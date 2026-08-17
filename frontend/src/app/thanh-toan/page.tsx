"use client";

import { useCart } from "@/components/cart-provider";
import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const order = await api.createOrder({
        customerName: form.get("customerName"),
        phone: form.get("phone"),
        email: form.get("email") || undefined,
        address: form.get("address"),
        note: form.get("note") || undefined,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      clear();
      setCode(order.code);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!items.length && !code) {
    return (
      <Container className="py-12">
        <h1 className="font-display text-4xl">Thanh toán</h1>
        <p className="mt-4 text-stone">
          Giỏ hàng trống. <Link href="/gio-hang">Quay lại giỏ</Link>
        </p>
      </Container>
    );
  }

  if (code) {
    return (
      <Container className="max-w-xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-copper">Đặt hàng thành công</p>
        <h1 className="mt-3 font-display text-5xl">{code}</h1>
        <p className="mt-4 text-stone">Lưu mã này để theo dõi. Nhân viên sẽ gọi xác nhận lắp đặt.</p>
        <Link
          href={`/kiem-tra-don-hang`}
          className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          Kiểm tra đơn hàng
        </Link>
      </Container>
    );
  }

  return (
    <Container className="grid gap-8 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-5xl">Thanh toán</h1>
        <p className="mt-3 mb-8 text-stone">COD hoặc chuyển khoản sau khi xác nhận. Không thu phí ẩn trên web.</p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input name="customerName" required placeholder="Họ tên" className="rounded-2xl border border-line bg-cream px-4 py-3" />
          <input name="phone" required placeholder="Số điện thoại" className="rounded-2xl border border-line bg-cream px-4 py-3" />
          <input name="email" type="email" placeholder="Email" className="rounded-2xl border border-line bg-cream px-4 py-3" />
          <textarea name="address" required placeholder="Địa chỉ giao / lắp đặt" className="rounded-2xl border border-line bg-cream px-4 py-3" rows={3} />
          <textarea name="note" placeholder="Ghi chú: tầng, biến áp, khung giờ..." className="rounded-2xl border border-line bg-cream px-4 py-3" rows={3} />
          <button type="submit" className="rounded-full bg-ink py-3 text-sm font-semibold text-cream">
            Đặt hàng · {formatPrice(subtotal)}
          </button>
          {error ? <p className="text-sm text-copper">{error}</p> : null}
        </form>
      </div>
      <aside className="h-fit rounded-[2rem] border border-line bg-cream p-6">
        <h2 className="font-display text-2xl">Đơn của bạn</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 py-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice((item.price ?? 0) * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </aside>
    </Container>
  );
}
