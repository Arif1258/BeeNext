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

    // Handle physical certificate creation with database-level uniqueness constraint
    if (updated.requiresCertificate && updated.userId) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { certificateClaimedAt: new Date() },
      });

      try {
        await prisma.certificateOrder.create({
          data: {
            userId: updated.userId,
            certificateUserKey: updated.userId, // Database UNIQUE constraint
            printedOrderId: updated.id,
            orderNumber: updated.orderNumber,
            customerName: updated.customerName,
            customerEmail: updated.customerEmail,
            status: "CONFIRMED",
            deliveryStatus: "PENDING",
            isReplacement: false,
          },
        });
      } catch (certErr: any) {
        console.warn("Certificate order already recorded or unique constraint caught:", certErr?.code);
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
