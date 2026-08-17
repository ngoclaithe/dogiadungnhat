import { ContactForm } from "@/app/lien-he/contact-form";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ ${SITE.name} tại ${SITE.address}. Hotline ${SITE.phoneDisplay}.`,
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return (
    <Container className="grid gap-10 py-12 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-copper">DOSUTECH</p>
        <h1 className="mt-2 font-display text-5xl">Liên hệ</h1>
        <p className="mt-4 text-stone">
          Tư vấn model, công suất và lịch lắp đặt. Liên hệ hotline hoặc để lại lời nhắn,
          chúng tôi sẽ phản hồi trong giờ làm việc.
        </p>
        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="text-stone">Địa chỉ</dt>
            <dd className="mt-1 font-medium">{SITE.address}</dd>
          </div>
          <div>
            <dt className="text-stone">Hotline</dt>
            <dd className="mt-1 font-medium">{SITE.phoneDisplay}</dd>
          </div>
          <div>
            <dt className="text-stone">Email</dt>
            <dd className="mt-1 font-medium">{SITE.email}</dd>
          </div>
          <div>
            <dt className="text-stone">Giờ làm việc</dt>
            <dd className="mt-1 font-medium">{SITE.hours}</dd>
          </div>
        </dl>
      </div>
      <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8">
        <h2 className="font-display text-3xl">Để lại lời nhắn</h2>
        <p className="mt-2 mb-6 text-sm text-stone">Nhân viên gọi lại trong giờ mở cửa.</p>
        <ContactForm />
      </div>
    </Container>
  );
}
