import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { contentUser } from "../../../server/content-auth";
import { changeCampaign, ContentError, parseContent } from "../../../server/content-model";
import { readCampaigns, writeCampaigns } from "../../../server/content-store";
import type { Campaign } from "../../../types/content";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const parts = (req.query.path || []) as string[];
    if (parts.length === 1 && parts[0] === "published" && req.method === "GET") {
      const campaigns = await readCampaigns();
      return res.json({ campaigns: campaigns.filter(c => c.published).map(c => ({ ...c.published, id: c.id })) });
    }
    if (parts.length > 1) throw new ContentError(404, "Not found.");
    const user = await contentUser(req);
    if (req.method === "GET" && !parts.length) return res.json({ campaigns: await readCampaigns(), reviewer: user.reviewer });
    if (req.method === "POST" && !parts.length) {
      const action = req.body?.action ?? "save";
      if (!["save", "submit", "publish_direct"].includes(action)) throw new ContentError(400, "Choose save, submit, or publish_direct when creating a campaign.");
      const content = parseContent(req.body?.content);
      const now = new Date().toISOString();
      let campaign: Campaign = { id: randomUUID(), revision: 1, content, status: "draft", lastEditor: user.id, updatedAt: now,
        history: [{ revision: 1, content, actor: user.id, action: "create", at: now }] };
      if (action !== "save") campaign = changeCampaign(campaign, { revision: campaign.revision, action }, user.id, user.reviewer);
      await writeCampaigns(campaigns => campaigns.push(campaign));
      return res.status(201).json({ campaign });
    }
    if (req.method === "PATCH" && parts.length === 1) {
      const campaign = await writeCampaigns(campaigns => {
        const index = campaigns.findIndex(c => c.id === parts[0]);
        if (index < 0) throw new ContentError(404, "Campaign not found.");
        const updated = changeCampaign(campaigns[index], req.body || {}, user.id, user.reviewer);
        campaigns[index] = updated;
        return updated;
      });
      return res.json({ campaign });
    }
    res.setHeader("Allow", parts.length ? "PATCH" : "GET, POST");
    return res.status(405).json({ message: "Method not allowed." });
  } catch (error) {
    if (error instanceof ContentError) return res.status(error.status).json({ message: error.message });
    console.error("Content API error", error);
    return res.status(500).json({ message: "Unable to save or load content." });
  }
}
export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };
