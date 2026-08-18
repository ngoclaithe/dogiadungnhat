import { ProductActions } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Container, SectionHeading } from "@/components/ui";
import { api } from "@/lib/api";
import { SITE } from "@/lib/constants";
import { conditionLabel, discountPercent, formatPrice, stripHtml } from "@/lib/format";
import { sanitizeContent } from "@/lib/sanitize";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api.product(slug);
    const description = stripHtml(product.shortDescription || product.description).slice(0, 160);
    return {
      title: product.name,
      description: description || `${product.name} — nội địa Nhật tại ${SITE.name}. ${formatPrice(product.price)}.`,
      alternates: { canonical: `/san-pham/${slug}` },
      openGraph: { title: product.name, images: product.images[0]?.url ? [product.images[0].url] : [] },
    };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export async function generateStaticParams() {
  try {
    const list = await api.products({ limit: 48 });
    return list.items.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await api.product(slug);
  } catch {
    notFound();
  }
  const related = await api.related(slug).catch(() => []);
  const off = discountPercent(product.price, product.compareAtPrice);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    brand: product.brand,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.price ?? undefined,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-sm text-stone">
        <Link href="/">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href={`/danh-muc/${product.category.slug}`}>{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
            {product.brand ?? product.category.name}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight">{product.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-paper px-3 py-1">{conditionLabel(product.condition)}</span>
            <span className="rounded-full bg-paper px-3 py-1">
              {product.inStock ? "Còn hàng" : "Liên hệ tồn kho"}
            </span>
            {product.sku ? <span className="rounded-full bg-paper px-3 py-1">SKU {product.sku}</span> : null}
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
            {product.compareAtPrice && product.price && product.compareAtPrice > product.price ? (
              <>
                <p className="text-stone line-through">{formatPrice(product.compareAtPrice)}</p>
                {off ? <p className="rounded-full bg-copper px-2 py-0.5 text-xs text-cream">-{off}%</p> : null}
              </>
            ) : null}
          </div>
          {product.shortDescription || product.description ? (
            <p className="mt-5 text-stone">
              {(() => {
                const text = stripHtml(product.description || product.shortDescription);
                return text.length > 420 ? `${text.slice(0, 420).trimEnd()}…` : text;
              })()}
            </p>
          ) : null}
          <div className="mt-8">
            <ProductActions product={product} />
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="mt-3 inline-block rounded-full border border-line px-6 py-3 text-sm font-semibold"
            >
              Gọi {SITE.phoneDisplay}
            </a>
          </div>
          <p className="mt-6 text-sm text-stone">
            Liên hệ: {SITE.address}. Giờ làm việc {SITE.hours}.
          </p>
        </div>
      </div>

      {product.description ? (
        <article
          className="prose-ndn mt-12 rounded-[2rem] border border-line bg-cream p-6 sm:p-10"
          dangerouslySetInnerHTML={{ __html: sanitizeContent(product.description) }}
        />
      ) : null}

      {related.length ? (
        <div className="mt-16">
          <SectionHeading title="Máy cùng danh mục" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
