import { ProductCard } from "@/components/product-card";
import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await api.category(slug);
    return {
      title: category.name,
      description: category.description ?? `Mua ${category.name} nội địa Nhật tại ${SITE.name}.`,
      alternates: { canonical: `/danh-muc/${slug}` },
    };
  } catch {
    return { title: "Danh mục" };
  }
}

export async function generateStaticParams() {
  try {
    const cats = await api.categories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  let category;
  try {
    category = await api.category(slug);
  } catch {
    notFound();
  }
  const list = await api.products({
    category: slug,
    sort: sort || "newest",
    page: Number(page || 1),
    limit: 12,
  });

  const sorts = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá thấp đến cao" },
    { value: "price_desc", label: "Giá cao xuống thấp" },
    { value: "name", label: "Tên A-Z" },
  ];

  return (
    <Container className="py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">Danh mục</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-stone">{category.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-stone">{list.total} sản phẩm</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {sorts.map((item) => (
          <a
            key={item.value}
            href={`/danh-muc/${slug}?sort=${item.value}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              (sort || "newest") === item.value
                ? "bg-ink text-cream"
                : "border border-line bg-cream"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {list.items.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-3xl border border-dashed border-line bg-cream p-10 text-center text-stone">
          Danh mục đang cập nhật. Liên hệ {SITE.phoneDisplay} để được tư vấn.
        </p>
      )}

      {list.pageCount > 1 ? (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: list.pageCount }, (_, i) => i + 1).map((n) => (
            <a
              key={n}
              href={`/danh-muc/${slug}?sort=${sort || "newest"}&page=${n}`}
              className={`grid h-10 w-10 place-items-center rounded-full text-sm ${
                n === list.page ? "bg-ink text-cream" : "border border-line bg-cream"
              }`}
            >
              {n}
            </a>
          ))}
        </div>
      ) : null}
    </Container>
  );
}
