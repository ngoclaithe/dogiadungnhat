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
    <Container className="py-10 sm:py-12">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md rounded-[2rem] border border-line bg-cream p-8 text-sm text-stone">
            Đang tải tài khoản...
          </div>
        }
      >
        <AccountForms />
      </Suspense>
    </Container>
  );
}
