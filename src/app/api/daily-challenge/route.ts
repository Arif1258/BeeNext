import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isUserActivePlus } from "@/lib/membership";
import {
  getOrCreateDailyChallenge,
  getTodayISTDateString,
  getNextMidnightIST,
  calculateEffectiveStreak,
  getUserDailyAllowance,
  DailyChallengeInfo,
} from "@/lib/dailyChallenge";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const todayStr = getTodayISTDateString();
    const problem = await getOrCreateDailyChallenge(todayStr);

    if (!problem) {
      return NextResponse.json(
        { error: "Daily challenge problem unavailable." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedProblemId = searchParams.get("problemId") || problem.id;

    const midnightIST = getNextMidnightIST().toISOString();

    // Check user session
    let isCompletedToday = false;
    let userStreak = {
      currentStreak: 0,
      longestStreak: 0,
      isCompletedToday: false,
    };
    let allowance = undefined;

    let sessionUserId: string | null = null;
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)beenext_token=([^;]+)/);
      if (match) {
        const decoded = verifyToken(match[1]);
        if (decoded?.id) sessionUserId = decoded.id;
      }
    }

    if (sessionUserId) {
      try {
        const isDailyChallengeRequested = requestedProblemId === problem.id;
        const [userRecord, attemptRows] = await Promise.all([
          prisma.user.findUnique({
            where: { id: sessionUserId },
            select: {
              id: true,
              role: true,
              membershipType: true,
              membershipExpiresAt: true,
              currentStreak: true,
              longestStreak: true,
              lastStreakDate: true,
            },
          }),
          isDailyChallengeRequested
            ? prisma.$queryRawUnsafe<Array<{ runCount: number; submitCount: number }>>(
                `SELECT "runCount", "submitCount" FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2 LIMIT 1`,
                sessionUserId,
                todayStr
              ).catch(() => [])
            : Promise.resolve([]),
        ]);

        if (userRecord) {
          userStreak = calculateEffectiveStreak(userRecord, todayStr);
          isCompletedToday = userStreak.isCompletedToday;

          const isPlus =
            userRecord.role === "ADMIN" || isUserActivePlus(userRecord);

          const preloaded =
            attemptRows && attemptRows.length > 0 ? attemptRows[0] : null;

          allowance = await getUserDailyAllowance(
            sessionUserId,
            isPlus,
            requestedProblemId,
            problem,
            preloaded
          );
        }
      } catch (err) {
        console.warn("Could not fetch user streak/allowance in daily challenge route:", err);
      }
    }

    const responseData: DailyChallengeInfo = {
      problem,
      todayDate: todayStr,
      midnightIST,
      isCompletedToday,
      userStreak,
      allowance,
    };

    // Calculate exact remaining seconds until upcoming midnight IST
    const nextMidnightMs = getNextMidnightIST().getTime();
    const secondsUntilMidnightIST = Math.max(
      0,
      Math.floor((nextMidnightMs - Date.now()) / 1000)
    );

    let cacheControlHeader = "private, no-cache, no-store, must-revalidate, max-age=0";
    if (!sessionUserId) {
      if (secondsUntilMidnightIST <= 15) {
        // At or right near midnight boundary: do not cache in intermediate CDN
        cacheControlHeader = "public, no-cache, must-revalidate, max-age=0";
      } else {
        // CDN and browser cache lifetime must never exceed midnight IST
        const maxAge = Math.max(1, Math.min(60, secondsUntilMidnightIST));
        const sMaxAge = Math.max(1, Math.min(300, secondsUntilMidnightIST));
        const remainingAfterSMaxAge = secondsUntilMidnightIST - sMaxAge;
        const swr = remainingAfterSMaxAge > 0 ? Math.min(300, remainingAfterSMaxAge) : 0;

        cacheControlHeader =
          swr > 0
            ? `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`
            : `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
      }
    }

    const headers: Record<string, string> = {
      "Cache-Control": cacheControlHeader,
      "Vary": "Cookie, Authorization",
    };
    if (sessionUserId) {
      headers["Pragma"] = "no-cache";
    }

    return NextResponse.json(responseData, { headers });
  } catch (err: any) {
    console.error("GET /api/daily-challenge error:", err);
    return NextResponse.json(
      { error: "Failed to fetch daily challenge." },
      { status: 500 }
    );
  }
}
