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
  Lock,
  Sparkles,
} from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import SolutionUpgradeModal from "@/components/SolutionUpgradeModal";
import { isProblemConceptual } from "@/lib/problemTemplates";

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

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
  initialTab = "BRUTE_FORCE",
}: ProblemDetailClientProps) {
  const { user, isPlusMember, refreshUser } = useAuth();
  const [problem] = useState<any>(initialProblem);
  const isConceptual = isProblemConceptual(problem?.slug);
  const [activeTab, setActiveTab] = useState<"BRUTE_FORCE" | "OPTIMAL">(initialTab);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    type: "Brute Force" | "Optimal";
  }>({ isOpen: false, type: "Brute Force" });

  useEffect(() => {
    if (!isConceptual && !isPlusMember && (initialTab === "BRUTE_FORCE" || initialTab === "OPTIMAL")) {
      setUpgradeModal({
        isOpen: true,
        type: initialTab === "BRUTE_FORCE" ? "Brute Force" : "Optimal",
      });
    }
  }, [isConceptual, isPlusMember, initialTab]);

  const isBookmarked = user?.bookmarks?.some((b: any) => b.problemId === problem?.id);
  const progressRecord = user?.progress?.find((p: any) => p.problemId === problem?.id);
  const isCompleted = progressRecord?.status === "COMPLETED";

  // Keep the problem's parent topic open in the DSA Topics accordion when navigating through problems & solutions
  useEffect(() => {
    if (problem?.category?.id && typeof window !== "undefined") {
      try {
        const raw =
          sessionStorage.getItem("beenext_topics_expanded_ids") ||
          localStorage.getItem("beenext_expanded_topics");
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list) && !list.includes(problem.category.id)) {
          const updated = [...list, problem.category.id];
          sessionStorage.setItem(
            "beenext_topics_expanded_ids",
            JSON.stringify(updated)
          );
          localStorage.setItem(
            "beenext_expanded_topics",
            JSON.stringify(updated)
          );
        }
      } catch (e) {}
    }
  }, [problem?.category?.id]);

  const handleTabChange = (newTab: "BRUTE_FORCE" | "OPTIMAL") => {
    if (!isPlusMember) {
      setUpgradeModal({
        isOpen: true,
        type: newTab === "BRUTE_FORCE" ? "Brute Force" : "Optimal",
      });
      return;
    }
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
              scroll={false}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to DSA Topics</span>
            </Link>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
                {problem?.title}
              </h1>
              {isConceptual ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Conceptual Guide
                </span>
              ) : (
                <DifficultyBadge difficulty={problem?.difficulty} size="sm" />
              )}
            </div>
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

            {/* LeetCode Button (Only for coding problems with leetcodeUrl) */}
            {!isConceptual && (
              problem?.leetcodeUrl ? (
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
              )
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
        {/* CONCEPTUAL VIEW OR CODE SOLUTIONS TABS                   */}
        {/* ========================================================= */}
        {isConceptual ? (
          <div className="space-y-6">
            {/* Video Section (if youtubeUrl present) */}
            {getYouTubeEmbedUrl(problem?.youtubeUrl) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <YouTubeIcon />
                    <span>Video Lecture &amp; Explanation</span>
                  </h2>
                  {problem.youtubeUrl && (
                    <a
                      href={problem.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-brand-border bg-black shadow-card">
                  <iframe
                    src={getYouTubeEmbedUrl(problem?.youtubeUrl)!}
                    title={problem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Description & Conceptual Content */}
            <div className="rounded-xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-4 shadow-card">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Conceptual Overview &amp; Key Notes
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-neutral-900 border border-neutral-800 text-neutral-400">
                  Theory Guide
                </span>
              </div>
              <div className="text-neutral-200 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3 font-sans">
                {problem?.description}
              </div>
              {problem?.explanation && (
                <div className="mt-4 pt-4 border-t border-brand-border/60 text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                  {problem.explanation}
                </div>
              )}
            </div>

            {/* Mark Completed Section */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {isCompleted ? "Topic completed!" : "Mark this topic as done"}
                </p>
                <p className="text-xs text-neutral-400">
                  {isCompleted
                    ? "You have marked this conceptual guide as completed. You can unmark anytime."
                    : "Finished studying this concept? Mark it as done to update your progress."}
                </p>
              </div>
              {user && (
                <button
                  onClick={handleProgressToggle}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                    isCompleted
                      ? "bg-emerald-950/60 border-emerald-700 text-emerald-400 hover:bg-emerald-900/60"
                      : "bg-brand-red hover:bg-brand-red/90 border-brand-red text-white shadow-brand"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isCompleted ? "Completed" : "Mark as Done"}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* TABS: BRUTE FORCE | OPTIMAL */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                {/* 1. Brute Force */}
                <button
                  type="button"
                  onClick={() => handleTabChange("BRUTE_FORCE")}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "BRUTE_FORCE"
                      ? "bg-brand-red text-white shadow-brand"
                      : "bg-brand-card text-neutral-400 hover:text-white hover:bg-neutral-800 border border-brand-border"
                  }`}
                >
                  <span>Brute Force</span>
                  {!isPlusMember && <Lock className="h-3 w-3 text-neutral-400" />}
                </button>

                {/* 2. Optimal */}
                <button
                  type="button"
                  onClick={() => handleTabChange("OPTIMAL")}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "OPTIMAL"
                      ? "bg-brand-red text-white shadow-brand"
                      : "bg-brand-card text-neutral-400 hover:text-white hover:bg-neutral-800 border border-brand-border"
                  }`}
                >
                  <span>Optimal</span>
                  {!isPlusMember && <Lock className="h-3 w-3 text-neutral-400" />}
                </button>
              </div>

              {!isPlusMember && (
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-red/10 border border-brand-red/40 hover:bg-brand-red/20 text-brand-red text-xs font-mono font-semibold transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Unlock Plus Solutions</span>
                </Link>
              )}
            </div>

            {/* ACTIVE TAB CONTENT */}
            {activeTab === "BRUTE_FORCE" ? (
              <div className="space-y-3">
                {/* Brute Force Java Code Block */}
                {bruteForceCode ? (
                  <JavaCodeBlock
                    code={bruteForceCode.javaCode}
                    isLocked={!isPlusMember}
                  />
                ) : (
                  <div className="p-6 text-center text-neutral-400 bg-[#111111] rounded-xl border border-neutral-800 font-mono text-xs">
                    Brute force solution not required for this problem.
                  </div>
                )}

                {/* Time & Space Complexity */}
                {isPlusMember ? (
                  <div className="space-y-1 font-mono text-xs sm:text-sm text-neutral-200">
                    <p>Time Complexity: {bruteForceCode?.timeComplexity || "O(N²)"}</p>
                    <p>Space Complexity: {bruteForceCode?.spaceComplexity || "O(1)"}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-500 font-mono flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Time &amp; Space Complexity locked with BeeNext Plus</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Optimal Java Code Block */}
                {optimalCode ? (
                  <JavaCodeBlock
                    code={optimalCode.javaCode}
                    isLocked={!isPlusMember}
                  />
                ) : (
                  <div className="p-6 text-center text-neutral-400 bg-[#111111] rounded-xl border border-neutral-800 font-mono text-xs">
                    Optimized solution code is currently being curated.
                  </div>
                )}

                {/* Time & Space Complexity */}
                {isPlusMember ? (
                  <div className="space-y-1 font-mono text-xs sm:text-sm text-neutral-200">
                    <p>Time Complexity: {optimalCode?.timeComplexity || "O(N)"}</p>
                    <p>Space Complexity: {optimalCode?.spaceComplexity || "O(1)"}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-500 font-mono flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Time &amp; Space Complexity locked with BeeNext Plus</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
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
