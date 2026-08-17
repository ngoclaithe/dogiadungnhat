"use client";

import { SITE } from "@/lib/constants";
import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

export function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-72 rounded-3xl border border-line bg-cream p-4 shadow-2xl">
          <div className="mb-3 flex items-start justify-between">
            <p className="font-display text-lg">Xin chào</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-stone">
            Chúng tôi có thể giúp gì cho bạn? Tư vấn model, biến áp 100V, lịch lắp đặt.
          </p>
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-semibold text-cream"
          >
            <Phone className="h-4 w-4" />
            Gọi {SITE.phoneDisplay}
          </a>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-copper text-cream shadow-lg"
        aria-label="Hỗ trợ"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
