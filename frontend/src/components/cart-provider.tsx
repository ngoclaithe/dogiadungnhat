"use client";

import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import type { CartItem, Product } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  loggedIn: boolean;
  add: (product: Product, quantity?: number) => Promise<void>;
  setQty: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const LEGACY_STORAGE_KEY = "ndn-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setItems([]);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    api
      .getCart()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  const applyItems = useCallback((next: CartItem[]) => {
    setItems(next);
  }, []);

  const add = useCallback(
    async (product: Product, quantity = 1) => {
      if (!user) return;
      const existing = items.find((item) => item.productId === product.id);
      const nextQty = (existing?.quantity ?? 0) + quantity;
      const next = await api.upsertCartItem(product.id, nextQty);
      applyItems(next);
    },
    [applyItems, items, user],
  );

  const setQty = useCallback(
    async (productId: string, quantity: number) => {
      if (!user) return;
      const next = await api.upsertCartItem(productId, quantity);
      applyItems(next);
    },
    [applyItems, user],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!user) return;
      const next = await api.removeCartItem(productId);
      applyItems(next);
    },
    [applyItems, user],
  );

  const clear = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const next = await api.clearCart();
    applyItems(next);
  }, [applyItems, user]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    );
    return {
      items,
      count,
      subtotal,
      ready: authReady && ready,
      loggedIn: Boolean(user),
      add,
      setQty,
      remove,
      clear,
    };
  }, [add, authReady, clear, items, ready, remove, setQty, user]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
