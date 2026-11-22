import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { PurchaseType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to make a purchase." }, { status: 401 });
    }

    const { type, id } = await req.json();

    if (!type || !["BUNDLE", "CATEGORY", "PROBLEM"].includes(type)) {
      return NextResponse.json({ error: "Invalid purchase type." }, { status: 400 });
    }

    let amount = 0;
    let categoryId: string | null = null;
    let problemId: string | null = null;
    let description = "";

    const bundle = await prisma.bundleConfig.findUnique({ where: { id: "default" } });

    // Check duplicate purchase & configure order
    if (type === "BUNDLE") {
      const existing = await prisma.purchase.findFirst({
        where: { userId: user.id, purchaseType: PurchaseType.BUNDLE, status: "COMPLETED" },
      });
      if (existing) {
        return NextResponse.json({ error: "You already own the Complete Notes PDF!" }, { status: 400 });
      }

      amount = bundle?.price || 299;
      description = bundle?.title || "Complete Striver's A to Z DSA Sheet – Notes PDF";
    } else if (type === "CATEGORY") {
      if (!id) {
        return NextResponse.json({ error: "Topic ID is required." }, { status: 400 });
      }

      const category = await prisma.category.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });

      if (!category) {
        return NextResponse.json({ error: "Topic not found." }, { status: 404 });
      }

      // Check if user already owns full bundle or this specific category
      const existingFull = await prisma.purchase.findFirst({
        where: { userId: user.id, purchaseType: PurchaseType.BUNDLE, status: "COMPLETED" },
      });
      if (existingFull) {
        return NextResponse.json({ error: "You already own the Complete PDF bundle, which includes all topics!" }, { status: 400 });
      }

      const existingCat = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          purchaseType: PurchaseType.CATEGORY,
          categoryId: category.id,
          status: "COMPLETED",
        },
      });
      if (existingCat) {
        return NextResponse.json({ error: `You have already purchased the notes for ${category.title}.` }, { status: 400 });
      }

      categoryId = category.id;
      amount = (bundle as any)?.topicPrice || category.price || 19;
      description = `DSA Notes: ${category.title}`;
    } else {
      return NextResponse.json({ error: "All DSA problem solutions are completely free! Only notes PDFs can be purchased." }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid price configuration." }, { status: 400 });
    }

    // Generate Razorpay order on server
    const receipt = `rcpt_${Date.now()}_${user.id.slice(0, 6)}`;
    const order = await createRazorpayOrder({
      amountInRupees: amount,
      receipt,
      notes: {
        userId: user.id,
        purchaseType: type,
        targetId: id || "bundle",
      },
    });

    // Create pending purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        purchaseType: type as PurchaseType,
        categoryId,
        problemId,
        amount,
        currency: "INR",
        status: "PENDING",
        razorpayOrderId: order.orderId,
      },
    });

    return NextResponse.json({
      purchaseId: purchase.id,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      isMock: order.isMock,
      description,
    });
  } catch (err: unknown) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to initiate payment." }, { status: 500 });
  }
}
