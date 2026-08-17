import { Container } from "@/components/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">404</p>
      <h1 className="mt-3 font-display text-5xl">Không tìm thấy trang</h1>
      <p className="mt-4 text-stone">Đường dẫn có thể đã đổi. Quay lại trang chủ để tiếp tục mua hàng.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
          Trang chủ
        </Link>
        <Link href="/lien-he" className="rounded-full border border-line px-5 py-2.5 text-sm">
          Liên hệ
        </Link>
      </div>
    </Container>
  );
}
