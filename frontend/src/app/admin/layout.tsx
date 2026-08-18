import { AdminShell } from "@/components/admin-shell";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f1ea] p-6 text-stone">Đang tải...</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
