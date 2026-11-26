import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { SupportedLanguage } from "@/lib/judge0";
import { evaluateTestSuiteWithOnlineCompiler } from "@/lib/executionWrapper";
import { isProblemConceptual } from "@/lib/problemTemplates";
import { SubmissionStatus } from "@prisma/client";

interface SubmitResponsePayload {
  success: boolean;
  isSubmission: boolean;
  status: SubmissionStatus;
  verdict: string;
  executionTime: string;
  memoryUsage: number;
  passedTests: number;
  totalTests: number;
  errorOutput: string | null;
  testResults: Array<{
    testIndex: number;
    passed: boolean;
    input: string;
    expectedOutput: string | null;
    actualOutput: string;
    status: string;
    time: string | null;
    memory: number | null;
  }>;
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser(req);
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to submit code." },
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

    const isPlus = user.role === "ADMIN" || isUserActivePlus(user);

    if (!isPlus) {
      return NextResponse.json(
        {
          error: "BeeNext Plus membership is required to submit code.",
          code: "PLUS_REQUIRED",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { problemId, language, sourceCode } = body;

    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: "Language and sourceCode are required." },
        { status: 400 }
      );
    }

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required for submission." },
        { status: 400 }
      );
    }

    let problemSlug = "";
    const prob = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { slug: true },
    });
    if (prob) problemSlug = prob.slug;

    if (problemSlug && isProblemConceptual(problemSlug)) {
      return NextResponse.json(
        { error: "This topic is conceptual and does not support code submission." },
        { status: 400 }
      );
    }

    // Query exactly the 6 active test cases from the database
    const testCases = await prisma.testCase.findMany({
      where: { problemId, isActive: true },
      orderBy: { order: "asc" },
      take: 6,
      select: { order: true, input: true, expectedOutput: true, isSample: true },
    });

    if (testCases.length === 0) {
      return NextResponse.json(
        { error: "No verified test cases found for this problem." },
        { status: 404 }
      );
    }

    const evalResult = await evaluateTestSuiteWithOnlineCompiler({
      language: language as SupportedLanguage,
      sourceCode,
      problemSlug,
      testCases,
      isSubmission: true,
      cacheKey: `submit_${user.id}_${problemId}_${language}`,
      userId: user.id,
      problemId,
    });

    if (evalResult.overallStatus === "SERVICE_UNAVAILABLE") {
      return NextResponse.json(
        {
          error: "Execution Service Unavailable. Please wait a moment and try again.",
          verdict: "Execution Service Unavailable",
        },
        { status: 503 }
      );
    }

    // Map Prisma submission status
    const prismaStatus: SubmissionStatus =
      evalResult.overallStatus === "ACCEPTED"
        ? "ACCEPTED"
        : evalResult.overallStatus === "COMPILATION_ERROR"
        ? "COMPILATION_ERROR"
        : evalResult.overallStatus === "RUNTIME_ERROR"
        ? "RUNTIME_ERROR"
        : evalResult.overallStatus === "TIME_LIMIT_EXCEEDED"
        ? "TIME_LIMIT_EXCEEDED"
        : "WRONG_ANSWER";

    // All 6 evaluated test case results with input, expectedOutput and actualOutput
    const submitTestResults = evalResult.testResults.map((t) => ({
      testIndex: t.testIndex,
      passed: t.passed,
      input: t.input,
      expectedOutput: t.expectedOutput,
      actualOutput: t.actualOutput,
      status: t.status,
      time: t.time,
      memory: t.memory,
    }));

    // Persist submission record in database
    try {
      await prisma.codeSubmission.create({
        data: {
          userId: user.id,
          problemId,
          language,
          code: sourceCode,
          status: prismaStatus,
          executionTime: parseFloat(evalResult.executionTime),
          memoryUsage: evalResult.memoryUsage,
          passedTests: evalResult.passedTests,
          totalTests: evalResult.totalTests,
          errorOutput: evalResult.errorOutput,
        },
      });

      // ONLY update user progress if genuinely ACCEPTED on all test cases
      if (prismaStatus === "ACCEPTED") {
        await prisma.userProgress.upsert({
          where: {
            userId_problemId: {
              userId: user.id,
              problemId,
            },
          },
          update: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
          create: {
            userId: user.id,
            problemId,
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.warn("Could not save submission record to DB:", dbErr);
    }

    return NextResponse.json<SubmitResponsePayload>({
      success: true,
      isSubmission: true,
      status: prismaStatus,
      verdict: evalResult.verdict,
      executionTime: evalResult.executionTime,
      memoryUsage: evalResult.memoryUsage,
      passedTests: evalResult.passedTests,
      totalTests: evalResult.totalTests,
      errorOutput: evalResult.errorOutput,
      testResults: submitTestResults,
    });
  } catch (error: any) {
    console.error("Playground submit error:", error);
    return NextResponse.json(
      { error: error?.message || "Submission processing encountered an unexpected error." },
      { status: 500 }
    );
  }
}
