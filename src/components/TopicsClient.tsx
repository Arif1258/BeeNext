"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import VerticalTopicAccordion, { TopicItem } from "@/components/VerticalTopicAccordion";
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

  // Number of grid boxes in the LeetCode contribution-style tracker (single horizontal row)
  const TOTAL_TRACKER_BOXES = 50;
  const completedBoxesCount = Math.min(
    TOTAL_TRACKER_BOXES,
    Math.max(
      completedCount > 0 ? 1 : 0,
      Math.round((progressPercentage / 100) * TOTAL_TRACKER_BOXES)
    )
  );

  return (
    <div className="min-h-screen bg-brand-black text-white pt-6 pb-10 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Clean Page Header (Title + Subtitle + Description + Circular Progress Graph & Completed Problems) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
          <div className="space-y-3 max-w-3xl lg:max-w-4xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-extrabold tracking-tight leading-tight sm:whitespace-nowrap text-white">
              BEE<span className="text-brand-red">NEXT</span> – HERO TO INFINITY DSA SHEET
            </h1>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight pt-1">
              Sheet Details
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              Prepare for technical interviews with BeeNext&apos;s carefully curated free DSA Sheet, featuring problem-solving guidance from Striver and Apna College. Developed in collaboration with senior faculty members of IIT Kharagpur, it focuses on interview-relevant problems and essential concepts, making quality DSA preparation accessible to every student.
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
              Alongside our free DSA Sheet, visit the Purchase section to explore BeeNext&apos;s wide collection of books. Carefully researched and curated exclusively for coding interviews, our books cover important problems and concepts to strengthen problem-solving skills and help professionals prepare effectively for technical interviews.
            </p>
            <p className="text-xs sm:text-sm font-bold text-white tracking-wide pt-1">
              Learn what matters. Skip what doesn&apos;t.
            </p>
          </div>

          {/* Circular Progress Graph & Completed Problems Section */}
          <div className="flex flex-col items-stretch gap-2.5 shrink-0 self-start sm:self-auto w-fit">
            {/* Circular Progress Graph (above Completed Problems section) */}
            <div
              className="relative flex items-center justify-center w-full h-44 sm:h-48 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-card"
              title={`Overall Completion: ${progressPercentage}% (${completedCount}/${totalProblemsCount} problems)`}
            >
              <svg
                className="w-32 h-32 sm:w-36 sm:h-36 transform -rotate-90"
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
                {/* BeeNext red progress indicator */}
                <path
                  className="text-brand-red transition-all duration-300 ease-out"
                  strokeDasharray={`${Math.min(100, Math.max(0, progressPercentage))}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Overall percentage inside circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-2xl sm:text-3xl font-black text-brand-red">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Completed Problems Section */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono shrink-0 shadow-sm">
              <span className="text-neutral-400">Completed:</span>
              <span className="text-emerald-400 font-bold">
                {completedCount} / {totalProblemsCount} Problems
              </span>
            </div>

            {/* Performance Tracker - Dedicated Certificate Button */}
            <Link
              href="/certificate"
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-brand-red/10 hover:bg-brand-red text-white border border-brand-red/30 hover:border-brand-red text-xs font-mono font-bold transition-all shadow-sm group"
              title="BeeNext Physical Certificate Requirements"
            >
              <Award className="h-4 w-4 text-brand-red group-hover:text-white transition-colors" />
              <span>Certificate</span>
            </Link>
          </div>
        </div>

        {/* OVERALL DSA COMPLETION PROGRESS BAR (DIRECTLY ABOVE TOPICS) */}
        <div className="rounded-xl border border-brand-border bg-brand-card p-4 space-y-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm font-mono">
            <div>
              <span className="font-bold text-white">Your Progress: </span>
              <span className="font-extrabold text-emerald-400">
                {progressPercentage}% Completed
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              {completedCount} of {totalProblemsCount} solved
            </div>
          </div>

          {/* LeetCode Contribution-Style Grid Tracker (Single Row of Small Square Boxes) */}
          <div
            className="w-full flex items-center gap-0.5 sm:gap-1 lg:gap-1.5"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`DSA Progress: ${progressPercentage}% completed`}
          >
            {Array.from({ length: TOTAL_TRACKER_BOXES }).map((_, index) => {
              const isCompleted = index < completedBoxesCount;
              return (
                <div
                  key={index}
                  className={`flex-1 aspect-square rounded-[2px] transition-colors duration-200 ${isCompleted
                    ? "bg-[#16a34a] border border-[#16a34a]"
                    : "bg-transparent border border-emerald-500/40"
                    }`}
                  style={{ aspectRatio: "1 / 1" }}
                  title={
                    isCompleted
                      ? `Box ${index + 1} of ${TOTAL_TRACKER_BOXES} (Completed)`
                      : `Box ${index + 1} of ${TOTAL_TRACKER_BOXES} (Remaining)`
                  }
                />
              );
            })}
          </div>
        </div>

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
