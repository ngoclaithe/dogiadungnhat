"use client";

import { AdminCard, AdminLoading } from "@/components/admin-shell";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import type { CmsPage, Order, Post } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Newspaper,
  Package,
  RefreshCw,
  Save,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"] as const;

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  SHIPPING: "bg-violet-50 text-violet-700 ring-violet-600/20",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLE[status] ?? "bg-slate-50 text-slate-600 ring-slate-500/20"
      }`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  tone: "emerald" | "amber" | "blue" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </AdminCard>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100">
        <Package className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

function OverviewTab({ orders }: { orders: Order[] }) {
  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const shipping = orders.filter((o) => o.status === "SHIPPING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const revenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);
    return { pending, shipping, completed, revenue, total: orders.length };
  }, [orders]);

  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng đơn hàng" value={stats.total} icon={Package} tone="blue" />
        <StatCard label="Chờ xác nhận" value={stats.pending} icon={Clock} tone="amber" />
        <StatCard label="Đang giao" value={stats.shipping} icon={Truck} tone="violet" />
        <StatCard label="Doanh thu" value={formatPrice(stats.revenue)} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Đơn hàng gần đây</h2>
              <p className="text-sm text-slate-500">Cập nhật trạng thái nhanh</p>
            </div>
            <Link
              href="/admin?tab=orders"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Xem tất cả →
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="Chưa có đơn hàng" description="Đơn mới sẽ hiển thị tại đây." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Mã đơn</th>
                    <th className="px-5 py-3 font-medium">Khách</th>
                    <th className="px-5 py-3 font-medium">Tổng</th>
                    <th className="px-5 py-3 font-medium">Trạng thái</th>
                    <th className="px-5 py-3 font-medium">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-900">
                        {order.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="font-semibold text-slate-900">Thao tác nhanh</h2>
          <p className="mt-1 text-sm text-slate-500">Đi tới khu vực quản lý</p>
          <div className="mt-5 grid gap-3">
            {[
              { href: "/admin?tab=orders", label: "Xử lý đơn chờ", icon: Package, count: stats.pending },
              { href: "/admin?tab=pages", label: "Sửa trang nội dung", icon: FileText },
              { href: "/admin?tab=posts", label: "Đăng / sửa tin tức", icon: Newspaper },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-800">{item.label}</span>
                {item.count != null && item.count > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    {item.count}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  onRefresh,
  onUpdateStatus,
  updatingId,
}: {
  orders: Order[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  updatingId: string | null;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "ALL") list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q),
      );
    }
    return list;
  }, [filter, orders, query]);

  return (
    <div className="space-y-4">
      <AdminCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm mã đơn, tên, SĐT..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", ...ORDER_STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "Tất cả" : orderStatusLabel(status)}
              </button>
            ))}
            <button
              type="button"
              onClick={onRefresh}
              className="ml-1 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Làm mới"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Mã đơn</th>
                  <th className="px-5 py-3 font-medium">Khách hàng</th>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium">Tổng</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-mono text-xs font-semibold">{order.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.phone}</p>
                      <p className="mt-1 max-w-[200px] truncate text-xs text-slate-400">
                        {order.address}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <ul className="space-y-1 text-xs text-slate-600">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {orderStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}

function ContentEditor<T extends CmsPage | Post>({
  items,
  type,
  onSave,
  saving,
}: {
  items: T[];
  type: "page" | "post";
  onSave: (slug: string, payload: Record<string, string>) => Promise<void>;
  saving: boolean;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(items[0]?.slug ?? null);
  const [search, setSearch] = useState("");
  const selected = items.find((i) => i.slug === selectedSlug) ?? null;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title);
    setContent(selected.content);
    setExcerpt("excerpt" in selected ? selected.excerpt ?? "" : "");
    setMessage(null);
  }, [selected]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.slug.includes(q));
  }, [items, search]);

  async function handleSave() {
    if (!selected) return;
    setMessage(null);
    try {
      const payload: Record<string, string> = { title, content };
      if (type === "post") payload.excerpt = excerpt;
      await onSave(selected.slug, payload);
      setMessage("Đã lưu thành công.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Lưu thất bại.");
    }
  }

  if (items.length === 0) {
    return (
      <AdminCard>
        <EmptyState title="Chưa có nội dung" description="Dữ liệu CMS sẽ hiển thị tại đây." />
      </AdminCard>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <AdminCard className="overflow-hidden">
        <div className="border-b border-slate-100 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
        <ul className="max-h-[520px] overflow-y-auto p-2">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedSlug(item.slug)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selectedSlug === item.slug
                    ? "bg-emerald-50 font-medium text-emerald-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="truncate">{item.title}</p>
                <p className="truncate text-xs text-slate-400">/{item.slug}</p>
              </button>
            </li>
          ))}
        </ul>
      </AdminCard>

      {selected ? (
        <AdminCard className="p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">{selected.title}</h2>
              <p className="text-sm text-slate-500">/{selected.slug}</p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>

          {message ? (
            <p
              className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                message.includes("thành công")
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tiêu đề</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
            {type === "post" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả ngắn</span>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Nội dung (HTML)</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>
          </div>
        </AdminCard>
      ) : null}
    </div>
  );
}

export default function AdminPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingContent, setSavingContent] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [orderList, pageList, postList] = await Promise.all([
        api.adminOrders(),
        api.adminPages(),
        api.adminPosts(),
      ]);
      setOrders(orderList);
      setPages(pageList);
      setPosts(postList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/tai-khoan?next=/admin");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    load();
  }, [load, ready, router, user]);

  async function handleUpdateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const updated = await api.adminUpdateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSavePage(slug: string, payload: Record<string, string>) {
    setSavingContent(true);
    try {
      const updated = await api.adminUpdatePage(slug, payload);
      setPages((prev) => prev.map((p) => (p.slug === slug ? updated : p)));
    } finally {
      setSavingContent(false);
    }
  }

  async function handleSavePost(slug: string, payload: Record<string, string>) {
    setSavingContent(true);
    try {
      const updated = await api.adminUpdatePost(slug, payload);
      setPosts((prev) => prev.map((p) => (p.slug === slug ? updated : p)));
    } finally {
      setSavingContent(false);
    }
  }

  if (!ready || !user || user.role !== "ADMIN") {
    return <AdminLoading />;
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-2 font-medium underline underline-offset-2"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : null}

      {tab === "orders" ? (
        <OrdersTab
          orders={orders}
          onRefresh={load}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
        />
      ) : tab === "pages" ? (
        <ContentEditor items={pages} type="page" onSave={handleSavePage} saving={savingContent} />
      ) : tab === "posts" ? (
        <ContentEditor items={posts} type="post" onSave={handleSavePost} saving={savingContent} />
      ) : (
        <OverviewTab orders={orders} />
      )}
    </div>
  );
}
