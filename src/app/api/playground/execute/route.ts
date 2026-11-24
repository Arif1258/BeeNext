import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { SupportedLanguage } from "@/lib/judge0";
import { evaluateCodeWithWrapper } from "@/lib/executionWrapper";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
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

    const isPlus = user.role === "ADMIN" || isUserActivePlus(user);

    if (!isPlus) {
      return NextResponse.json(
        {
          error: "BeeNext Plus membership is required to execute code.",
          code: "PLUS_REQUIRED",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { problemId, language, sourceCode, stdin } = body;

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

    // Custom Input mode
    if (stdin && typeof stdin === "string" && stdin.trim()) {
      const evalResult = await evaluateCodeWithWrapper({
        language: language as SupportedLanguage,
        sourceCode,
        input: stdin,
        expectedOutput: "",
        testIndex: 1,
        problemSlug,
      });

      const isCompileError = evalResult.status === "Compilation Error";
      const isRuntimeError = evalResult.status === "Runtime Error";
      const isTLE = evalResult.status === "Time Limit Exceeded";
      const passed = !isCompileError && !isRuntimeError && !isTLE;

      return NextResponse.json({
        success: true,
        isCustomInput: true,
        isSubmission: false,
        verdict: evalResult.status,
        executionTime: evalResult.time,
        memoryUsage: evalResult.memory,
        passedTests: passed ? 1 : 0,
        totalTests: 1,
        errorOutput: evalResult.compileError || evalResult.runtimeError || null,
        testResults: [
          {
            testIndex: 1,
            passed,
            input: stdin,
            expectedOutput: null,
            actualOutput: evalResult.actualOutput || "(no output)",
            status: evalResult.status,
            time: evalResult.time,
            memory: evalResult.memory,
          },
        ],
      });
    }

    // Query sample test cases from database (order 1..3, isSample: true)
    let sampleCases: Array<{ order: number; input: string; expectedOutput: string }> = [];
    if (problemId) {
      const dbCases = await prisma.testCase.findMany({
        where: { problemId, isSample: true },
        orderBy: { order: "asc" },
        select: { order: true, input: true, expectedOutput: true },
      });

      if (dbCases.length > 0) {
        sampleCases = dbCases;
      } else {
        // Fallback to first 2-3 cases if isSample flag wasn't queried
        const allDb = await prisma.testCase.findMany({
          where: { problemId },
          orderBy: { order: "asc" },
          take: 3,
          select: { order: true, input: true, expectedOutput: true },
        });
        if (allDb.length > 0) sampleCases = allDb;
      }
    }

    // Ultimate fallback if no test cases found in DB
    if (sampleCases.length === 0) {
      sampleCases = [
        { order: 1, input: "nums = [2, 7, 11, 15], target = 9", expectedOutput: "[0, 1]" },
        { order: 2, input: "nums = [3, 2, 4], target = 6", expectedOutput: "[1, 2]" },
        { order: 3, input: "nums = [3, 3], target = 6", expectedOutput: "[0, 1]" },
      ];
    }

    const testResults: Array<{
      testIndex: number;
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      status: string;
      time: string;
      memory: number;
    }> = [];

    let passedTests = 0;
    let maxTime = 0.01;
    let maxMemory = 13000;
    let overallVerdict = "Accepted";
    let errorOutput: string | null = null;

    for (const tc of sampleCases) {
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
        overallVerdict = "Compilation Error";
        errorOutput = evalResult.compileError || "Compilation failed.";
      } else if (evalResult.status === "Runtime Error" && overallVerdict !== "Compilation Error") {
        overallVerdict = "Runtime Error";
        errorOutput = evalResult.runtimeError || "Runtime error occurred.";
      } else if (evalResult.status === "Time Limit Exceeded" && overallVerdict === "Accepted") {
        overallVerdict = "Time Limit Exceeded";
        errorOutput = evalResult.runtimeError || "Time limit exceeded.";
      } else if (!evalResult.passed && overallVerdict === "Accepted") {
        overallVerdict = "Wrong Answer";
      }

      if (evalResult.passed) {
        passedTests++;
      }

      testResults.push({
        testIndex: tc.order,
        passed: evalResult.passed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: evalResult.actualOutput,
        status: evalResult.status,
        time: evalResult.time,
        memory: evalResult.memory,
      });
    }

    return NextResponse.json({
      success: true,
      isSubmission: false,
      isCustomInput: false,
      verdict: overallVerdict,
      executionTime: maxTime.toFixed(3),
      memoryUsage: maxMemory,
      passedTests,
      totalTests: sampleCases.length,
      errorOutput,
      testResults,
    });
  } catch (error: any) {
    console.error("Playground execute error:", error);
    return NextResponse.json(
      { error: error?.message || "Execution engine encountered an unexpected error." },
      { status: 500 }
    );
  }
}
