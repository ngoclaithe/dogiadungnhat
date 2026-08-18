import { AddToCartButton } from "@/components/add-to-cart-button";
import { conditionLabel, discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const off = discountPercent(product.price, product.compareAtPrice);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_10px_30px_rgba(12,46,43,0.04)]">
      <Link href={`/san-pham/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-paper">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone">Chưa có ảnh</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {off ? (
            <span className="rounded-full bg-copper px-2.5 py-1 text-[11px] font-semibold text-cream">
              -{off}%
            </span>
          ) : null}
          <span className="rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-medium text-ink">
            {conditionLabel(product.condition)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.brand ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
            {product.brand}
          </p>
        ) : null}
        <Link href={`/san-pham/${product.slug}`} className="mt-1 line-clamp-2 min-h-12 font-medium leading-snug">
          {product.name}
        </Link>
        <div className="mt-3 flex items-end gap-2">
          <p className="text-lg font-semibold text-ink">{formatPrice(product.price)}</p>
          {product.compareAtPrice && product.price && product.compareAtPrice > product.price ? (
            <p className="text-sm text-stone line-through">{formatPrice(product.compareAtPrice)}</p>
          ) : null}
        </div>
        <div className="mt-4">
          <AddToCartButton product={product} className="w-full" compact />
        </div>
      </div>
    </article>
  );
}
