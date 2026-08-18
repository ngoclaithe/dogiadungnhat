import type {
  AuthUser,
  CartItem,
  Category,
  CmsPage,
  Order,
  Post,
  Product,
  ProductList,
  SitemapPayload,
} from "./types";

function baseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isServer = typeof window === "undefined";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers,
    credentials: isServer ? init?.credentials : (init?.credentials ?? "include"),
    ...(isServer && !init?.cache ? { next: { revalidate: 60 } } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string | string[] }).message ?? `Lỗi API ${res.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return data as T;
}

export type AuthPayload = {
  user: AuthUser;
};

export type CreateOrderPayload = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  items: { productId: string; quantity: number }[];
};

export const api = {
  health: () => request<{ ok: boolean }>("/health"),
  sitemap: () => request<SitemapPayload>("/sitemap"),
  categories: () => request<Category[]>("/categories"),
  navCategories: () => request<Category[]>("/categories/nav"),
  category: (slug: string) => request<Category>(`/categories/${slug}`),
  products: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    });
    const suffix = qs.toString() ? `?${qs}` : "";
    return request<ProductList>(`/products${suffix}`);
  },
  featured: () => request<Product[]>("/products/featured"),
  byCategory: (slug: string) => request<Product[]>(`/products/by-category/${slug}`),
  product: (slug: string) => request<Product>(`/products/${slug}`),
  related: (slug: string) => request<Product[]>(`/products/${slug}/related`),
  posts: () => request<Post[]>("/posts"),
  post: (slug: string) => request<Post>(`/posts/${slug}`),
  pages: () => request<CmsPage[]>("/pages"),
  page: (slug: string) => request<CmsPage>(`/pages/${slug}`),
  login: (email: string, password: string) =>
    request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    }),
  register: (payload: { email: string; password: string; name?: string; phone?: string }) =>
    request<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  logout: () =>
    request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
      cache: "no-store",
    }),
  me: () => request<AuthUser>("/auth/me", { cache: "no-store" }),
  updateProfile: (payload: { name?: string; phone?: string }) =>
    request<AuthUser>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  createOrder: (payload: CreateOrderPayload) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  myOrders: () => request<Order[]>("/orders/mine", { cache: "no-store" }),
  getCart: () => request<CartItem[]>("/cart", { cache: "no-store" }),
  upsertCartItem: (productId: string, quantity: number) =>
    request<CartItem[]>("/cart/items", {
      method: "PUT",
      body: JSON.stringify({ productId, quantity }),
      cache: "no-store",
    }),
  removeCartItem: (productId: string) =>
    request<CartItem[]>(`/cart/items/${productId}`, {
      method: "DELETE",
      cache: "no-store",
    }),
  clearCart: () =>
    request<CartItem[]>("/cart", {
      method: "DELETE",
      cache: "no-store",
    }),
  trackOrder: (code: string) =>
    request<Order>(`/orders/track/${encodeURIComponent(code)}`, { cache: "no-store" }),
  adminOrders: () => request<Order[]>("/admin/orders", { cache: "no-store" }),
  adminUpdateOrderStatus: (id: string, status: string) =>
    request<Order>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      cache: "no-store",
    }),
  adminPages: () => request<CmsPage[]>("/admin/pages", { cache: "no-store" }),
  adminUpdatePage: (slug: string, payload: { title?: string; content?: string }) =>
    request<CmsPage>(`/admin/pages/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  adminPosts: () => request<Post[]>("/admin/posts", { cache: "no-store" }),
  adminUpdatePost: (
    slug: string,
    payload: { title?: string; excerpt?: string; content?: string },
  ) =>
    request<Post>(`/admin/posts/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  contact: (payload: unknown) =>
    request<{ ok: boolean; message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
  newsletter: (email: string) =>
    request<{ ok: boolean; message: string }>("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email }),
      cache: "no-store",
    }),
};
