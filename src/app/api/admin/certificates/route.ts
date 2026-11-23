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

    const certificateOrders = await prisma.certificateOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            certificateClaimedAt: true,
          },
        },
        printedOrder: {
          select: {
            id: true,
            orderNumber: true,
            productTitle: true,
            orderStatus: true,
            paymentStatus: true,
            trackingNumber: true,
            carrier: true,
          },
        },
      },
    });

    return NextResponse.json({ certificateOrders });
  } catch (err) {
    console.error("Fetch admin certificates error:", err);
    return NextResponse.json({ error: "Failed to fetch certificate orders" }, { status: 500 });
  }
}
