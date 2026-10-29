/** @jest-environment node */
import type { Campaign } from "../types/content";
import { readCampaigns, writeCampaigns } from "./content-store";
import { resetMemoryStore } from "./memory-store";

beforeEach(() => resetMemoryStore());
const campaign = (id: string, slug: string) => ({ id, content: { slug } } as Campaign);
it("shares in-memory updates without dropping campaigns", async () => {
  await Promise.all([writeCampaigns(items => items.push(campaign("one", "one"))), writeCampaigns(items => items.push(campaign("two", "two")))]);
  expect((await readCampaigns()).map(item => item.id)).toEqual(["one", "two"]);
});
it("rejects duplicate draft or live slugs without committing failed changes", async () => {
  await writeCampaigns(items => items.push({ ...campaign("one", "new-slug"), published: { slug: "live-slug" } } as Campaign));
  await expect(writeCampaigns(items => items.push(campaign("two", "live-slug")))).rejects.toThrow("already used");
  expect(await readCampaigns()).toHaveLength(1);
  await writeCampaigns(items => items.push(campaign("two", "different-slug")));
  expect(await readCampaigns()).toHaveLength(2);
});
it("isolates snapshots from external mutation and resets data with the memory store", async () => {
  const input = campaign("one", "one");
  await writeCampaigns(items => items.push(input));
  input.content.slug = "mutated-input";
  const items = await readCampaigns();
  items[0].content.slug = "mutated-read";
  expect((await readCampaigns())[0].content.slug).toBe("one");
  resetMemoryStore();
  expect(await readCampaigns()).toEqual([]);
});
