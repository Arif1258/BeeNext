import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProblems = searchParams.get("includeProblems") === "true";

    const categories = await prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { problems: true },
        },
        ...(includeProblems
          ? {
              problems: {
                where: { isPublished: true },
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  difficulty: true,
                  isFree: true,
                  price: true,
                  order: true,
                  leetcodeUrl: true,
                  notes: {
                    select: {
                      id: true,
                      title: true,
                      fileType: true,
                      fileUrl: true,
                      pageCount: true,
                      isProtected: true,
                    },
                  },
                  _count: {
                    select: { notes: true },
                  },
                },
              },
            }
          : {}),
      },
    });

    const bundle = await prisma.bundleConfig.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json(
      { categories, bundle },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Categories fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { title, slug, description, isFree, price, order } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

    const category = await prisma.category.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        description: description?.trim() || "",
        isFree: Boolean(isFree),
        price: Number(price) || 0,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create category error:", err);
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
