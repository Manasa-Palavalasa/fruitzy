/** @jest-environment node */
import { changeCampaign, ContentError, parseContent, qualityIssues } from "./content-model";
import type { Campaign, CampaignContent } from "../types/content";

const content: CampaignContent = { title: "Summer sale", slug: "summer-sale", description: "Fresh seasonal fruit", image: "/banner1.jpg", imageAlt: "A selection of fresh fruit", buttonLabel: "Shop fruit", buttonHref: "/products", productIds: ["fruit-1"] };
const draft = (): Campaign => ({ id: "sale", revision: 1, content: { ...content }, status: "draft", lastEditor: "editor", updatedAt: "2026-01-01", history: [{ revision: 1, content: { ...content }, actor: "editor", action: "create", at: "2026-01-01" }] });
const action = (campaign: Campaign, name: string, actor = "reviewer", reviewer = true, extra = {}) => changeCampaign(campaign, { action: name, revision: campaign.revision, ...extra }, actor, reviewer);

describe("content publishing workflow", () => {
  it("keeps content private until independent approval and publish", () => {
    let campaign = action(draft(), "submit", "editor", false);
    expect(campaign.published).toBeUndefined();
    expect(() => action(campaign, "approve", "editor")).toThrow("different administrator");
    expect(() => action(campaign, "publish")).toThrow("Independent approval");
    campaign = action(campaign, "approve");
    expect(campaign.published).toBeUndefined();
    campaign = action(campaign, "publish");
    expect(campaign.published).toEqual(content);
    expect(campaign.history.map(v => v.action)).toEqual(["create", "submit", "approve", "publish"]);
  });
  it("preserves the live snapshot when editing and restoring, and removes it on unpublish", () => {
    let campaign = action(action(action(draft(), "submit"), "approve"), "publish");
    campaign = action(campaign, "save", "editor", false, { content: { ...content, title: "Next sale" } });
    expect(campaign.content.title).toBe("Next sale");
    expect(campaign.published?.title).toBe("Summer sale");
    expect(campaign.status).toBe("draft");
    expect(campaign.approvedBy).toBeUndefined();
    campaign = action(campaign, "restore", "editor", false, { restoreRevision: 1 });
    expect(campaign.content.title).toBe("Summer sale");
    expect(campaign.status).toBe("draft");
    campaign = action(campaign, "unpublish");
    expect(campaign.published).toBeUndefined();
  });
  it("rejects stale edits and unauthorized review/publish actions", () => {
    expect(() => changeCampaign(draft(), { revision: 0, action: "save", content }, "editor", false)).toThrow("Reload");
    const pending = action(draft(), "submit");
    expect(() => action(pending, "approve", "another-editor", false)).toThrow("Administrator");
    expect(() => action(pending, "unpublish", "editor", false)).toThrow("administrators");
    expect(() => action(draft(), "approve")).toThrow("Submit");
  });
  it("blocks unsafe links, missing alt text and unsupported images before review", () => {
    for (const patch of [{ imageAlt: "" }, { buttonHref: "javascript:alert(1)" }, { buttonHref: "//evil.example" }, { image: "https://evil.example/banner.jpg" }]) {
      const campaign = { ...draft(), content: { ...content, ...patch } };
      expect(qualityIssues(campaign.content).length).toBeGreaterThan(0);
      expect(() => action(campaign, "submit")).toThrow(ContentError);
    }
    expect(qualityIssues(content)).toEqual([]);
  });
  it("validates unknown payloads and deduplicates product IDs", () => {
    expect(() => parseContent(null)).toThrow(ContentError);
    expect(() => parseContent({ ...content, slug: "../../etc" })).toThrow(ContentError);
    expect(() => parseContent({ ...content, productIds: ["<script>"] })).toThrow(ContentError);
    expect(parseContent({ ...content, productIds: ["fruit-1", "fruit-1"] }).productIds).toEqual(["fruit-1"]);
  });
});


describe("optional direct publishing", () => {
  it("lets an administrator publish their own draft without review", () => {
    const campaign = action(draft(), "publish_direct", "editor");
    expect(campaign.status).toBe("published");
    expect(campaign.published).toEqual(content);
    expect(campaign.approvedBy).toBeUndefined();
    expect(campaign.history.at(-1)?.action).toBe("publish_direct");
  });
  it("saves and publishes the current form atomically, and can submit its next revision for review", () => {
    const first = action(draft(), "publish_direct", "editor", true, { content: { ...content, title: "Immediate offer" } });
    expect(first.published?.title).toBe("Immediate offer");
    const pending = action(first, "submit", "editor", true, { content: { ...content, title: "Review this update" } });
    expect(pending.status).toBe("in_review");
    expect(pending.content.title).toBe("Review this update");
    expect(pending.published?.title).toBe("Immediate offer");
    expect(() => action(pending, "approve", "editor")).toThrow("different administrator");
    const approved = action(pending, "approve");
    expect(action(approved, "publish").published?.title).toBe("Review this update");
  });
  it("rejects editor-only direct publishing and invalid or stale content", () => {
    expect(() => action(draft(), "publish_direct", "editor", false)).toThrow("administrators");
    expect(() => action(draft(), "publish_direct", "editor", true, { content: { ...content, imageAlt: "" } })).toThrow("imageAlt");
    expect(() => action(draft(), "publish_direct", "editor", true, { content: { ...content, buttonHref: "javascript:alert(1)" } })).toThrow("internal website path");
    expect(() => changeCampaign(draft(), { action: "publish_direct", revision: 0, content }, "editor", true)).toThrow("Reload");
  });
});
