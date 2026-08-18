import type { Metadata } from "next";
import { Suspense } from "react";
import AdminPage from "./admin-page";
import { AdminLoading } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminPage />
    </Suspense>
  );
}
