"use client";

import { api, TOKEN_KEY } from "@/lib/api";
import type { AuthUser } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (payload: { name?: string; phone?: string }) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setReady(true));
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login: async (email, password) => {
        const payload = await api.login(email, password);
        persist(payload.accessToken, payload.user);
        return payload.user;
      },
      register: async (input) => {
        const payload = await api.register(input);
        persist(payload.accessToken, payload.user);
        return payload.user;
      },
      logout,
      updateProfile: async (input) => {
        const next = await api.updateProfile(input);
        setUser(next);
        return next;
      },
    }),
    [logout, persist, ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
