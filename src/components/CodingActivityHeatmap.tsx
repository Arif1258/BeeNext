"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Calendar } from "lucide-react";
import { TopicItem } from "@/components/VerticalTopicAccordion";

interface DifficultyStats {
  solved: number;
  total: number;
}

interface ActivityData {
  isAuthenticated: boolean;
  activity: { [dateStr: string]: number };
  totalActiveDays: number;
  maxStreak: number;
  totalSolved: number;
  difficulty?: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
}

interface CodingActivityHeatmapProps {
  completedCount: number;
  totalProblemsCount: number;
  progressPercentage: number;
  user: any;
  categories?: TopicItem[];
  completedMap?: { [id: string]: boolean };
}

interface CellData {
  dateStr: string;
  displayDate: string;
  count: number;
  level: number; // 0, 1, 2, 3, 4, or -1 (future)
  isFuture: boolean;
  dayOfWeek: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function CodingActivityHeatmap({
  completedCount,
  totalProblemsCount,
  progressPercentage,
  user,
  categories,
  completedMap,
}: CodingActivityHeatmapProps) {
  const [data, setData] = useState<ActivityData>({
    isAuthenticated: false,
    activity: {},
    totalActiveDays: 0,
    maxStreak: 0,
    totalSolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    dateStr: string;
    displayDate: string;
    count: number;
    x: number;
    y: number;
    visible: boolean;
  } | null>(null);

  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Fetch actual user activity and difficulty stats from API
  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/user/activity");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn("Failed to fetch user activity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();

    const handleChallengeCompleted = () => {
      fetchActivity();
    };

    window.addEventListener("beenext_daily_challenge_completed", handleChallengeCompleted);
    return () => {
      window.removeEventListener("beenext_daily_challenge_completed", handleChallengeCompleted);
    };
  }, [user?.id]);

  // Today in IST
  const todayISTStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  // Compute local difficulty breakdown from categories + completedMap for immediate optimistic updates
  const localDifficulty = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    const diff = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    };
    const seenIds = new Set<string>();
    categories.forEach((cat) => {
      cat.problems?.forEach((p) => {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          const key = p.difficulty?.toLowerCase() as "easy" | "medium" | "hard";
          if (diff[key]) {
            diff[key].total++;
            if (completedMap && completedMap[p.id]) {
              diff[key].solved++;
            }
          }
        }
      });
    });
    return diff;
  }, [categories, completedMap]);

  // Authoritative difficulty stats: local optimistic when available, fallback to DB response
  const effectiveDifficulty = useMemo(() => {
    if (localDifficulty && localDifficulty.easy.total > 0) {
      return localDifficulty;
    }
    return (
      data.difficulty || {
        easy: { solved: 0, total: 96 },
        medium: { solved: 0, total: 290 },
        hard: { solved: 0, total: 109 },
      }
    );
  }, [localDifficulty, data.difficulty]);

  const effectiveTotalSolved = useMemo(() => {
    return (
      effectiveDifficulty.easy.solved +
      effectiveDifficulty.medium.solved +
      effectiveDifficulty.hard.solved
    );
  }, [effectiveDifficulty]);

  const effectiveTotalProblems = useMemo(() => {
    return (
      effectiveDifficulty.easy.total +
      effectiveDifficulty.medium.total +
      effectiveDifficulty.hard.total || totalProblemsCount || 495
    );
  }, [effectiveDifficulty, totalProblemsCount]);

  // SVG Circular Gauge calculations: radius = 41 => circumference ~257.61
  const radius = 41;
  const circumference = 2 * Math.PI * radius;
  const easyStrokeLength = effectiveTotalProblems > 0
    ? (effectiveDifficulty.easy.solved / effectiveTotalProblems) * circumference
    : 0;
  const mediumStrokeLength = effectiveTotalProblems > 0
    ? (effectiveDifficulty.medium.solved / effectiveTotalProblems) * circumference
    : 0;
  const hardStrokeLength = effectiveTotalProblems > 0
    ? (effectiveDifficulty.hard.solved / effectiveTotalProblems) * circumference
    : 0;

  // Compute the 53-week grid (Sunday to Saturday) ending on current week
  const { weeks, monthLabels } = useMemo(() => {
    const [year, month, day] = todayISTStr.split("-").map(Number);
    const todayUTC = new Date(Date.UTC(year, month - 1, day));
    const todayDOW = todayUTC.getUTCDay(); // 0 = Sun, 6 = Sat

    // End date is the Saturday of current week
    const endDate = new Date(todayUTC);
    endDate.setUTCDate(todayUTC.getUTCDate() + (6 - todayDOW));

    // Start date is 52 weeks prior to current week's Sunday (53 weeks total = 371 days)
    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - (53 * 7 - 1));

    const weeksArray: CellData[][] = [];
    const monthsHeader: Array<{ weekIndex: number; label: string }> = [];

    let currentCursor = new Date(startDate);
    let lastMonthSeen = -1;

    for (let w = 0; w < 53; w++) {
      const weekCells: CellData[] = [];
      let weekStartMonth = -1;

      for (let d = 0; d < 7; d++) {
        const dStr = currentCursor.toISOString().slice(0, 10);
        const isFuture = dStr > todayISTStr;
        const count = isFuture ? 0 : data.activity[dStr] || 0;

        let level = 0;
        if (isFuture) {
          level = -1;
        } else if (count === 0) {
          level = 0;
        } else if (count === 1) {
          level = 1;
        } else if (count <= 3) {
          level = 2;
        } else if (count <= 5) {
          level = 3;
        } else {
          level = 4;
        }

        const dateObj = new Date(dStr + "T00:00:00Z");
        const formattedDisplay = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        });

        if (d === 0) {
          weekStartMonth = dateObj.getUTCMonth();
        }

        weekCells.push({
          dateStr: dStr,
          displayDate: formattedDisplay,
          count,
          level,
          isFuture,
          dayOfWeek: d,
        });

        currentCursor.setUTCDate(currentCursor.getUTCDate() + 1);
      }

      // Determine month label placement
      if (weekStartMonth !== -1 && weekStartMonth !== lastMonthSeen) {
        monthsHeader.push({
          weekIndex: w,
          label: MONTH_NAMES[weekStartMonth],
        });
        lastMonthSeen = weekStartMonth;
      }

      weeksArray.push(weekCells);
    }

    return { weeks: weeksArray, monthLabels: monthsHeader };
  }, [todayISTStr, data.activity]);

  // Scroll to the right on initial render so recent days are visible on mobile
  useEffect(() => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollLeft = gridScrollRef.current.scrollWidth;
    }
  }, [weeks]);

  // Exact LeetCode dark mode activity heatmap colors:
  // Inactive: #282828 with subtle border
  // Level 1: #0e4429 (dark green)
  // Level 2: #008236 (medium green)
  // Level 3: #10b981 (emerald green)
  // Level 4: #2cbb5d (bright signature LeetCode green)
  const getCellColorClass = (level: number) => {
    switch (level) {
      case -1:
        return "bg-transparent border border-transparent pointer-events-none opacity-0";
      case 0:
        return "bg-[#282828] border border-white/[0.04] hover:border-neutral-500";
      case 1:
        return "bg-[#0e4429] border border-[#00552b] hover:border-emerald-400";
      case 2:
        return "bg-[#008236] border border-[#009b40] hover:border-emerald-300";
      case 3:
        return "bg-[#10b981] border border-[#059669] hover:border-emerald-200";
      case 4:
        return "bg-[#2cbb5d] border border-[#34d399] hover:border-white shadow-[0_0_6px_rgba(44,187,93,0.35)]";
      default:
        return "bg-[#282828] border border-white/[0.04]";
    }
  };

  const handleCellMouseEnter = (
    cell: CellData,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (cell.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      dateStr: cell.dateStr,
      displayDate: cell.displayDate,
      count: cell.count,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      visible: true,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div
      data-testid="coding-activity-heatmap"
      data-loaded={!loading}
      className="w-full rounded-xl border border-brand-border bg-brand-card p-2.5 sm:p-3 space-y-2.5 shadow-sm relative overflow-hidden"
    >
      {/* Top Header: Title + Active Days / Max Streak Metrics */}
      <div className="flex items-center justify-between gap-2 border-b border-brand-border/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            Coding Activity
          </h3>
        </div>

        {/* LeetCode Activity Metrics */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
            <span className="text-neutral-500">Active Days:</span>
            <span className="text-emerald-400 font-bold">{data.totalActiveDays}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
            <span className="text-neutral-500">Max Streak:</span>
            <span className="text-amber-400 font-bold">
              {data.maxStreak} {data.maxStreak === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Left-Aligned Heatmap + Shifted Partition Line + Right Difficulty Performance Graph */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-5 pt-0.5">
        {/* Left: Heatmap Grid Area (Aligned to left, width ~765px) */}
        <div
          ref={gridScrollRef}
          className="w-full lg:w-auto shrink-0 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent pb-0.5"
        >
          <div className="inline-block min-w-max select-none">
            {/* Month Labels: Placed with exact 14px step (11px cell + 3px gap) */}
            <div className="relative h-4 mb-1 pl-[25px]">
              {monthLabels.map((m, idx) => (
                <div
                  key={idx}
                  className="absolute text-[10px] font-mono text-neutral-400 font-medium leading-none"
                  style={{
                    left: `${25 + m.weekIndex * 14}px`,
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Heatmap Matrix: Day Labels (left) + 53 Week Columns */}
            <div className="flex items-start gap-1">
              {/* Day of Week Labels: Exactly 7 slots of 11px + 3px gap for pixel-perfect vertical alignment */}
              <div className="flex flex-col gap-[3px] pr-1.5 text-[9px] font-mono text-neutral-500 leading-none">
                {DAY_LABELS.map((dayLabel, i) => (
                  <div key={i} className="h-[11px] flex items-center justify-end w-5">
                    {dayLabel}
                  </div>
                ))}
              </div>

              {/* Weeks Columns: 11px x 11px cells, 3px gap, rounded-[2px] */}
              <div className="flex items-center gap-[3px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((cell, dIdx) => (
                      <div
                        key={dIdx}
                        data-activity-cell="true"
                        data-count={cell.count}
                        data-date={cell.dateStr}
                        onMouseEnter={(e) => handleCellMouseEnter(cell, e)}
                        onMouseLeave={handleCellMouseLeave}
                        className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] transition-all duration-150 cursor-pointer ${getCellColorClass(
                          cell.level
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Partition Line: Positioned right after heatmap, giving more space to the difficulty graph */}
        <div className="hidden lg:block w-[1px] bg-neutral-800/90 self-stretch my-0.5 shrink-0" />

        {/* Horizontal Divider on Mobile/Tablet */}
        <div className="block lg:hidden w-full h-[1px] bg-neutral-800/60 my-0.5" />

        {/* Right: Difficulty-Wise Performance Graph (Expands to efficiently utilize the remaining width) */}
        <div
          data-testid="difficulty-performance-graph"
          className="w-full lg:flex-1 flex items-center justify-center lg:justify-start gap-5 sm:gap-6 lg:gap-8 px-2 sm:px-3 py-1"
        >
          {/* Circular Progress Gauge: Enlarged to ~104px (w-26 h-26) to harmoniously balance heatmap height */}
          <div className="relative w-24 h-24 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#282828"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Easy Arc (Green #22C55E) */}
              {easyStrokeLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#22C55E"
                  strokeWidth="7"
                  strokeDasharray={`${easyStrokeLength} ${circumference}`}
                  strokeDashoffset="0"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              )}
              {/* Medium Arc (Yellow #EAB308) */}
              {mediumStrokeLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#EAB308"
                  strokeWidth="7"
                  strokeDasharray={`${mediumStrokeLength} ${circumference}`}
                  strokeDashoffset={-easyStrokeLength}
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              )}
              {/* Hard Arc (Red #EF4444) */}
              {hardStrokeLength > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#EF4444"
                  strokeWidth="7"
                  strokeDasharray={`${hardStrokeLength} ${circumference}`}
                  strokeDashoffset={-(easyStrokeLength + mediumStrokeLength)}
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>

            {/* Overall Solved Count in Center of Circle: Prominent & Crisp */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-white leading-none tracking-tight">
                {effectiveTotalSolved}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mt-1">
                Solved
              </span>
            </div>
          </div>

          {/* Difficulty Breakdown (Easy, Medium, Hard): Well-proportioned labels, counts and progress bars */}
          <div className="flex-1 flex flex-col justify-center gap-2 sm:gap-2.5 max-w-[280px] sm:max-w-[320px]">
            {/* Easy: Green #22C55E */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono leading-none">
                <span className="font-semibold text-[#22C55E]">Easy</span>
                <span className="text-neutral-300">
                  <strong className="text-white font-bold">{effectiveDifficulty.easy.solved}</strong>
                  <span className="text-neutral-500 font-normal"> / {effectiveDifficulty.easy.total}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800/90 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      effectiveDifficulty.easy.total > 0
                        ? Math.min(100, (effectiveDifficulty.easy.solved / effectiveDifficulty.easy.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Medium: Yellow #EAB308 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono leading-none">
                <span className="font-semibold text-[#EAB308]">Medium</span>
                <span className="text-neutral-300">
                  <strong className="text-white font-bold">{effectiveDifficulty.medium.solved}</strong>
                  <span className="text-neutral-500 font-normal"> / {effectiveDifficulty.medium.total}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800/90 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EAB308] rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      effectiveDifficulty.medium.total > 0
                        ? Math.min(100, (effectiveDifficulty.medium.solved / effectiveDifficulty.medium.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Hard: Red #EF4444 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono leading-none">
                <span className="font-semibold text-[#EF4444]">Hard</span>
                <span className="text-neutral-300">
                  <strong className="text-white font-bold">{effectiveDifficulty.hard.solved}</strong>
                  <span className="text-neutral-500 font-normal"> / {effectiveDifficulty.hard.total}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800/90 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EF4444] rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      effectiveDifficulty.hard.total > 0
                        ? Math.min(100, (effectiveDifficulty.hard.solved / effectiveDifficulty.hard.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltip && tooltip.visible && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-md bg-neutral-900/95 border border-neutral-700/80 shadow-xl text-center whitespace-nowrap backdrop-blur-sm"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="text-[11px] font-mono font-bold text-white">
            {tooltip.count > 0 ? (
              <span>
                <strong className="text-emerald-400">{tooltip.count}</strong>{" "}
                {tooltip.count === 1 ? "problem" : "problems"} solved
              </span>
            ) : (
              <span className="text-neutral-400">No activity</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-neutral-400">
            {tooltip.displayDate}
          </div>
        </div>
      )}
    </div>
  );
}
