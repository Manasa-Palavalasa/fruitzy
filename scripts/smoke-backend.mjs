import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Run this test against a local test server only.");
async function api(path, method = "GET", body, token, expected = 200) {
  const response = await fetch(base + path, {
    method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${data.message || response.statusText}`);
  return data;
}
const runId = randomUUID();
const login = email => api("/api/commerce/auth/login", "POST", { email, password: "FruitzyDemo123!" });
const admin = await login("admin@fruitzy.test");
const reviewer = await login("reviewer@fruitzy.test");
const shopper = await api("/api/commerce/auth/signup", "POST", { name: "Smoke Shopper", email: `${runId}@example.test`, password: "SmokePassword123!", role: "admin" }, undefined, 201);
assert.equal(shopper.user.role, "user");
assert.ok((await api("/api/commerce/products")).products.length > 0);
console.log("PASS accounts, session login, and catalog");

const productValues = { name: "Smoke Test Fruit", slug: `smoke-fruit-${runId}`, description: "Test fruit", categories: ["fruits"], price: 12.5, stock: 5, isPopular: false, image: "/apple.jpg" };
await api("/api/commerce/products", "POST", productValues, shopper.token, 403);
const { product } = await api("/api/commerce/products", "POST", productValues, admin.token, 201);
const { addresses } = await api("/api/commerce/user/address", "POST", { label: "Home", address: "1 Test Street", city: "Hyderabad", state: "Telangana", pincode: "500001", country: "India" }, shopper.token, 201);
await api("/api/commerce/cart", "POST", { productId: product._id, quantity: 2 }, shopper.token);
const { order } = await api("/api/commerce/orders", "POST", { addressId: addresses[0]._id, paymentMethod: "card", totalAmount: 1 }, shopper.token, 201);
assert.equal(order.totalAmount, 25);
assert.equal(order.paymentStatus, "pending");
assert.equal((await api("/api/commerce/cart", "GET", undefined, shopper.token)).cart.items.length, 0);
assert.ok((await api("/api/commerce/admin/orders", "GET", undefined, admin.token)).orders.some(item => item._id === order._id));
await api(`/api/commerce/products/${product._id}/review`, "POST", { rating: 5, review: "Fresh test fruit" }, shopper.token, 201);
assert.equal((await api(`/api/commerce/reviews/${product._id}`)).reviews.length, 1);
console.log("PASS product permissions, address, cart, checkout, orders, and reviews");

const content = { title: "Smoke Campaign Offer", slug: `smoke-campaign-${runId}`, description: "Test promotion", image: "/banner1.jpg", imageAlt: "Fresh fruit", buttonLabel: "Shop now", buttonHref: "/products", productIds: [product._id] };
let { campaign } = await api("/api/content", "POST", { content, action: "publish_direct" }, admin.token, 201);
assert.ok((await api("/api/content/published")).campaigns.some(item => item.id === campaign.id));
let page = await fetch(`${base}/campaigns/${content.slug}`);
assert.equal(page.status, 200);
assert.ok((await page.text()).includes(content.title));
campaign = (await api(`/api/content/${campaign.id}`, "PATCH", { revision: campaign.revision, action: "submit", content: { ...content, title: "Smoke Reviewed Offer" } }, admin.token)).campaign;
assert.equal((await api("/api/content/published")).campaigns.find(item => item.id === campaign.id).title, content.title);
await api(`/api/content/${campaign.id}`, "PATCH", { revision: campaign.revision, action: "approve" }, admin.token, 403);
campaign = (await api(`/api/content/${campaign.id}`, "PATCH", { revision: campaign.revision, action: "approve" }, reviewer.token)).campaign;
campaign = (await api(`/api/content/${campaign.id}`, "PATCH", { revision: campaign.revision, action: "publish" }, reviewer.token)).campaign;
page = await fetch(`${base}/campaigns/${content.slug}`);
assert.equal(page.status, 200);
assert.ok((await page.text()).includes("Smoke Reviewed Offer"));
await api(`/api/content/${campaign.id}`, "PATCH", { revision: campaign.revision, action: "unpublish" }, admin.token);
assert.equal((await fetch(`${base}/campaigns/${content.slug}`)).status, 404);
await api("/api/commerce/auth/logout", "POST", {}, shopper.token);
await api("/api/commerce/user/profile", "GET", undefined, shopper.token, 401);
console.log("PASS shared CMS sessions, immediate/reviewed publishing, public SSR pages, unpublish, and logout");
console.log("Smoke checks passed. Test records remain in memory until server restart.");
