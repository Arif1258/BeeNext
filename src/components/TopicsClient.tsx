"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import confetti from "canvas-confetti";
import VerticalTopicAccordion, { TopicItem } from "@/components/VerticalTopicAccordion";
import DailyChallengeSection from "@/components/DailyChallengeSection";
import CodingActivityHeatmap from "@/components/CodingActivityHeatmap";
import { useAuth } from "@/context/AuthContext";

interface TopicsClientProps {
  initialCategories: TopicItem[];
}

export default function TopicsClient({ initialCategories }: TopicsClientProps) {
  const { user, refreshUser } = useAuth();
  const [categories] = useState<TopicItem[]>(initialCategories);

  // Completed problems map: { [problemId: string]: boolean }
  const [completedMap, setCompletedMap] = useState<{ [id: string]: boolean }>({});

  // Sync completion status from authenticated user or local storage
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
      } catch (e) { }
    }
    setCompletedMap(map);
  }, [user]);

  // Handle immediate checkbox toggle with optimistic update & database/local persistence
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
      } catch (e) { }
    }
  };

  // Total problems across all DSA topics
  const totalProblemsCount = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((cat) => {
      cat.problems?.forEach((p) => set.add(p.id));
    });
    return set.size;
  }, [categories]);

  // Number of completed problems across all available problems
  const completedCount = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((cat) => {
      cat.problems?.forEach((p) => {
        if (completedMap[p.id]) {
          set.add(p.id);
        }
      });
    });
    return set.size;
  }, [categories, completedMap]);

  // Overall completion percentage: (Number of completed problems / Total number of problems) * 100
  const progressPercentage =
    totalProblemsCount > 0
      ? Math.round((completedCount / totalProblemsCount) * 100)
      : 0;

  // Continuous scroll position tracking in sessionStorage (scoped per browser tab)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set scrollRestoration to manual so browser doesn't clamp scroll before content expands
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem("beenext_topics_scroll_y", String(window.scrollY));
      }, 50);
    };

    const handleSnapshot = () => {
      sessionStorage.setItem("beenext_topics_scroll_y", String(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handleSnapshot);
    window.addEventListener("beforeunload", handleSnapshot);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handleSnapshot);
      window.removeEventListener("beforeunload", handleSnapshot);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-white pt-3 sm:pt-5 pb-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-3 sm:space-y-3.5">
        {/* Clean Page Header (Title + Subtitle + Description + Certificate Option + Circular Progress Graph) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-brand-border pb-3 sm:pb-3.5">
          {/* Left: DSA Sheet Details */}
          <div className="space-y-1 sm:space-y-1.5 max-w-xl lg:max-w-2xl flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight sm:whitespace-nowrap text-white">
              BEE<span className="text-brand-red">NEXT</span> – HERO TO INFINITY DSA SHEET
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Sheet Details
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              A curated DSA Sheet with approximately 500 questions for college students and professionals to prepare and practice with YouTube videos, notes, solutions and an interactive coding playground.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              Learn what matters. Skip what doesn&apos;t.
            </p>
          </div>

          {/* Right Group: Certificate Section + Circular Performance Graph */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-center">
            {/* Left Stack: Certificate Icon Box + Certificate Button directly below */}
            <div className="flex flex-col items-stretch gap-1.5 shrink-0 w-24 sm:w-28">
              {/* Certificate Upper Box: Maximum Proportional Necktie Icon in Emerald Green (#22C55E) */}
              <div
                data-testid="certificate-box"
                className="flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 shadow-card p-2 sm:p-2.5 h-24 sm:h-28 w-full shrink-0 text-center"
              >
                {/* Professional Necktie Icon scaled up to occupy maximum available area while maintaining proportions */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-full h-full max-h-[68px] sm:max-h-[80px] text-[#22C55E] transition-transform duration-200 hover:scale-105"
                  aria-hidden="true"
                >
                  {/* Left Collar Lapel pointing down */}
                  <path d="M6 3.5 L7.5 7.5 L9.5 6" />
                  <path d="M6 3.5 H9.5" />
                  {/* Right Collar Lapel pointing down */}
                  <path d="M18 3.5 L16.5 7.5 L14.5 6" />
                  <path d="M18 3.5 H14.5" />
                  {/* Tie Knot */}
                  <polygon points="9.5,3.5 14.5,3.5 13.5,7.5 10.5,7.5" fill="currentColor" fillOpacity="0.3" />
                  {/* Tie Blade with center crease */}
                  <polygon points="10.5,7.5 13.5,7.5 16,16.5 12,21.5 8,16.5" fill="currentColor" fillOpacity="0.18" />
                  <line x1="12" y1="9.5" x2="12" y2="18" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6" />
                </svg>
              </div>

              {/* Certificate Button moved outside and directly below the icon box in Emerald Green */}
              <Link
                href="/certificate"
                className="flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#22C55E]/15 hover:bg-[#22C55E] text-white border border-[#22C55E]/40 hover:border-[#22C55E] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed text-[11px] font-mono font-bold transition-all shadow-sm w-full text-center"
                title="BeeNext Physical Certificate Requirements"
              >
                <span>Certificate</span>
              </Link>
            </div>

            {/* Right Stack: Circular Performance Graph (Same width as Certificate box) & Solved Problems Count below */}
            <div className="flex flex-col items-stretch gap-1.5 shrink-0 w-24 sm:w-28">
              {/* Circular Progress Graph Upper Box: Identical width and height to Certificate icon box */}
              <div
                className="relative flex items-center justify-center w-full h-24 sm:h-28 rounded-xl bg-neutral-900 border border-neutral-800 shadow-card p-2 sm:p-2.5 shrink-0"
                title={`Overall Completion: ${progressPercentage}% (${completedCount}/${totalProblemsCount} problems)`}
              >
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                  aria-label={`Overall problem completion progress: ${progressPercentage}%`}
                >
                  {/* Subtle neutral background for remaining portion */}
                  <path
                    className="text-neutral-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Single Emerald Green (#22C55E) progress indicator */}
                  <path
                    className="text-[#22C55E] transition-all duration-300 ease-out"
                    strokeDasharray={`${Math.min(100, Math.max(0, progressPercentage))}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Overall percentage inside circle in Emerald Green */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-base sm:text-lg font-black text-[#22C55E]">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Dynamic Solved Count below circular graph (e.g. 423 / 495 Problems) matching Certificate button placement */}
              <div className="flex items-center justify-center px-1.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10.5px] sm:text-[11px] font-mono shadow-sm w-full text-center whitespace-nowrap overflow-hidden">
                <span className="text-white font-medium">
                  <strong className="text-[#22C55E] font-bold">{completedCount}</strong>
                  <span className="text-neutral-400"> / {totalProblemsCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LeetCode-Style Coding Activity Heatmap & Difficulty Performance Graph */}
        <CodingActivityHeatmap
          completedCount={completedCount}
          totalProblemsCount={totalProblemsCount}
          progressPercentage={progressPercentage}
          user={user}
          categories={categories}
          completedMap={completedMap}
        />

        {/* Daily Challenge Section (Immediately Above Beginner Problems) */}
        <DailyChallengeSection />

        {/* Vertical Topic Accordion Layout (ONE Topic Per Row) */}
        {categories.length > 0 ? (
          <VerticalTopicAccordion
            topics={categories}
            user={user}
            refreshUser={refreshUser}
            completedMap={completedMap}
            onToggleProgress={handleToggleProgress}
          />
        ) : (
          <div className="p-8 text-center bg-brand-card rounded-xl border border-brand-border text-neutral-400 font-mono text-sm">
            No topics available.
          </div>
        )}
      </div>
    </div>
  );
}
