import { api } from "@/lib/api";
import { POLICY_LINKS } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPaths = [
    "",
    "/lien-he",
    "/tin-tuc",
    "/kiem-tra-don-hang",
    "/so-do-trang",
    "/tai-khoan",
    ...POLICY_LINKS.map((p) => p.href),
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

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
  } catch {
    /* API chưa chạy lúc build */
  }

  return entries;
}
