"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, CheckCircle2, Clock, Code2 } from "lucide-react";
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
      setData((prev) => (prev ? { ...prev, isCompletedToday: true } : prev));
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
    } catch (e) { }
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
    <div
      data-testid="daily-challenge-section"
      className={`w-full rounded-xl border transition-colors duration-300 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/90 px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 ${isCompleted
          ? "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
          : "border-amber-500/40"
        }`}
    >
      {/* Subtle background ambient glow */}
      <div
        className={`absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${isCompleted ? "bg-emerald-500/10" : "bg-amber-500/5"
          }`}
      />

      {/* Left Group: Flame Badge + Countdown Timer + Problem Title + Solved/Not Solved Status */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        {/* Daily Challenge Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-[10px] sm:text-[10.5px] font-extrabold tracking-wide uppercase shrink-0 leading-none">
          <Flame className="h-3 w-3 text-orange-500 fill-orange-500 animate-pulse" />
          <span>Daily Challenge</span>
        </div>



        {/* Problem Title */}
        <Link
          href={`/problem/${problem.slug}/code`}
          onClick={() => handleBeforeNavigate(problem.category?.id)}
          className={`text-xs sm:text-sm font-bold transition-colors truncate max-w-[200px] sm:max-w-xs md:max-w-sm ${isCompleted
              ? "text-neutral-400 line-through decoration-neutral-600 hover:text-white"
              : "text-white hover:text-amber-400"
            }`}
          title={`Solve today's challenge: ${problem.title}`}
        >
          {problem.title}
        </Link>

        {/* In place of the topic name: Solved in green or Not Solved in grey */}
        {isCompleted ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold text-[#22C55E] bg-emerald-950/60 border border-emerald-500/40 shrink-0 leading-none">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Solved</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-medium text-neutral-400 bg-neutral-800/80 border border-neutral-700/60 shrink-0 leading-none">
            <span>Not Solved</span>
          </span>
        )}
        {/* Retained Midnight IST Countdown Timer */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[10.5px] font-mono text-neutral-300 shrink-0 leading-none"
          title="Refreshes automatically at midnight IST (Asia/Kolkata)"
        >
          <Clock className="h-2.5 w-2.5 text-neutral-400" />
          <span>
            {String(timeLeft.hours).padStart(2, "0")}h:
            {String(timeLeft.minutes).padStart(2, "0")}m:
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        </div>
      </div>

      {/* Right: Retained Action Buttons (Code | Video | Brute | Optimal) */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 text-xs font-mono flex-shrink-0 self-end sm:self-center">
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

      {/* Upgrade Modal for Normal users */}
      <SolutionUpgradeModal
        isOpen={upgradeModal.isOpen}
        solutionType={upgradeModal.type}
        onClose={() => setUpgradeModal({ isOpen: false, type: "Brute Force" })}
      />
    </div>
  );
}
