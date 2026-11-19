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

    // Backend access check
    const access = await checkProblemAccess(session?.id, problem.id);

    // If access is locked, mask protected code and secure note files
    if (!access.hasAccess) {
      const sanitizedCodes = problem.codes.map((c) => ({
        id: c.id,
        approachType: c.approachType,
        title: c.title,
        explanation: c.explanation.slice(0, 150) + "...\n[Unlock to read full architectural breakdown]",
        javaCode: "// 🔒 CONTENT LOCKED\n// Purchase this problem (₹" + problem.price + ") or the " + problem.category.title + " category (₹" + problem.category.price + ") to view full Java source code.",
        timeComplexity: c.timeComplexity,
        spaceComplexity: c.spaceComplexity,
        isLocked: true,
      }));

      const sanitizedNotes = problem.notes.map((n) => ({
        id: n.id,
        title: n.title,
        fileType: n.fileType,
        pageCount: n.pageCount,
        isProtected: true,
        previewUrl: n.previewUrl || null,
        fileUrl: null, // Hidden on backend!
        isLocked: true,
      }));

      return NextResponse.json({
        problem: {
          ...problem,
          codes: sanitizedCodes,
          notes: sanitizedNotes,
        },
        access: {
          hasAccess: false,
          reason: access.reason,
          price: problem.price,
          categoryPrice: problem.category.price,
        },
      });
    }

    // If access granted, return all content with verified media access
    return NextResponse.json({
      problem: {
        ...problem,
        codes: problem.codes.map((c) => ({ ...c, isLocked: false })),
        notes: problem.notes.map((n) => ({ ...n, isLocked: false })),
      },
      access: {
        hasAccess: true,
        reason: access.reason,
      },
    });
  } catch (err) {
    console.error("Get problem error:", err);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
