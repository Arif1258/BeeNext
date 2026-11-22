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

    const orders = await prisma.printedOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Admin fetch printed orders error:", err);
    return NextResponse.json({ error: "Failed to fetch printed orders" }, { status: 500 });
  }
}
