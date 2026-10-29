import type { Campaign, CampaignContent, PublicCampaign } from "@/types/content";

export async function contentRequest<T>(path = "", options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const response = await fetch(`/api/content${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Content request failed.");
  return data;
}
export const listCampaigns = () => contentRequest<{ campaigns: Campaign[]; reviewer: boolean }>();
export const publishedCampaigns = () => contentRequest<{ campaigns: PublicCampaign[] }>("/published");
export const createCampaign = (content: CampaignContent, action = "save") => contentRequest<{ campaign: Campaign }>("", { method: "POST", body: JSON.stringify({ content, action }) });
export const updateCampaign = (campaign: Campaign, action: string, extra = {}) => contentRequest<{ campaign: Campaign }>(`/${campaign.id}`, {
  method: "PATCH", body: JSON.stringify({ revision: campaign.revision, action, ...extra }),
});
