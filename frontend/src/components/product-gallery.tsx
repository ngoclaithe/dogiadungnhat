"use client";

import type { ProductImage } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="grid aspect-square place-items-center rounded-[2rem] bg-cream text-stone">
        Chưa có ảnh
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-cream">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-cream ring-2 ring-offset-2 ring-offset-paper transition ${
                index === active ? "ring-ink" : "ring-transparent hover:ring-line"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${name} ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
