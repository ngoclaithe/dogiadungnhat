"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (product: Product, quantity?: number) => void;
  setQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ndn-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

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
      ready,
      add: (product, quantity = 1) => {
        setItems((current) => {
          const found = current.find((item) => item.productId === product.id);
          if (found) {
            return current.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [
            ...current,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url ?? null,
              quantity,
            },
          ];
        });
      },
      setQty: (productId, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      remove: (productId) =>
        setItems((current) => current.filter((item) => item.productId !== productId)),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
