import { ProductCard } from "@/components/product-card";
import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const list = q
    ? await api.products({ q, limit: 24 }).catch(() => ({ items: [], total: 0, page: 1, limit: 24, pageCount: 0 }))
    : { items: [], total: 0, page: 1, limit: 24, pageCount: 0 };

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl">Tìm kiếm</h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nhập model, hãng, từ khóa..."
          className="w-full max-w-xl rounded-full border border-line bg-cream px-5 py-3 outline-none"
        />
      </form>
      {q ? (
        <p className="mt-4 text-sm text-stone">
          {list.total} kết quả cho “{q}”
        </p>
      ) : (
        <p className="mt-4 text-stone">Nhập từ khóa để tìm máy nội địa Nhật.</p>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Container>
  );
}
