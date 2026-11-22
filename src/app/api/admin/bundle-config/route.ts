import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const bundle = await prisma.bundleConfig.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({ bundle });
  } catch (err) {
    console.error("Admin fetch bundle config error:", err);
    return NextResponse.json({ error: "Failed to fetch bundle config" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, originalPrice, topicPrice, pdfUrl, isActive } = body;

    const updated = await prisma.bundleConfig.upsert({
      where: { id: "default" },
      update: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(originalPrice !== undefined ? { originalPrice: Number(originalPrice) } : {}),
        ...(topicPrice !== undefined ? { topicPrice: Number(topicPrice) } : {}),
        ...(pdfUrl ? { pdfUrl } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      create: {
        id: "default",
        title: title || "Complete Striver's A to Z DSA Sheet – Handwritten PDF",
        description:
          description || "Download the complete collection of handwritten DSA notes covering all 20 topics.",
        price: Number(price) || 299,
        originalPrice: Number(originalPrice) || 999,
        topicPrice: Number(topicPrice) || 19,
        pdfUrl: pdfUrl || "/notes/strivers-a2z-dsa-notes.pdf",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    if (topicPrice !== undefined) {
      await prisma.category.updateMany({
        data: { price: Number(topicPrice) },
      });
    }

    return NextResponse.json({ bundle: updated });
  } catch (err) {
    console.error("Admin update bundle config error:", err);
    return NextResponse.json({ error: "Failed to update bundle config" }, { status: 500 });
  }
}
