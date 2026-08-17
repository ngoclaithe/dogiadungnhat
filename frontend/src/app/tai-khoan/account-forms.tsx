"use client";

import { api } from "@/lib/api";
import { FormEvent, useState } from "react";

const TOKEN_KEY = "ndn-token";

export function AccountForms() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const payload =
        mode === "login"
          ? await api.login(String(form.get("email")), String(form.get("password")))
          : await api.register({
              email: String(form.get("email")),
              password: String(form.get("password")),
              name: String(form.get("name") || ""),
              phone: String(form.get("phone") || ""),
            });
      localStorage.setItem(TOKEN_KEY, payload.accessToken);
      setMessage(`Xin chào ${payload.user.name || payload.user.email}. Đăng nhập thành công.`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  return (
    <div className="rounded-[2rem] border border-line bg-cream p-6 sm:p-8">
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-2 text-sm ${mode === "login" ? "bg-ink text-cream" : "border border-line"}`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
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
        <input name="password" type="password" required minLength={6} placeholder="Mật khẩu" className="rounded-2xl border border-line px-4 py-3" />
        <button type="submit" className="rounded-full bg-ink py-3 text-sm font-semibold text-cream">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>
      <p className="mt-4 text-xs text-stone">Tài khoản demo: demo@noidianhat.vn / demo1234</p>
      {message ? <p className="mt-3 text-sm text-matcha">{message}</p> : null}
    </div>
  );
}
