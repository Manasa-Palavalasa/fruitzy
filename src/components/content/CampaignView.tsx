import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import type { CampaignContent } from "@/types/content";
import { isAllowedImage } from "@/server/content-model";

export default function CampaignView({ content, heading = "h2", priority = false }: { content: CampaignContent; heading?: "h1" | "h2"; priority?: boolean }) {
  const safeHref = /^\/(?!\/)[a-zA-Z0-9/_?=&%#.-]*$/.test(content.buttonHref);
  return <Card component="section" variant="outlined" sx={{ my: 3, overflow: "hidden" }}>
    {isAllowedImage(content.image) && <Box sx={{ position: "relative", height: { xs: 180, md: 300 } }}>
      <Image src={content.image} alt={content.imageAlt} fill sizes="(max-width: 600px) 100vw, 1100px" priority={priority} style={{ objectFit: "cover" }} />
    </Box>}
    <CardContent>
      <Typography component={heading} variant="h4" gutterBottom>{content.title || "Campaign title"}</Typography>
      <Typography sx={{ mb: 2, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{content.description}</Typography>
      {safeHref && <Button component={Link} href={content.buttonHref} variant="contained">{content.buttonLabel || "Shop now"}</Button>}
    </CardContent>
  </Card>;
}
