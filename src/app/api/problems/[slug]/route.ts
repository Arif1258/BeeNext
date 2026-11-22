import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, checkProblemAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const session = await getCurrentUser();

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
            isFree: true,
            price: true,
          },
        },
        codes: {
          orderBy: { approachType: "desc" }, // OPTIMAL first, then BRUTE_FORCE
        },
        notes: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!problem || !problem.isPublished) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({
      problem: {
        ...problem,
        codes: problem.codes.map((c) => ({ ...c, isLocked: false })),
        notes: problem.notes.map((n) => ({ ...n, isLocked: false })),
      },
      access: {
        hasAccess: true,
        reason: "FREE",
      },
    });
  } catch (err) {
    console.error("Get problem error:", err);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
