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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        printedOrders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            paymentStatus: true,
            orderStatus: true,
            createdAt: true,
          },
        },
        purchases: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            purchaseType: true,
            amount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            printedOrders: true,
            purchases: true,
            progress: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users list error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
