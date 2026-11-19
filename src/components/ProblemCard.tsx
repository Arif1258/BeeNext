"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  ExternalLink,
  Lock,
  CheckCircle2,
  FileText,
  Bookmark,
  Sparkles,
} from "lucide-react";

interface ProblemCardProps {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryTitle: string;
  categorySlug: string;
  isFree: boolean;
  price: number;
  leetcodeUrl?: string | null;
  notesCount: number;
  hasAccess: boolean;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
}

export default function ProblemCard({
  id,
  title,
  slug,
  difficulty,
  categoryTitle,
  categorySlug,
  isFree,
  price,
  leetcodeUrl,
  notesCount,
  hasAccess,
  isCompleted,
  isBookmarked,
  onBookmarkToggle,
}: ProblemCardProps) {
  const difficultyColor =
    difficulty === "EASY"
      ? "text-emerald-400 bg-emerald-950/40 border-emerald-900"
      : difficulty === "MEDIUM"
      ? "text-amber-400 bg-amber-950/40 border-amber-900"
      : "text-brand-red bg-brand-redMuted border-brand-red/40";

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-brand-card border border-brand-border p-4 hover:border-brand-red/50 hover:bg-brand-cardHover transition-all shadow-card">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${difficultyColor}`}
            >
              {difficulty}
            </span>
            <span className="text-[11px] font-mono text-brand-muted">
              {categoryTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bookmark button */}
            {onBookmarkToggle && (
              <button
                onClick={onBookmarkToggle}
                className="p-1 text-brand-muted hover:text-brand-red transition-colors"
                title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? "fill-brand-red text-brand-red" : ""}`}
                />
              </button>
            )}

            {/* Access status */}
            {isFree ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-red text-white">
                FREE
              </span>
            ) : hasAccess ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Unlocked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-black border border-brand-border text-white">
                <Lock className="h-3 w-3 text-brand-red" />
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/problem/${slug}`} className="block">
          <h3 className="text-base font-bold text-white group-hover:text-brand-red transition-colors flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              )}
              <span>{title}</span>
            </span>
          </h3>
        </Link>
      </div>

      {/* Card Actions */}
      <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-brand-muted font-mono text-[11px]">
          <FileText className="h-3.5 w-3.5 text-brand-red" />
          <span>{notesCount} handwritten notes</span>
        </div>

        <div className="flex items-center space-x-2">
          {leetcodeUrl && (
            <a
              href={leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-brand-muted hover:text-white transition-colors"
              title="Solve on LeetCode"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Link
            href={`/problem/${slug}`}
            className="text-xs font-semibold text-brand-red hover:text-brand-redLight transition-colors font-mono"
          >
            Solve &amp; Notes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
