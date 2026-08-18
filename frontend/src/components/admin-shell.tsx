"use client";

import { useAuth } from "@/components/auth-provider";
import { SITE } from "@/lib/constants";
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

const NAV = [
  { tab: null, label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { tab: "orders", label: "Đơn hàng", icon: Package, href: "/admin?tab=orders" },
  { tab: "pages", label: "Trang nội dung", icon: FileText, href: "/admin?tab=pages" },
  { tab: "posts", label: "Tin tức", icon: Newspaper, href: "/admin?tab=posts" },
] as const;

const TITLES: Record<string, string> = {
  "": "Tổng quan",
  orders: "Quản lý đơn hàng",
  pages: "Trang nội dung",
  posts: "Tin tức",
};

function ShellInner({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = TITLES[activeTab] ?? "Quản trị";

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <Image
          src={SITE.logo}
          alt={SITE.name}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{SITE.name}</p>
          <p className="text-[11px] text-slate-400">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const isActive = item.tab === activeTab || (item.tab === null && !activeTab);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            {(user?.name || user?.email || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name || "Admin"}</p>
            <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem cửa hàng
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/15"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          aria-label="Đóng"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Quản trị</p>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            </div>
          </div>
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 sm:flex"
          >
            <ExternalLink className="h-4 w-4" />
            Cửa hàng
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<AdminLoading />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading full />}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}

export function AdminLoading({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? "grid min-h-screen place-items-center bg-slate-100" : "py-20"}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
        <p className="text-sm text-slate-500">Đang tải...</p>
      </div>
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
