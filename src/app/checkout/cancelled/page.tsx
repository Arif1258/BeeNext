import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CancelledPageProps {
  searchParams?: { orderNumber?: string };
}

export default function CheckoutCancelledPage({ searchParams }: CancelledPageProps) {
  const orderNumber = searchParams?.orderNumber;

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Cancelled Header Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <AlertTriangle className="h-9 w-9" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <span>Checkout Dismissed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payment Was Cancelled
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              You cancelled or dismissed the payment window. No money has been deducted from your account.
            </p>
          </div>

          {orderNumber && (
            <div className="pt-2">
              <div className="inline-block px-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs sm:text-sm font-mono text-neutral-300">
                Order Reference: <span className="font-bold text-white">{orderNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notice Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-2 shadow-xl text-center">
          <p className="text-xs text-neutral-300 leading-relaxed font-mono">
            Your selected books remain safely in your cart. You can complete your order whenever you are ready.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/purchase"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Return to Purchase &amp; Cart</span>
          </Link>

          <Link
            href="/topics"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Browse DSA Sheet</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
