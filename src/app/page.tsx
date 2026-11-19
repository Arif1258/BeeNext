"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import CategoryCard from "@/components/CategoryCard";
import PaymentModal from "@/components/PaymentModal";
import { useAuth } from "@/context/AuthContext";
import {
  Code2,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Terminal,
  FileText,
  Star,
} from "lucide-react";

export default function HomePage() {
  const { user, hasCategoryAccess, hasBundleAccess } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [bundle, setBundle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bundleModalOpen, setBundleModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setBundle(data.bundle || null);
        }
      } catch (err) {
        console.error("Error loading categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const sortingCategory = categories.find((c) => c.slug === "sorting");
  const premiumCategories = categories.filter((c) => c.slug !== "sorting").slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-brand-black text-white selection:bg-brand-red selection:text-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-brand-border graph-paper-bg">
        {/* Glow circle */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-card border border-brand-border text-xs font-mono font-medium text-white shadow-card">
            <span className="flex h-2 w-2 rounded-full bg-brand-red animate-ping" />
            <span className="text-brand-red font-bold">100% FREE SORTING ALGORITHMS</span>
            <span className="text-brand-subtle">•</span>
            <span>Handwritten DSA Notes Marketplace</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Master Data Structures with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-redLight to-white">
              Handwritten Visuals
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Crystal-clear recursion trees, memory pointer traces, and battle-tested Java implementations. Stop memorizing code—understand the deep algorithmic invariants visually.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/topics/sorting"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-bold text-sm shadow-brand hover:shadow-brand-glow transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore Free Sorting Notes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setBundleModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white font-semibold text-sm transition-all"
            >
              <Zap className="h-4 w-4 text-brand-red" />
              <span>All-Access Bundle ({formatCurrency(bundle?.price || 1499)})</span>
            </button>
          </div>

          {/* Hero Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 text-left">
            <div className="p-4 rounded-xl bg-brand-card/70 border border-brand-border">
              <span className="text-2xl font-extrabold font-mono text-white block">18</span>
              <span className="text-xs text-brand-muted">DSA Categories</span>
            </div>
            <div className="p-4 rounded-xl bg-brand-card/70 border border-brand-border">
              <span className="text-2xl font-extrabold font-mono text-brand-red block">100% Free</span>
              <span className="text-xs text-brand-muted">Sorting Compendium</span>
            </div>
            <div className="p-4 rounded-xl bg-brand-card/70 border border-brand-border">
              <span className="text-2xl font-extrabold font-mono text-white block">O(N) / O(1)</span>
              <span className="text-xs text-brand-muted">Complexity Proofs</span>
            </div>
            <div className="p-4 rounded-xl bg-brand-card/70 border border-brand-border">
              <span className="text-2xl font-extrabold font-mono text-white block">Java</span>
              <span className="text-xs text-brand-muted">Brute + Optimal Code</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Free Sorting Category Highlight (IMPORTANT BUSINESS RULE) */}
      <section className="py-16 bg-brand-blackDeep border-b border-brand-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-brand-red/50 bg-gradient-to-br from-brand-card to-brand-black p-6 sm:p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Terminal className="w-80 h-80 text-brand-red" />
            </div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red text-white text-xs font-mono font-bold shadow-brand">
                <Star className="h-3 w-3 fill-white" />
                <span>PERMANENT COMMUNITY GIFT</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Complete Sorting Category: Free For Everyone
              </h2>

              <p className="text-sm text-brand-muted leading-relaxed">
                We believe core algorithmic intuition should be accessible to every developer. Study all 8 fundamental sorting algorithms with zero paywall: Quick Sort, Merge Sort, Bubble Sort, Selection Sort, Insertion Sort, Heap Sort, Counting Sort, and Radix Sort.
              </p>

              {/* Algorithm Quick Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Quick Sort",
                  "Merge Sort",
                  "Heap Sort",
                  "Insertion Sort",
                  "Selection Sort",
                  "Bubble Sort",
                  "Counting Sort",
                  "Radix Sort",
                ].map((algo) => (
                  <span
                    key={algo}
                    className="px-3 py-1 rounded-lg bg-brand-black border border-brand-border text-xs font-mono text-white"
                  >
                    {algo}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex items-center space-x-4">
                <Link
                  href="/topics/sorting"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold font-mono transition-all shadow-brand"
                >
                  <span>Open Free Sorting Topics</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/problem/quick-sort"
                  className="text-xs font-mono text-brand-muted hover:text-white transition-colors"
                >
                  Direct to Quick Sort Notes &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sample Handwritten Notes Preview Carousel Showcase */}
      <section className="py-16 border-b border-brand-border bg-brand-black graph-paper-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold text-brand-red uppercase tracking-widest">
              Engineered For Intuition
            </h2>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">
              Sample Handwritten Diagrams &amp; Breakdowns
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted">
              Inspect how our visual breakdown transforms abstract algorithmic logic into step-by-step mental models.
            </p>
          </div>

          {/* Interactive Note Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Note Preview 1: QuickSort */}
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden shadow-2xl group">
              <div className="p-3 bg-brand-black border-b border-brand-border flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-brand-red" />
                  <span>Quick Sort — Lomuto Partition Visualizer</span>
                </span>
                <span className="text-brand-red font-bold">FREE NOTE</span>
              </div>
              <div className="p-3 bg-brand-blackDeep flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/notes/quicksort-p1.svg"
                  alt="Quick Sort Lomuto Partition Note"
                  className="w-full h-auto object-contain rounded group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
              <div className="p-4 bg-brand-card border-t border-brand-border flex items-center justify-between">
                <span className="text-xs text-brand-muted">Two-pointer swap invariant trace</span>
                <Link
                  href="/problem/quick-sort"
                  className="text-xs font-mono font-bold text-brand-red hover:underline"
                >
                  View Full Solution &rarr;
                </Link>
              </div>
            </div>

            {/* Note Preview 2: 0/1 Knapsack */}
            <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden shadow-2xl group">
              <div className="p-3 bg-brand-black border-b border-brand-border flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-brand-red" />
                  <span>0/1 Knapsack — Dynamic Programming State Grid</span>
                </span>
                <span className="text-brand-subtle">PREMIUM NOTE</span>
              </div>
              <div className="p-3 bg-brand-blackDeep flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/notes/knapsack.svg"
                  alt="0/1 Knapsack DP Table Note"
                  className="w-full h-auto object-contain rounded group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
              <div className="p-4 bg-brand-card border-t border-brand-border flex items-center justify-between">
                <span className="text-xs text-brand-muted">1D vs 2D space optimization proof</span>
                <Link
                  href="/problem/0-1-knapsack"
                  className="text-xs font-mono font-bold text-brand-red hover:underline"
                >
                  Unlock DP Blueprint &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complete 18 DSA Categories Matrix Showcase */}
      <section className="py-20 border-b border-brand-border bg-brand-blackDeep">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-brand-red uppercase tracking-wider block">
                Comprehensive Curriculum
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                All 18 DSA Topic Modules
              </h2>
              <p className="text-xs text-brand-muted mt-1 max-w-lg">
                Explore our full syllabus. Sorting is completely free. Premium modules are unlocked individually or bundled.
              </p>
            </div>

            <Link
              href="/topics"
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-white hover:text-brand-red transition-colors"
            >
              <span>View all 18 topics &amp; syllabus</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                title={cat.title}
                slug={cat.slug}
                description={cat.description}
                isFree={cat.isFree}
                price={cat.price}
                problemCount={cat._count?.problems || 0}
                hasAccess={hasCategoryAccess(cat.id, cat.isFree)}
              />
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-card hover:bg-brand-cardHover border border-brand-border text-white text-xs font-mono font-semibold transition-all"
            >
              <span>Explore Remaining 10 Advanced Categories</span>
              <ArrowRight className="h-4 w-4 text-brand-red" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. All-Access Lifetime Bundle Banner */}
      <section className="py-20 bg-brand-black relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-brand-red bg-gradient-to-b from-brand-card to-brand-black p-8 sm:p-12 text-center space-y-6 shadow-brand">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-red text-white shadow-brand">
              <Sparkles className="h-3.5 w-3.5" />
              <span>LIMITED LIFETIME OFFER</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              All-Access DSA Handwritten Mastery Bundle
            </h2>

            <p className="text-sm text-brand-muted max-w-xl mx-auto leading-relaxed">
              Unlock every single category: Sorting, Dynamic Programming, Graphs, Binary Trees, Tries, Backtracking, and all 150+ handwritten breakdowns with a single one-time payment.
            </p>

            {/* Price Box */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-mono font-black text-white">
                {formatCurrency(bundle?.price || 1499)}
              </span>
              <span className="text-xl font-mono text-brand-subtle line-through">
                {formatCurrency(bundle?.originalPrice || 4999)}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setBundleModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-extrabold text-sm shadow-brand hover:shadow-brand-glow transition-all active:scale-95"
              >
                <span>Unlock All-Access Lifetime Pass</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-red" />
                <span>Instant Razorpay Activation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-red" />
                <span>All Future DSA Problems Included</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-brand-red" />
                <span>High-Res PDFs + Source Code</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={bundleModalOpen}
        onClose={() => setBundleModalOpen(false)}
        type="BUNDLE"
        title="All-Access DSA Handwritten Mastery Bundle"
        price={bundle?.price || 1499}
        originalPrice={bundle?.originalPrice || 4999}
      />
    </div>
  );
}
