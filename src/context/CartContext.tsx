"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  id: string;          // product id
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const cartKey = userId ? `cart:${userId}` : "cart:guest";
  const prevKeyRef = useRef<string>(cartKey);

  // load from current key
  useEffect(() => {
    const saved = localStorage.getItem(cartKey);
    if (saved) setItems(JSON.parse(saved));
    else setItems([]);
  }, [cartKey]);

  // migrate when key changes (login/logout)
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== cartKey) {
      const prevData = localStorage.getItem(prevKey);
      if (prevData) {
        if (!localStorage.getItem(cartKey)) {
          localStorage.setItem(cartKey, prevData);
          setItems(JSON.parse(prevData));
        }
        localStorage.removeItem(prevKey);
      }
    }
    prevKeyRef.current = cartKey;
  }, [cartKey]);

  // persist whenever items or key change
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, cartKey]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const decreaseQty = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        decreaseQty,
        total,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
