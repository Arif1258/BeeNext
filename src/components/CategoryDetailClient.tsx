"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  Check,
  ExternalLink,
  Code2,
} from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import SolutionUpgradeModal from "@/components/SolutionUpgradeModal";
import confetti from "canvas-confetti";
import { isProblemConceptual } from "@/lib/problemTemplates";

// YouTube Play Icon
const YouTubeIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`${className} text-red-600 flex-shrink-0`}
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// LeetCode Icon
const LeetCodeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-3.5 w-3.5 fill-amber-500 hover:fill-amber-400 transition-colors flex-shrink-0"
    aria-label="Solve on LeetCode"
  >
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c.058-.087.122-.171.192-.25l5.35-5.733c.523-.56.49-1.442-.075-1.966A1.368 1.368 0 0 0 13.483 0zm-2.88 8.44a1.376 1.376 0 0 0-1.026.467l-3.79 4.258a1.376 1.376 0 0 0 2.052 1.83l3.79-4.258a1.376 1.376 0 0 0-1.026-2.297z" />
  </svg>
);

interface CategoryDetailClientProps {
  initialCategory: any;
  initialProblems: any[];
}

export default function CategoryDetailClient({
  initialCategory,
  initialProblems,
}: CategoryDetailClientProps) {
  const { user, isPlusMember, hasCategoryAccess, refreshUser } = useAuth();
  const [category] = useState<any>(initialCategory);
  const [problems] = useState<any[]>(initialProblems);
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    type: "Brute Force" | "Optimal";
  }>({ isOpen: false, type: "Brute Force" });

  const handleBeforeNavigate = () => {
    if (typeof window === "undefined" || !category?.id) return;
    try {
      const raw =
        sessionStorage.getItem("beenext_topics_expanded_ids") ||
        localStorage.getItem("beenext_expanded_topics");
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && !list.includes(category.id)) {
        const updated = [...list, category.id];
        sessionStorage.setItem("beenext_topics_expanded_ids", JSON.stringify(updated));
        localStorage.setItem("beenext_expanded_topics", JSON.stringify(updated));
      }
    } catch (e) {}
  };

  // Completed map
  const [completedMap, setCompletedMap] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const map: { [id: string]: boolean } = {};
    if (user?.progress) {
      user.progress.forEach((p: any) => {
        if (p.status === "COMPLETED") map[p.problemId] = true;
      });
    } else if (typeof window !== "undefined") {
      try {
        const local = JSON.parse(localStorage.getItem("beenext_progress") || "[]");
        local.forEach((id: string) => {
          map[id] = true;
        });
      } catch (e) {}
    }
    setCompletedMap(map);
  }, [user]);

  const handleToggleProgress = async (problemId: string) => {
    const isNowCompleted = !completedMap[problemId];
    setCompletedMap((prev) => ({ ...prev, [problemId]: isNowCompleted }));

    if (isNowCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#E52532", "#FFFFFF"],
      });
    }

    if (user) {
      try {
        await fetch("/api/user/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemId,
            status: isNowCompleted ? "COMPLETED" : "IN_PROGRESS",
          }),
        });
        if (refreshUser) refreshUser();
      } catch (err) {
        console.error("Progress update error:", err);
      }
    } else if (typeof window !== "undefined") {
      try {
        const local = JSON.parse(localStorage.getItem("beenext_progress") || "[]");
        const updated = isNowCompleted
          ? Array.from(new Set([...local, problemId]))
          : local.filter((id: string) => id !== problemId);
        localStorage.setItem("beenext_progress", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const isTopicFree = category
    ? category.isFree || category.slug === "sorting" || category.slug === "sorting-techniques"
    : false;

  const isCategoryUnlocked = category
    ? isTopicFree || (hasCategoryAccess ? hasCategoryAccess(category.id, category.isFree) : false)
    : false;

  const completedCount = problems.filter((p) => completedMap[p.id]).length;

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumb Navigation */}
        <Link
          href="/topics"
          scroll={false}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Topics</span>
        </Link>

        {/* Clean Topic Header (Title Only + Progress) */}
        {category && (
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {category.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400">
                Completed:{" "}
                <span className="text-emerald-400 font-bold">
                  {completedCount} / {problems.length}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Clean Problem Rows List */}
        <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
          {problems.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-mono text-xs">
              Problems are currently being curated for this topic.
            </div>
          ) : (
            <div className="divide-y divide-brand-border/40 bg-brand-black px-2 sm:px-4 py-1">
              {problems.map((prob, idx) => {
                const problemNum = String(prob.order || idx + 1).padStart(2, "0");
                const isCompleted = Boolean(completedMap[prob.id]);

                return (
                  <div
                    key={prob.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-2 hover:bg-neutral-900/60 rounded-md transition-colors gap-2"
                  >
                    {/* Left: Checkbox + Problem Name + Difficulty */}
                    <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleProgress(prob.id)}
                        className={`h-4 w-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : "bg-transparent border-neutral-600 hover:border-brand-red text-transparent"
                        }`}
                        title={isCompleted ? "Completed (Click to unmark)" : "Mark as completed"}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </button>

                      {/* Problem Title Link - Navigates to Overview for conceptual topics, or Coding Playground for coding problems */}
                      {(() => {
                        const isConceptual = isProblemConceptual(prob.slug);
                        return (
                          <Link
                            href={isConceptual ? `/problem/${prob.slug}` : `/problem/${prob.slug}/code`}
                            onClick={handleBeforeNavigate}
                            className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                              isCompleted
                                ? "text-neutral-500 line-through decoration-neutral-600 hover:text-neutral-300"
                                : "text-neutral-100 hover:text-brand-red"
                            }`}
                            title={isConceptual ? `View ${prob.title}` : `Open Coding Playground for ${prob.title}`}
                          >
                            <span className="font-mono text-neutral-500 mr-2">
                              {problemNum}.
                            </span>
                            <span>{prob.title}</span>
                          </Link>
                        );
                      })()}

                      {/* Difficulty Label directly after the title */}
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </div>

                    {/* Right: Code | Striver | LeetCode | Brute | Optimal */}
                    <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 text-xs font-mono flex-shrink-0 pl-6 sm:pl-0">
                      {/* 1. Code (Only for non-conceptual coding problems) */}
                      {!isProblemConceptual(prob.slug) && (
                        <>
                          <Link
                            href={`/problem/${prob.slug}/code`}
                            onClick={handleBeforeNavigate}
                            className="text-neutral-300 hover:text-brand-red font-medium transition-colors inline-flex items-center gap-1.5"
                            title="Open dedicated Coding Playground for this problem"
                          >
                            <Code2 className="h-3.5 w-3.5 text-brand-red" />
                            <span>Code</span>
                          </Link>

                          <span className="text-neutral-700 select-none">|</span>
                        </>
                      )}

                      {/* 2. Striver YouTube */}
                      {prob.youtubeUrl ? (
                        <a
                          href={prob.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-brand-red font-medium transition-colors inline-flex items-center gap-1.5"
                          title="Watch Striver's YouTube explanation video"
                        >
                          <YouTubeIcon />
                          <span>Striver</span>
                        </a>
                      ) : (
                        <span
                          className="text-neutral-500 opacity-40 select-none inline-flex items-center gap-1.5 cursor-not-allowed font-medium"
                          title="No Striver video available"
                        >
                          <YouTubeIcon className="h-3 w-3 opacity-40 grayscale" />
                          <span>Striver</span>
                        </span>
                      )}

                      <span className="text-neutral-700 select-none">|</span>

                      {/* 3. LeetCode */}
                      {prob.leetcodeUrl ? (
                        <a
                          href={prob.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:text-amber-400 font-semibold transition-colors inline-flex items-center gap-0.5"
                          title="Open problem on LeetCode"
                        >
                          <span>LeetCode</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-80" />
                        </a>
                      ) : (
                        <span
                          className="text-neutral-500 opacity-40 select-none inline-flex items-center gap-0.5 cursor-not-allowed font-semibold"
                          title="No LeetCode problem available"
                        >
                          <span>LeetCode</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-40 grayscale" />
                        </span>
                      )}

                      <span className="text-neutral-700 select-none">|</span>

                      {/* 4. Brute */}
                      {isPlusMember ? (
                        <Link
                          href={`/problem/${prob.slug}/brute-force`}
                          onClick={handleBeforeNavigate}
                          className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                          title="Open Brute Force solution"
                        >
                          Brute
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setUpgradeModal({ isOpen: true, type: "Brute Force" })
                          }
                          className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                          title="Brute Force solution (Plus required)"
                        >
                          Brute
                        </button>
                      )}

                      <span className="text-neutral-700 select-none">|</span>

                      {/* 5. Optimal */}
                      {isPlusMember ? (
                        <Link
                          href={`/problem/${prob.slug}/optimal`}
                          onClick={handleBeforeNavigate}
                          className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                          title="Open Optimal solution"
                        >
                          Optimal
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setUpgradeModal({ isOpen: true, type: "Optimal" })
                          }
                          className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                          title="Optimal solution (Plus required)"
                        >
                          Optimal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Solution Upgrade Modal for Normal Users */}
      <SolutionUpgradeModal
        isOpen={upgradeModal.isOpen}
        solutionType={upgradeModal.type}
        onClose={() => setUpgradeModal({ isOpen: false, type: "Brute Force" })}
      />
    </div>
  );
}
