import { ProductCard } from "@/components/product-card";
import { Container, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";
import { SITE } from "@/lib/constants";
import type { Category, Post, Product } from "@/lib/types";
import { ArrowRight, ShieldCheck, Sparkles, Truck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `${SITE.name} — Uy tín, chất lượng, bảo hành dài hạn`,
  description: SITE.description,
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [nav, featured, posts] = await Promise.all([
    safe(() => api.navCategories(), [] as Category[]),
    safe(() => api.featured(), [] as Product[]),
    safe(() => api.posts(), [] as Post[]),
  ]);

  const sections = await Promise.all(
    nav.slice(0, 4).map(async (cat) => ({
      category: cat,
      products: await safe(() => api.byCategory(cat.slug), [] as Product[]),
    })),
  );

  const heroProduct = featured[0] ?? sections.flatMap((s) => s.products)[0];
  const heroImage = heroProduct?.images[0]?.url;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-ink text-cream">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-matcha/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-56 w-56 rounded-full bg-copper/20 blur-3xl" />
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-soft">
              Gia dụng nội địa Nhật
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
              Máy giặt, điều hòa, tủ lạnh — nhập khẩu nội địa Nhật Bản
            </h1>
            <p className="mt-5 max-w-xl text-cream/75">
              Không phải hàng lắp ráp thị trường Việt. Mỗi máy được kiểm tra, vệ sinh,
              kèm tư vấn biến áp 100V và bảo hành rõ ràng trước khi rời showroom.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/danh-muc/may-giat"
                className="rounded-full bg-copper px-6 py-3 text-sm font-semibold text-cream"
              >
                Xem máy giặt
              </Link>
              <Link
                href="/lien-he"
                className="rounded-full border border-cream/20 px-6 py-3 text-sm font-semibold text-cream"
              >
                Liên hệ tư vấn
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-cream/50">Giờ mở cửa</dt>
                <dd className="mt-1 font-medium">7:30 – 22:00</dd>
              </div>
              <div>
                <dt className="text-cream/50">Hotline</dt>
                <dd className="mt-1 font-medium">{SITE.phoneDisplay}</dd>
              </div>
              <div>
                <dt className="text-cream/50">Bảo hành</dt>
                <dd className="mt-1 font-medium">Dài hạn theo máy</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-soft sm:aspect-[5/4] lg:aspect-[4/5]">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={heroProduct?.name ?? "Gia dụng Nhật"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              ) : (
                <div className="grid h-full place-items-center text-cream/40">Nội Địa Nhật</div>
              )}
            </div>
            {heroProduct ? (
              <Link
                href={`/san-pham/${heroProduct.slug}`}
                className="absolute bottom-4 left-4 right-4 rounded-2xl bg-cream/95 p-4 text-ink shadow-xl"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                  Nổi bật tuần này
                </p>
                <p className="mt-1 font-medium">{heroProduct.name}</p>
              </Link>
            ) : null}
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <SectionHeading eyebrow="Danh mục" title="Chọn đúng nhóm máy" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {nav.map((cat) => (
            <Link
              key={cat.id}
              href={`/danh-muc/${cat.slug}`}
              className="group overflow-hidden rounded-3xl border border-line bg-cream"
            >
              <div className="relative aspect-[5/3] bg-paper">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="25vw"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <p className="text-xs text-stone">{cat._count?.products ?? 0} sản phẩm</p>
                </div>
                <ArrowRight className="h-4 w-4 text-matcha" />
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <Container>
        <div className="grid gap-4 rounded-[2rem] border border-line bg-cream p-6 md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Bảo hành dài hạn", text: "Phiếu xuất rõ thời hạn, hỗ trợ tại showroom." },
            { icon: Wrench, title: "Đổi nguồn 100V", text: "Tư vấn biến áp phù hợp từng model nội địa." },
            { icon: Sparkles, title: "Kiểm tra trước giao", text: "Vệ sinh, test chức năng, ảnh thật theo máy." },
            { icon: Truck, title: "Giao lắp Hà Nội", text: "Hỗ trợ giao lắp theo lịch 7:30 – 22:00." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-stone">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {sections.map(({ category, products }) =>
        products.length ? (
          <Container key={category.id} className="py-16">
            <SectionHeading
              eyebrow="Bộ sưu tập"
              title={category.name}
              href={`/danh-muc/${category.slug}`}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        ) : null,
      )}

      {posts.length ? (
        <Container className="pb-16">
          <SectionHeading eyebrow="Góc kỹ thuật" title="Tin tức" href="/tin-tuc" />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/tin-tuc/${post.slug}`}
                className="overflow-hidden rounded-3xl border border-line bg-cream"
              >
                <div className="relative aspect-[16/9] bg-paper">
                  {post.coverUrl ? (
                    <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl leading-snug">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-stone">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}
