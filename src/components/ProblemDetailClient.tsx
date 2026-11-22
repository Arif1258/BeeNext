"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import JavaCodeBlock from "@/components/JavaCodeBlock";
import confetti from "canvas-confetti";
import {
  ExternalLink,
  ChevronLeft,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

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

interface ProblemDetailClientProps {
  initialProblem: any;
  initialAccess?: {
    hasAccess: boolean;
    reason?: string;
    price?: number;
    categoryPrice?: number;
  };
  initialTab?: "BRUTE_FORCE" | "OPTIMAL";
}

export default function ProblemDetailClient({
  initialProblem,
  initialAccess,
  initialTab = "OPTIMAL",
}: ProblemDetailClientProps) {
  const { user, refreshUser } = useAuth();
  const [problem] = useState<any>(initialProblem);
  const [activeTab, setActiveTab] = useState<"BRUTE_FORCE" | "OPTIMAL">(initialTab);

  const isBookmarked = user?.bookmarks?.some((b: any) => b.problemId === problem?.id);
  const progressRecord = user?.progress?.find((p: any) => p.problemId === problem?.id);
  const isCompleted = progressRecord?.status === "COMPLETED";

  // Keep the problem's parent topic open in the DSA Topics accordion when navigating through problems & solutions
  useEffect(() => {
    if (problem?.category?.id && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("beenext_expanded_topics");
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list) && !list.includes(problem.category.id)) {
          localStorage.setItem(
            "beenext_expanded_topics",
            JSON.stringify([...list, problem.category.id])
          );
        }
      } catch (e) {}
    }
  }, [problem]);

  const handleTabChange = (newTab: "BRUTE_FORCE" | "OPTIMAL") => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const path =
        newTab === "BRUTE_FORCE"
          ? `/problem/${problem?.slug}/brute-force`
          : `/problem/${problem?.slug}/optimal`;
      window.history.replaceState(null, "", path);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user || !problem) return;
    try {
      await fetch("/api/user/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id }),
      });
      await refreshUser();
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleProgressToggle = async () => {
    if (!user || !problem) return;
    const newStatus = isCompleted ? "IN_PROGRESS" : "COMPLETED";
    try {
      await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, status: newStatus }),
      });
      if (newStatus === "COMPLETED") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#E52532", "#FFFFFF"],
        });
      }
      await refreshUser();
    } catch (err) {
      console.error("Progress update failed", err);
    }
  };

  // Extract Brute Force and Optimal code approaches
  const bruteForceCode = problem?.codes?.find((c: any) => c.approachType === "BRUTE_FORCE");
  const optimalCode = problem?.codes?.find((c: any) => c.approachType === "OPTIMAL");

  return (
    <div className="min-h-screen bg-brand-black text-white py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation Breadcrumb, Title & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/topics"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to DSA Topics</span>
            </Link>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
              {problem?.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Striver's YouTube Link */}
            {problem?.youtubeUrl ? (
              <a
                href={problem.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/80 text-white hover:bg-red-900/50 hover:text-red-300 text-xs font-mono font-bold transition-all"
                title="Watch Striver's YouTube Explanation"
              >
                <YouTubeIcon />
                <span className="hidden sm:inline">Striver&apos;s YouTube</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/40 border border-neutral-800 text-neutral-500 opacity-40 cursor-not-allowed text-xs font-mono font-bold select-none"
                title="No video available"
              >
                <YouTubeIcon className="opacity-40 grayscale" />
                <span className="hidden sm:inline">Striver&apos;s YouTube</span>
              </span>
            )}

            {/* LeetCode Button */}
            {problem?.leetcodeUrl ? (
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-amber-500 text-amber-400 hover:text-amber-300 text-xs font-mono font-bold transition-all group"
                title="Solve on LeetCode"
              >
                <ExternalLink className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                <span className="hidden sm:inline">LeetCode</span>
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/40 border border-neutral-800 text-neutral-500 opacity-40 cursor-not-allowed text-xs font-mono font-bold select-none"
                title="No LeetCode problem available"
              >
                <ExternalLink className="h-3.5 w-3.5 text-neutral-500 opacity-40 grayscale" />
                <span className="hidden sm:inline">LeetCode</span>
              </span>
            )}

            {/* Mark Solved Action */}
            {user && (
              <button
                onClick={handleProgressToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  isCompleted
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-400"
                    : "bg-brand-card border-brand-border text-neutral-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isCompleted ? "Solved" : "Mark Solved"}</span>
              </button>
            )}

            {/* Bookmark Action */}
            {user && (
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-lg border transition-all ${
                  isBookmarked
                    ? "bg-brand-red/10 border-brand-red text-brand-red"
                    : "bg-brand-card border-brand-border text-neutral-400 hover:text-white"
                }`}
                title="Bookmark Problem"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-brand-red" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SOLUTION TABS: BRUTE FORCE | OPTIMAL                     */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <button
            type="button"
            onClick={() => handleTabChange("BRUTE_FORCE")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === "BRUTE_FORCE"
                ? "bg-brand-red text-white shadow-brand"
                : "bg-brand-card text-neutral-400 hover:text-white hover:bg-neutral-800 border border-brand-border"
            }`}
          >
            Brute Force
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("OPTIMAL")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === "OPTIMAL"
                ? "bg-brand-red text-white shadow-brand"
                : "bg-brand-card text-neutral-400 hover:text-white hover:bg-neutral-800 border border-brand-border"
            }`}
          >
            Optimal
          </button>
        </div>

        {/* ========================================================= */}
        {/* ACTIVE TAB CONTENT: ONLY CODE + TC + SC                   */}
        {/* ========================================================= */}
        {activeTab === "BRUTE_FORCE" ? (
          <div className="space-y-3">
            {/* Brute Force Java Code Block */}
            {bruteForceCode ? (
              <JavaCodeBlock
                code={bruteForceCode.javaCode}
                isLocked={false}
              />
            ) : (
              <div className="p-6 text-center text-neutral-400 bg-[#111111] rounded-xl border border-neutral-800 font-mono text-xs">
                Brute force solution not required for this problem.
              </div>
            )}

            {/* Time & Space Complexity */}
            <div className="space-y-1 font-mono text-xs sm:text-sm text-neutral-200">
              <p>Time Complexity: {bruteForceCode?.timeComplexity || "O(N²)"}</p>
              <p>Space Complexity: {bruteForceCode?.spaceComplexity || "O(1)"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Optimal Java Code Block */}
            {optimalCode ? (
              <JavaCodeBlock
                code={optimalCode.javaCode}
                isLocked={false}
              />
            ) : (
              <div className="p-6 text-center text-neutral-400 bg-[#111111] rounded-xl border border-neutral-800 font-mono text-xs">
                Optimized solution code is currently being curated.
              </div>
            )}

            {/* Time & Space Complexity */}
            <div className="space-y-1 font-mono text-xs sm:text-sm text-neutral-200">
              <p>Time Complexity: {optimalCode?.timeComplexity || "O(N)"}</p>
              <p>Space Complexity: {optimalCode?.spaceComplexity || "O(1)"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
