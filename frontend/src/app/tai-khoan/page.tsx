import { AccountForms } from "@/app/tai-khoan/account-forms";
import { Container } from "@/components/ui";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="font-display text-5xl">Tài khoản</h1>
      <p className="mt-3 mb-8 text-stone">
        Đăng nhập để lưu đơn, theo dõi trạng thái giao lắp, hoặc đăng ký email mới.
      </p>
      <Suspense
        fallback={
          <div className="rounded-[2rem] border border-line bg-cream p-8 text-sm text-stone">
            Đang tải tài khoản...
          </div>
        }
      >
        <AccountForms />
      </Suspense>
    </Container>
  );
}
