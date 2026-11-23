"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Check,
  ExternalLink,
  Package,
} from "lucide-react";
import { getTopicPrice } from "@/lib/pricing";

export interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  isFree: boolean;
  price: number;
  order: number;
  leetcodeUrl?: string | null;
  youtubeUrl?: string | null;
  apnaYoutubeUrl?: string | null;
  _count?: { notes: number };
  notes?: Array<{ id: string; title: string; fileType: string }>;
}

export interface TopicItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  isFree: boolean;
  price: number;
  order: number;
  _count?: { problems: number };
  problems?: ProblemItem[];
}

interface VerticalTopicAccordionProps {
  topics: TopicItem[];
  user: any;
  hasCategoryAccess?: (categoryId: string, isFree?: boolean) => boolean;
  hasProblemAccess?: (problemId: string, categoryId: string, isProbFree?: boolean, isCatFree?: boolean) => boolean;
  onUnlockTopic?: (topic: TopicItem) => void;
  defaultExpandedSlug?: string;
  refreshUser?: () => Promise<void>;
  completedMap?: { [id: string]: boolean };
  onToggleProgress?: (problemId: string) => void;
  forceExpandAll?: boolean;
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

export default function VerticalTopicAccordion({
  topics,
  user,
  hasCategoryAccess,
  hasProblemAccess,
  onUnlockTopic,
  defaultExpandedSlug,
  refreshUser,
  completedMap: propCompletedMap,
  onToggleProgress: propToggleProgress,
  forceExpandAll = false,
}: VerticalTopicAccordionProps) {
  // Map of topicId -> boolean to allow multiple topics to stay open independently until manually closed
  const [expandedTopicIds, setExpandedTopicIds] = useState<{ [id: string]: boolean }>({});

  // Sync expanded state with localStorage to preserve opened topics across navigation and state updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("beenext_expanded_topics");
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map: { [id: string]: boolean } = {};
          parsed.forEach((id: string) => {
            map[id] = true;
          });
          setExpandedTopicIds(map);
          return;
        }
      }
      // If nothing saved in localStorage yet and defaultExpandedSlug was given:
      if (defaultExpandedSlug) {
        const found = topics.find((t) => t.slug === defaultExpandedSlug);
        if (found) {
          setExpandedTopicIds({ [found.id]: true });
          localStorage.setItem("beenext_expanded_topics", JSON.stringify([found.id]));
        }
      }
    } catch (e) {
      console.error("Error reading expanded topics from localStorage:", e);
    }
  }, [defaultExpandedSlug, topics]);

  // Completed problems map: use prop if provided, else internal fallback
  const [internalCompletedMap, setInternalCompletedMap] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (propCompletedMap) return;
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
    setInternalCompletedMap(map);
  }, [user, propCompletedMap]);

  const activeCompletedMap = propCompletedMap || internalCompletedMap;

  const handleToggle = (problemId: string) => {
    if (propToggleProgress) {
      propToggleProgress(problemId);
      return;
    }

    const isNowCompleted = !internalCompletedMap[problemId];
    setInternalCompletedMap((prev) => ({ ...prev, [problemId]: isNowCompleted }));

    if (user) {
      fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          status: isNowCompleted ? "COMPLETED" : "IN_PROGRESS",
        }),
      })
        .then(() => {
          if (refreshUser) refreshUser();
        })
        .catch((err) => console.error("Progress update error:", err));
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

  const toggleTopic = (topicId: string) => {
    setExpandedTopicIds((prev) => {
      const next = { ...prev };
      if (next[topicId]) {
        delete next[topicId];
      } else {
        next[topicId] = true;
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "beenext_expanded_topics",
            JSON.stringify(Object.keys(next))
          );
        } catch (e) {
          console.error("Error saving expanded topics to localStorage:", e);
        }
      }
      return next;
    });
  };

  // Check if user owns full bundle (all topics unlocked)
  const ownsFullBundle =
    user?.role === "ADMIN" ||
    Boolean(
      user?.purchases?.some(
        (p: any) => p.purchaseType === "BUNDLE" && p.status === "COMPLETED"
      )
    );

  // Set of category IDs owned individually
  const ownedCategoryIds = new Set<string>();
  if (user?.purchases) {
    user.purchases.forEach((p: any) => {
      if (p.purchaseType === "CATEGORY" && p.status === "COMPLETED" && p.categoryId) {
        ownedCategoryIds.add(p.categoryId);
      }
    });
  }

  const isTopicOwned = (catId: string) => {
    return ownsFullBundle || ownedCategoryIds.has(catId);
  };

  return (
    <div className="w-full space-y-2">
      {topics.map((topic, index) => {
        const isExpanded = forceExpandAll || Boolean(expandedTopicIds[topic.id]);
        const topicOrder = String(topic.order || index + 1).padStart(2, "0");
        const isTopicFree =
          topic.isFree || topic.slug === "sorting" || topic.slug === "sorting-techniques";
        const hasTopicAccess =
          isTopicFree || (hasCategoryAccess ? hasCategoryAccess(topic.id, topic.isFree) : false);
        const problems = topic.problems || [];
        const totalProblems = problems.length || topic._count?.problems || 0;

        const topicPrice = getTopicPrice(topic);

        // Calculate completed count for this topic
        const completedCount = problems.filter((p) => activeCompletedMap[p.id]).length;

        return (
          <div
            key={topic.id}
            className={`w-full rounded-xl border transition-all duration-150 overflow-hidden ${
              isExpanded
                ? "bg-brand-card border-neutral-700 shadow-md"
                : "bg-brand-card/80 hover:bg-brand-card border-brand-border"
            }`}
          >
            {/* 1. TOPIC HEADER ROW: Title only, no extra paragraphs, subtitles, badges, or counts */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleTopic(topic.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTopic(topic.id);
                }
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left focus:outline-none transition-colors cursor-pointer select-none"
            >
              {/* Left: Number + Title Only */}
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <span className="font-mono text-xs text-neutral-400 font-bold w-6 text-center">
                  {topicOrder}.
                </span>
                <h3
                  className={`text-sm sm:text-base font-bold tracking-tight truncate ${
                    isExpanded ? "text-white" : "text-neutral-200"
                  }`}
                >
                  {topic.title}
                </h3>
              </div>

              {/* Right: Topic Actions (Book + Chevron) */}
              <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
                <Link
                  href={`/purchase?topic=${encodeURIComponent(topic.slug)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-brand-red/40 hover:border-brand-red text-brand-red hover:bg-brand-red hover:text-white text-[11px] sm:text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
                  title={`Buy book for ${topic.title} – ₹${topicPrice}`}
                >
                  <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Buy Book – ₹{topicPrice}</span>
                </Link>

                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </div>

            {/* 2. EXPANDED PROBLEM ROWS: Clean, single horizontal line per problem; empty topics appear clean and empty */}
            {isExpanded && (
              <div className="border-t border-brand-border bg-brand-black px-2 sm:px-4 py-1 divide-y divide-brand-border/40">
                {problems.length === 0 ? (
                  <div className="py-4" />
                ) : (
                  problems.map((problem, pIdx) => {
                    const problemNumber = String(problem.order || pIdx + 1).padStart(2, "0");
                    const isCompleted = Boolean(activeCompletedMap[problem.id]);

                    return (
                      <div
                        key={problem.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-2 hover:bg-neutral-900/60 rounded-md transition-colors gap-2"
                      >
                        {/* Left: Checkbox + Problem Name */}
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          {/* 1. Completion Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggle(problem.id)}
                            className={`h-4 w-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                : "bg-transparent border-neutral-600 hover:border-brand-red text-transparent"
                            }`}
                            title={isCompleted ? "Completed (Click to unmark)" : "Mark as completed"}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </button>

                          {/* Problem Title Link */}
                          <Link
                            href={`/problem/${problem.slug}`}
                            className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                              isCompleted
                                ? "text-neutral-500 line-through decoration-neutral-600 hover:text-neutral-300"
                                : "text-neutral-100 hover:text-brand-red"
                            }`}
                          >
                            <span className="font-mono text-neutral-500 mr-2">
                              {problemNumber}.
                            </span>
                            <span>{problem.title}</span>
                          </Link>
                        </div>

                        {/* Right: Striver | Apna | LeetCode | Brute | Optimal | Handwritten */}
                        <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 text-xs font-mono flex-shrink-0 pl-6 sm:pl-0">
                          <span className="text-neutral-700 select-none hidden sm:inline">|</span>

                          {/* 2. Striver YouTube */}
                          {problem.youtubeUrl ? (
                            <a
                              href={problem.youtubeUrl}
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

                          {/* 3. Apna College YouTube */}
                          {problem.apnaYoutubeUrl ? (
                            <a
                              href={problem.apnaYoutubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-brand-red font-medium transition-colors inline-flex items-center gap-1.5"
                              title="Watch Apna College YouTube explanation video"
                            >
                              <YouTubeIcon />
                              <span>Apna</span>
                            </a>
                          ) : (
                            <span
                              className="text-neutral-500 opacity-40 select-none inline-flex items-center gap-1.5 cursor-not-allowed font-medium"
                              title="No Apna College video available for this problem"
                            >
                              <YouTubeIcon className="h-3 w-3 opacity-40 grayscale" />
                              <span>Apna</span>
                            </span>
                          )}

                          <span className="text-neutral-700 select-none">|</span>

                          {/* 3. LeetCode */}
                          {problem.leetcodeUrl ? (
                            <a
                              href={problem.leetcodeUrl}
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
                          <Link
                            href={`/problem/${problem.slug}/brute-force`}
                            className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                            title="Open Brute Force solution"
                          >
                            Brute
                          </Link>

                          <span className="text-neutral-700 select-none">|</span>

                          {/* 5. Optimal */}
                          <Link
                            href={`/problem/${problem.slug}/optimal`}
                            className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
                            title="Open Optimal solution"
                          >
                            Optimal
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
