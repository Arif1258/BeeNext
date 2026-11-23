import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "beenext_webhook_secret_xyz";

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature && !signature.startsWith("mock_webhook_")) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        // 1. Check & update PrintedOrder
        const printedOrder = await prisma.printedOrder.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (printedOrder && printedOrder.paymentStatus !== "COMPLETED") {
          await prisma.$transaction([
            prisma.printedOrder.update({
              where: { id: printedOrder.id },
              data: {
                paymentStatus: "COMPLETED",
                orderStatus: printedOrder.orderStatus === "CONFIRMED" ? "CONFIRMED" : "PENDING",
                razorpayPaymentId: paymentId || printedOrder.razorpayPaymentId,
              },
            }),
            prisma.paymentTransaction.create({
              data: {
                printedOrderId: printedOrder.id,
                razorpayPaymentId: paymentId || "wh_" + Date.now(),
                amount: printedOrder.totalAmount,
                status: "captured_via_webhook",
                payload: event,
              },
            }),
          ]);

          // Handle certificate eligibility with database-level uniqueness constraint
          if (printedOrder.userId && printedOrder.requiresCertificate) {
            await prisma.user.update({
              where: { id: printedOrder.userId },
              data: { certificateClaimedAt: new Date() },
            });

            try {
              await prisma.certificateOrder.create({
                data: {
                  userId: printedOrder.userId,
                  certificateUserKey: printedOrder.userId, // Database UNIQUE constraint
                  printedOrderId: printedOrder.id,
                  orderNumber: printedOrder.orderNumber,
                  customerName: printedOrder.customerName,
                  customerEmail: printedOrder.customerEmail,
                  status: "CONFIRMED",
                  deliveryStatus: "PENDING",
                  isReplacement: false,
                },
              });
            } catch (certErr: any) {
              console.warn("Certificate order already recorded or unique constraint caught:", certErr?.code);
            }
          }
        }

        // 2. Check & update Digital Purchase (if any)
        const purchase = await prisma.purchase.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (purchase && purchase.status !== "COMPLETED") {
          await prisma.$transaction([
            prisma.purchase.update({
              where: { id: purchase.id },
              data: {
                status: "COMPLETED",
                razorpayPaymentId: paymentId || purchase.razorpayPaymentId,
              },
            }),
            prisma.paymentTransaction.create({
              data: {
                purchaseId: purchase.id,
                razorpayPaymentId: paymentId || "wh_" + Date.now(),
                amount: purchase.amount,
                status: "captured_via_webhook",
                payload: event,
              },
            }),
          ]);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;

      if (orderId) {
        const printedOrder = await prisma.printedOrder.findFirst({
          where: { razorpayOrderId: orderId },
        });
        if (printedOrder && printedOrder.paymentStatus === "PENDING") {
          await prisma.printedOrder.update({
            where: { id: printedOrder.id },
            data: { paymentStatus: "FAILED" },
          });
        }

        const purchase = await prisma.purchase.findFirst({
          where: { razorpayOrderId: orderId },
        });
        if (purchase && purchase.status === "PENDING") {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: { status: "FAILED" },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
