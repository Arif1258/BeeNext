import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let bundle = await prisma.bundleConfig.findUnique({
      where: { id: "default" },
    });

    if (!bundle) {
      bundle = await prisma.bundleConfig.create({
        data: {
          id: "default",
          title: "Complete Striver's A to Z DSA Sheet – Notes PDF",
          description:
            "Download the complete collection of DSA notes covering all 20 topics.",
          price: 299,
          originalPrice: 999,
          topicPrice: 19,
          pdfUrl: "/notes/strivers-a2z-dsa-notes.pdf",
          isActive: true,
        },
      });
    }

    return NextResponse.json({ bundle });
  } catch (err) {
    console.error("Fetch bundle error:", err);
    return NextResponse.json({ error: "Failed to fetch bundle config" }, { status: 500 });
  }
}
