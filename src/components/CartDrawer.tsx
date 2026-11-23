"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { getBookImage } from "@/lib/bookImages";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    openCheckout,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-brand-border bg-brand-card text-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-brand-black/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Shopping Cart</span>
                  {totalItems > 0 && (
                    <span className="text-[11px] font-mono font-normal text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Your cart is currently empty</p>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Explore our topic-wise books, complete DSA book, and CS fundamental notes.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/purchase"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Browse Books</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Free Delivery Banner */}
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Free Doorstep Delivery</span>
                  <span className="text-neutral-400 text-[10px] ml-auto">Across India</span>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-brand-border bg-brand-black/40 p-3 sm:p-3.5 space-y-2.5 transition hover:border-neutral-700"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative h-14 w-11 rounded-lg overflow-hidden border border-brand-border bg-neutral-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image || getBookImage(item.slug, item.productType)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.language && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-red/10 border border-brand-red/30 text-brand-red">
                                {item.language}
                              </span>
                            )}
                            {item.pages && (
                              <span className="text-[10px] font-mono text-neutral-400">
                                ~{item.pages} Pages
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-brand-border rounded-lg bg-brand-card">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 sm:p-1.5 text-neutral-400 hover:text-white transition"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 sm:px-2.5 text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="p-1 sm:p-1.5 text-neutral-400 hover:text-white transition disabled:opacity-40"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] font-mono text-neutral-400">
                              {formatCurrency(item.price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-neutral-400 font-mono">
                  <span>Need to reset?</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-neutral-400 hover:text-red-400 underline transition"
                  >
                    Clear All Items
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer (Summary & Checkout CTA) */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-black/70 space-y-3.5">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery Charge
                  </span>
                  <span>FREE</span>
                </div>
                <div className="border-t border-brand-border/60 pt-2 flex justify-between text-sm sm:text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-400 font-mono font-extrabold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openCheckout()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover active:scale-[0.98] text-white font-mono text-xs sm:text-sm font-bold shadow-brand transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between text-xs font-mono pt-0.5 px-0.5">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="text-neutral-400 hover:text-white underline transition flex items-center gap-1"
                >
                  <span>View Full Cart Page</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-neutral-500 hover:text-red-400 transition"
                >
                  Clear Cart
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-mono text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
                <span>100% Secure Checkout via Razorpay Standard</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
