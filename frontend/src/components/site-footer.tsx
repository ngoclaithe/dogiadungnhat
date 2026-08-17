"use client";

import { COMPANY, POLICY_LINKS, SITE } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { api } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function SiteFooter({ categories }: { categories: Category[] }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const res = await api.newsletter(email);
      setMessage(res.message);
      setEmail("");
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  return (
    <footer className="mt-20 border-t border-line bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-2xl tracking-wide">
            <span className="text-cream">DOSU</span>
            <span className="text-[#2DD4BF]">TECH</span>
          </p>
          <p className="mt-3 text-sm text-cream/70">{COMPANY.tagline}</p>
          <div className="mt-5 space-y-3 text-sm text-cream/80">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4BF]" />
              {SITE.address}
            </p>
            <p className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4BF]" />
              {SITE.phoneDisplay.replaceAll(".", " ")}
            </p>
            <p className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2DD4BF]" />
              {SITE.email}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-soft">
            Danh mục sản phẩm
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-cream/80">
            {categories.slice(0, 11).map((cat) => (
              <li key={cat.id}>
                <Link href={`/danh-muc/${cat.slug}`} className="hover:text-cream">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-soft">
            Chăm sóc khách hàng
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-cream/80">
            {POLICY_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tin-tuc" className="hover:text-cream">
                Tin tức
              </Link>
            </li>
            <li>
              <a
                href={COMPANY.website}
                className="hover:text-cream"
                target="_blank"
                rel="noreferrer"
              >
                {COMPANY.websiteLabel}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-soft">
            Email khuyến mãi
          </p>
          <p className="mt-4 text-sm text-cream/70">
            Nhận thông tin sản phẩm mới và ưu đãi trong tuần.
          </p>
          <form onSubmit={onSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full rounded-full bg-ink-soft px-4 py-2.5 text-sm text-cream outline-none ring-1 ring-white/10"
            />
            <button
              type="submit"
              className="rounded-full bg-copper px-4 text-sm font-semibold text-cream"
            >
              Gửi
            </button>
          </form>
          {message ? <p className="mt-2 text-xs text-copper-soft">{message}</p> : null}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {COMPANY.name}
      </div>
    </footer>
  );
}
