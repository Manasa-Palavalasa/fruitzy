/** @jest-environment node */
import handler from "../pages/api/content/[[...path]]";
import { contentUser } from "./content-auth";
import { readCampaigns, writeCampaigns } from "./content-store";
import { ContentError } from "./content-model";
import type { NextApiRequest, NextApiResponse } from "next";
jest.mock("./content-auth");
jest.mock("./content-store");
const mockUser = contentUser as jest.Mock;
const mockRead = readCampaigns as jest.Mock;
function response() {
  const res = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}
beforeEach(() => jest.resetAllMocks());
it("returns only published snapshots to anonymous shoppers", async () => {
  mockRead.mockResolvedValue([{ id: "one", content: { title: "Private update" }, published: { title: "Live sale", slug: "sale" }, history: ["secret"] }, { id: "two", content: { title: "Unpublished" } }]);
  const res = response();
  await handler({ query: { path: ["published"] }, method: "GET" } as unknown as NextApiRequest, res as unknown as NextApiResponse);
  expect(res.json).toHaveBeenCalledWith({ campaigns: [{ id: "one", title: "Live sale", slug: "sale" }] });
  expect(mockUser).not.toHaveBeenCalled();
});
it("denies private campaign reads before accessing storage", async () => {
  mockUser.mockRejectedValue(new ContentError(401, "Please sign in."));
  const res = response();
  await handler({ query: {}, method: "GET" } as NextApiRequest, res as unknown as NextApiResponse);
  expect(res.status).toHaveBeenCalledWith(401);
  expect(mockRead).not.toHaveBeenCalled();
});


const creationContent = { title: "Sale", slug: "sale", description: "Fresh fruit offers", image: "/banner1.jpg", imageAlt: "Fresh fruit", buttonLabel: "Shop now", buttonHref: "/products", productIds: [] };
const mockWrite = writeCampaigns as jest.Mock;
it.each([
  ["save", "draft", true],
  ["submit", "in_review", false],
  ["publish_direct", "published", true],
])("creates a campaign with %s in one request", async (action, status, reviewer) => {
  mockUser.mockResolvedValue({ id: "author", reviewer });
  mockWrite.mockImplementation(update => update([]));
  const res = response();
  await handler({ query: {}, method: "POST", body: { content: creationContent, action } } as NextApiRequest, res as unknown as NextApiResponse);
  expect(res.status).toHaveBeenCalledWith(201);
  const campaign = res.json.mock.calls[0][0].campaign;
  expect(campaign.status).toBe(status);
  expect(campaign.published).toEqual(status === "published" ? creationContent : undefined);
  expect(mockWrite).toHaveBeenCalledTimes(1);
});
it.each([
  ["publish_direct", false, creationContent, 403],
  ["publish_direct", true, { ...creationContent, imageAlt: "" }, 400],
  ["submit", true, { ...creationContent, buttonHref: "//evil.example" }, 400],
  ["approve", true, creationContent, 400],
])("does not persist a new campaign when %s is rejected", async (action, reviewer, content, status) => {
  mockUser.mockResolvedValue({ id: "author", reviewer });
  const res = response();
  await handler({ query: {}, method: "POST", body: { content, action } } as NextApiRequest, res as unknown as NextApiResponse);
  expect(res.status).toHaveBeenCalledWith(status);
  expect(mockWrite).not.toHaveBeenCalled();
});
