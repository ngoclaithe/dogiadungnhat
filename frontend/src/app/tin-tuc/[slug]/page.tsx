import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await api.post(slug);
    return {
      title: post.title,
      description: post.excerpt ?? post.title,
      alternates: { canonical: `/tin-tuc/${slug}` },
    };
  } catch {
    return { title: "Tin tức" };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await api.post(slug);
  } catch {
    notFound();
  }
  return (
    <Container className="max-w-3xl py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">Tin tức</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-stone">{formatDate(post.publishedAt)}</p>
      {post.coverUrl ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[2rem]">
          <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}
      <article
        className="prose-ndn mt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </Container>
  );
}
