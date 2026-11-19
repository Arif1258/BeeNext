"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  BookOpen,
} from "lucide-react";

export default function PurchasesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
        <div className="h-8 w-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full rounded-2xl bg-brand-card border border-brand-border p-8 text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-brand-red mx-auto" />
          <h2 className="text-2xl font-bold">Sign In to View Purchases</h2>
          <p className="text-xs text-brand-muted">
            Access your purchased handwritten notes, unlock receipts, and problem solutions.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const purchases = user.purchases || [];

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-card border border-brand-border text-brand-red">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>MEMBER CONTENT VAULT</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            My Purchased Notes &amp; Passes
          </h1>
          <p className="text-sm text-brand-muted">
            Review your active unlocked categories, individual problems, and lifetime bundle access.
          </p>
        </div>

        {/* Free Sorting Always Highlight */}
        <div className="p-4 rounded-xl bg-brand-card border border-brand-red/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-red text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Sorting Algorithms Track</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-red text-white">
                  100% FREE
                </span>
              </h4>
              <p className="text-xs text-brand-muted">
                Quick Sort, Merge Sort, Heap Sort &amp; 5 other algorithms are unlocked for you.
              </p>
            </div>
          </div>
          <Link
            href="/topics/sorting"
            className="px-4 py-2 rounded-lg bg-brand-black hover:bg-brand-surface border border-brand-border text-xs font-mono font-bold text-white transition-colors"
          >
            Study Notes &rarr;
          </Link>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-brand-card p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-black border border-brand-border text-brand-muted">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Purchases Yet</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
              You haven&apos;t purchased any premium notes yet. Check out our DSA Topics or get the complete All-Access bundle.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/topics"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold font-mono transition-all shadow-brand"
              >
                <span>Browse DSA Topics</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-brand-card border border-brand-border flex flex-col justify-between space-y-4 shadow-card"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-red text-white">
                      {p.purchaseType}
                    </span>
                    <span className="text-xs font-mono text-brand-muted">
                      {formatDate(p.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {p.purchaseType === "BUNDLE"
                      ? "All-Access Lifetime Bundle"
                      : p.purchaseType === "CATEGORY"
                      ? "Category Pass"
                      : "Problem Unlock"}
                  </h3>

                  <p className="text-xs text-brand-muted">
                    Amount paid:{" "}
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(p.amount)}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active Lifetime Access</span>
                  </span>

                  <Link
                    href="/topics"
                    className="text-xs font-mono font-semibold text-brand-red hover:underline"
                  >
                    Open Notes &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
