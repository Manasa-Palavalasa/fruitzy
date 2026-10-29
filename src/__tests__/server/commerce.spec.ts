/** @jest-environment node */
import type { NextApiRequest, NextApiResponse } from "next";
import type { Product, UserProfileType, Cart } from "@/types";
import type { Campaign } from "@/types/content";
import type { StoredOrder } from "@/server/memory-store";
import commerceHandler from "@/pages/api/commerce/[[...path]]";
import contentHandler from "@/pages/api/content/[[...path]]";
import { getMemoryStore, resetMemoryStore } from "@/server/memory-store";
import { tokenHash } from "@/server/auth-crypto";

type Auth = { token: string; user: UserProfileType };
async function request<T = Record<string, unknown>>(path: string, method = "GET", body = {}, token?: string, query = {}, content = false) {
  let status = 200;
  let data: unknown;
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (name: string, value: string) => { headers[name] = value; },
    status: (value: number) => { status = value; return res; },
    json: (value: unknown) => { data = structuredClone(value); return res; },
  };
  const req = { method, body, query: { path: path.split("/").filter(Boolean), ...query }, headers: token ? { authorization: `Bearer ${token}` } : {} } as unknown as NextApiRequest;
  await (content ? contentHandler : commerceHandler)(req, res as unknown as NextApiResponse);
  return { status, data: data as T, headers };
}
async function signup(email = "person@example.test") {
  const result = await request<Auth>("auth/signup", "POST", { name: "Test Shopper", email, password: "TestPassword123!", role: "admin" });
  expect(result.status).toBe(201);
  return result.data;
}
async function login(email = "admin@fruitzy.test") {
  const result = await request<Auth>("auth/login", "POST", { email, password: "FruitzyDemo123!" });
  expect(result.status).toBe(200);
  return result.data;
}
beforeEach(() => resetMemoryStore(true));

it("registers shoppers, hashes passwords, prevents role injection and rejects duplicate accounts", async () => {
  const account = await signup();
  expect(account.user.role).toBe("user");
  expect(account.user).not.toHaveProperty("passwordHash");
  expect(getMemoryStore().users.find(user => user._id === account.user._id)?.passwordHash).not.toContain("TestPassword123!");
  expect((await request("auth/signup", "POST", { name: "Again", email: "PERSON@example.test", password: "TestPassword123!" })).status).toBe(409);
  expect((await request("auth/login", "POST", { email: "person@example.test", password: "Incorrect123!" })).status).toBe(401);
  const loggedIn = await request<Auth>("auth/login", "POST", { email: "PERSON@example.test", password: "TestPassword123!" });
  expect(loggedIn.status).toBe(200);
  expect(loggedIn.data.token).not.toBe(account.token);
});
it("enforces session expiry and revokes sessions on logout", async () => {
  const { token } = await signup();
  expect((await request("user/profile")).status).toBe(401);
  expect((await request("user/profile", "GET", {}, "forged")).status).toBe(401);
  expect((await request("user/profile", "GET", {}, token)).status).toBe(200);
  getMemoryStore().sessions.get(tokenHash(token))!.expiresAt = 0;
  expect((await request("user/profile", "GET", {}, token)).status).toBe(401);
  const admin = await login();
  await request("auth/logout", "POST", {}, admin.token);
  expect((await request("user/profile", "GET", {}, admin.token)).status).toBe(401);
});
it("filters, sorts and paginates the public catalog", async () => {
  const result = await request<{ products: Product[]; total: number; totalPages: number }>("products", "GET", {}, undefined, { category: "tropical", sort: "price", limit: "2" });
  expect(result.status).toBe(200);
  expect(result.data.products).toHaveLength(2);
  expect(result.data.products.every(product => product.categories.includes("tropical"))).toBe(true);
  expect(result.data.products[0].price).toBeLessThanOrEqual(result.data.products[1].price);
  expect(result.data.totalPages).toBeGreaterThan(1);
  expect((await request<{ products: Product[] }>("products", "GET", {}, undefined, { search: "apple" })).data.products.some(product => product.name === "Apple")).toBe(true);
  expect((await request("products", "GET", {}, undefined, { page: "-1" })).status).toBe(400);
});
it("restricts product changes and promotions to administrators and validates products", async () => {
  const shopper = await signup();
  const admin = await login();
  const product = { name: "Test Fruit", slug: "test-fruit", description: "Fresh fruit", categories: ["summer"], price: 10.25, stock: 5, isPopular: false, image: "/apple.jpg" };
  expect((await request("products", "POST", product, shopper.token)).status).toBe(403);
  expect((await request("products", "POST", { ...product, stock: -1 }, admin.token)).status).toBe(400);
  const created = await request<{ product: Product }>("products", "POST", product, admin.token);
  expect(created.status).toBe(201);
  expect(created.data.product.images).toEqual(["/apple.jpg"]);
  expect((await request("products", "POST", product, admin.token)).status).toBe(409);
  expect((await request(`products/${created.data.product._id}`, "PUT", { ...product, price: 12 }, admin.token)).status).toBe(200);
  expect((await request(`admin/users/${shopper.user._id}`, "PATCH", { role: "admin" }, shopper.token)).status).toBe(403);
  expect((await request(`admin/users/${shopper.user._id}`, "PATCH", { role: "admin" }, admin.token)).status).toBe(200);
  expect((await request("admin/users", "GET", {}, shopper.token)).status).toBe(200);
});
it("isolates carts, validates quantities, and removes deleted products from carts", async () => {
  const first = await signup("first@example.test");
  const second = await signup("second@example.test");
  const admin = await login();
  expect((await request("cart", "POST", { productId: "fruit-1", quantity: -1 }, first.token)).status).toBe(400);
  expect((await request("cart", "POST", { productId: "fruit-1", quantity: 31 }, first.token)).status).toBe(409);
  await request("cart", "POST", { productId: "fruit-1", quantity: 2 }, first.token);
  const result = await request<{ cart: Cart }>("cart", "GET", {}, first.token);
  expect(result.data.cart.items[0].quantity).toBe(2);
  expect((await request<{ cart: Cart }>("cart", "GET", {}, second.token)).data.cart.items).toEqual([]);
  expect((await request("cart/fruit-1", "PUT", { quantity: 0 }, first.token)).status).toBe(400);
  await request("products/fruit-1", "DELETE", {}, admin.token);
  expect((await request<{ cart: Cart }>("cart", "GET", {}, first.token)).data.cart.items).toEqual([]);
});
it("calculates checkout totals on the server, snapshots orders, and clears the cart", async () => {
  const shopper = await login("shopper@fruitzy.test");
  await request("cart", "POST", { productId: "fruit-1", quantity: 2 }, shopper.token);
  expect((await request("orders", "POST", { addressId: "someone-elses-address", paymentMethod: "cod" }, shopper.token)).status).toBe(400);
  const order = await request<{ order: StoredOrder }>("orders", "POST", { addressId: "demo-address", paymentMethod: "card", totalAmount: 1 }, shopper.token);
  expect(order.status).toBe(201);
  expect(order.data.order.totalAmount).toBe(240);
  expect(order.data.order.paymentStatus).toBe("pending");
  expect(getMemoryStore().products[0].stock).toBe(28);
  expect((await request<{ cart: Cart }>("cart", "GET", {}, shopper.token)).data.cart.items).toEqual([]);
  getMemoryStore().products[0].name = "Edited product";
  expect(getMemoryStore().orders[0].items[0].product.name).toBe("Apple");
  const other = await signup();
  expect((await request<{ orders: StoredOrder[] }>("orders", "GET", {}, other.token)).data.orders).toEqual([]);
  expect((await request("orders", "POST", { addressId: "demo-address", paymentMethod: "cod" }, shopper.token)).status).toBe(400);
});
it("rolls back the entire checkout when another shopper consumes the last stock", async () => {
  const first = await login("shopper@fruitzy.test");
  const second = await signup();
  getMemoryStore().products[0].stock = 1;
  await request("cart", "POST", { productId: "fruit-1", quantity: 1 }, first.token);
  await request("cart", "POST", { productId: "fruit-1", quantity: 1 }, second.token);
  await request("cart", "POST", { productId: "fruit-2", quantity: 1 }, second.token);
  const address = { label: "Home", address: "1 Test Road", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500001" };
  const added = await request<{ addresses: { _id: string }[] }>("user/address", "POST", address, second.token);
  await request("orders", "POST", { addressId: "demo-address", paymentMethod: "cod" }, first.token);
  expect((await request("orders", "POST", { addressId: added.data.addresses[0]._id, paymentMethod: "cod" }, second.token)).status).toBe(409);
  expect(getMemoryStore().orders).toHaveLength(1);
  expect(getMemoryStore().products[1].stock).toBe(30);
  expect((await request<{ cart: Cart }>("cart", "GET", {}, second.token)).data.cart.items).toHaveLength(2);
});
it("validates ratings and rejects duplicate reviews", async () => {
  const shopper = await signup();
  expect((await request("products/fruit-1/review", "POST", { rating: 6, review: "Good" }, shopper.token)).status).toBe(400);
  expect((await request("products/fruit-1/review", "POST", { rating: 4, review: "Fresh fruit" }, shopper.token)).status).toBe(201);
  expect((await request("products/fruit-1/review", "POST", { rating: 5, review: "Again" }, shopper.token)).status).toBe(409);
  expect((await request<{ reviews: unknown[] }>("reviews/fruit-1")).data.reviews).toHaveLength(1);
  expect((await request<{ product: Product }>("products/fruit-1")).data.product.averageRating).toBe(4);
});
it("returns method and not-found errors, and resets all test data and sessions", async () => {
  expect((await request("auth/login", "GET")).status).toBe(405);
  expect((await request("does-not-exist")).status).toBe(404);
  const user = await signup();
  resetMemoryStore();
  expect((await request("user/profile", "GET", {}, user.token)).status).toBe(401);
  expect(getMemoryStore().users).toEqual([]);
  expect(getMemoryStore().orders).toEqual([]);
});
it("uses the same local sessions and memory for CMS creation, publication and review", async () => {
  const admin = await login();
  const reviewer = await login("reviewer@fruitzy.test");
  const content = { title: "Sale", slug: "sale", description: "Fruit offers", image: "/banner1.jpg", imageAlt: "Fresh fruit", buttonLabel: "Shop", buttonHref: "/products", productIds: ["fruit-1"] };
  const created = await request<{ campaign: Campaign }>("", "POST", { content, action: "publish_direct" }, admin.token, {}, true);
  expect(created.status).toBe(201);
  expect((await request<{ campaigns: unknown[] }>("published", "GET", {}, undefined, {}, true)).data.campaigns).toHaveLength(1);
  const draft = await request<{ campaign: Campaign }>(created.data.campaign.id, "PATCH", { revision: created.data.campaign.revision, action: "submit", content: { ...content, title: "Reviewed offer" } }, admin.token, {}, true);
  expect(draft.data.campaign.published?.title).toBe("Sale");
  const approved = await request<{ campaign: Campaign }>(created.data.campaign.id, "PATCH", { revision: draft.data.campaign.revision, action: "approve" }, reviewer.token, {}, true);
  const published = await request<{ campaign: Campaign }>(created.data.campaign.id, "PATCH", { revision: approved.data.campaign.revision, action: "publish" }, reviewer.token, {}, true);
  expect(published.data.campaign.published?.title).toBe("Reviewed offer");
  resetMemoryStore();
  expect((await request<{ campaigns: unknown[] }>("published", "GET", {}, undefined, {}, true)).data.campaigns).toEqual([]);
});
