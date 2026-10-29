import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Alert, Box, Button, Chip, CircularProgress, Container, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useAuthGuard } from "@/hooks/useAuthGuard.hooks";
import { createCampaign, listCampaigns, updateCampaign } from "@/services/content";
import { getProducts } from "@/services/product";
import type { Product } from "@/types";
import type { Campaign, CampaignContent } from "@/types/content";
import { qualityIssues } from "@/server/content-model";
import CampaignView from "@/components/content/CampaignView";
import FeaturedProducts from "@/components/content/FeaturedProducts";

const empty: CampaignContent = { title: "", slug: "", description: "", image: "/banner1.jpg", imageAlt: "", buttonLabel: "Shop now", buttonHref: "/products", productIds: [] };
const fields: [keyof Omit<CampaignContent, "productIds">, string][] = [["title", "Campaign title"], ["slug", "URL slug"], ["description", "Promotional text"], ["image", "Banner image URL"], ["imageAlt", "Image description (alt text)"], ["buttonLabel", "Button label"], ["buttonHref", "Button destination"]];

export default function ContentDashboard() {
  const { isLoading, isAuthorized } = useAuthGuard();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [current, setCurrent] = useState<Campaign | null>(null);
  const [form, setForm] = useState<CampaignContent>({ ...empty });
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewer, setReviewer] = useState(false);
  const [delivery, setDelivery] = useState<"submit" | "publish_direct">("submit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [productError, setProductError] = useState(false);
  const dirty = !!current && JSON.stringify(form) !== JSON.stringify(current.content);
  const issues = qualityIssues(form);

  function select(campaign: Campaign | null) { setCurrent(campaign); setForm(campaign ? campaign.content : { ...empty, productIds: [] }); setMessage(""); setError(""); }
  useEffect(() => {
    if (!isAuthorized || isLoading) return;
    let active = true;
    listCampaigns().then(data => { if (active) { setCampaigns(data.campaigns); setReviewer(data.reviewer); setReady(true); } }).catch(e => { if (active) setError(e.message); });
    getProducts({ limit: 100 }).then(data => { if (active) setProducts(data.products); }).catch(() => { if (active) setProductError(true); });
    return () => { active = false; };
  }, [isAuthorized, isLoading]);

  async function run(action: string, extra = {}) {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = current ? await updateCampaign(current, action, ["save", "submit", "publish_direct"].includes(action) ? { content: form } : extra) : await createCampaign(form, action);
      setCurrent(result.campaign); setForm(result.campaign.content);
      setCampaigns(previous => [result.campaign, ...previous.filter(c => c.id !== result.campaign.id)]);
      setMessage(action === "save" ? "Draft saved." : action === "publish_direct" || action === "publish" ? "Campaign published." : action === "submit" ? "Campaign sent for review." : `Campaign ${action} completed.`);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function reload() {
    setBusy(true); setError("");
    try { const data = await listCampaigns(); setCampaigns(data.campaigns); setReviewer(data.reviewer); setReady(true); select(data.campaigns.find(c => c.id === current?.id) || null); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  if (isLoading || !isAuthorized) return <CircularProgress aria-label="Checking access" />;
  return <Container>
    <Head><title>Content studio | Fruitzy</title><meta name="robots" content="noindex,nofollow" /></Head>
    <Typography component="h1" variant="h4" gutterBottom>Content studio</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Create and preview campaigns, then choose to publish immediately or ask for review.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    <Button onClick={reload} disabled={busy} sx={{ mb: 2 }}>Reload campaigns (discards unsaved changes)</Button>
    {ready && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: 3 }}>
      <Stack component="nav" aria-label="Campaigns" spacing={1}>
        <Button variant="contained" disabled={busy} onClick={() => select(null)}>New campaign</Button>
        {campaigns.map(c => <Button key={c.id} disabled={busy} variant={c.id === current?.id ? "outlined" : "text"} onClick={() => select(c)} sx={{ justifyContent: "flex-start", textAlign: "left" }}>{c.content.title} ({c.status.replace("_", " ")}){c.published ? " - live" : ""}</Button>)}
      </Stack>
      <Box component="section" aria-label="Campaign editor">
        <Stack direction="row" gap={1} sx={{ mb: 2 }}><Chip label={current?.status || "New draft"} />{current?.published && <Chip color="success" label="Live version available" />}{dirty && <Chip label="Unsaved changes" />}</Stack>
        <Box component="form" onSubmit={e => { e.preventDefault(); run(delivery); }}>
          <Stack spacing={2}>
            {fields.map(([key, label]) => <TextField key={key} label={label} value={form[key]} required={key === "title" || key === "slug"} disabled={busy} multiline={key === "description"} minRows={key === "description" ? 3 : undefined} inputProps={{ maxLength: 3000 }} onChange={e => setForm({ ...form, [key]: e.target.value })} helperText={key === "image" ? "Local path such as /banner1.jpg, or https://images.unsplash.com/..." : key === "slug" ? "Example: summer-sale" : undefined} />)}
            <FormControl><InputLabel id="products-label">Featured products</InputLabel><Select multiple labelId="products-label" label="Featured products" value={form.productIds} disabled={busy} onChange={e => setForm({ ...form, productIds: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value })}>
              {Array.from(new Set([...products.map(p => p._id), ...form.productIds])).map(id => <MenuItem key={id} value={id}>{products.find(p => p._id === id)?.name || `Previously selected: ${id}`}</MenuItem>)}
            </Select></FormControl>
            {productError && <Alert severity="warning">Products could not be loaded from the commerce backend. Existing selections are preserved.</Alert>}
            <FormControl disabled={busy}>
              <FormLabel id="delivery-label">Publishing option</FormLabel>
              <RadioGroup aria-labelledby="delivery-label" value={delivery} onChange={e => setDelivery(e.target.value as "submit" | "publish_direct")}>
                <FormControlLabel value="publish_direct" control={<Radio />} label="Publish immediately" disabled={!reviewer} />
                <FormControlLabel value="submit" control={<Radio />} label="Ask for review" />
              </RadioGroup>
              <Typography variant="caption">{delivery === "publish_direct" ? "The campaign will appear on the storefront immediately." : "Your changes stay private until another administrator approves and publishes them."}{!reviewer && " Immediate publishing is available to administrators."}</Typography>
            </FormControl>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Button type="submit" variant="contained" disabled={busy || issues.length > 0 || (delivery === "publish_direct" && !reviewer)}>{delivery === "publish_direct" ? "Publish immediately" : "Ask for review"}</Button>
              <Button type="button" disabled={busy} onClick={() => run("save")}>Save draft</Button>
              <Button onClick={() => setPreview(!preview)}>{preview ? "Hide preview" : "Preview content"}</Button>
              {current?.status === "in_review" && reviewer && <><Button disabled={busy || dirty} onClick={() => run("approve")}>Approve</Button><Button disabled={busy || dirty} onClick={() => run("reject")}>Return to draft</Button></>}
              {current?.status === "approved" && reviewer && <Button disabled={busy || dirty} onClick={() => run("publish")}>Publish approved version</Button>}
              {current?.published && reviewer && <Button color="warning" disabled={busy || dirty} onClick={() => run("unpublish")}>Unpublish</Button>}
            </Stack>
          </Stack>
        </Box>
        {issues.length > 0 && <Alert severity="info" sx={{ mt: 2 }}><strong>Before publishing or review:</strong><ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul></Alert>}
        {preview && <Box sx={{ mt: 3 }}><Button onClick={() => setMobile(!mobile)}>Switch to {mobile ? "desktop" : "mobile"} width</Button><Typography variant="caption" display="block">Preview of the current form, including unsaved changes. Images load from the entered URL.</Typography><Box sx={{ maxWidth: mobile ? 375 : "100%", mx: "auto" }}><CampaignView content={form} /><FeaturedProducts ids={form.productIds} /></Box></Box>}
        {current && <Box sx={{ mt: 4 }}><Typography component="h2" variant="h6">Version history</Typography><Typography variant="body2">Restoring creates a new draft. Choose immediate publishing or ask for review again.</Typography><Stack spacing={1} sx={{ mt: 2 }}>{[...current.history].reverse().map(version => <Box key={version.revision} sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}><Typography variant="body2">v{version.revision} - {version.action} - {new Date(version.at).toLocaleString()} - {version.actor}</Typography><Button size="small" disabled={busy || dirty} onClick={() => run("restore", { restoreRevision: version.revision })}>Restore v{version.revision}</Button></Box>)}</Stack></Box>}
      </Box>
    </Box>}
  </Container>;
}

