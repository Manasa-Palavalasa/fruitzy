import { randomBytes } from "crypto";
import { getMemoryStore, type StoredUser } from "./memory-store";
import { tokenHash } from "./auth-crypto";

export class CommerceError extends Error {
  constructor(public status: number, message: string, public allowed?: string[]) { super(message); }
}
export function authenticate(authorization: string | undefined): StoredUser {
  if (!authorization?.startsWith("Bearer ")) throw new CommerceError(401, "Please sign in.");
  const key = tokenHash(authorization.slice(7));
  const store = getMemoryStore();
  const session = store.sessions.get(key);
  if (!session || session.expiresAt <= Date.now()) {
    store.sessions.delete(key);
    throw new CommerceError(401, "Your session expired or the test server restarted. Please sign in again.");
  }
  const user = store.users.find(value => value._id === session.userId);
  if (!user) throw new CommerceError(401, "Account not found.");
  return user;
}
export function requireAdmin(user: StoredUser): void {
  if (user.role !== "admin") throw new CommerceError(403, "Administrator access is required.");
}
export function publicUser(user: StoredUser) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role, addresses: structuredClone(user.addresses) };
}
export function createSession(user: StoredUser): string {
  const token = randomBytes(32).toString("hex");
  const store = getMemoryStore();
  for (const [key, session] of store.sessions) if (session.expiresAt <= Date.now()) store.sessions.delete(key);
  store.sessions.set(tokenHash(token), { userId: user._id, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
  return token;
}
export function revokeSession(authorization: string | undefined): void {
  if (authorization?.startsWith("Bearer ")) getMemoryStore().sessions.delete(tokenHash(authorization.slice(7)));
}
