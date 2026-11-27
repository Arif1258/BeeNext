"use client";

import React from "react";
import { Flame, Trophy, X, CheckCircle2, Sparkles } from "lucide-react";

interface DailyChallengeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
}

export default function DailyChallengeCelebrationModal({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
}: DailyChallengeCelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-challenge-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-neutral-950 p-6 sm:p-7 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          aria-label="Close celebration dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animated Celebration Icon */}
        <div className="flex items-center justify-center pt-2">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 shadow-lg shadow-orange-500/10">
            <Flame className="h-10 w-10 text-orange-500 fill-orange-500 animate-pulse" />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-5 w-5 text-amber-300 animate-bounce" />
          </div>
        </div>

        {/* Header & Congratulations Message */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>DAILY CHALLENGE COMPLETED</span>
          </div>

          <h2
            id="daily-challenge-title"
            className="text-xl sm:text-2xl font-extrabold text-white tracking-tight"
          >
            Congratulations!
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
            You&apos;ve completed today&apos;s Daily Challenge.
          </p>
        </div>

        {/* Streak Counter Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <span className="text-xs text-neutral-400">Current Streak</span>
            <div className="flex items-center gap-1.5 text-base sm:text-lg font-extrabold text-orange-400">
              <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
              <span>{currentStreak} {currentStreak === 1 ? "Day" : "Days"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-neutral-400">Longest Streak</span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-300">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>{longestStreak} {longestStreak === 1 ? "Day" : "Days"}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-mono text-sm font-bold transition-all shadow-md active:scale-[0.98]"
        >
          Keep It Going!
        </button>
      </div>
    </div>
  );
}
