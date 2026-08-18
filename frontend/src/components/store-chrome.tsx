"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportWidget } from "@/components/support-widget";
import type { Category } from "@/lib/types";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function StoreChrome({
  categories,
  nav,
  children,
}: {
  categories: Category[];
  nav: Category[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="paper-grid min-h-screen">
      <SiteHeader categories={nav} />
      <main className="min-h-[70vh]">{children}</main>
      <SiteFooter categories={categories} />
      <SupportWidget />
    </div>
  );
}
