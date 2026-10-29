import type { NextApiRequest } from "next";
import type { AddressType, Product } from "../types";
import { randomUUID } from "crypto";
import { getMemoryStore, type StoredOrder } from "./memory-store";
import { authenticate, CommerceError, createSession, publicUser, requireAdmin, revokeSession } from "./commerce-auth";
import { isAllowedImage } from "./content-model";
import { passwordHash, passwordMatches } from "./auth-crypto";

type Body = Record<string, unknown>;
export function text(value: unknown, label: string, max = 3000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new CommerceError(400, `${label} is required (maximum ${max} characters).`);
  return value.trim();
}
function integer(value: unknown, label: string, min = 1, max = 100000): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new CommerceError(400, `${label} must be an integer between ${min} and ${max}.`);
  return value;
}
function query(req: NextApiRequest, name: string): string {
  const value = req.query[name];
  if (Array.isArray(value)) throw new CommerceError(400, `Invalid ${name}.`);
  return value || "";
}
function paginate<T>(items: T[], req: NextApiRequest) {
  const page = query(req, "page") ? integer(Number(query(req, "page")), "Page", 1) : 1;
  const limit = query(req, "limit") ? integer(Number(query(req, "limit")), "Limit", 1, 100) : 12;
  return { items: items.slice((page - 1) * limit, page * limit), currentPage: page, totalPages: Math.max(1, Math.ceil(items.length / limit)), total: items.length };
}
function product(id: string): Product {
  const item = getMemoryStore().products.find(p => p._id === id);
  if (!item) throw new CommerceError(404, "Product not found.");
  return item;
}
function productValues(body: Body) {
  const name = text(body.name, "Name", 150);
  const slug = text(body.slug, "Slug", 150);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new CommerceError(400, "Use a lowercase URL slug.");
  const description = text(body.description, "Description");
  if (!Array.isArray(body.categories) || !body.categories.length || body.categories.length > 20) throw new CommerceError(400, "Choose 1 to 20 categories.");
  const categories = [...new Set(body.categories.map(category => text(category, "Category", 60).toLowerCase()))];
  if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price <= 0 || body.price > 1000000 || Math.abs(body.price * 100 - Math.round(body.price * 100)) > 0.000001) throw new CommerceError(400, "Price must be positive with at most two decimal places.");
  const stock = integer(body.stock, "Stock", 0);
  if (typeof body.isPopular !== "boolean") throw new CommerceError(400, "isPopular must be a boolean.");
  const image = body.image === undefined ? "/banner1.jpg" : text(body.image, "Image URL", 2000);
  if (!isAllowedImage(image)) throw new CommerceError(400, "Use a local raster image path or an HTTPS images.unsplash.com image.");
  return { name, slug, description, categories, price: body.price, stock, isPopular: body.isPopular, images: [image] };
}
function cartFor(userId: string) {
  const store = getMemoryStore();
  const cart = (store.carts.get(userId) || []).filter(line => store.products.some(p => p._id === line.productId));
  return { user: userId, items: cart.map(line => ({ product: product(line.productId), quantity: line.quantity })) };
}

function methodsFor(parts: string[]): string[] | undefined {
  const route = parts.join("/");
  const exact: Record<string, string[]> = {
    "auth/signup": ["POST"], "auth/login": ["POST"], "auth/logout": ["POST"],
    products: ["GET", "POST"], "user/profile": ["GET"], "user/address": ["POST"],
    cart: ["GET", "POST"], "cart/clear": ["DELETE"], orders: ["GET", "POST"],
    "admin/users": ["GET"], "admin/orders": ["GET"], "admin/stats": ["GET"],
  };
  if (Object.hasOwn(exact, route)) return exact[route];
  if (parts.length === 2 && parts[0] === "products") return ["GET", "PUT", "DELETE"];
  if (parts.length === 3 && parts[0] === "products" && parts[2] === "review") return ["POST"];
  if (parts.length === 2 && parts[0] === "reviews") return ["GET"];
  if (parts.length === 2 && parts[0] === "cart") return ["PUT", "DELETE"];
  if (parts.length === 3 && parts[0] === "user" && parts[1] === "address") return ["DELETE"];
  if (parts.length === 3 && parts[0] === "admin" && parts[1] === "users") return ["PATCH"];
}

// Mutations below are synchronous: inventory checks and updates run in one event-loop turn.
export function commerceRequest(req: NextApiRequest, parts: string[]): { status?: number; data: unknown } {
  const allowed = methodsFor(parts);
  if (!allowed) throw new CommerceError(404, "API endpoint not found.");
  if (!allowed.includes(req.method || "")) throw new CommerceError(405, "Method not allowed.", allowed);
  const store = getMemoryStore();
  const method = req.method;
  const body: Body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const route = parts.join("/");
  if ((route === "auth/signup" || route === "auth/login") && method === "POST") {
    const email = text(body.email, "Email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CommerceError(400, "Enter a valid email.");
    if (typeof body.password !== "string" || body.password.length < 6 || body.password.length > 128) throw new CommerceError(400, "Password must contain 6 to 128 characters.");
    if (route === "auth/signup") {
      const name = text(body.name, "Name", 100);
      if (store.users.some(user => user.email === email)) throw new CommerceError(409, "An account with this email already exists.");
      const user = { _id: randomUUID(), email, name, role: "user" as const, addresses: [], passwordHash: passwordHash(body.password) };
      store.users.push(user);
      return { status: 201, data: { user: publicUser(user), token: createSession(user) } };
    }
    const user = store.users.find(value => value.email === email);
    if (!user || !passwordMatches(body.password, user.passwordHash)) throw new CommerceError(401, "Invalid email or password.");
    return { data: { user: publicUser(user), token: createSession(user) } };
  }
  if (route === "auth/logout" && method === "POST") {
    revokeSession(req.headers.authorization);
    return { data: { message: "Signed out." } };
  }
  if (parts[0] === "products" && parts.length === 1 && method === "GET") {
    const search = query(req, "search").toLowerCase();
    const categories = query(req, "category").split(",").filter(Boolean);
    let products = store.products.filter(p => (!search || `${p.name} ${p.description}`.toLowerCase().includes(search)) && (!categories.length || categories.some(c => p.categories.includes(c))));
    const sort = query(req, "sort");
    if (sort === "price" || sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
    else if (sort === "new-arrivals") products = [...products].reverse();
    const { items, ...pagination } = paginate(products, req);
    return { data: { products: items, ...pagination } };
  }
  if (parts[0] === "products" && parts.length === 2 && method === "GET") return { data: { product: product(parts[1]) } };
  if (parts[0] === "reviews" && parts.length === 2 && method === "GET") {
    const { items, ...pagination } = paginate([...product(parts[1]).ratings].reverse(), req);
    return { data: { reviews: items, ...pagination } };
  }

  const user = authenticate(req.headers.authorization);
  if (route === "user/profile" && method === "GET") return { data: { user: publicUser(user) } };
  if (route === "user/address" && method === "POST") {
    if (user.addresses.length >= 20) throw new CommerceError(400, "Maximum 20 addresses.");
    const address = { _id: randomUUID() } as AddressType;
    for (const key of ["label", "address", "pincode", "city", "state", "country"] as const) address[key] = text(body[key], key, 300);
    user.addresses.push(address);
    return { status: 201, data: { addresses: user.addresses } };
  }
  if (parts[0] === "user" && parts[1] === "address" && parts.length === 3 && method === "DELETE") {
    if (!user.addresses.some(address => address._id === parts[2])) throw new CommerceError(404, "Address not found.");
    user.addresses = user.addresses.filter(address => address._id !== parts[2]);
    return { data: { addresses: user.addresses } };
  }
  if (parts[0] === "cart") {
    const cart = store.carts.get(user._id) || [];
    if (parts.length === 1 && method === "GET") return { data: { cart: cartFor(user._id) } };
    if (parts.length === 1 && method === "POST") {
      const item = product(text(body.productId, "Product ID", 100));
      const quantity = integer(body.quantity, "Quantity");
      const line = cart.find(value => value.productId === item._id);
      if (!line && cart.length >= 5) throw new CommerceError(400, "A cart can contain at most 5 different products.");
      const total = (line?.quantity || 0) + quantity;
      if (total > item.stock) throw new CommerceError(409, "Not enough stock.");
      if (line) line.quantity = total; else cart.push({ productId: item._id, quantity });
      store.carts.set(user._id, cart);
      return { data: { cart: cartFor(user._id) } };
    }
    if (parts.length === 2 && parts[1] === "clear" && method === "DELETE") {
      store.carts.delete(user._id);
      return { data: { cart: cartFor(user._id) } };
    }
    if (parts.length === 2 && (method === "PUT" || method === "DELETE")) {
      const line = cart.find(value => value.productId === parts[1]);
      if (!line) throw new CommerceError(404, "Cart item not found.");
      if (method === "DELETE") store.carts.set(user._id, cart.filter(value => value !== line));
      else {
        const quantity = integer(body.quantity, "Quantity");
        if (quantity > product(parts[1]).stock) throw new CommerceError(409, "Not enough stock.");
        line.quantity = quantity;
      }
      return { data: { cart: cartFor(user._id) } };
    }
  }
  if (route === "orders" && method === "POST") {
    const address = user.addresses.find(value => value._id === body.addressId);
    if (!address) throw new CommerceError(400, "Select one of your saved addresses.");
    if (!["cod", "upi", "card"].includes(body.paymentMethod as string)) throw new CommerceError(400, "Invalid payment method.");
    const cart = store.carts.get(user._id) || [];
    if (!cart.length) throw new CommerceError(400, "Your cart is empty.");
    const items = cart.map(line => {
      const item = product(line.productId);
      if (line.quantity > item.stock) throw new CommerceError(409, `${item.name} has insufficient stock.`);
      return { product: structuredClone(item), quantity: line.quantity, unitPrice: item.price };
    });
    const totalCents = items.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0);
    const order: StoredOrder = { _id: randomUUID(), userId: user._id, user: { name: user.name, email: user.email }, items, address: structuredClone(address), paymentMethod: body.paymentMethod as StoredOrder["paymentMethod"], paymentStatus: "pending", orderStatus: "placed", totalAmount: totalCents / 100, createdAt: new Date().toISOString() };
    for (const line of items) product(line.product._id).stock -= line.quantity;
    store.orders.push(order);
    store.carts.delete(user._id);
    return { status: 201, data: { order } };
  }
  if (route === "orders" && method === "GET") {
    const { items, ...pagination } = paginate(store.orders.filter(order => order.userId === user._id).slice().reverse(), req);
    return { data: { orders: items, ...pagination } };
  }
  if (parts[0] === "products" && parts[2] === "review" && parts.length === 3 && method === "POST") {
    const item = product(parts[1]);
    const rating = integer(body.rating, "Rating", 1, 5);
    const review = text(body.review, "Review", 2000);
    if (item.ratings.some(value => value.user === user._id)) throw new CommerceError(409, "You already reviewed this product.");
    item.ratings.push({ _id: randomUUID(), user: user._id, rating, review, createdAt: new Date().toISOString() });
    item.averageRating = item.ratings.reduce((sum, value) => sum + value.rating, 0) / item.ratings.length;
    return { status: 201, data: { message: "Review added.", product: item } };
  }

  requireAdmin(user);
  if (parts[0] === "products" && (parts.length === 1 && method === "POST" || parts.length === 2 && method === "PUT")) {
    const values = productValues(body);
    const existing = parts.length === 2 ? product(parts[1]) : undefined;
    if (store.products.some(p => p.slug === values.slug && p._id !== existing?._id)) throw new CommerceError(409, "This product slug is already in use.");
    if (existing) {
      Object.assign(existing, values);
      return { data: { product: existing } };
    }
    const item: Product = { ...values, _id: randomUUID(), ratings: [], averageRating: 0 };
    store.products.push(item);
    return { status: 201, data: { product: item } };
  }
  if (parts[0] === "products" && parts.length === 2 && method === "DELETE") {
    const item = product(parts[1]);
    store.products = store.products.filter(p => p._id !== item._id);
    for (const [id, cart] of store.carts) store.carts.set(id, cart.filter(line => line.productId !== item._id));
    return { data: { message: "Product removed." } };
  }
  if (route === "admin/users" && method === "GET") {
    const search = query(req, "search").toLowerCase();
    const users = store.users.filter(value => `${value.name} ${value.email}`.toLowerCase().includes(search)).map(publicUser);
    const { items, ...pagination } = paginate(users, req);
    return { data: { users: items, ...pagination } };
  }
  if (parts[0] === "admin" && parts[1] === "users" && parts.length === 3 && method === "PATCH") {
    const target = store.users.find(value => value._id === parts[2]);
    if (!target) throw new CommerceError(404, "User not found.");
    if (body.role !== "admin") throw new CommerceError(400, "Only promotion to administrator is supported.");
    target.role = "admin";
    return { data: { user: publicUser(target) } };
  }
  if (route === "admin/orders" && method === "GET") {
    const { items, ...pagination } = paginate([...store.orders].reverse(), req);
    return { data: { orders: items, ...pagination } };
  }
  if (route === "admin/stats" && method === "GET") return { data: { products: store.products.length, users: store.users.length, orders: store.orders.length } };
  throw new CommerceError(404, "API endpoint not found.");
}
