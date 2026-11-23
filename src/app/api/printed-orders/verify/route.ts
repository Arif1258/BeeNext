import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const {
      printedOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!printedOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required order verification parameters." },
        { status: 400 }
      );
    }

    const order = await prisma.printedOrder.findUnique({
      where: { id: printedOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Printed order record not found." }, { status: 404 });
    }

    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        message: "Order already confirmed.",
      });
    }

    // Replay attack prevention: Ensure payment ID hasn't been used on another completed order
    if (razorpayPaymentId && !razorpayPaymentId.startsWith("pay_mock_")) {
      const existingPayment = await prisma.printedOrder.findFirst({
        where: {
          razorpayPaymentId,
          paymentStatus: "COMPLETED",
          id: { not: printedOrderId },
        },
      });
      if (existingPayment) {
        return NextResponse.json(
          { error: "This payment reference has already been processed for another order." },
          { status: 400 }
        );
      }
    }

    // Cryptographic signature verification
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await prisma.printedOrder.update({
        where: { id: printedOrderId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    // Update payment to COMPLETED while keeping orderStatus as PENDING
    const updated = await prisma.printedOrder.update({
      where: { id: printedOrderId },
      data: {
        paymentStatus: "COMPLETED",
        orderStatus: "PENDING",
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    // Handle certificate qualification if order requires certificate
    if (updated.requiresCertificate && updated.userId) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { certificateClaimedAt: new Date() },
      });
    } else if (updated.userId) {
      const userProfile = await prisma.user.findUnique({
        where: { id: updated.userId },
        select: { dsaQualifiedAt: true, certificateClaimedAt: true },
      });
      if (userProfile?.dsaQualifiedAt && !userProfile.certificateClaimedAt) {
        await Promise.all([
          prisma.printedOrder.update({
            where: { id: updated.id },
            data: { requiresCertificate: true, certificateStatus: "PENDING" },
          }),
          prisma.user.update({
            where: { id: updated.userId },
            data: { certificateClaimedAt: new Date() },
          }),
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: updated.orderNumber,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      totalAmount: updated.totalAmount,
      deliveryCharge: updated.deliveryCharge,
      message: "Payment successfully verified! Your printed DSA notes order is confirmed.",
    });
  } catch (err) {
    console.error("Verify printed order error:", err);
    return NextResponse.json({ error: "Failed to verify printed order." }, { status: 500 });
  }
}
