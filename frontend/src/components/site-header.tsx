"use client";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { SITE } from "@/lib/constants";
import type { Category } from "@/lib/types";
import {
  Clock3,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SiteHeader({ categories }: { categories: Category[] }) {
  const { count } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const query = q.trim();
    if (query) router.push(`/tim-kiem?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-cream/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6">
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-copper-soft" />
            <span>{SITE.hours}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/" className="hover:text-cream">
              Trang chủ
            </Link>
            <Link href="/kiem-tra-don-hang" className="hover:text-cream">
              Kiểm tra đơn hàng
            </Link>
            <Link href="/tai-khoan" className="hover:text-cream">
              {user ? user.name || "Tài khoản" : "Tài khoản"}
            </Link>
            <Link href="/lien-he" className="hover:text-cream">
              Liên hệ
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0">
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={64}
              height={64}
              className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
              priority
            />
          </Link>

          <form onSubmit={onSearch} className="hidden flex-1 md:flex">
            <label className="sr-only" htmlFor="q">
              Tìm kiếm
            </label>
            <div className="flex w-full overflow-hidden rounded-full border border-line bg-paper">
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm model Panasonic, Hitachi, Toshiba..."
                className="w-full bg-transparent px-5 py-2.5 text-sm outline-none"
              />
              <button
                type="submit"
                className="m-1 rounded-full bg-matcha px-4 text-cream"
                aria-label="Tìm kiếm"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-sm lg:flex"
            >
              <Phone className="h-4 w-4 text-copper" />
              <span className="font-semibold">{SITE.phoneDisplay}</span>
            </a>
            <Link
              href="/tai-khoan"
              className="grid h-10 w-10 place-items-center rounded-full border border-line"
              aria-label="Tài khoản"
              title={user ? user.email : "Đăng nhập"}
            >
              {user ? (
                <span className="text-xs font-semibold">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </span>
              ) : (
                <UserRound className="h-4 w-4" />
              )}
            </Link>
            <Link
              href="/gio-hang"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-cream"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[10px] font-bold">
                  {count}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-line md:block">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft hover:bg-paper hover:text-matcha"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {open ? (
        <div className="border-b border-line bg-cream px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            />
          </form>
          <div className="grid gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-paper px-4 py-3 text-sm font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
