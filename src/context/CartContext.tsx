"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getBookImage } from "@/lib/bookImages";

export interface CartItem {
  id: string;
  slug: string;
  productType: "COMPLETE_BOOK" | "TOPIC" | "CS_FUNDAMENTAL";
  title: string;
  language?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  categoryId?: string;
  pages?: number;
  sections?: number;
  description?: string;
  image?: string;
}

export type CartItemInput = Omit<CartItem, "quantity" | "id"> & { id?: string; quantity?: number };

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: CartItemInput,
    options?: { openDrawer?: boolean }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;

  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  directCheckoutItem: CartItem | null;
  openCheckout: (item?: CartItemInput) => void;
  closeCheckout: () => void;

  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "beenext_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<CartItem | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write cart to localStorage:", e);
    }
  }, [items, isHydrated]);

  const addItem = (
    itemData: CartItemInput,
    options?: { openDrawer?: boolean }
  ) => {
    const qty = Math.max(1, Math.min(10, itemData.quantity || 1));
    const itemId = itemData.id || `${itemData.productType}_${itemData.slug}_${itemData.language || "none"}`;
    const img = itemData.image || getBookImage(itemData.slug, itemData.productType);

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.id === itemId);
      if (existingIdx > -1) {
        const next = [...prev];
        const newQty = Math.min(10, next[existingIdx].quantity + qty);
        next[existingIdx] = { ...next[existingIdx], quantity: newQty, image: next[existingIdx].image || img };
        return next;
      }
      return [...prev, { ...itemData, id: itemId, quantity: qty, image: img }];
    });

    if (options?.openDrawer !== false) {
      setIsCartOpen(true);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const cleanQty = Math.min(10, quantity);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: cleanQty } : it))
    );
  };

  const clearCart = () => {
    setItems([]);
    setDirectCheckoutItem(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = (directItem?: CartItemInput) => {
    if (directItem) {
      const qty = Math.max(1, Math.min(10, directItem.quantity || 1));
      const itemId = directItem.id || `${directItem.productType}_${directItem.slug}_${directItem.language || "none"}`;
      const img = directItem.image || getBookImage(directItem.slug, directItem.productType);
      setDirectCheckoutItem({ ...directItem, id: itemId, quantity: qty, image: img });
    } else {
      setDirectCheckoutItem(null);
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setDirectCheckoutItem(null);
  };

  // Computations
  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + (it.quantity || 1), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0),
    [items]
  );

  const deliveryCharge = 0; // Free Doorstep Delivery
  const totalAmount = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        setIsCheckoutOpen,
        directCheckoutItem,
        openCheckout,
        closeCheckout,
        totalItems,
        subtotal,
        deliveryCharge,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
