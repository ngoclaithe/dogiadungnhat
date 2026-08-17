import { SITE } from "@/lib/constants";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeGoodsStore",
    name: SITE.name,
    description: SITE.description,
    telephone: SITE.phoneRaw,
    email: SITE.email,
    openingHours: "Mo-Su 07:30-22:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Hà Nội",
      addressCountry: "VN",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
