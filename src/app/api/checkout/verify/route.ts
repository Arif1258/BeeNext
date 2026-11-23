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
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const order = await prisma.printedOrder.findUnique({
      where: { id: printedOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order record not found." }, { status: 404 });
    }

    // Duplicate payment prevention: Check if already completed
    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        message: "Payment for this order has already been successfully verified and confirmed.",
      });
    }

    // Replay attack prevention: Ensure payment ID hasn't been used on a different completed order
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

      const existingTx = await prisma.paymentTransaction.findFirst({
        where: {
          razorpayPaymentId,
          printedOrderId: { not: printedOrderId },
        },
      });
      if (existingTx) {
        return NextResponse.json(
          { error: "This payment reference has already been processed for another transaction." },
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

    // Atomic transaction: Update order status & record transaction
    const [updated] = await prisma.$transaction([
      prisma.printedOrder.update({
        where: { id: printedOrderId },
        data: {
          paymentStatus: "COMPLETED",
          orderStatus: "PENDING",
          razorpayPaymentId,
          razorpaySignature,
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          printedOrderId: order.id,
          razorpayPaymentId,
          amount: order.totalAmount,
          status: "captured",
          payload: {
            orderNumber: order.orderNumber,
            razorpayOrderId,
            razorpayPaymentId,
            verifiedAt: new Date().toISOString(),
          },
        },
      }),
    ]);

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
    } else if (updated.userId) {
      const userProfile = await prisma.user.findUnique({
        where: { id: updated.userId },
        select: { dsaQualifiedAt: true, certificateClaimedAt: true },
      });
      const existingCert = await prisma.certificateOrder.findFirst({
        where: { userId: updated.userId, status: "CONFIRMED" },
      });
      if (userProfile?.dsaQualifiedAt && !userProfile.certificateClaimedAt && !existingCert) {
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
          console.warn("Certificate order already recorded:", certErr?.code);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: updated.orderNumber,
      customerName: updated.customerName,
      customerEmail: updated.customerEmail,
      totalAmount: updated.totalAmount,
      deliveryCharge: updated.deliveryCharge,
      message: "Payment successfully verified! Your BeeNext book order is confirmed.",
    });
  } catch (err: any) {
    console.error("Verify checkout order error:", err);
    return NextResponse.json({ error: "Failed to verify order payment." }, { status: 500 });
  }
}
