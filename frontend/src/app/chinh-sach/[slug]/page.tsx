import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await api.page(slug);
    return {
      title: page.title,
      alternates: { canonical: `/chinh-sach/${slug}` },
    };
  } catch {
    return { title: "Chính sách" };
  }
}

export async function generateStaticParams() {
  try {
    const pages = await api.pages();
    return pages.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  let page;
  try {
    page = await api.page(slug);
  } catch {
    notFound();
  }
  return (
    <Container className="max-w-3xl py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">Chăm sóc khách hàng</p>
      <h1 className="mt-2 font-display text-5xl">{page.title}</h1>
      <article className="prose-ndn mt-8" dangerouslySetInnerHTML={{ __html: page.content }} />
    </Container>
  );
}
