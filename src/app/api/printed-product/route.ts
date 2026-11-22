import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let config = await prisma.printedProductConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.printedProductConfig.create({
        data: {
          id: "default",
          title: "Complete Printed DSA Notes – Striver's A to Z Sheet",
          description: "Get the complete collection of DSA notes with computer-written Java solutions in printed physical format, delivered to your doorstep.",
          price: 1499,
          originalPrice: 3999,
          deliveryCharge: 0,
          isFreeShipping: true,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ config });
  } catch (err) {
    console.error("Fetch printed product config error:", err);
    return NextResponse.json({ error: "Failed to load printed product details" }, { status: 500 });
  }
}
