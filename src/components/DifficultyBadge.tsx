import React from "react";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

interface DifficultyBadgeProps {
  difficulty?: DifficultyLevel | string | null;
  className?: string;
  size?: "xs" | "sm" | "md";
}

/**
 * Small, clean, and visually subtle difficulty label for DSA topics & problems.
 * - Easy: Green
 * - Medium: Yellow
 * - Hard: Red
 */
export default function DifficultyBadge({
  difficulty,
  className = "",
  size = "xs",
}: DifficultyBadgeProps) {
  if (!difficulty) return null;

  const normalized = difficulty.toUpperCase().trim();

  let label = "Medium";
  let colorClasses = "text-amber-400 bg-amber-500/10 border-amber-500/25";

  if (normalized === "EASY") {
    label = "Easy";
    colorClasses = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  } else if (normalized === "HARD") {
    label = "Hard";
    colorClasses = "text-red-400 bg-red-500/10 border-red-500/25";
  }

  let sizeClasses = "px-1.5 py-0.5 text-[9.5px] sm:text-[10px]";
  if (size === "sm") {
    sizeClasses = "px-2 py-0.5 text-[10.5px] sm:text-[11.5px]";
  } else if (size === "md") {
    sizeClasses = "px-2.5 py-1 text-xs sm:text-sm";
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-semibold rounded border leading-none select-none shrink-0 tracking-wide ${sizeClasses} ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}
