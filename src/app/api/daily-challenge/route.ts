import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isUserActivePlus } from "@/lib/membership";
import {
  getOrCreateDailyChallenge,
  getTodayISTDateString,
  getNextMidnightIST,
  calculateEffectiveStreak,
  getUserStreakSafe,
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

    const session = await getCurrentUser(req);
    if (session?.id) {
      try {
        const [rawStreak, userRecord] = await Promise.all([
          getUserStreakSafe(session.id),
          prisma.user.findUnique({
            where: { id: session.id },
            select: { role: true, membershipType: true, membershipExpiresAt: true },
          }),
        ]);
        userStreak = calculateEffectiveStreak(rawStreak, todayStr);
        isCompletedToday = userStreak.isCompletedToday;

        const isPlus = userRecord
          ? userRecord.role === "ADMIN" || isUserActivePlus(userRecord)
          : false;

        allowance = await getUserDailyAllowance(session.id, isPlus, requestedProblemId);
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

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("GET /api/daily-challenge error:", err);
    return NextResponse.json(
      { error: "Failed to fetch daily challenge." },
      { status: 500 }
    );
  }
}
