import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { purchaseId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!purchaseId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required payment verification details." }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase || purchase.userId !== user.id) {
      return NextResponse.json({ error: "Purchase record not found." }, { status: 404 });
    }

    if (purchase.status === "COMPLETED") {
      return NextResponse.json({ success: true, message: "Purchase already completed." });
    }

    // Cryptographic signature check
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    // Mark as completed and record transaction
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "COMPLETED",
          razorpayPaymentId,
          razorpaySignature,
        },
      }),
      prisma.paymentTransaction.create({
        data: {
          purchaseId: purchase.id,
          razorpayPaymentId,
          amount: purchase.amount,
          status: "captured",
          payload: {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            verifiedAt: new Date().toISOString(),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Your notes are now unlocked.",
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
