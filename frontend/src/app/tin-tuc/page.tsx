import { Container } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin điện lạnh, mẹo sử dụng gia dụng Nhật và cập nhật showroom.",
  alternates: { canonical: "/tin-tuc" },
};

export default async function NewsPage() {
  const posts = await api.posts().catch(() => []);
  return (
    <Container className="py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">Góc kỹ thuật</p>
      <h1 className="mt-2 font-display text-5xl">Tin tức</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/tin-tuc/${post.slug}`}
            className="overflow-hidden rounded-[2rem] border border-line bg-cream"
          >
            <div className="relative aspect-[16/8] bg-paper">
              {post.coverUrl ? (
                <Image src={post.coverUrl} alt={post.title} fill className="object-cover" />
              ) : null}
            </div>
            <div className="p-6">
              <p className="text-xs text-stone">{formatDate(post.publishedAt)}</p>
              <h2 className="mt-2 font-display text-3xl">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm text-stone">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
