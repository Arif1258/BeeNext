import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Difficulty, ApproachType } from "@prisma/client";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        category: true,
        codes: true,
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem });
  } catch (err: unknown) {
    console.error("Fetch problem by id error:", err);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Validate URLs if provided
    if (body.leetcodeUrl !== undefined && body.leetcodeUrl !== null) {
      if (typeof body.leetcodeUrl === "string" && body.leetcodeUrl.trim().length > 0) {
        try {
          const parsed = new URL(body.leetcodeUrl.trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return NextResponse.json({ error: "Problem URL must start with http:// or https://" }, { status: 400 });
          }
        } catch {
          return NextResponse.json({ error: "Invalid Problem URL format" }, { status: 400 });
        }
      }
    }

    if (body.youtubeUrl !== undefined && body.youtubeUrl !== null) {
      if (typeof body.youtubeUrl === "string" && body.youtubeUrl.trim().length > 0) {
        const trimmed = body.youtubeUrl.trim();
        const isYT = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(.*)?$/.test(trimmed);
        if (!isYT) {
          return NextResponse.json(
            { error: "Invalid YouTube URL format. Please provide a valid YouTube watch or share URL." },
            { status: 400 }
          );
        }
      }
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        categoryId: body.categoryId || undefined,
        description: body.description !== undefined ? body.description.trim() : undefined,
        difficulty: body.difficulty ? (body.difficulty as Difficulty) : undefined,
        inputFormat: body.inputFormat !== undefined ? body.inputFormat?.trim() : undefined,
        outputFormat: body.outputFormat !== undefined ? body.outputFormat?.trim() : undefined,
        constraints: body.constraints !== undefined ? body.constraints?.trim() : undefined,
        leetcodeUrl: body.leetcodeUrl !== undefined ? (body.leetcodeUrl ? body.leetcodeUrl.trim() : null) : undefined,
        youtubeUrl: body.youtubeUrl !== undefined ? (body.youtubeUrl ? body.youtubeUrl.trim() : null) : undefined,
        isFree: typeof body.isFree === "boolean" ? body.isFree : undefined,
        price: typeof body.price === "number" ? body.price : undefined,
        order: typeof body.order === "number" ? body.order : undefined,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : undefined,
      },
    });

    // Update brute force code if provided
    if (body.bruteForce && body.bruteForce.javaCode !== undefined) {
      await prisma.problemCode.upsert({
        where: {
          problemId_approachType: {
            problemId: id,
            approachType: ApproachType.BRUTE_FORCE,
          },
        },
        update: {
          title: body.bruteForce.title?.trim() || "Brute Force Approach",
          explanation: body.bruteForce.explanation?.trim() || "",
          javaCode: body.bruteForce.javaCode.trim(),
          timeComplexity: body.bruteForce.timeComplexity?.trim() || "O(N^2)",
          spaceComplexity: body.bruteForce.spaceComplexity?.trim() || "O(1)",
        },
        create: {
          problemId: id,
          approachType: ApproachType.BRUTE_FORCE,
          title: body.bruteForce.title?.trim() || "Brute Force Approach",
          explanation: body.bruteForce.explanation?.trim() || "",
          javaCode: body.bruteForce.javaCode.trim(),
          timeComplexity: body.bruteForce.timeComplexity?.trim() || "O(N^2)",
          spaceComplexity: body.bruteForce.spaceComplexity?.trim() || "O(1)",
        },
      });
    }

    // Update optimal code if provided
    if (body.optimal && body.optimal.javaCode !== undefined) {
      await prisma.problemCode.upsert({
        where: {
          problemId_approachType: {
            problemId: id,
            approachType: ApproachType.OPTIMAL,
          },
        },
        update: {
          title: body.optimal.title?.trim() || "Optimal Approach",
          explanation: body.optimal.explanation?.trim() || "",
          javaCode: body.optimal.javaCode.trim(),
          timeComplexity: body.optimal.timeComplexity?.trim() || "O(N)",
          spaceComplexity: body.optimal.spaceComplexity?.trim() || "O(1)",
        },
        create: {
          problemId: id,
          approachType: ApproachType.OPTIMAL,
          title: body.optimal.title?.trim() || "Optimal Approach",
          explanation: body.optimal.explanation?.trim() || "",
          javaCode: body.optimal.javaCode.trim(),
          timeComplexity: body.optimal.timeComplexity?.trim() || "O(N)",
          spaceComplexity: body.optimal.spaceComplexity?.trim() || "O(1)",
        },
      });
    }

    const fullProblem = await prisma.problem.findUnique({
      where: { id },
      include: {
        category: true,
        codes: true,
      },
    });

    return NextResponse.json({ problem: fullProblem });
  } catch (err: unknown) {
    console.error("Update problem error:", err);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    await prisma.problem.delete({ where: { id } });

    return NextResponse.json({ message: "Problem deleted successfully" });
  } catch (err: unknown) {
    console.error("Delete problem error:", err);
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}
