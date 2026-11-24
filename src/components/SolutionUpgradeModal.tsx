"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

interface SolutionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionType?: "Brute Force" | "Optimal" | "Solution";
}

export default function SolutionUpgradeModal({
  isOpen,
  onClose,
  solutionType = "Solution",
}: SolutionUpgradeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-5 text-left"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 pr-8">
          <div className="h-10 w-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {solutionType} Locked
            </h3>
            <p className="text-xs text-brand-red font-mono font-medium">
              BeeNext Plus Exclusive
            </p>
          </div>
        </div>

        {/* Explanatory Message */}
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Detailed <strong className="text-white">{solutionType}</strong> code solutions, approach explanations, and Time &amp; Space complexity analyses are available exclusively to <strong className="text-white">BeeNext Plus</strong> members.
        </p>

        {/* Feature Highlights */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 space-y-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
            <span>Full Brute Force &amp; Optimal solutions</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
            <span>Interactive Monaco Cloud Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
            <span>All 5 comprehensive PDF Notes libraries</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-medium transition-colors text-center"
          >
            Maybe Later
          </button>
          <Link
            href="/membership"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all flex items-center justify-center gap-1.5 text-center"
          >
            <span>Upgrade to Plus</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
