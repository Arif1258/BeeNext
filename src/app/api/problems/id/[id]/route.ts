import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Difficulty, ApproachType } from "@prisma/client";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        difficulty: body.difficulty ? (body.difficulty as Difficulty) : undefined,
        inputFormat: body.inputFormat?.trim(),
        outputFormat: body.outputFormat?.trim(),
        constraints: body.constraints?.trim(),
        leetcodeUrl: body.leetcodeUrl?.trim(),
        isFree: typeof body.isFree === "boolean" ? body.isFree : undefined,
        price: typeof body.price === "number" ? body.price : undefined,
        order: typeof body.order === "number" ? body.order : undefined,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : undefined,
      },
    });

    // Update brute force code if present
    if (body.bruteForce?.javaCode) {
      await prisma.problemCode.upsert({
        where: {
          problemId_approachType: {
            problemId: id,
            approachType: ApproachType.BRUTE_FORCE,
          },
        },
        update: {
          title: body.bruteForce.title,
          explanation: body.bruteForce.explanation,
          javaCode: body.bruteForce.javaCode,
          timeComplexity: body.bruteForce.timeComplexity,
          spaceComplexity: body.bruteForce.spaceComplexity,
        },
        create: {
          problemId: id,
          approachType: ApproachType.BRUTE_FORCE,
          title: body.bruteForce.title || "Brute Force Approach",
          explanation: body.bruteForce.explanation || "",
          javaCode: body.bruteForce.javaCode,
          timeComplexity: body.bruteForce.timeComplexity || "O(N^2)",
          spaceComplexity: body.bruteForce.spaceComplexity || "O(1)",
        },
      });
    }

    // Update optimal code if present
    if (body.optimal?.javaCode) {
      await prisma.problemCode.upsert({
        where: {
          problemId_approachType: {
            problemId: id,
            approachType: ApproachType.OPTIMAL,
          },
        },
        update: {
          title: body.optimal.title,
          explanation: body.optimal.explanation,
          javaCode: body.optimal.javaCode,
          timeComplexity: body.optimal.timeComplexity,
          spaceComplexity: body.optimal.spaceComplexity,
        },
        create: {
          problemId: id,
          approachType: ApproachType.OPTIMAL,
          title: body.optimal.title || "Optimal Approach",
          explanation: body.optimal.explanation || "",
          javaCode: body.optimal.javaCode,
          timeComplexity: body.optimal.timeComplexity || "O(N)",
          spaceComplexity: body.optimal.spaceComplexity || "O(1)",
        },
      });
    }

    return NextResponse.json({ problem: updated });
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
