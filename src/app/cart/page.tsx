"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { getBookImage } from "@/lib/bookImages";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  BookOpen,
  Sparkles,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    openCheckout,
  } = useCart();

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Link href="/purchase" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Purchase</span>
              </Link>
              <span>/</span>
              <span className="text-brand-red font-bold">Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Shopping Cart</span>
              {totalItems > 0 && (
                <span className="text-xs font-mono font-normal text-neutral-300 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  {totalItems} {totalItems === 1 ? "Book" : "Books"}
                </span>
              )}
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="self-start sm:self-auto text-xs font-mono text-neutral-400 hover:text-red-400 underline transition"
            >
              Clear Entire Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="py-20 text-center space-y-6 rounded-2xl border border-brand-border bg-brand-card/50 p-8 max-w-2xl mx-auto shadow-card">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400 shadow-inner">
              <ShoppingBag className="h-10 w-10 text-neutral-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Your Cart is Currently Empty</h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                You haven&apos;t added any books yet. Explore our curated topic-wise DSA booklets, the complete 500-page DSA book, or CS fundamental notes.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/purchase"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs sm:text-sm font-mono font-bold shadow-brand transition-all active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                <span>Explore All Books</span>
              </Link>
              <Link
                href="/topics"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-xs sm:text-sm font-mono font-bold transition-all"
              >
                <span>View DSA Sheet</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Items List (8 Columns on desktop) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Callout */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center justify-between text-emerald-400 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="font-bold">Free Doorstep Delivery Across India</span>
                </div>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">Dispatched via Speed Post / Courier</span>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {items.map((item) => {
                  const coverImage = item.image || getBookImage(item.slug, item.productType);
                  const itemTotal = item.price * (item.quantity || 1);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-brand-border bg-brand-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-neutral-700 shadow-card"
                    >
                      {/* Left: Image & Info */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Book Thumbnail */}
                        <div className="relative h-20 w-16 sm:h-24 sm:w-18 rounded-xl overflow-hidden border border-brand-border bg-neutral-900 shrink-0 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImage}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        {/* Title & Metadata */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                            {item.language && (
                              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-brand-red/10 border border-brand-red/30 text-brand-red">
                                {item.language} Edition
                              </span>
                            )}
                            {item.pages && (
                              <span className="text-neutral-400 text-[11px]">
                                ~{item.pages} Pages
                              </span>
                            )}
                            {item.sections && (
                              <span className="text-neutral-400 text-[11px]">
                                {item.sections} Sections
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-emerald-400 font-bold sm:hidden pt-1">
                            Unit Price: {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity, Price & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/60 shrink-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-brand-border rounded-xl bg-brand-black p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg transition hover:bg-neutral-900"
                            title="Decrease quantity"
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-mono font-bold text-white select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg transition hover:bg-neutral-900 disabled:opacity-40"
                            title="Increase quantity"
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                            {formatCurrency(itemTotal)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] font-mono text-neutral-400">
                              {formatCurrency(item.price)} each
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-400 p-2 rounded-lg transition-colors hover:bg-neutral-900"
                          title="Remove item from cart"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation Link */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono">
                <Link
                  href="/purchase"
                  className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Continue Shopping More Books</span>
                </Link>
                <span className="text-neutral-500">Prices are inclusive of all taxes</span>
              </div>
            </div>

            {/* Right: Order Summary (4 Columns on desktop) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-5 shadow-card sticky top-24">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-brand-border pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Total Books ({totalItems})</span>
                    <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Doorstep Delivery
                    </span>
                    <span className="font-bold">FREE</span>
                  </div>

                  <div className="flex justify-between text-neutral-400 text-[11px]">
                    <span>Packaging & Handling</span>
                    <span className="text-neutral-300">FREE</span>
                  </div>

                  <div className="border-t border-brand-border/60 pt-3 flex justify-between items-baseline text-sm sm:text-base font-bold text-white">
                    <span>Total Payable</span>
                    <span className="text-emerald-400 font-mono text-xl sm:text-2xl font-extrabold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => openCheckout()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover active:scale-[0.98] text-white font-mono text-xs sm:text-sm font-bold shadow-brand transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Trust Badges */}
                <div className="space-y-2 pt-2 border-t border-brand-border/40 text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-red shrink-0" />
                    <span>100% Secure Checkout via Razorpay Standard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>UPI, Debit/Credit Cards & NetBanking accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Speed courier dispatch with parcel tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
