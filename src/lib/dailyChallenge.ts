import prisma from "@/lib/prisma";
import { isProblemConceptual } from "@/lib/problemTemplates";
import crypto from "crypto";

export interface DailyProblemData {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order: number;
  leetcodeUrl?: string | null;
  youtubeUrl?: string | null;
  isFree?: boolean;
  category?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface DailyChallengeAllowance {
  isDailyChallenge: boolean;
  isPlus: boolean;
  freeRunsRemaining: number;
  freeSubmitsRemaining: number;
  freeRunsTotal: number;
  freeSubmitsTotal: number;
  canRun: boolean;
  canSubmit: boolean;
}

export interface DailyChallengeInfo {
  problem: DailyProblemData;
  todayDate: string; // "YYYY-MM-DD"
  midnightIST: string; // ISO date string for next midnight IST
  isCompletedToday: boolean;
  userStreak: {
    currentStreak: number;
    longestStreak: number;
    isCompletedToday: boolean;
  };
  allowance?: DailyChallengeAllowance;
}

/**
 * Returns today's date in Asia/Kolkata (IST) timezone in "YYYY-MM-DD" format.
 */
export function getTodayISTDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Returns yesterday's date in Asia/Kolkata (IST) timezone in "YYYY-MM-DD" format.
 */
export function getYesterdayISTDateString(d: Date = new Date()): string {
  const istDateStr = getTodayISTDateString(d);
  const [year, month, day] = istDateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  dateObj.setUTCDate(dateObj.getUTCDate() - 1);
  return dateObj.toISOString().slice(0, 10);
}

/**
 * Returns the exact Date of the upcoming midnight in Asia/Kolkata (IST).
 */
export function getNextMidnightIST(d: Date = new Date()): Date {
  const todayStr = getTodayISTDateString(d);
  const [year, month, day] = todayStr.split("-").map(Number);
  // Next day midnight in IST (IST is UTC + 5:30)
  // Next day 00:00 IST is previous day 18:30 UTC
  // So next day 00:00:00 IST = UTC(year, month - 1, day + 1, 0, 0, 0) minus 5 hours 30 mins
  const nextDayMidnightUTC = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  nextDayMidnightUTC.setUTCMinutes(nextDayMidnightUTC.getUTCMinutes() - 330);
  return nextDayMidnightUTC;
}

/**
 * Computes a deterministic integer seed from a string (e.g. date string).
 */
function hashStringToInt(str: string): number {
  const hash = crypto.createHash("sha256").update(str).digest("hex");
  return parseInt(hash.slice(0, 8), 16);
}

/**
 * Fetches or deterministically selects today's Daily Challenge problem.
 * Avoids repeating problems until all non-conceptual coding problems (464) are exhausted.
 */
export async function getOrCreateDailyChallenge(dateStr?: string): Promise<DailyProblemData | null> {
  const todayStr = dateStr || getTodayISTDateString();

  // 1. Try to find an existing DailyChallenge record in the database
  try {
    const existing = await prisma.dailyChallenge.findUnique({
      where: { date: todayStr },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            order: true,
            leetcodeUrl: true,
            youtubeUrl: true,
            isFree: true,
            category: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (existing?.problem) {
      return existing.problem as DailyProblemData;
    }
  } catch (err: any) {
    // If table doesn't exist yet (e.g. before migration), log and fall back to deterministic selection
    console.warn("daily_challenges query notice (fallback active):", err?.message || err);
  }

  // 2. Query all published problems and filter out the 31 conceptual problems
  const allProblems = await prisma.problem.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      order: true,
      leetcodeUrl: true,
      youtubeUrl: true,
      isFree: true,
      category: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
  });

  const codingProblems = allProblems.filter((p) => !isProblemConceptual(p.slug));
  if (codingProblems.length === 0) return null;

  // 3. Find problems already used in previous daily challenges
  let usedProblemIds = new Set<string>();
  try {
    const previous = await prisma.dailyChallenge.findMany({
      select: { problemId: true },
    });
    usedProblemIds = new Set(previous.map((p) => p.problemId));
  } catch {
    // Fallback if table not ready
  }

  // If all problems have been used, reset the pool to avoid repeating until exhausted
  let availablePool = codingProblems.filter((p) => !usedProblemIds.has(p.id));
  if (availablePool.length === 0) {
    availablePool = codingProblems;
  }

  // 4. Deterministically select one problem based on the date seed
  // This guarantees all serverless instances pick the exact same problem for the date
  const seed = hashStringToInt(`beenext_daily_challenge_${todayStr}`);
  const selectedIndex = Math.abs(seed) % availablePool.length;
  const selectedProblem = availablePool[selectedIndex];

  // 5. Attempt to persist the selected problem into the database
  try {
    await prisma.dailyChallenge.create({
      data: {
        date: todayStr,
        problemId: selectedProblem.id,
      },
    });
  } catch (err: any) {
    // Handle concurrent insertion race condition gracefully
    try {
      const winner = await prisma.dailyChallenge.findUnique({
        where: { date: todayStr },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              order: true,
              leetcodeUrl: true,
              youtubeUrl: true,
              isFree: true,
              category: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      if (winner?.problem) return winner.problem as DailyProblemData;
    } catch {
      // Return selectedProblem
    }
  }

  return selectedProblem as DailyProblemData;
}

/**
 * Safely fetches a user's streak data, gracefully handling unmigrated databases.
 */
export async function getUserStreakSafe(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
}> {
  try {
    const res = await prisma.$queryRawUnsafe<Array<{
      currentStreak: number;
      longestStreak: number;
      lastStreakDate: string | null;
    }>>(
      `SELECT "currentStreak", "longestStreak", "lastStreakDate" FROM "users" WHERE id = $1 LIMIT 1`,
      userId
    );
    if (res && res.length > 0) {
      return {
        currentStreak: res[0].currentStreak || 0,
        longestStreak: res[0].longestStreak || 0,
        lastStreakDate: res[0].lastStreakDate || null,
      };
    }
  } catch {
    // Columns not yet added in database (unmigrated)
  }
  return { currentStreak: 0, longestStreak: 0, lastStreakDate: null };
}

/**
 * Calculates effective user streak based on consecutive days in IST.
 * If user missed yesterday, streak resets to 0 while preserving longestStreak.
 */
export function calculateEffectiveStreak(user: {
  currentStreak?: number | null;
  longestStreak?: number | null;
  lastStreakDate?: string | null;
} | null, todayStr: string = getTodayISTDateString()): {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
} {
  if (!user) {
    return { currentStreak: 0, longestStreak: 0, isCompletedToday: false };
  }

  const currentStreak = user.currentStreak || 0;
  const longestStreak = user.longestStreak || 0;
  const lastStreakDate = user.lastStreakDate || null;

  const yesterdayStr = getYesterdayISTDateString();

  if (lastStreakDate === todayStr) {
    // Completed today
    return {
      currentStreak,
      longestStreak,
      isCompletedToday: true,
    };
  }

  if (lastStreakDate === yesterdayStr) {
    // Completed yesterday, today is pending (streak is active)
    return {
      currentStreak,
      longestStreak,
      isCompletedToday: false,
    };
  }

  // Missed yesterday or never completed: streak is reset to 0
  return {
    currentStreak: 0,
    longestStreak,
    isCompletedToday: false,
  };
}

/**
 * Validates a successful submission against today's Daily Challenge.
 * If it passes all 6 test cases for today's challenge:
 * - Records streak completion in database
 * - Increments streak for consecutive days, or resets to 1 if day missed
 * - Prevents multiple streak increments on the same day
 * - Returns celebration metadata
 */
export async function verifyAndRecordDailySubmission({
  userId,
  problemId,
  passedTests,
  totalTests,
  isAccepted,
}: {
  userId: string;
  problemId: string;
  passedTests: number;
  totalTests: number;
  isAccepted: boolean;
}): Promise<{
  isDailyChallenge: boolean;
  newlyCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  todayDate: string;
}> {
  const todayStr = getTodayISTDateString();

  // 1. Only a genuinely ACCEPTED submission with all 6 test cases passed qualifies
  if (!isAccepted || passedTests < 6 || totalTests < 6) {
    return {
      isDailyChallenge: false,
      newlyCompleted: false,
      currentStreak: 0,
      longestStreak: 0,
      todayDate: todayStr,
    };
  }

  // 2. Fetch today's Daily Challenge problem
  const dailyProblem = await getOrCreateDailyChallenge(todayStr);
  if (!dailyProblem || dailyProblem.id !== problemId) {
    // Not today's daily challenge problem
    return {
      isDailyChallenge: false,
      newlyCompleted: false,
      currentStreak: 0,
      longestStreak: 0,
      todayDate: todayStr,
    };
  }

  // 3. Problem IS today's daily challenge!
  // Check if user has already completed today's challenge
  try {
    const existingStreakRecord = await prisma.userDailyStreak.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
    });

    if (existingStreakRecord) {
      // Repeated successful submission on the same day must not increase streak again
      const userStreak = await getUserStreakSafe(userId);
      return {
        isDailyChallenge: true,
        newlyCompleted: false,
        currentStreak: userStreak.currentStreak || 1,
        longestStreak: userStreak.longestStreak || 1,
        todayDate: todayStr,
      };
    }

    // 4. First time completing today's challenge!
    // Insert into user_daily_streaks to prevent race conditions via unique index
    try {
      await prisma.userDailyStreak.create({
        data: {
          userId,
          date: todayStr,
          problemId,
        },
      });
    } catch (insertErr) {
      // Table unmigrated or concurrent duplicate
      console.warn("user_daily_streaks insert note:", insertErr);
    }

    // 5. Calculate updated streak
    const userStreak = await getUserStreakSafe(userId);
    const yesterdayStr = getYesterdayISTDateString();
    let newStreak = 1;

    if (userStreak.lastStreakDate === yesterdayStr) {
      // Consecutive day!
      newStreak = (userStreak.currentStreak || 0) + 1;
    } else {
      // Missed previous day or first time: streak starts at 1
      newStreak = 1;
    }

    const newLongest = Math.max(userStreak.longestStreak || 0, newStreak);

    // Persist new streak in User model safely
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "users" SET "currentStreak" = $1, "longestStreak" = $2, "lastStreakDate" = $3 WHERE id = $4`,
        newStreak,
        newLongest,
        todayStr,
        userId
      );
    } catch (updateErr) {
      console.warn("users streak update note:", updateErr);
    }

    return {
      isDailyChallenge: true,
      newlyCompleted: true,
      currentStreak: newStreak,
      longestStreak: newLongest,
      todayDate: todayStr,
    };
  } catch (err: any) {
    console.error("verifyAndRecordDailySubmission error:", err);
    // Fallback if unique constraint or tables not ready
    return {
      isDailyChallenge: true,
      newlyCompleted: false,
      currentStreak: 1,
      longestStreak: 1,
      todayDate: todayStr,
    };
  }
}

/**
 * Safely fetches a user's daily challenge allowance for today in IST.
 * - Plus users have unlimited runs & submits across all problems.
 * - Normal logged-in users get exactly 1 free Run and 1 free Submit per day exclusively for today's Daily Challenge.
 */
export async function getUserDailyAllowance(
  userId: string,
  isPlus: boolean,
  problemId?: string
): Promise<DailyChallengeAllowance> {
  const todayStr = getTodayISTDateString();
  const dailyProblem = await getOrCreateDailyChallenge(todayStr);
  const isDailyChallenge = Boolean(problemId && dailyProblem && dailyProblem.id === problemId);

  if (isPlus) {
    return {
      isDailyChallenge,
      isPlus: true,
      freeRunsRemaining: 999,
      freeSubmitsRemaining: 999,
      freeRunsTotal: 1,
      freeSubmitsTotal: 1,
      canRun: true,
      canSubmit: true,
    };
  }

  if (!isDailyChallenge) {
    return {
      isDailyChallenge: false,
      isPlus: false,
      freeRunsRemaining: 0,
      freeSubmitsRemaining: 0,
      freeRunsTotal: 1,
      freeSubmitsTotal: 1,
      canRun: false,
      canSubmit: false,
    };
  }

  let runCount = 0;
  let submitCount = 0;
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ runCount: number; submitCount: number }>>(
      `SELECT "runCount", "submitCount" FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2 LIMIT 1`,
      userId,
      todayStr
    );
    if (rows && rows.length > 0) {
      runCount = rows[0].runCount || 0;
      submitCount = rows[0].submitCount || 0;
    }
  } catch (err: any) {
    // If table unmigrated, treat as 0 used
    console.warn("getUserDailyAllowance read note:", err?.message);
  }

  const freeRunsRemaining = Math.max(0, 1 - runCount);
  const freeSubmitsRemaining = Math.max(0, 1 - submitCount);

  return {
    isDailyChallenge: true,
    isPlus: false,
    freeRunsRemaining,
    freeSubmitsRemaining,
    freeRunsTotal: 1,
    freeSubmitsTotal: 1,
    canRun: freeRunsRemaining > 0,
    canSubmit: freeSubmitsRemaining > 0,
  };
}

/**
 * Atomically attempts to reserve 1 free daily attempt (RUN or SUBMIT).
 * Uses PostgreSQL row-level concurrency control with WHERE count < 1 to prevent race conditions.
 */
export async function reserveDailyAttempt(
  userId: string,
  type: "RUN" | "SUBMIT"
): Promise<{ success: boolean; date?: string; error?: string }> {
  const todayStr = getTodayISTDateString();
  const attemptId = `att_${crypto.randomBytes(12).toString("hex")}`;

  try {
    if (type === "RUN") {
      const res = await prisma.$queryRawUnsafe<Array<{ runCount: number }>>(
        `INSERT INTO "daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 1, 0, NOW(), NOW())
         ON CONFLICT ("userId", "date")
         DO UPDATE SET "runCount" = "daily_challenge_attempts"."runCount" + 1, "updatedAt" = NOW()
         WHERE "daily_challenge_attempts"."runCount" < 1
         RETURNING "runCount"`,
        attemptId,
        userId,
        todayStr
      );
      if (!res || res.length === 0) {
        return { success: false, error: "DAILY_FREE_RUN_EXHAUSTED" };
      }
      return { success: true, date: todayStr };
    } else {
      const res = await prisma.$queryRawUnsafe<Array<{ submitCount: number }>>(
        `INSERT INTO "daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 0, 1, NOW(), NOW())
         ON CONFLICT ("userId", "date")
         DO UPDATE SET "submitCount" = "daily_challenge_attempts"."submitCount" + 1, "updatedAt" = NOW()
         WHERE "daily_challenge_attempts"."submitCount" < 1
         RETURNING "submitCount"`,
        attemptId,
        userId,
        todayStr
      );
      if (!res || res.length === 0) {
        return { success: false, error: "DAILY_FREE_SUBMIT_EXHAUSTED" };
      }
      return { success: true, date: todayStr };
    }
  } catch (err: any) {
    console.error(`reserveDailyAttempt ${type} error:`, err?.message);
    // If table unmigrated (code 42P01: relation does not exist), allow for offline/local dev
    if (err?.code === "42P01" || err?.message?.includes("does not exist")) {
      return { success: true, date: todayStr };
    }
    return { success: false, error: "RESERVATION_FAILED" };
  }
}

/**
 * Refunds a reserved attempt if code execution failed prior to running
 * (e.g., OnlineCompiler provider 503 or internal server error).
 * Idempotent and uses original reservation date to properly support midnight IST crossing.
 */
export async function refundDailyAttempt(
  userId: string,
  type: "RUN" | "SUBMIT",
  reservationDate?: string
): Promise<void> {
  const targetDate = reservationDate || getTodayISTDateString();
  try {
    if (type === "RUN") {
      await prisma.$executeRawUnsafe(
        `UPDATE "daily_challenge_attempts"
         SET "runCount" = GREATEST(0, "runCount" - 1), "updatedAt" = NOW()
         WHERE "userId" = $1 AND "date" = $2 AND "runCount" > 0`,
        userId,
        targetDate
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "daily_challenge_attempts"
         SET "submitCount" = GREATEST(0, "submitCount" - 1), "updatedAt" = NOW()
         WHERE "userId" = $1 AND "date" = $2 AND "submitCount" > 0`,
        userId,
        targetDate
      );
    }
  } catch (err: any) {
    console.warn(`refundDailyAttempt ${type} note:`, err?.message);
  }
}
