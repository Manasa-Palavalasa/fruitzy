/** @jest-environment node */
import { contentUser } from "./content-auth";
import { resetMemoryStore, getMemoryStore } from "./memory-store";
import { createSession } from "./commerce-auth";
import { tokenHash } from "./auth-crypto";
import type { NextApiRequest } from "next";
const request = (token?: string) => ({ headers: token ? { authorization: `Bearer ${token}` } : {} } as NextApiRequest);
beforeEach(() => { resetMemoryStore(true); delete process.env.CMS_EDITOR_IDS; });
afterEach(() => { delete process.env.CMS_EDITOR_IDS; });
it("rejects missing, forged, and ordinary shopper sessions", async () => {
  await expect(contentUser(request())).rejects.toMatchObject({ status: 401 });
  await expect(contentUser(request("forged-token"))).rejects.toMatchObject({ status: 401 });
  const token = createSession(getMemoryStore().users.find(user => user._id === "demo-shopper")!);
  await expect(contentUser(request(token))).rejects.toMatchObject({ status: 403 });
});
it("accepts local administrators and explicitly assigned editors", async () => {
  const admin = createSession(getMemoryStore().users.find(user => user._id === "demo-admin")!);
  await expect(contentUser(request(admin))).resolves.toEqual({ id: "demo-admin", reviewer: true });
  process.env.CMS_EDITOR_IDS = "demo-shopper";
  const editor = createSession(getMemoryStore().users.find(user => user._id === "demo-shopper")!);
  await expect(contentUser(request(editor))).resolves.toEqual({ id: "demo-shopper", reviewer: false });
});
it("rejects expired sessions and tokens issued before a server reset", async () => {
  const token = createSession(getMemoryStore().users[0]);
  getMemoryStore().sessions.get(tokenHash(token))!.expiresAt = 0;
  await expect(contentUser(request(token))).rejects.toMatchObject({ status: 401 });
  const second = createSession(getMemoryStore().users[0]);
  resetMemoryStore(true);
  await expect(contentUser(request(second))).rejects.toMatchObject({ status: 401 });
});
