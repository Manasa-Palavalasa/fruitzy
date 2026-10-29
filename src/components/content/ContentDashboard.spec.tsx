import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ContentDashboard from "@/pages/admin/content";
import { listCampaigns, createCampaign, updateCampaign } from "@/services/content";
import { getProducts } from "@/services/product";
import type { Campaign, CampaignContent } from "@/types/content";

jest.mock("@/hooks/useAuthGuard.hooks", () => ({ useAuthGuard: () => ({ isLoading: false, isAuthorized: true }) }));
jest.mock("@/services/content", () => ({ listCampaigns: jest.fn(), createCampaign: jest.fn(), updateCampaign: jest.fn() }));
jest.mock("@/services/product", () => ({ getProducts: jest.fn() }));
jest.mock("@/components/content/CampaignView", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/content/FeaturedProducts", () => ({ __esModule: true, default: () => null }));

const content: CampaignContent = { title: "Sale", slug: "sale", description: "Fresh fruit offers", image: "/banner1.jpg", imageAlt: "Fresh fruit", buttonLabel: "Shop now", buttonHref: "/products", productIds: [] };
const campaign: Campaign = { id: "sale", revision: 1, content, status: "draft", lastEditor: "author", updatedAt: "2026-01-01", history: [] };
beforeEach(() => {
  jest.resetAllMocks();
  (listCampaigns as jest.Mock).mockResolvedValue({ campaigns: [], reviewer: true });
  (getProducts as jest.Mock).mockResolvedValue({ products: [] });
  (createCampaign as jest.Mock).mockImplementation(async (value, action) => ({ campaign: { ...campaign, content: value, status: action === "publish_direct" ? "published" : "in_review" } }));
});
async function fillNewCampaign() {
  await screen.findByRole("textbox", { name: /Campaign title/ });
  for (const [label, value] of [["Campaign title", "Sale"], ["URL slug", "sale"], ["Promotional text", "Fresh fruit offers"], ["Image description", "Fresh fruit"]]) {
    fireEvent.change(screen.getByRole("textbox", { name: new RegExp(label) }), { target: { value } });
  }
}
it.each([ ["Publish immediately", "publish_direct", "Campaign published."], ["Ask for review", "submit", "Campaign sent for review."] ])("can choose %s while creating without saving first", async (label, action, message) => {
  render(<ContentDashboard />);
  await fillNewCampaign();
  fireEvent.click(screen.getByRole("radio", { name: label }));
  fireEvent.click(screen.getByRole("button", { name: label }));
  await screen.findByText(message);
  expect(createCampaign).toHaveBeenCalledWith(content, action);
  expect(updateCampaign).not.toHaveBeenCalled();
});
it("shows editor-only users that direct publishing requires administrator access", async () => {
  (listCampaigns as jest.Mock).mockResolvedValue({ campaigns: [], reviewer: false });
  render(<ContentDashboard />);
  await fillNewCampaign();
  expect(screen.getByRole("radio", { name: "Publish immediately" })).toBeDisabled();
  expect(screen.getByRole("radio", { name: "Ask for review" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Ask for review" }));
  await screen.findByText("Campaign sent for review.");
  expect(createCampaign).toHaveBeenCalledWith(content, "submit");
});
it("publishes the latest form changes when editing an existing campaign", async () => {
  (listCampaigns as jest.Mock).mockResolvedValue({ campaigns: [campaign], reviewer: true });
  (updateCampaign as jest.Mock).mockResolvedValue({ campaign: { ...campaign, status: "published", content: { ...content, title: "New offer" } } });
  render(<ContentDashboard />);
  fireEvent.click(await screen.findByRole("button", { name: /Sale \(draft\)/ }));
  fireEvent.change(screen.getByRole("textbox", { name: /Campaign title/ }), { target: { value: "New offer" } });
  fireEvent.click(screen.getByRole("radio", { name: "Publish immediately" }));
  fireEvent.click(screen.getByRole("button", { name: "Publish immediately" }));
  await waitFor(() => expect(updateCampaign).toHaveBeenCalledWith(campaign, "publish_direct", { content: { ...content, title: "New offer" } }));
  await screen.findByText("Campaign published.");
});
