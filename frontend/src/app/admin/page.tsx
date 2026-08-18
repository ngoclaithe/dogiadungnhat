"use client";

import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import type { CmsPage, Order, Post } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"] as const;

type Tab = "orders" | "pages" | "posts";

export default function AdminPage() {
  const { user, ready } = useAuth();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab | null) || "orders";

  if (!ready) {
    return <p className="text-stone">Đang tải...</p>;
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-display text-3xl">Quản trị</p>
        <p className="mt-3 text-stone">Bạn cần đăng nhập tài khoản admin để truy cập.</p>
        <Link
          href="/tai-khoan?next=/admin"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (!searchParams.get("tab")) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["orders", "Đơn hàng", "Theo dõi và cập nhật trạng thái giao lắp"],
            ["pages", "Trang nội dung", "Chỉnh sửa chính sách, hướng dẫn mua hàng"],
            ["posts", "Tin tức", "Cập nhật bài viết tin tức"],
          ] as const
        ).map(([key, title, desc]) => (
          <Link
            key={key}
            href={`/admin?tab=${key}`}
            className="rounded-2xl border border-line bg-cream p-5 transition hover:border-ink"
          >
            <p className="font-medium">{title}</p>
            <p className="mt-2 text-sm text-stone">{desc}</p>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
        {(
          [
            ["orders", "Đơn hàng"],
            ["pages", "Trang"],
            ["posts", "Tin tức"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin?tab=${key}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === key ? "bg-ink text-cream" : "border border-line bg-cream"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {tab === "orders" ? <OrdersPanel /> : null}
      {tab === "pages" ? <PagesPanel /> : null}
      {tab === "posts" ? <PostsPanel /> : null}
    </>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.adminOrders().then(setOrders).catch((e) => setError((e as Error).message));
  }, []);

  async function onStatusChange(orderId: string, status: string) {
    try {
      const updated = await api.adminUpdateOrderStatus(orderId, status);
      setOrders((current) => current.map((o) => (o.id === orderId ? updated : o)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (error) return <p className="text-sm text-copper">{error}</p>;

  return (
    <div className="space-y-4">
      {!orders.length ? <p className="text-stone">Chưa có đơn hàng.</p> : null}
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-line bg-cream p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper">
                {order.code}
              </p>
              <p className="mt-1 text-sm text-stone">
                {order.customerName} · {order.phone}
              </p>
              <p className="text-sm text-stone">{formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatPrice(order.total)}</p>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="mt-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {orderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PagesPanel() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [active, setActive] = useState<CmsPage | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.adminPages().then(setPages).catch((e) => setMessage((e as Error).message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.adminUpdatePage(active.slug, {
        title: String(form.get("title") || ""),
        content: String(form.get("content") || ""),
      });
      setPages((current) => current.map((p) => (p.slug === updated.slug ? updated : p)));
      setActive(updated);
      setMessage("Đã lưu trang.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.id}>
            <button
              type="button"
              onClick={() => {
                setActive(page);
                setMessage("");
              }}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                active?.slug === page.slug ? "border-ink bg-paper" : "border-line bg-cream"
              }`}
            >
              {page.title}
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-cream p-5">
          <input
            name="title"
            defaultValue={active.title}
            className="rounded-xl border border-line bg-paper px-4 py-3"
          />
          <textarea
            name="content"
            defaultValue={active.content}
            rows={16}
            className="rounded-xl border border-line bg-paper px-4 py-3 font-mono text-sm"
          />
          <button type="submit" className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
            Lưu trang
          </button>
          {message ? <p className="text-sm text-matcha">{message}</p> : null}
        </form>
      ) : (
        <p className="text-stone">Chọn trang để chỉnh sửa.</p>
      )}
    </div>
  );
}

function PostsPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [active, setActive] = useState<Post | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.adminPosts().then(setPosts).catch((e) => setMessage((e as Error).message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api.adminUpdatePost(active.slug, {
        title: String(form.get("title") || ""),
        excerpt: String(form.get("excerpt") || ""),
        content: String(form.get("content") || ""),
      });
      setPosts((current) => current.map((p) => (p.slug === updated.slug ? updated : p)));
      setActive(updated);
      setMessage("Đã lưu bài viết.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => {
                setActive(post);
                setMessage("");
              }}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                active?.slug === post.slug ? "border-ink bg-paper" : "border-line bg-cream"
              }`}
            >
              {post.title}
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-cream p-5">
          <input
            name="title"
            defaultValue={active.title}
            className="rounded-xl border border-line bg-paper px-4 py-3"
          />
          <textarea
            name="excerpt"
            defaultValue={active.excerpt ?? ""}
            rows={3}
            className="rounded-xl border border-line bg-paper px-4 py-3 text-sm"
          />
          <textarea
            name="content"
            defaultValue={active.content}
            rows={14}
            className="rounded-xl border border-line bg-paper px-4 py-3 font-mono text-sm"
          />
          <button type="submit" className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream">
            Lưu bài viết
          </button>
          {message ? <p className="text-sm text-matcha">{message}</p> : null}
        </form>
      ) : (
        <p className="text-stone">Chọn bài viết để chỉnh sửa.</p>
      )}
    </div>
  );
}
