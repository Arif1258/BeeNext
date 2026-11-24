import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { MEMBERSHIP_PLANS, PlanType } from "@/lib/membership";
import { MembershipPlan } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to choose a membership plan." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const plan = (body.plan as PlanType)?.toUpperCase() as MembershipPlan;

    if (!plan || !["MONTHLY", "YEARLY"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid membership plan selected." },
        { status: 400 }
      );
    }

    const planConfig = MEMBERSHIP_PLANS[plan as PlanType];
    const amount = planConfig.price;

    const receipt = `mem_${session.id.slice(0, 8)}_${Date.now()}`.slice(0, 40);

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amountInRupees: amount,
      receipt,
      notes: {
        userId: session.id,
        userEmail: session.email,
        plan,
        type: "MEMBERSHIP",
      },
    });

    // Save pending membership order
    const membershipOrder = await prisma.membershipOrder.create({
      data: {
        userId: session.id,
        plan,
        amount,
        currency: "INR",
        status: "PENDING",
        razorpayOrderId: orderResult.orderId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      membershipOrderId: membershipOrder.id,
      amount: orderResult.amount,
      currency: orderResult.currency,
      keyId: orderResult.keyId,
      isMock: orderResult.isMock,
      plan,
    });
  } catch (error) {
    console.error("Membership create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create membership order." },
      { status: 500 }
    );
  }
}
