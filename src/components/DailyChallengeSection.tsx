"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, CheckCircle2, Clock, Code2, ExternalLink } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import SolutionUpgradeModal from "@/components/SolutionUpgradeModal";
import { useAuth } from "@/context/AuthContext";
import { DailyChallengeInfo } from "@/lib/dailyChallenge";

// YouTube Icon
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

export default function DailyChallengeSection() {
  const { user, isPlusMember } = useAuth();
  const [data, setData] = useState<DailyChallengeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    type: "Brute Force" | "Optimal";
  }>({ isOpen: false, type: "Brute Force" });

  // Fetch Daily Challenge info from API
  const fetchDailyChallenge = async () => {
    try {
      const res = await fetch("/api/daily-challenge");
      if (res.ok) {
        const json: DailyChallengeInfo = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch daily challenge:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyChallenge();

    const handleCompleted = () => {
      fetchDailyChallenge();
    };

    window.addEventListener("beenext_daily_challenge_completed", handleCompleted);
    return () => {
      window.removeEventListener("beenext_daily_challenge_completed", handleCompleted);
    };
  }, []);

  // Countdown timer to midnight IST
  useEffect(() => {
    if (!data?.midnightIST) return;

    const targetTime = new Date(data.midnightIST).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      if (diff <= 0) {
        // Midnight IST passed! Re-fetch new daily challenge!
        fetchDailyChallenge();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data?.midnightIST]);

  const handleBeforeNavigate = (categoryId?: string) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("beenext_topics_scroll_y", String(window.scrollY));
      if (categoryId) {
        const raw = sessionStorage.getItem("beenext_topics_expanded_ids");
        const list = raw ? JSON.parse(raw) : [];
        if (Array.isArray(list) && !list.includes(categoryId)) {
          const updated = [...list, categoryId];
          sessionStorage.setItem("beenext_topics_expanded_ids", JSON.stringify(updated));
          localStorage.setItem("beenext_expanded_topics", JSON.stringify(updated));
        }
      }
    } catch (e) {}
  };

  if (loading || !data?.problem) {
    return (
      <div className="rounded-xl border border-brand-border/60 bg-brand-card/50 p-4 animate-pulse">
        <div className="h-4 w-40 bg-neutral-800 rounded mb-3" />
        <div className="h-6 w-3/4 bg-neutral-800 rounded" />
      </div>
    );
  }

  const problem = data.problem;
  const isCompleted = Boolean(
    data.isCompletedToday ||
    (user?.progress && user.progress.some((p: any) => p.problemId === problem.id && p.status === "COMPLETED"))
  );

  return (
    <div className="w-full rounded-xl border border-amber-500/30 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/90 p-3.5 sm:p-4 shadow-md space-y-3 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row: Badge + Date + Countdown + Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-[11px] font-extrabold tracking-wide uppercase">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>Daily Challenge</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
            {data.todayDate}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Midnight IST Countdown */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300"
            title="Refreshes automatically at midnight IST (Asia/Kolkata)"
          >
            <Clock className="h-3 w-3 text-neutral-400" />
            <span>
              {String(timeLeft.hours).padStart(2, "0")}h:
              {String(timeLeft.minutes).padStart(2, "0")}m:
              {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>

          {/* Completion Status Badge */}
          {isCompleted ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30 text-[11px] font-bold text-amber-400">
              <span>Unsolved</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Problem Details Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        {/* Left: Problem Title + Topic + Difficulty */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <Link
            href={`/problem/${problem.slug}/code`}
            onClick={() => handleBeforeNavigate(problem.category?.id)}
            className={`text-sm sm:text-base font-bold transition-colors truncate ${
              isCompleted
                ? "text-neutral-400 line-through decoration-neutral-600 hover:text-white"
                : "text-white hover:text-amber-400"
            }`}
            title={`Solve today's challenge: ${problem.title}`}
          >
            {problem.title}
          </Link>

          {problem.category?.title && (
            <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-medium text-neutral-300 bg-neutral-800/90 border border-neutral-700/60 shrink-0">
              {problem.category.title}
            </span>
          )}

          <DifficultyBadge difficulty={problem.difficulty} size="sm" />
        </div>

        {/* Right: Action Buttons (Code | Video | Brute | Optimal) */}
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 text-xs font-mono flex-shrink-0 pl-1 sm:pl-0">
          {/* 1. Code Button */}
          <Link
            href={`/problem/${problem.slug}/code`}
            onClick={() => handleBeforeNavigate(problem.category?.id)}
            className="text-white hover:text-amber-400 font-bold transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/80 shadow-sm"
            title="Open dedicated Coding Playground for today's Daily Challenge"
          >
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Code</span>
          </Link>

          <span className="text-neutral-700 select-none">|</span>

          {/* 2. Video Link (Striver) */}
          {problem.youtubeUrl ? (
            <a
              href={problem.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-brand-red font-medium transition-colors inline-flex items-center gap-1.5"
              title="Watch Striver's YouTube explanation video"
            >
              <YouTubeIcon />
              <span>Video</span>
            </a>
          ) : (
            <span
              className="text-neutral-500 opacity-40 select-none inline-flex items-center gap-1.5 cursor-not-allowed font-medium"
              title="No video available"
            >
              <YouTubeIcon className="h-3 w-3 opacity-40 grayscale" />
              <span>Video</span>
            </span>
          )}

          <span className="text-neutral-700 select-none">|</span>

          {/* 3. Brute Force */}
          {isPlusMember ? (
            <Link
              href={`/problem/${problem.slug}/brute-force`}
              onClick={() => handleBeforeNavigate(problem.category?.id)}
              className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
              title="Open Brute Force solution"
            >
              Brute
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setUpgradeModal({ isOpen: true, type: "Brute Force" })}
              className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
              title="Brute Force solution (Plus required)"
            >
              Brute
            </button>
          )}

          <span className="text-neutral-700 select-none">|</span>

          {/* 4. Optimal Solution */}
          {isPlusMember ? (
            <Link
              href={`/problem/${problem.slug}/optimal`}
              onClick={() => handleBeforeNavigate(problem.category?.id)}
              className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
              title="Open Optimal solution"
            >
              Optimal
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setUpgradeModal({ isOpen: true, type: "Optimal" })}
              className="text-neutral-300 hover:text-white hover:underline transition-colors font-medium"
              title="Optimal solution (Plus required)"
            >
              Optimal
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Modal for Normal users */}
      <SolutionUpgradeModal
        isOpen={upgradeModal.isOpen}
        solutionType={upgradeModal.type}
        onClose={() => setUpgradeModal({ isOpen: false, type: "Brute Force" })}
      />
    </div>
  );
}
