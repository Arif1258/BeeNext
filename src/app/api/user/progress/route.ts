import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProgressStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to track progress." }, { status: 401 });
    }

    const { problemId, status } = await req.json();
    if (!problemId) {
      return NextResponse.json({ error: "Problem ID required" }, { status: 400 });
    }

    const targetStatus = status === "COMPLETED" ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS;

    const record = await prisma.userProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId,
        },
      },
      update: {
        status: targetStatus,
        completedAt: targetStatus === ProgressStatus.COMPLETED ? new Date() : null,
      },
      create: {
        userId: user.id,
        problemId,
        status: targetStatus,
        completedAt: targetStatus === ProgressStatus.COMPLETED ? new Date() : null,
      },
    });

    // Check if user has reached >= 85% completion
    if (targetStatus === ProgressStatus.COMPLETED) {
      const [totalProblems, completedProblems] = await Promise.all([
        prisma.problem.count({ where: { isPublished: true } }),
        prisma.userProgress.count({
          where: { userId: user.id, status: ProgressStatus.COMPLETED },
        }),
      ]);

      if (totalProblems > 0 && completedProblems / totalProblems >= 0.85) {
        const userRecord = await prisma.user.findUnique({
          where: { id: user.id },
          select: { dsaQualifiedAt: true },
        });

        if (!userRecord?.dsaQualifiedAt) {
          await prisma.user.update({
            where: { id: user.id },
            data: { dsaQualifiedAt: new Date() },
          });
        }
      }
    }

    return NextResponse.json({ progress: record });
  } catch (err) {
    console.error("Progress update error:", err);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
