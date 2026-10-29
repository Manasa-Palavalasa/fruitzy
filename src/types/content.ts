export interface CampaignContent {
  title: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  buttonLabel: string;
  buttonHref: string;
  productIds: string[];
}

export type CampaignStatus = "draft" | "in_review" | "approved" | "published";
export interface CampaignVersion {
  revision: number;
  content: CampaignContent;
  actor: string;
  action: string;
  at: string;
}
export interface Campaign {
  id: string;
  revision: number;
  content: CampaignContent;
  status: CampaignStatus;
  lastEditor: string;
  approvedBy?: string;
  published?: CampaignContent;
  updatedAt: string;
  history: CampaignVersion[];
}
export interface PublicCampaign extends CampaignContent { id: string }
