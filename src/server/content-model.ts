import type { Campaign, CampaignContent } from "../types/content";

export class ContentError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function parseContent(input: unknown): CampaignContent {
  if (!input || typeof input !== "object") throw new ContentError(400, "Campaign content is required.");
  const value = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of ["title", "slug", "description", "image", "imageAlt", "buttonLabel", "buttonHref"]) {
    if (typeof value[key] !== "string" || (value[key] as string).length > 3000) {
      throw new ContentError(400, `Invalid ${key}.`);
    }
    result[key] = (value[key] as string).trim();
  }
  if (!result.title) throw new ContentError(400, "A title is required to save a draft.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug as string)) {
    throw new ContentError(400, "Use lowercase letters, numbers and single hyphens for the slug.");
  }
  if (!Array.isArray(value.productIds) || value.productIds.length > 20 || value.productIds.some(id => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))) {
    throw new ContentError(400, "Choose up to 20 valid product IDs.");
  }
  result.productIds = Array.from(new Set(value.productIds));
  return result as unknown as CampaignContent;
}

export function qualityIssues(content: CampaignContent): string[] {
  const issues: string[] = [];
  for (const key of ["title", "description", "image", "imageAlt", "buttonLabel", "buttonHref"] as const) {
    if (!content[key].trim()) issues.push(`${key} is required.`);
  }
  if (content.buttonHref && !/^\/(?!\/)[a-zA-Z0-9/_?=&%#.-]*$/.test(content.buttonHref)) {
    issues.push("Button destination must be an internal website path, such as /products.");
  }
  if (content.image && !isAllowedImage(content.image)) issues.push("Use a local image path or an HTTPS images.unsplash.com image.");
  return issues;
}

export function isAllowedImage(src: string): boolean {
  if (/^\/(?!\/)[a-zA-Z0-9/_%.-]+\.(png|jpg|jpeg|webp|avif)$/i.test(src)) return true;
  try { const url = new URL(src); return url.protocol === "https:" && url.hostname === "images.unsplash.com" && !url.username && !url.password && !url.port; }
  catch { return false; }
}

export function changeCampaign(campaign: Campaign, body: Record<string, unknown>, actor: string, reviewer: boolean): Campaign {
  if (body.revision !== campaign.revision) throw new ContentError(409, "This campaign changed. Reload it before saving.");
  const next: Campaign = JSON.parse(JSON.stringify(campaign));
  const action = body.action;
  if (action === "save" || action === "restore") {
    if (action === "restore") {
      const previous = next.history.find(version => version.revision === body.restoreRevision);
      if (!previous) throw new ContentError(404, "Version not found.");
      next.content = previous.content;
    } else next.content = parseContent(body.content);
    next.status = "draft";
    next.lastEditor = actor;
    delete next.approvedBy;
  } else if (action === "submit" || action === "publish_direct") {
    if (action === "publish_direct" && !reviewer) throw new ContentError(403, "Only administrators can publish directly.");
    if (body.content !== undefined) {
      next.content = parseContent(body.content);
      next.lastEditor = actor;
      next.status = "draft";
      delete next.approvedBy;
    }
    if (action === "submit" && next.status !== "draft") throw new ContentError(409, "Only drafts can be submitted.");
    const issues = qualityIssues(next.content);
    if (issues.length) throw new ContentError(400, issues.join(" "));
    if (action === "publish_direct") {
      next.published = { ...next.content };
      next.status = "published";
      delete next.approvedBy;
    } else next.status = "in_review";
  } else if (action === "approve" || action === "reject") {
    if (!reviewer) throw new ContentError(403, "Administrator review is required.");
    if (next.status !== "in_review") throw new ContentError(409, "Submit the draft for review first.");
    if (next.lastEditor === actor) throw new ContentError(403, "A different administrator must review this campaign.");
    next.status = action === "approve" ? "approved" : "draft";
    if (action === "approve") next.approvedBy = actor;
  } else if (action === "publish") {
    if (!reviewer) throw new ContentError(403, "Only administrators can publish.");
    if (next.status !== "approved" || !next.approvedBy || next.approvedBy === next.lastEditor) throw new ContentError(409, "Independent approval is required before publishing.");
    const issues = qualityIssues(next.content);
    if (issues.length) throw new ContentError(400, issues.join(" "));
    next.published = { ...next.content };
    next.status = "published";
  } else if (action === "unpublish") {
    if (!reviewer) throw new ContentError(403, "Only administrators can unpublish.");
    delete next.published;
    delete next.approvedBy;
    next.status = "draft";
  } else throw new ContentError(400, "Unknown campaign action.");
  next.revision++;
  next.updatedAt = new Date().toISOString();
  next.history.push({ revision: next.revision, content: next.content, actor, action: action as string, at: next.updatedAt });
  return next;
}
