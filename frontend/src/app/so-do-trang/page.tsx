import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { POLICY_LINKS } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sơ đồ trang",
  description: "Sơ đồ trang Nội Địa Nhật: danh mục, sản phẩm, tin tức và chính sách.",
  alternates: { canonical: "/so-do-trang" },
};

export default async function HtmlSitemapPage() {
  const data = await api.sitemap().catch(() => ({
    categories: [],
    products: [],
    posts: [],
    pages: [],
  }));

  const staticPages = [
    { href: "/", label: "Trang chủ" },
    { href: "/tim-kiem", label: "Tìm kiếm" },
    { href: "/gio-hang", label: "Giỏ hàng" },
    { href: "/thanh-toan", label: "Thanh toán" },
    { href: "/kiem-tra-don-hang", label: "Kiểm tra đơn hàng" },
    { href: "/tai-khoan", label: "Tài khoản" },
    { href: "/lien-he", label: "Liên hệ" },
    { href: "/tin-tuc", label: "Tin tức" },
  ];

  return (
    <Container className="py-12">
      <h1 className="font-display text-5xl">Sơ đồ trang</h1>
      <p className="mt-3 max-w-2xl text-stone">
        Danh sách trang, danh mục và sản phẩm trên website.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Trang</h2>
        <ul className="mt-4 columns-1 gap-x-10 text-sm sm:columns-2">
          {staticPages.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href} className="text-matcha hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
          {POLICY_LINKS.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href} className="text-matcha hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Danh mục</h2>
        <ul className="mt-4 columns-1 gap-x-10 text-sm sm:columns-2">
          {data.categories.map((item) => (
            <li key={item.slug} className="mb-2">
              <Link href={`/danh-muc/${item.slug}`} className="hover:text-matcha">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Sản phẩm</h2>
        <ul className="mt-4 columns-1 gap-x-10 text-sm md:columns-2">
          {data.products.map((item) => (
            <li key={item.slug} className="mb-2 break-inside-avoid">
              <Link href={`/san-pham/${item.slug}`} className="hover:text-matcha">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl">Tin tức</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {data.posts.map((item) => (
            <li key={item.slug}>
              <Link href={`/tin-tuc/${item.slug}`} className="hover:text-matcha">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
