import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { SupportedLanguage } from "@/lib/judge0";
import { evaluateCodeWithWrapper } from "@/lib/executionWrapper";
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
    status: string;
    time: string | null;
    memory: number | null;
  }>;
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
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

    let problemSlug = "";
    if (problemId) {
      const prob = await prisma.problem.findUnique({
        where: { id: problemId },
        select: { slug: true },
      });
      if (prob) problemSlug = prob.slug;
    }

    // Query all 12 test cases from the database
    let testCases: Array<{
      order: number;
      input: string;
      expectedOutput: string;
      isSample: boolean;
    }> = [];

    if (problemId) {
      const dbCases = await prisma.testCase.findMany({
        where: { problemId },
        orderBy: { order: "asc" },
        select: { order: true, input: true, expectedOutput: true, isSample: true },
      });

      if (dbCases.length > 0) {
        testCases = dbCases;
      }
    }

    // Fallback if none in DB (guarantees 12 test cases)
    if (testCases.length === 0) {
      for (let i = 1; i <= 12; i++) {
        testCases.push({
          order: i,
          input: `nums = [${i}, ${i + 1}, ${i + 2}], target = ${2 * i + 1}`,
          expectedOutput: "[0, 1]",
          isSample: i <= 3,
        });
      }
    }

    let passedTests = 0;
    let finalVerdict: SubmissionStatus = "ACCEPTED";
    let overallDisplayVerdict = "Accepted";
    let maxTime = 0.02;
    let maxMemory = 12000;
    let errorOutput: string | null = null;

    // Test results for the client: STRICTLY PROTECTED
    // For hidden test cases (!tc.isSample), inputs and expected outputs are omitted!
    const testResults: Array<{
      testIndex: number;
      passed: boolean;
      status: string;
      time: string | null;
      memory: number | null;
    }> = [];

    for (const tc of testCases) {
      const evalResult = await evaluateCodeWithWrapper({
        language: language as SupportedLanguage,
        sourceCode,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        testIndex: tc.order,
        problemSlug,
      });

      const parsedTime = parseFloat(evalResult.time || "0.02");
      if (parsedTime > maxTime) maxTime = parsedTime;
      if ((evalResult.memory || 0) > maxMemory) maxMemory = evalResult.memory;

      if (evalResult.status === "Compilation Error") {
        finalVerdict = "COMPILATION_ERROR";
        overallDisplayVerdict = "Compilation Error";
        errorOutput = evalResult.compileError || "Compilation error";
      } else if (evalResult.status === "Runtime Error" && finalVerdict !== "COMPILATION_ERROR") {
        finalVerdict = "RUNTIME_ERROR";
        overallDisplayVerdict = "Runtime Error";
        errorOutput = evalResult.runtimeError || "Runtime error";
      } else if (evalResult.status === "Time Limit Exceeded" && finalVerdict === "ACCEPTED") {
        finalVerdict = "TIME_LIMIT_EXCEEDED";
        overallDisplayVerdict = "Time Limit Exceeded";
        errorOutput = evalResult.runtimeError || "Time limit exceeded";
      } else if (!evalResult.passed && finalVerdict === "ACCEPTED") {
        finalVerdict = "WRONG_ANSWER";
        overallDisplayVerdict = "Wrong Answer";
      }

      if (evalResult.passed) {
        passedTests++;
      }

      // Record protected client status
      testResults.push({
        testIndex: tc.order,
        passed: evalResult.passed,
        status: evalResult.status,
        time: evalResult.time,
        memory: evalResult.memory,
      });
    }

    // Persist submission record in database
    try {
      await prisma.codeSubmission.create({
        data: {
          userId: user.id,
          problemId: problemId || null,
          language,
          code: sourceCode,
          status: finalVerdict,
          executionTime: maxTime,
          memoryUsage: maxMemory,
          passedTests,
          totalTests: testCases.length,
          errorOutput,
        },
      });

      // If accepted, update user progress
      if (finalVerdict === "ACCEPTED" && problemId) {
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
      status: finalVerdict,
      verdict: overallDisplayVerdict,
      executionTime: maxTime.toFixed(3),
      memoryUsage: maxMemory,
      passedTests,
      totalTests: testCases.length,
      errorOutput,
      testResults,
    });
  } catch (error: any) {
    console.error("Playground submit error:", error);
    return NextResponse.json(
      { error: error?.message || "Submission processing encountered an unexpected error." },
      { status: 500 }
    );
  }
}
