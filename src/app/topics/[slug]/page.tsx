"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProblemCard from "@/components/ProblemCard";
import PaymentModal from "@/components/PaymentModal";
import { formatCurrency } from "@/lib/utils";
import {
  BookOpen,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronLeft,
  Zap,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, hasCategoryAccess, hasBundleAccess, hasProblemAccess, refreshUser } = useAuth();

  const [category, setCategory] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadCategoryData() {
      if (!slug) return;
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          const currentCat = catData.categories?.find((c: any) => c.slug === slug);
          setCategory(currentCat || null);
        }

        const probRes = await fetch(`/api/problems?category=${slug}`);
        if (probRes.ok) {
          const probData = await probRes.json();
          setProblems(probData.problems || []);
        }
      } catch (err) {
        console.error("Failed to load category problems", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryData();
  }, [slug]);

  const handleBookmarkToggle = async (problemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/user/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const isCategoryUnlocked = category
    ? category.isFree || hasCategoryAccess(category.id, category.isFree)
    : false;

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Breadcrumb Navigation */}
        <Link
          href="/topics"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All DSA Topics</span>
        </Link>

        {/* Category Header Card */}
        {category && (
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 space-y-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-black border border-brand-border text-brand-red">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-brand-muted">
                  Topic Module
                </span>
              </div>

              {category.isFree ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-brand-red text-white shadow-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>100% FREE MODULE</span>
                </span>
              ) : isCategoryUnlocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-red" />
                  <span>UNLOCKED ACCESS</span>
                </span>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all active:scale-95"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Unlock Category ({formatCurrency(category.price)})</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {category.title}
            </h1>

            <p className="text-sm text-brand-muted max-w-3xl leading-relaxed">
              {category.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-brand-subtle">
              <span>{problems.length} Problems available</span>
              <span>•</span>
              <span>Java Brute + Optimal Code</span>
              <span>•</span>
              <span>Visual Handwritten Diagrams</span>
            </div>
          </div>
        )}

        {/* Problems Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Problems in this Category
            </h2>
            <span className="text-xs font-mono text-brand-muted">
              {problems.length} Curated Problems
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl bg-brand-card/40 border border-brand-border animate-pulse"
                />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="py-16 text-center text-brand-muted bg-brand-card rounded-xl border border-brand-border">
              Problems are currently being prepared for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((prob) => {
                const isProbUnlocked =
                  prob.isFree ||
                  (category && category.isFree) ||
                  hasProblemAccess(prob.id, prob.category?.id || category?.id, prob.isFree, category?.isFree);

                const isCompleted = user?.progress?.some(
                  (p) => p.problemId === prob.id && p.status === "COMPLETED"
                );
                const isBookmarked = user?.bookmarks?.some(
                  (b) => b.problemId === prob.id
                );

                return (
                  <ProblemCard
                    key={prob.id}
                    id={prob.id}
                    title={prob.title}
                    slug={prob.slug}
                    difficulty={prob.difficulty}
                    categoryTitle={prob.category?.title || category?.title}
                    categorySlug={prob.category?.slug || slug}
                    isFree={prob.isFree || (category && category.isFree)}
                    price={prob.price}
                    leetcodeUrl={prob.leetcodeUrl}
                    notesCount={prob._count?.notes || 0}
                    hasAccess={Boolean(isProbUnlocked)}
                    isCompleted={Boolean(isCompleted)}
                    isBookmarked={Boolean(isBookmarked)}
                    onBookmarkToggle={(e) => handleBookmarkToggle(prob.id, e)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Purchase Modal */}
      {category && (
        <PaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type="CATEGORY"
          id={category.id}
          title={`Unlock ${category.title} Category`}
          price={category.price}
        />
      )}
    </div>
  );
}
