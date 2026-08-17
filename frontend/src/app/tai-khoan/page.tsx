import { AccountForms } from "@/app/tai-khoan/account-forms";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Container className="max-w-xl py-12">
      <h1 className="font-display text-5xl">Tài khoản</h1>
      <p className="mt-3 mb-8 text-stone">
        Đăng nhập để theo dõi đơn, hoặc đăng ký email mới. Mật khẩu được mã hóa trên máy chủ.
      </p>
      <AccountForms />
    </Container>
  );
}
