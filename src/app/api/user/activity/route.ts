import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCachedPublishedProblems = unstable_cache(
  async () => {
    return prisma.problem.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        difficulty: true,
      },
    });
  },
  ["all-published-problems-difficulty"],
  { revalidate: 300, tags: ["problems"] }
);

/**
 * Helper to convert any Date into an IST (Asia/Kolkata) date string "YYYY-MM-DD".
 */
function toISTDateString(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(d));
}

/**
 * Calculates the maximum consecutive days streak from a sorted list of unique "YYYY-MM-DD" date strings.
 */
function calculateMaxStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  if (dates.length === 1) return 1;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1] + "T00:00:00Z");
    const currDate = new Date(dates[i] + "T00:00:00Z");

    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser(req);

    if (!session?.id) {
      const allProblems = await getCachedPublishedProblems();
      const difficulty = {
        easy: { solved: 0, total: 0 },
        medium: { solved: 0, total: 0 },
        hard: { solved: 0, total: 0 },
      };
      for (const p of allProblems) {
        const diffKey = p.difficulty.toLowerCase() as "easy" | "medium" | "hard";
        if (difficulty[diffKey]) difficulty[diffKey].total++;
      }

      return NextResponse.json({
        isAuthenticated: false,
        activity: {},
        totalActiveDays: 0,
        maxStreak: 0,
        totalSolved: 0,
        difficulty,
      });
    }

    const userId = session.id;

    // Daily map: dateStr ("YYYY-MM-DD") -> Set of distinct problemIds solved on that day
    const dailyMap: { [date: string]: Set<string> } = {};

    // 1. Fetch all ACCEPTED CodeSubmissions for this user
    const acceptedSubmissions = await prisma.codeSubmission.findMany({
      where: {
        userId,
        status: "ACCEPTED",
        problemId: { not: null },
      },
      select: {
        problemId: true,
        createdAt: true,
      },
    });

    for (const sub of acceptedSubmissions) {
      if (sub.problemId && sub.createdAt) {
        const dateStr = toISTDateString(sub.createdAt);
        if (!dailyMap[dateStr]) dailyMap[dateStr] = new Set();
        dailyMap[dateStr].add(sub.problemId);
      }
    }

    // 2. Fetch all COMPLETED UserProgress records for this user
    const completedProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      select: {
        problemId: true,
        completedAt: true,
        updatedAt: true,
      },
    });

    for (const prog of completedProgress) {
      const date = prog.completedAt || prog.updatedAt;
      if (prog.problemId && date) {
        const dateStr = toISTDateString(date);
        if (!dailyMap[dateStr]) dailyMap[dateStr] = new Set();
        dailyMap[dateStr].add(prog.problemId);
      }
    }

    // 3. Fetch all UserDailyStreak entries (Daily Challenge completions)
    const dailyStreaks = await prisma.userDailyStreak.findMany({
      where: { userId },
      select: {
        problemId: true,
        date: true,
      },
    });

    for (const streak of dailyStreaks) {
      if (streak.problemId && streak.date) {
        const dateStr = streak.date; // Already "YYYY-MM-DD" in IST
        if (!dailyMap[dateStr]) dailyMap[dateStr] = new Set();
        dailyMap[dateStr].add(streak.problemId);
      }
    }

    // Convert sets to distinct counts per day
    const activity: { [date: string]: number } = {};
    const allUniqueProblems = new Set<string>();
    const activeDates: string[] = [];

    for (const [dateStr, problemSet] of Object.entries(dailyMap)) {
      if (problemSet.size > 0) {
        activity[dateStr] = problemSet.size;
        activeDates.push(dateStr);
        problemSet.forEach((pid) => {
          allUniqueProblems.add(pid);
        });
      }
    }

    // Sort active dates chronologically
    activeDates.sort();

    const totalActiveDays = activeDates.length;
    const maxStreak = calculateMaxStreak(activeDates);
    const totalSolved = allUniqueProblems.size;

    // 4. Fetch all published problems (cached) to compute exact difficulty breakdown
    const allProblems = await getCachedPublishedProblems();

    const difficulty = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    };

    for (const p of allProblems) {
      const diffKey = p.difficulty.toLowerCase() as "easy" | "medium" | "hard";
      if (difficulty[diffKey]) {
        difficulty[diffKey].total++;
        if (allUniqueProblems.has(p.id)) {
          difficulty[diffKey].solved++;
        }
      }
    }

    return NextResponse.json({
      isAuthenticated: true,
      activity,
      totalActiveDays,
      maxStreak,
      totalSolved,
      difficulty,
    });
  } catch (err: any) {
    console.error("GET /api/user/activity error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user activity" },
      { status: 500 }
    );
  }
}
