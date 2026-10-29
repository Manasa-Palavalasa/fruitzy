import type { AddressType, Product, UserProfileType } from "../types";
import type { Campaign } from "../types/content";
import { passwordHash } from "./auth-crypto";

export interface StoredUser extends UserProfileType { passwordHash: string }
export interface StoredOrder {
  _id: string;
  userId: string;
  user: { name: string; email: string };
  items: { product: Product; quantity: number; unitPrice: number }[];
  address: AddressType;
  paymentMethod: "cod" | "upi" | "card";
  paymentStatus: "pending";
  orderStatus: "placed";
  totalAmount: number;
  createdAt: string;
}
export interface MemoryStore {
  users: StoredUser[];
  products: Product[];
  carts: Map<string, { productId: string; quantity: number }[]>;
  orders: StoredOrder[];
  sessions: Map<string, { userId: string; expiresAt: number }>;
  campaigns: Campaign[];
}

function initialStore(seedAccounts: boolean): MemoryStore {
  const catalog: [string, string, string[], number][] = [
    ["Apple", "apple", ["seasonal"], 120], ["Banana", "banana", ["tropical"], 60],
    ["Mango", "mango", ["summer", "tropical"], 180], ["Orange", "orange", ["citrus"], 100],
    ["Strawberry", "strawberry", ["berries", "seasonal"], 200], ["Kiwi", "kiwi", ["exotic"], 150],
    ["Grapes", "grapes", ["seasonal"], 90], ["Watermelon", "watermelon", ["summer"], 50],
    ["Papaya", "papaya", ["tropical"], 80], ["Pomegranate", "pomegranate", ["seasonal"], 160],
    ["Guava", "guava", ["tropical"], 70], ["Pineapple", "pineapple", ["tropical", "exotic"], 110],
  ];
  const users: StoredUser[] = seedAccounts ? [
    { _id: "demo-admin", name: "Demo Admin", email: "admin@fruitzy.test", role: "admin", addresses: [], passwordHash: passwordHash("FruitzyDemo123!") },
    { _id: "demo-reviewer", name: "Demo Reviewer", email: "reviewer@fruitzy.test", role: "admin", addresses: [], passwordHash: passwordHash("FruitzyDemo123!") },
    { _id: "demo-shopper", name: "Demo Shopper", email: "shopper@fruitzy.test", role: "user", addresses: [{ _id: "demo-address", label: "Home", address: "123 Demo Street", city: "Hyderabad", state: "Telangana", pincode: "500001", country: "India" }], passwordHash: passwordHash("FruitzyDemo123!") },
  ] : [];
  return {
    users,
    products: catalog.map(([name, slug, categories, price], index) => ({
      _id: `fruit-${index + 1}`, name, slug, description: `Fresh ${name.toLowerCase()} for your everyday fruit basket. Price per pack.`,
      images: [slug === "pineapple" ? "/Pineapple.jpg" : `/${slug}.jpg`], categories: ["fruits", ...categories], price, stock: 30,
      ratings: [], averageRating: 0, isPopular: index < 3,
    })),
    carts: new Map(), orders: [], sessions: new Map(), campaigns: [],
  };
}

// Shared by API routes and SSR in the same Node process, including dev hot reloads.
const processGlobal = globalThis as typeof globalThis & { fruitzyMemoryV1?: MemoryStore };
export function getMemoryStore(): MemoryStore {
  return processGlobal.fruitzyMemoryV1 ??= initialStore(process.env.DEMO_SEED_ACCOUNTS === "true" || (process.env.NODE_ENV === "development" && process.env.DEMO_SEED_ACCOUNTS !== "false"));
}
// Test helper only; no HTTP reset endpoint is exposed.
export function resetMemoryStore(seedAccounts = false): void { processGlobal.fruitzyMemoryV1 = initialStore(seedAccounts); }
