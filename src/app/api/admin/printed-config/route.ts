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

    const config = await prisma.printedProductConfig.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({ config });
  } catch (err) {
    console.error("Admin fetch printed config error:", err);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, originalPrice, deliveryCharge, isFreeShipping, isActive } = body;

    const updated = await prisma.printedProductConfig.upsert({
      where: { id: "default" },
      update: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(originalPrice !== undefined ? { originalPrice: Number(originalPrice) } : {}),
        ...(deliveryCharge !== undefined ? { deliveryCharge: Number(deliveryCharge) } : {}),
        ...(isFreeShipping !== undefined ? { isFreeShipping: Boolean(isFreeShipping) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      create: {
        id: "default",
        title: title || "Complete Printed DSA Notes – Striver's A to Z Sheet",
        description: description || "Get the complete collection of handwritten DSA notes in printed physical format, delivered to your doorstep.",
        price: Number(price) || 1499,
        originalPrice: Number(originalPrice) || 3999,
        deliveryCharge: Number(deliveryCharge) || 0,
        isFreeShipping: Boolean(isFreeShipping),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ config: updated });
  } catch (err) {
    console.error("Admin update printed config error:", err);
    return NextResponse.json({ error: "Failed to update printed config" }, { status: 500 });
  }
}
