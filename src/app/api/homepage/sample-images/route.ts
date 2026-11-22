import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await prisma.homepageSampleImage.findMany({
      orderBy: { slotIndex: "asc" },
    });
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Fetch sample images error:", err);
    return NextResponse.json({ error: "Failed to load sample images" }, { status: 500 });
  }
}
