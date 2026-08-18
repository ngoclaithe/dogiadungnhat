import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { JsonLd } from "@/components/json-ld";
import { StoreChrome } from "@/components/store-chrome";
import { api } from "@/lib/api";
import { SITE } from "@/lib/constants";
import type { Category } from "@/lib/types";
import type { Metadata } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import "./globals.css";

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const display = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "gia dụng nhật",
    "nội địa nhật",
    "máy giặt nhật",
    "điều hòa nhật",
    "tủ lạnh hitachi",
    "bếp từ nhật",
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    locale: "vi_VN",
    type: "website",
  },
  alternates: { canonical: "/" },
};

async function loadCategories(): Promise<Category[]> {
  try {
    return await api.categories();
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await loadCategories();
  const nav = categories.filter((c) => c.featured).sort((a, b) => a.navOrder - b.navOrder);

  return (
    <html lang="vi">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        <JsonLd />
        <AuthProvider>
          <CartProvider>
            <StoreChrome categories={categories} nav={nav}>
              {children}
            </StoreChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
