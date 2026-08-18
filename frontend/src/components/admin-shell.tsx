"use client";

import { useAuth } from "@/components/auth-provider";
import { SITE } from "@/lib/constants";
import { FileText, LayoutDashboard, LogOut, Newspaper, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

const NAV = [
  { tab: "orders", label: "Đơn hàng", icon: Package },
  { tab: "pages", label: "Trang nội dung", icon: FileText },
  { tab: "posts", label: "Tin tức", icon: Newspaper },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "orders";

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink text-cream lg:flex">
          <div className="border-b border-cream/10 px-5 py-5">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold">Quản trị</p>
                <p className="text-xs text-cream/60">{SITE.name}</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                !searchParams.get("tab")
                  ? "bg-cream/15 text-cream"
                  : "text-cream/80 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Tổng quan
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.tab}
                href={`/admin?tab=${item.tab}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  activeTab === item.tab
                    ? "bg-cream/15 text-cream"
                    : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-cream/10 p-4">
            <p className="truncate text-xs text-cream/50">{user?.email ?? "Chưa đăng nhập"}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/"
                className="rounded-lg border border-cream/15 px-3 py-2 text-center text-xs text-cream/80 hover:bg-cream/10"
              >
                Xem cửa hàng
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 rounded-lg bg-cream/10 px-3 py-2 text-xs text-cream hover:bg-cream/15"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Đăng xuất
                </button>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line bg-cream px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-copper lg:hidden">Quản trị</p>
              <h1 className="font-display text-xl sm:text-2xl">Bảng điều khiển</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium sm:text-sm"
              >
                Cửa hàng
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream sm:text-sm lg:hidden"
                >
                  Thoát
                </button>
              ) : null}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <Suspense fallback={<p className="text-stone">Đang tải...</p>}>{children}</Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
