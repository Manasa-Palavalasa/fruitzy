import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button } from "@mui/material";
import { publishedCampaigns } from "@/services/content";
import type { PublicCampaign } from "@/types/content";
import CampaignView from "./CampaignView";

export default function PublishedCampaigns() {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    publishedCampaigns().then(data => { if (active) setCampaigns(data.campaigns); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  if (error) return <Alert severity="info">Promotions are temporarily unavailable. You can still browse products.</Alert>;
  return <Box>{campaigns.map(content => <Box key={content.id}>
    <CampaignView content={content} />
    <Button component={Link} href={`/campaigns/${content.slug}`}>View campaign and featured products</Button>
  </Box>)}</Box>;
}
