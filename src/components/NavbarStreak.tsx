"use client";

import React, { useState, useEffect, useRef } from "react";
import { Flame, Trophy, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NavbarStreak() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [localStreak, setLocalStreak] = useState<{
    currentStreak: number;
    longestStreak: number;
    isCompletedToday: boolean;
  }>({
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
    isCompletedToday: Boolean(user?.isDailyChallengeCompletedToday),
  });

  // Keep state synced with auth context
  useEffect(() => {
    if (user) {
      setLocalStreak({
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        isCompletedToday: Boolean(user.isDailyChallengeCompletedToday),
      });
    } else {
      setLocalStreak({
        currentStreak: 0,
        longestStreak: 0,
        isCompletedToday: false,
      });
    }
  }, [user]);

  // Listen for real-time daily challenge completion events from coding playground
  useEffect(() => {
    const handleDailyCompleted = (e: any) => {
      if (e?.detail) {
        setLocalStreak({
          currentStreak: e.detail.currentStreak ?? 1,
          longestStreak: e.detail.longestStreak ?? 1,
          isCompletedToday: true,
        });
      }
    };

    window.addEventListener("beenext_daily_challenge_completed", handleDailyCompleted);
    return () => {
      window.removeEventListener("beenext_daily_challenge_completed", handleDailyCompleted);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveStreak = localStreak.currentStreak > 0;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl border transition-all focus:outline-none select-none ${
          hasActiveStreak
            ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 text-amber-400 shadow-sm"
            : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300"
        }`}
        title={`Daily Challenge Streak: ${localStreak.currentStreak} Days`}
        aria-label="Daily challenge streak information"
        aria-expanded={dropdownOpen}
      >
        <Flame
          className={`h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform group-hover:scale-110 ${
            hasActiveStreak
              ? "text-orange-500 fill-orange-500 animate-pulse"
              : "text-neutral-500 fill-neutral-600/40"
          }`}
        />
        <span
          className={`font-mono text-xs sm:text-sm font-extrabold ${
            hasActiveStreak ? "text-orange-400" : "text-neutral-400"
          }`}
        >
          {localStreak.currentStreak}
        </span>
      </button>

      {/* Streak Dropdown Popover on Hover / Click */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 sm:w-60 rounded-xl border border-brand-border bg-neutral-950 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-white text-[11px] tracking-wide uppercase">
              Daily Streak
            </span>
            {localStreak.isCompletedToday ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                <span>Solved</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Pending</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-neutral-900/80 rounded-lg px-2.5 py-1.5 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px]">Current Streak</span>
              <div className="flex items-center gap-1 font-extrabold text-orange-400">
                <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                <span>{localStreak.currentStreak} {localStreak.currentStreak === 1 ? "Day" : "Days"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-neutral-900/80 rounded-lg px-2.5 py-1.5 border border-neutral-800/80">
              <span className="text-neutral-400 text-[11px]">Longest Streak</span>
              <div className="flex items-center gap-1 font-bold text-neutral-200">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>{localStreak.longestStreak} {localStreak.longestStreak === 1 ? "Day" : "Days"}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 pt-0.5 border-t border-neutral-800 leading-tight font-sans">
            {localStreak.isCompletedToday
              ? "Great job! You've completed today's challenge. Return tomorrow to continue your streak!"
              : "Solve today's Daily Challenge on the DSA Topics page to keep your streak alive!"}
          </div>
        </div>
      )}
    </div>
  );
}
