"use client";

import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import type { Order } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AccountForms() {
  const { user, ready, login, register, logout, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));

  if (!ready) {
    return (
      <div className="rounded-[2rem] border border-line bg-cream p-8 text-sm text-stone">
        Đang tải tài khoản...
      </div>
    );
  }

  if (user) {
    return (
      <AccountDashboard
        user={user}
        nextPath={nextPath}
        onLogout={() => {
          logout();
          router.replace("/tai-khoan");
        }}
        onUpdate={updateProfile}
      />
    );
  }

  return (
    <AuthForms
      nextPath={nextPath}
      onLogin={login}
      onRegister={register}
      onSuccess={() => {
        router.replace(nextPath || "/tai-khoan");
      }}
    />
  );
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function AuthForms({
  nextPath,
  onLogin,
  onRegister,
  onSuccess,
}: {
  nextPath: string;
  onLogin: (email: string, password: string) => Promise<unknown>;
  onRegister: (payload: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => Promise<unknown>;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "register") {
        const confirm = String(form.get("confirm") || "");
        if (password !== confirm) {
          setMessage("Mật khẩu xác nhận không khớp.");
          return;
        }
        await onRegister({
          email,
          password,
          name: String(form.get("name") || "").trim() || undefined,
          phone: String(form.get("phone") || "").trim() || undefined,
        });
      } else {
        await onLogin(email, password);
      }
      onSuccess();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8">
      {nextPath === "/thanh-toan" ? (
        <p className="mb-5 rounded-2xl bg-paper px-4 py-3 text-sm text-stone">
          Đăng nhập để lưu đơn vào tài khoản, rồi quay lại thanh toán.
        </p>
      ) : null}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-ink text-cream" : "border border-line"}`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
          className={`rounded-full px-4 py-2 text-sm ${mode === "register" ? "bg-ink text-cream" : "border border-line"}`}
        >
          Đăng ký
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4">
        {mode === "register" ? (
          <>
            <input name="name" placeholder="Họ tên" className="rounded-2xl border border-line px-4 py-3" />
            <input name="phone" placeholder="Số điện thoại" className="rounded-2xl border border-line px-4 py-3" />
          </>
        ) : null}
        <input name="email" type="email" required placeholder="Email" className="rounded-2xl border border-line px-4 py-3" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mật khẩu"
          className="rounded-2xl border border-line px-4 py-3"
        />
        {mode === "register" ? (
          <input
            name="confirm"
            type="password"
            required
            minLength={6}
            placeholder="Xác nhận mật khẩu"
            className="rounded-2xl border border-line px-4 py-3"
          />
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>
      <p className="mt-4 text-xs text-stone">Tài khoản demo: demo@noidianhat.vn / demo1234</p>
      {message ? <p className="mt-3 text-sm text-copper">{message}</p> : null}
    </div>
  );
}

function AccountDashboard({
  user,
  nextPath,
  onLogout,
  onUpdate,
}: {
  user: { email: string; name: string | null; phone: string | null };
  nextPath: string;
  onLogout: () => void;
  onUpdate: (payload: { name?: string; phone?: string }) => Promise<unknown>;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .myOrders()
      .then(setOrders)
      .catch((error) => setOrdersError((error as Error).message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setProfileMessage("");
    try {
      await onUpdate({
        name: String(form.get("name") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
      });
      setProfileMessage("Đã lưu thông tin liên hệ.");
    } catch (error) {
      setProfileMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-copper">Xin chào</p>
            <h2 className="mt-1 font-display text-3xl">{user.name || user.email}</h2>
            <p className="mt-1 text-sm text-stone">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-line px-4 py-2 text-sm"
          >
            Đăng xuất
          </button>
        </div>
        {nextPath === "/thanh-toan" ? (
          <a
            href="/thanh-toan"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Tiếp tục thanh toán
          </a>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            defaultValue={user.name ?? ""}
            placeholder="Họ tên"
            className="rounded-2xl border border-line px-4 py-3"
          />
          <input
            name="phone"
            defaultValue={user.phone ?? ""}
            placeholder="Số điện thoại"
            className="rounded-2xl border border-line px-4 py-3"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-ink py-3 text-sm font-semibold text-cream sm:col-span-2 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Cập nhật hồ sơ"}
          </button>
        </form>
        {profileMessage ? <p className="mt-3 text-sm text-matcha">{profileMessage}</p> : null}
      </div>

      <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8">
        <h3 className="font-display text-2xl">Đơn hàng của bạn</h3>
        {ordersError ? <p className="mt-3 text-sm text-copper">{ordersError}</p> : null}
        {!ordersError && !orders.length ? (
          <p className="mt-3 text-sm text-stone">Chưa có đơn nào gắn với tài khoản này.</p>
        ) : (
          <ul className="mt-5 divide-y divide-line">
            {orders.map((order) => (
              <li key={order.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-copper">{order.code}</p>
                    <p className="mt-1 font-medium">{orderStatusLabel(order.status)}</p>
                    <p className="mt-1 text-xs text-stone">{formatDate(order.createdAt)}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-stone">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
