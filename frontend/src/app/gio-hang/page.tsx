"use client";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Container } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { user, ready: authReady } = useAuth();
  const { items, subtotal, setQty, remove, ready } = useCart();

  if (!ready || !authReady) {
    return (
      <Container className="py-12">
        <h1 className="font-display text-5xl">Giỏ hàng</h1>
        <p className="mt-8 text-stone">Đang tải giỏ hàng...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-12">
        <h1 className="font-display text-5xl">Giỏ hàng</h1>
        <div className="mt-8 max-w-lg rounded-[2rem] border border-line bg-cream p-8">
          <p className="text-stone">Giỏ hàng được lưu theo từng tài khoản. Vui lòng đăng nhập để xem và mua hàng.</p>
          <Link
            href="/tai-khoan?next=/gio-hang"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Đăng nhập
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-5xl">Giỏ hàng</h1>
      {!items.length ? (
        <div className="mt-8 rounded-[2rem] border border-line bg-cream p-8">
          <p className="text-stone">Chưa có sản phẩm trong giỏ.</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Tiếp tục xem máy
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <ul className="divide-y divide-line overflow-hidden rounded-[2rem] border border-line bg-cream">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link
                  href={`/san-pham/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-paper"
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1">
                  <Link href={`/san-pham/${item.slug}`} className="font-medium">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone">{formatPrice(item.price)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label="Giảm số lượng"
                        onClick={() => setQty(item.productId, item.quantity - 1)}
                        className="grid h-9 w-9 place-items-center"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tăng số lượng"
                        onClick={() => setQty(item.productId, item.quantity + 1)}
                        className="grid h-9 w-9 place-items-center"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="inline-flex items-center gap-1 text-sm text-copper"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                    <p className="ml-auto text-sm font-semibold">
                      {formatPrice((item.price ?? 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-[2rem] border border-line bg-cream p-6">
            <p className="text-sm text-stone">Tạm tính</p>
            <p className="mt-2 font-display text-4xl">{formatPrice(subtotal)}</p>
            <p className="mt-2 text-xs text-stone">Máy “Liên hệ” sẽ được báo giá khi xác nhận đơn.</p>
            <Link
              href="/thanh-toan"
              className="mt-6 block rounded-full bg-ink py-3 text-center text-sm font-semibold text-cream"
            >
              Thanh toán
            </Link>
            <Link href="/" className="mt-3 block text-center text-sm text-matcha underline">
              Tiếp tục mua hàng
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
