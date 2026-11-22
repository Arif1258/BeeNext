import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    // Securely fetch only the currently logged in user's orders
    const orders = await prisma.printedOrder.findMany({
      where: {
        OR: [
          { userId: session.id },
          { customerEmail: session.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        productTitle: true,
        quantity: true,
        unitPrice: true,
        totalAmount: true,
        currency: true,
        paymentStatus: true,
        orderStatus: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        trackingNumber: true,
        carrier: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Fetch user orders error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve orders." },
      { status: 500 }
    );
  }
}
