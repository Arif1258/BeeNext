import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Difficulty, ApproachType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: any = { isPublished: true };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
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
        youtubeUrl: true,
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
          select: {
            id: true,
            approachType: true,
            title: true,
            explanation: true,
            javaCode: true,
            timeComplexity: true,
            spaceComplexity: true,
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
    let {
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
      youtubeUrl,
      isFree = false,
      price = 49,
      order,
      bruteForce,
      optimal,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Problem title is required" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Topic/Category is required" }, { status: 400 });
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Selected category does not exist" }, { status: 400 });
    }

    // Auto-generate slug if not provided
    let finalSlug = slug ? slug.trim() : title.trim();
    finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!finalSlug) finalSlug = `problem-${Date.now().toString().slice(-6)}`;

    // Ensure slug uniqueness
    const existingProblem = await prisma.problem.findUnique({ where: { slug: finalSlug } });
    if (existingProblem) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Default description to title if not provided
    const finalDescription = description?.trim() || title.trim();

    // Validate LeetCode / external problem URL if provided
    if (leetcodeUrl && typeof leetcodeUrl === "string" && leetcodeUrl.trim().length > 0) {
      try {
        const parsed = new URL(leetcodeUrl.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return NextResponse.json({ error: "Problem URL must start with http:// or https://" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid Problem URL format" }, { status: 400 });
      }
    }

    // Validate YouTube URL if provided
    if (youtubeUrl && typeof youtubeUrl === "string" && youtubeUrl.trim().length > 0) {
      const trimmed = youtubeUrl.trim();
      const isYT = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(.*)?$/.test(trimmed);
      if (!isYT) {
        return NextResponse.json(
          { error: "Invalid YouTube URL format. Please provide a valid YouTube watch or share URL." },
          { status: 400 }
        );
      }
    }

    // Auto-calculate order within category if not set
    let finalOrder = typeof order === "number" ? order : 0;
    if (finalOrder === 0) {
      const lastProblem = await prisma.problem.findFirst({
        where: { categoryId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      finalOrder = (lastProblem?.order ?? -1) + 1;
    }

    const problem = await prisma.problem.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        categoryId,
        difficulty: (difficulty as Difficulty) || "MEDIUM",
        description: finalDescription,
        inputFormat: inputFormat?.trim() || null,
        outputFormat: outputFormat?.trim() || null,
        constraints: constraints?.trim() || null,
        examples: examples || [],
        leetcodeUrl: leetcodeUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        isFree: Boolean(isFree),
        price: Number(price) || 0,
        order: finalOrder,
        isPublished: true,
      },
    });

    // Create brute force code if provided
    if (bruteForce?.javaCode && bruteForce.javaCode.trim()) {
      await prisma.problemCode.create({
        data: {
          problemId: problem.id,
          approachType: ApproachType.BRUTE_FORCE,
          title: bruteForce.title?.trim() || "Brute Force Approach",
          explanation: bruteForce.explanation?.trim() || "",
          javaCode: bruteForce.javaCode.trim(),
          timeComplexity: bruteForce.timeComplexity?.trim() || "O(N^2)",
          spaceComplexity: bruteForce.spaceComplexity?.trim() || "O(1)",
        },
      });
    }

    // Create optimal code if provided
    if (optimal?.javaCode && optimal.javaCode.trim()) {
      await prisma.problemCode.create({
        data: {
          problemId: problem.id,
          approachType: ApproachType.OPTIMAL,
          title: optimal.title?.trim() || "Optimal Approach",
          explanation: optimal.explanation?.trim() || "",
          javaCode: optimal.javaCode.trim(),
          timeComplexity: optimal.timeComplexity?.trim() || "O(N)",
          spaceComplexity: optimal.spaceComplexity?.trim() || "O(1)",
        },
      });
    }

    const fullProblem = await prisma.problem.findUnique({
      where: { id: problem.id },
      include: {
        category: true,
        codes: true,
      },
    });

    return NextResponse.json({ problem: fullProblem }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create problem error:", err);
    const message = err instanceof Error ? err.message : "Failed to create problem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
