import React from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import CampaignView from "@/components/content/CampaignView";
import FeaturedProducts from "@/components/content/FeaturedProducts";
import type { PublicCampaign } from "@/types/content";

export default function CampaignPage({ campaign }: { campaign: PublicCampaign }) {
  return <>
    <Head><title>{campaign.title} | Fruitzy</title><meta name="description" content={campaign.description.slice(0, 160)} /></Head>
    <CampaignView content={campaign} heading="h1" priority />
    <FeaturedProducts ids={campaign.productIds} />
  </>;
}
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  res.setHeader("Cache-Control", "no-store");
  const { readCampaigns } = await import("@/server/content-store");
  const item = (await readCampaigns()).find(c => c.published?.slug === params?.slug);
  if (!item?.published) return { notFound: true };
  return { props: { campaign: { ...item.published, id: item.id } } };
};
