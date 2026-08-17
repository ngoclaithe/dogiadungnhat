"use client";

import { api } from "@/lib/api";
import { SITE } from "@/lib/constants";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const res = await api.contact({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email") || undefined,
        message: form.get("message"),
      });
      setStatus(res.message);
      event.currentTarget.reset();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input name="name" required placeholder="Họ tên" className="rounded-2xl border border-line bg-cream px-4 py-3" />
      <input name="phone" required placeholder="Số điện thoại" className="rounded-2xl border border-line bg-cream px-4 py-3" />
      <input name="email" type="email" placeholder="Email (không bắt buộc)" className="rounded-2xl border border-line bg-cream px-4 py-3" />
      <textarea
        name="message"
        required
        rows={5}
        placeholder={`Nhu cầu tư vấn, model quan tâm, thời gian đến showroom... Hotline ${SITE.phoneDisplay}`}
        className="rounded-2xl border border-line bg-cream px-4 py-3"
      />
      <button type="submit" className="rounded-full bg-ink py-3 text-sm font-semibold text-cream">
        Gửi liên hệ
      </button>
      {status ? <p className="text-sm text-matcha">{status}</p> : null}
    </form>
  );
}
