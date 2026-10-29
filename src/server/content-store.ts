import type { Campaign } from "../types/content";
import { ContentError } from "./content-model";
import { getMemoryStore } from "./memory-store";

export async function readCampaigns(): Promise<Campaign[]> {
  return structuredClone(getMemoryStore().campaigns);
}
// Synchronous clone/validate/commit is atomic within one Node process.
// Callbacks must be synchronous; no awaiting network or disk inside a transaction.
export async function writeCampaigns<T>(update: (campaigns: Campaign[]) => T): Promise<T> {
  const campaigns = structuredClone(getMemoryStore().campaigns);
  const result = update(campaigns);
  if (result instanceof Promise) throw new ContentError(500, "Campaign transactions must be synchronous.");
  const slugs = new Map<string, string>();
  for (const campaign of campaigns) {
    for (const slug of [campaign.content.slug, campaign.published?.slug].filter(Boolean) as string[]) {
      if (slugs.has(slug) && slugs.get(slug) !== campaign.id) throw new ContentError(409, "This slug is already used by another campaign.");
      slugs.set(slug, campaign.id);
    }
  }
  getMemoryStore().campaigns = structuredClone(campaigns);
  return structuredClone(result);
}
