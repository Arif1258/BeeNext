import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to bookmark problems." }, { status: 401 });
    }

    const { problemId } = await req.json();
    if (!problemId) {
      return NextResponse.json({ error: "Problem ID required" }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          problemId,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (err) {
    console.error("Bookmark toggle error:", err);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
