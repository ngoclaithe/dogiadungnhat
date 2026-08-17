"use client";

import { useCart } from "@/components/cart-provider";
import { Container } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();

  return (
    <Container className="py-12">
      <h1 className="font-display text-5xl">Giỏ hàng</h1>
      {!items.length ? (
        <p className="mt-8 text-stone">
          Chưa có sản phẩm.{" "}
          <Link href="/" className="text-matcha underline">
            Tiếp tục xem máy
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <ul className="divide-y divide-line overflow-hidden rounded-[2rem] border border-line bg-cream">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-paper">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <Link href={`/san-pham/${item.slug}`} className="font-medium">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone">{formatPrice(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQty(item.productId, Number(e.target.value))}
                      className="w-16 rounded-full border border-line px-3 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="text-sm text-copper"
                    >
                      Xóa
                    </button>
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
          </aside>
        </div>
      )}
    </Container>
  );
}
