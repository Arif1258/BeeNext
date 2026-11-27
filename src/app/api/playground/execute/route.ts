import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { SupportedLanguage } from "@/lib/judge0";
import {
  evaluateTestSuiteWithOnlineCompiler,
} from "@/lib/executionWrapper";
import { executeOnlineCompilerSync } from "@/lib/onlineCompiler";
import { isProblemConceptual } from "@/lib/problemTemplates";
import {
  getTodayISTDateString,
  getOrCreateDailyChallenge,
  reserveDailyAttempt,
  refundDailyAttempt,
} from "@/lib/dailyChallenge";

export async function POST(req: Request) {
  let isDailyChallengeRun = false;
  let currentUserId: string | null = null;
  let reservationDate: string | undefined = undefined;

  try {
    const session = await getCurrentUser(req);
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to execute code in the playground." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 401 }
      );
    }

    currentUserId = user.id;
    const isPlus = user.role === "ADMIN" || isUserActivePlus(user);

    const body = await req.json();
    const { problemId, language, sourceCode, stdin } = body;

    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: "Language and sourceCode are required." },
        { status: 400 }
      );
    }

    // Membership & Daily Challenge Access Control
    if (!isPlus) {
      if (!problemId) {
        return NextResponse.json(
          {
            error: "BeeNext Plus membership is required to execute code in custom scratchpad mode.",
            code: "PLUS_REQUIRED",
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }

      // Check if problemId is today's Daily Challenge
      const todayStr = getTodayISTDateString();
      const dailyProblem = await getOrCreateDailyChallenge(todayStr);

      if (!dailyProblem || dailyProblem.id !== problemId) {
        return NextResponse.json(
          {
            error: "BeeNext Plus membership is required to execute code for this problem.",
            code: "PLUS_REQUIRED",
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }

      // Custom input execution mode is Plus-exclusive
      if (stdin && typeof stdin === "string" && stdin.trim()) {
        return NextResponse.json(
          {
            error: "Custom Input execution requires BeeNext Plus membership.",
            code: "PLUS_REQUIRED",
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }

      // Atomically reserve the 1 free Run attempt for today's Daily Challenge
      const reservation = await reserveDailyAttempt(user.id, "RUN");
      if (!reservation.success) {
        return NextResponse.json(
          {
            error: "You have used your 1 free Run for today's Daily Challenge. Upgrade to BeeNext Plus for unlimited executions.",
            code: "DAILY_FREE_RUN_EXHAUSTED",
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }

      isDailyChallengeRun = true;
      reservationDate = reservation.date;
    }

    let problemSlug = "";
    if (problemId) {
      const prob = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { slug: true },
      });
      if (prob) problemSlug = prob.slug;
    }

    if (problemSlug && isProblemConceptual(problemSlug)) {
      return NextResponse.json(
        { error: "This topic is conceptual and does not support code execution." },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // Custom Input mode (Direct stdin execution)
    // -------------------------------------------------------------
    if (stdin && typeof stdin === "string" && stdin.trim()) {
      try {
        const syncResult = await executeOnlineCompilerSync({
          language: language as SupportedLanguage,
          code: sourceCode,
          input: stdin,
          timeLimit: 5,
          userId: user.id,
          problemId: problemId || undefined,
        });

        const isTLE = syncResult.status === "timeout" || syncResult.exit_code === 124;
        const isError = syncResult.exit_code !== 0;
        let verdict = "Accepted";
        let status = "Accepted";
        let errorOutput: string | null = null;

        if (isTLE) {
          verdict = "Time Limit Exceeded";
          status = "Time Limit Exceeded";
          errorOutput = "Time Limit Exceeded (5.0s CPU execution limit exceeded).";
        } else if (isError) {
          const isCompile =
            syncResult.error?.includes("error:") ||
            syncResult.error?.includes("SyntaxError") ||
            syncResult.error?.includes("compilation terminated");
          verdict = isCompile ? "Compilation Error" : "Runtime Error";
          status = verdict;
          errorOutput = syncResult.error || "Execution terminated with non-zero exit code.";
        }

        const passed = !isTLE && !isError;

        return NextResponse.json({
          success: true,
          isCustomInput: true,
          isSubmission: false,
          verdict,
          executionTime: syncResult.time,
          memoryUsage: parseInt(syncResult.memory || "0", 10),
          passedTests: passed ? 1 : 0,
          totalTests: 1,
          errorOutput,
          testResults: [
            {
              testIndex: 1,
              passed,
              input: stdin,
              expectedOutput: null,
              actualOutput: syncResult.output || "(no output)",
              status,
              time: syncResult.time,
              memory: parseInt(syncResult.memory || "0", 10),
            },
          ],
        });
      } catch (syncErr: any) {
        return NextResponse.json(
          {
            success: false,
            verdict: "Execution Service Unavailable",
            error: syncErr.message || "Failed to execute custom input in sandbox.",
          },
          { status: 503 }
        );
      }
    }

    // -------------------------------------------------------------
    // Standard Problem Run (Sample Test Cases)
    // -------------------------------------------------------------
    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required for test case evaluation." },
        { status: 400 }
      );
    }

    const sampleCases = await prisma.testCase.findMany({
      where: { problemId, isActive: true, isSample: true },
      orderBy: { order: "asc" },
      take: 3,
      select: { order: true, input: true, expectedOutput: true, isSample: true },
    });

    if (sampleCases.length === 0) {
      return NextResponse.json(
        { error: "No verified sample test cases found for this problem." },
        { status: 404 }
      );
    }

    const evalResult = await evaluateTestSuiteWithOnlineCompiler({
      language: language as SupportedLanguage,
      sourceCode,
      problemSlug,
      testCases: sampleCases,
      isSubmission: false,
      cacheKey: `execute_${user.id}_${problemId}_${language}`,
      userId: user.id,
      problemId,
    });

    if (evalResult.overallStatus === "SERVICE_UNAVAILABLE") {
      if (isDailyChallengeRun && currentUserId) {
        await refundDailyAttempt(currentUserId, "RUN", reservationDate);
      }
      return NextResponse.json(
        {
          success: false,
          verdict: "Execution Service Unavailable",
          error: evalResult.errorOutput || "Execution service is temporarily unavailable.",
          passedTests: 0,
          totalTests: sampleCases.length,
          executionTime: "0.00",
          memoryUsage: 0,
          errorOutput: evalResult.errorOutput,
          testResults: evalResult.testResults,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      isSubmission: false,
      isCustomInput: false,
      verdict: evalResult.verdict,
      executionTime: evalResult.executionTime,
      memoryUsage: evalResult.memoryUsage,
      passedTests: evalResult.passedTests,
      totalTests: evalResult.totalTests,
      errorOutput: evalResult.errorOutput,
      testResults: evalResult.testResults,
      dailyAllowance: isDailyChallengeRun ? {
        isDailyChallenge: true,
        freeRunsRemaining: 0,
      } : undefined,
    });
  } catch (error: any) {
    if (isDailyChallengeRun && currentUserId) {
      try {
        await refundDailyAttempt(currentUserId, "RUN", reservationDate);
      } catch (refundErr) {
        console.warn("refundDailyAttempt error on exception:", refundErr);
      }
    }
    console.error("Playground execute error:", error);
    return NextResponse.json(
      { error: error?.message || "Execution engine encountered an unexpected error." },
      { status: 500 }
    );
  }
}
