import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { calculateNewExpiry, PlanType } from "@/lib/membership";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const {
      membershipOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required payment verification details." },
        { status: 400 }
      );
    }

    const membershipOrder = await prisma.membershipOrder.findFirst({
      where: {
        OR: [
          membershipOrderId ? { id: membershipOrderId } : {},
          { razorpayOrderId },
        ],
        userId: session.id,
      },
    });

    if (!membershipOrder) {
      return NextResponse.json(
        { error: "Membership order record not found." },
        { status: 404 }
      );
    }

    // Idempotency: if already completed, return immediately
    if (membershipOrder.status === "COMPLETED") {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: {
          membershipType: true,
          membershipPlan: true,
          membershipExpiresAt: true,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Membership already activated.",
        membership: user,
      });
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      await prisma.membershipOrder.update({
        where: { id: membershipOrder.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Invalid payment signature." },
        { status: 400 }
      );
    }

    // Fetch existing user to calculate renewal/extension accurately
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        membershipType: true,
        membershipPlan: true,
        membershipStartedAt: true,
        membershipExpiresAt: true,
      },
    });

    const now = new Date();
    const newExpiresAt = calculateNewExpiry(
      user?.membershipExpiresAt,
      membershipOrder.plan as PlanType
    );
    const startsAt =
      user?.membershipStartedAt &&
      user.membershipType === "PLUS" &&
      user.membershipExpiresAt &&
      user.membershipExpiresAt > now
        ? user.membershipStartedAt
        : now;

    // Execute atomic update
    const [, updatedUser] = await prisma.$transaction([
      prisma.membershipOrder.update({
        where: { id: membershipOrder.id },
        data: {
          status: "COMPLETED",
          razorpayPaymentId,
          razorpaySignature,
          startsAt,
          expiresAt: newExpiresAt,
        },
      }),
      prisma.user.update({
        where: { id: session.id },
        data: {
          membershipType: "PLUS",
          membershipPlan: membershipOrder.plan,
          membershipStartedAt: startsAt,
          membershipExpiresAt: newExpiresAt,
        },
        select: {
          id: true,
          name: true,
          email: true,
          membershipType: true,
          membershipPlan: true,
          membershipStartedAt: true,
          membershipExpiresAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Membership activated successfully!",
      membership: {
        type: updatedUser.membershipType,
        plan: updatedUser.membershipPlan,
        expiresAt: updatedUser.membershipExpiresAt,
        isActivePlus: true,
      },
    });
  } catch (error) {
    console.error("Membership verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify membership payment." },
      { status: 500 }
    );
  }
}
