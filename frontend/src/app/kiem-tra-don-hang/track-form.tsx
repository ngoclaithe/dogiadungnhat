"use client";

import { api } from "@/lib/api";
import { formatPrice, orderStatusLabel } from "@/lib/format";
import type { Order } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function TrackForm() {
  const searchParams = useSearchParams();
  const preset = (searchParams.get("code") || "").trim().toUpperCase();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      setOrder(await api.trackOrder(normalized));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (preset) void lookup(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") || "");
    await lookup(code);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="code"
          required
          defaultValue={preset}
          placeholder="Mã đơn, ví dụ ND20260817001"
          className="w-full rounded-full border border-line bg-cream px-5 py-3 uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {loading ? "Đang tra..." : "Tra cứu"}
        </button>
      </form>
      {error ? <p className="mt-4 text-sm text-copper">{error}</p> : null}
      {order ? (
        <div className="mt-8 rounded-[2rem] border border-line bg-cream p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-copper">{order.code}</p>
              <h2 className="mt-1 font-display text-3xl">{orderStatusLabel(order.status)}</h2>
            </div>
            <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
          </div>
          <p className="mt-4 text-sm text-stone">
            {order.customerName} · {order.phone}
            <br />
            {order.address}
          </p>
          <ul className="mt-5 divide-y divide-line text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
