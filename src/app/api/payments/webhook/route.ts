import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "beenext_webhook_secret_xyz";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
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
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
