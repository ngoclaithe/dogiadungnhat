"use client";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

function loginHref(pathname: string) {
  return `/tai-khoan?next=${encodeURIComponent(pathname)}`;
}

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
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [done, setDone] = useState(false);

  async function handleAdd() {
    if (!user) {
      router.push(loginHref(pathname));
      return;
    }
    await add(product, quantity);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <div className={`flex flex-col items-stretch gap-2 ${className}`}>
      <button
        type="button"
        disabled={!product.inStock}
        onClick={handleAdd}
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
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  function goLogin() {
    router.push(loginHref(pathname));
  }

  async function handleAdd() {
    if (!user) {
      goLogin();
      return;
    }
    await add(product, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  async function handleBuyNow() {
    if (!user) {
      goLogin();
      return;
    }
    await add(product, qty);
    router.push("/thanh-toan");
  }

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
          onClick={handleAdd}
          className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!product.inStock ? "Tạm hết hàng" : done ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        </button>
        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleBuyNow}
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
