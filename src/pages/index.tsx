import React from "react";
import PublishedCampaigns from "@/components/content/PublishedCampaigns";
import BrowseByCategories from "@/components/common/BrowseByCategories";
import Carousel from "@/components/common/Carousel";
import PopularFruits from "@/components/common/PopularFruits";
import { Container } from "@mui/material";

export default function Home() {
  return (
    <Container sx={{ mt: { xs: -1, md: 3 }, px: { xs: 1, md: 3 } }}>
      <Carousel />
      <PublishedCampaigns />
      <PopularFruits />
      <BrowseByCategories />
    </Container>
  );
}

