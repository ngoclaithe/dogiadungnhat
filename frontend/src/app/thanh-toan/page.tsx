"use client";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

export default function CheckoutPage() {
  const { items, subtotal, clear, ready: cartReady } = useCart();
  const { user, ready: authReady } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const defaults = useMemo(
    () => ({
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
    }),
    [user],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const order = await api.createOrder({
        customerName: String(form.get("customerName") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        email: String(form.get("email") || "").trim() || undefined,
        address: String(form.get("address") || "").trim(),
        note: String(form.get("note") || "").trim() || undefined,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      clear();
      setCode(order.code);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!cartReady || !authReady) {
    return (
      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-cream p-6 sm:p-8 text-sm text-stone">
          Đang tải đơn hàng...
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-cream p-6 sm:p-8 text-center">
          <h1 className="font-display text-3xl">Thanh toán</h1>
          <p className="mt-3 text-sm text-stone">Vui lòng đăng nhập để thanh toán giỏ hàng của bạn.</p>
          <Link
            href="/tai-khoan?next=/thanh-toan"
            className="mt-6 block w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream"
          >
            Đăng nhập
          </Link>
        </div>
      </Container>
    );
  }

  if (!items.length && !code) {
    return (
      <Container className="py-10 sm:py-12">
        <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-cream p-6 sm:p-8 text-center">
          <h1 className="font-display text-3xl">Thanh toán</h1>
          <p className="mt-3 text-sm text-stone">Giỏ hàng trống.</p>
          <Link href="/gio-hang" className="mt-6 block w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream">
            Quay lại giỏ
          </Link>
        </div>
      </Container>
    );
  }

  if (code) {
    return (
      <Container className="max-w-xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-copper">Đặt hàng thành công</p>
        <h1 className="mt-3 font-display text-5xl">{code}</h1>
        <p className="mt-4 text-stone">
          Lưu mã này để theo dõi. Nhân viên sẽ gọi xác nhận lắp đặt. Thanh toán COD hoặc chuyển khoản
          sau khi chốt đơn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/kiem-tra-don-hang?code=${encodeURIComponent(code)}`}
            className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
          >
            Kiểm tra đơn hàng
          </Link>
          {user ? (
            <Link
              href="/tai-khoan"
              className="inline-block rounded-full border border-line px-6 py-3 text-sm font-semibold"
            >
              Xem đơn trong tài khoản
            </Link>
          ) : null}
        </div>
      </Container>
    );
  }

  return (
    <Container className="grid gap-8 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-5xl">Thanh toán</h1>
        <p className="mt-3 mb-6 text-stone">
          COD hoặc chuyển khoản sau khi xác nhận. Không thu phí ẩn trên web.
        </p>
        <form key={user.id} onSubmit={onSubmit} className="grid gap-4">
          <input
            name="customerName"
            required
            minLength={2}
            defaultValue={defaults.name}
            placeholder="Họ tên"
            className="rounded-2xl border border-line bg-cream px-4 py-3"
          />
          <input
            name="phone"
            required
            minLength={8}
            defaultValue={defaults.phone}
            placeholder="Số điện thoại"
            className="rounded-2xl border border-line bg-cream px-4 py-3"
          />
          <input
            name="email"
            type="email"
            defaultValue={defaults.email}
            placeholder="Email"
            className="rounded-2xl border border-line bg-cream px-4 py-3"
          />
          <textarea
            name="address"
            required
            minLength={8}
            placeholder="Địa chỉ giao / lắp đặt"
            className="rounded-2xl border border-line bg-cream px-4 py-3"
            rows={3}
          />
          <textarea
            name="note"
            placeholder="Ghi chú: tầng, biến áp, khung giờ..."
            className="rounded-2xl border border-line bg-cream px-4 py-3"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-60"
          >
            {submitting ? "Đang đặt hàng..." : `Đặt hàng · ${formatPrice(subtotal)}`}
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
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-stone">Tạm tính</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <Link href="/gio-hang" className="mt-4 inline-block text-sm text-matcha underline">
          Sửa giỏ hàng
        </Link>
      </aside>
    </Container>
  );
}
