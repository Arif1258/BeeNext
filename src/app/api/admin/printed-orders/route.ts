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

    const membershipOrders = await prisma.membershipOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const printedOrders = await prisma.printedOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const formattedMembershipOrders = membershipOrders.map((m) => ({
      id: m.id,
      orderNumber: m.razorpayOrderId || `BN-MEM-${m.id.slice(-6).toUpperCase()}`,
      customerName: m.user?.name || "Subscriber",
      customerEmail: m.user?.email || "N/A",
      membershipPlan: m.plan, // "YEARLY" | "MONTHLY"
      productTitle: m.plan === "YEARLY" ? "BeeNext Plus (Yearly Plan)" : "BeeNext Plus (Monthly Plan)",
      totalAmount: m.amount,
      paymentStatus: (m.status === "COMPLETED" ? "COMPLETED" : m.status === "FAILED" ? "FAILED" : "PENDING") as "PENDING" | "COMPLETED" | "FAILED",
      paymentMethod: m.razorpayPaymentId ? "Razorpay" : "Admin Granted",
      razorpayOrderId: m.razorpayOrderId || null,
      razorpayPaymentId: m.razorpayPaymentId || null,
      isManualGrant: !m.razorpayPaymentId,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    }));

    const formattedPrintedOrders = printedOrders.map((p) => ({
      id: p.id,
      orderNumber: p.orderNumber,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      membershipPlan: "YEARLY",
      productTitle: p.productTitle,
      totalAmount: p.totalAmount,
      paymentStatus: (p.paymentStatus === "COMPLETED" ? "COMPLETED" : p.paymentStatus === "FAILED" ? "FAILED" : "PENDING") as "PENDING" | "COMPLETED" | "FAILED",
      paymentMethod: p.paymentMethod || "Razorpay",
      razorpayOrderId: p.razorpayOrderId || null,
      razorpayPaymentId: p.razorpayPaymentId || null,
      isManualGrant: !p.razorpayPaymentId,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
    }));

    const orders = [...formattedMembershipOrders, ...formattedPrintedOrders];

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Admin fetch printed orders error:", err);
    return NextResponse.json({ error: "Failed to fetch printed orders" }, { status: 500 });
  }
}
