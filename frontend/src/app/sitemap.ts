import { api } from "@/lib/api";
import { POLICY_LINKS } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/lien-he`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/tin-tuc`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/kiem-tra-don-hang`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/so-do-trang`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
    ...POLICY_LINKS.map((page) => ({
      url: `${base}${page.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  const seen = new Set(entries.map((item) => item.url));

  try {
    const data = await api.sitemap();
    data.categories.forEach((item) => {
      entries.push({
        url: `${base}/danh-muc/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });
    });
    data.products.forEach((item) => {
      entries.push({
        url: `${base}/san-pham/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
    data.posts.forEach((item) => {
      entries.push({
        url: `${base}/tin-tuc/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    });
    data.pages.forEach((item) => {
      const url = `${base}/chinh-sach/${item.slug}`;
      if (seen.has(url)) return;
      entries.push({
        url,
        lastModified: item.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    });
  } catch {
    /* API chưa chạy lúc build */
  }

  return entries;
}
