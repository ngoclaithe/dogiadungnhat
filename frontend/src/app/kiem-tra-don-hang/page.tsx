import { TrackForm } from "@/app/kiem-tra-don-hang/track-form";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm tra đơn hàng",
  description: "Nhập mã đơn ND… để xem trạng thái giao lắp.",
  alternates: { canonical: "/kiem-tra-don-hang" },
};

export default function TrackPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="font-display text-5xl">Kiểm tra đơn hàng</h1>
      <p className="mt-3 mb-8 text-stone">
        Mã đơn được gửi sau khi xác nhận. Demo: <strong>ND20260817001</strong>
      </p>
      <TrackForm />
    </Container>
  );
}
