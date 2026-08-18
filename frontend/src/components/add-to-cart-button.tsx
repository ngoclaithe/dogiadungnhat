"use client";

import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton({
  product,
  className = "",
  quantity = 1,
  compact = false,
}: {
  product: Product;
  className?: string;
  quantity?: number;
  compact?: boolean;
}) {
  const { add } = useCart();
  const [done, setDone] = useState(false);

  return (
    <div className={`flex flex-col items-stretch gap-2 ${className}`}>
      <button
        type="button"
        disabled={!product.inStock}
        onClick={() => {
          add(product, quantity);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!product.inStock ? "Tạm hết hàng" : done ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
      </button>
      {done && !compact ? (
        <Link href="/gio-hang" className="text-center text-xs text-matcha underline">
          Xem giỏ hàng
        </Link>
      ) : null}
    </div>
  );
}

export function ProductActions({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-stone">Số lượng</span>
        <div className="flex items-center rounded-full border border-line bg-cream">
          <button
            type="button"
            className="h-10 w-10"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            className="h-10 w-10"
            onClick={() => setQty((n) => n + 1)}
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => {
            add(product, qty);
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          }}
          className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!product.inStock ? "Tạm hết hàng" : done ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        </button>
        <button
          type="button"
          disabled={!product.inStock}
          onClick={() => {
            add(product, qty);
            router.push("/thanh-toan");
          }}
          className="rounded-full border border-line px-8 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mua ngay
        </button>
      </div>
      {done ? (
        <Link href="/gio-hang" className="text-sm text-matcha underline">
          Xem giỏ hàng
        </Link>
      ) : null}
    </div>
  );
}
