import type { NextApiRequest } from "next";
import { ContentError } from "./content-model";
import { authenticate, CommerceError } from "./commerce-auth";

export async function contentUser(req: NextApiRequest) {
  try {
    const user = authenticate(req.headers.authorization);
    const reviewer = user.role === "admin";
    const editors = (process.env.CMS_EDITOR_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
    if (!reviewer && !editors.includes(user._id)) throw new ContentError(403, "Content editor access is required.");
    return { id: user._id, reviewer };
  } catch (error) {
    if (error instanceof CommerceError) throw new ContentError(error.status, error.message);
    throw error;
  }
}
