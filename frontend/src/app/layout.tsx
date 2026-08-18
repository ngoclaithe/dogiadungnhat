import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportWidget } from "@/components/support-widget";
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
      <body className={`${body.variable} ${display.variable} paper-grid antialiased`}>
        <JsonLd />
        <AuthProvider>
          <CartProvider>
            <SiteHeader categories={nav} />
            <main className="min-h-[70vh]">{children}</main>
            <SiteFooter categories={categories} />
            <SupportWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
