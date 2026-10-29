import type { NextApiRequest, NextApiResponse } from "next";
import { commerceRequest } from "../../../server/commerce";
import { CommerceError } from "../../../server/commerce-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const parts = req.query.path;
    const result = commerceRequest(req, Array.isArray(parts) ? parts : []);
    return res.status(result.status || 200).json(result.data);
  } catch (error) {
    if (error instanceof CommerceError) {
      if (error.allowed) res.setHeader("Allow", error.allowed.join(", "));
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Commerce API error", error);
    return res.status(500).json({ message: "Unable to process the request." });
  }
}
export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };
