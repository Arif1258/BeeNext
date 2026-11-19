import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Difficulty, ApproachType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const where: any = { isPublished: true };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const problems = await prisma.problem.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        description: true,
        isFree: true,
        price: true,
        order: true,
        leetcodeUrl: true,
        category: {
          select: {
            id: true,
            title: true,
            slug: true,
            isFree: true,
            price: true,
          },
        },
        _count: {
          select: { notes: true },
        },
      },
    });

    return NextResponse.json({ problems });
  } catch (err) {
    console.error("Fetch problems error:", err);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      categoryId,
      difficulty = "MEDIUM",
      description,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      leetcodeUrl,
      isFree = false,
      price = 49,
      order = 0,
      bruteForce,
      optimal,
    } = body;

    if (!title || !slug || !categoryId || !description) {
      return NextResponse.json(
        { error: "Title, slug, category, and description are required" },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    const problem = await prisma.problem.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        categoryId,
        difficulty: difficulty as Difficulty,
        description: description.trim(),
        inputFormat: inputFormat?.trim(),
        outputFormat: outputFormat?.trim(),
        constraints: constraints?.trim(),
        examples: examples || [],
        leetcodeUrl: leetcodeUrl?.trim() || null,
        isFree: Boolean(isFree),
        price: Number(price) || 0,
        order: Number(order) || 0,
      },
    });

    // Create brute force code if provided
    if (bruteForce?.javaCode) {
      await prisma.problemCode.create({
        data: {
          problemId: problem.id,
          approachType: ApproachType.BRUTE_FORCE,
          title: bruteForce.title || "Brute Force Approach",
          explanation: bruteForce.explanation || "",
          javaCode: bruteForce.javaCode,
          timeComplexity: bruteForce.timeComplexity || "O(N^2)",
          spaceComplexity: bruteForce.spaceComplexity || "O(1)",
        },
      });
    }

    // Create optimal code if provided
    if (optimal?.javaCode) {
      await prisma.problemCode.create({
        data: {
          problemId: problem.id,
          approachType: ApproachType.OPTIMAL,
          title: optimal.title || "Optimal Approach",
          explanation: optimal.explanation || "",
          javaCode: optimal.javaCode,
          timeComplexity: optimal.timeComplexity || "O(N)",
          spaceComplexity: optimal.spaceComplexity || "O(1)",
        },
      });
    }

    return NextResponse.json({ problem }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create problem error:", err);
    const message = err instanceof Error ? err.message : "Failed to create problem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
