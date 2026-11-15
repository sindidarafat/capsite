import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { getJobs, getWorks } from "@/lib/store";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cap.direct";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, jobs] = await Promise.all([getWorks(), getJobs()]);
  const pages = ["", "/work", "/services", "/services/content", "/services/analytics", "/services/production", "/about", "/team", "/careers", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...works.map((w) => ({ url: `${BASE}/work/${w.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...jobs.map((j) => ({ url: `${BASE}/careers/${j.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
