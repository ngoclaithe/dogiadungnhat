"use client";

import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/types";
import { useState } from "react";

export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useCart();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(product);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className={`rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink-soft ${className}`}
    >
      {done ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
    </button>
  );
}
