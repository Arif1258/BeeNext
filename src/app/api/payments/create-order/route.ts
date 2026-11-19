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

    // Check duplicate purchase
    if (type === "BUNDLE") {
      const existing = await prisma.purchase.findFirst({
        where: { userId: user.id, purchaseType: PurchaseType.BUNDLE, status: "COMPLETED" },
      });
      if (existing) {
        return NextResponse.json({ error: "You already own the All-Access DSA Bundle!" }, { status: 400 });
      }

      const bundle = await prisma.bundleConfig.findUnique({ where: { id: "default" } });
      amount = bundle?.price || 1499;
      description = bundle?.title || "All-Access DSA Bundle";
    } else if (type === "CATEGORY") {
      if (!id) return NextResponse.json({ error: "Category ID required." }, { status: 400 });

      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
      if (category.isFree) return NextResponse.json({ error: "This category is already free!" }, { status: 400 });

      // Check if user already owns bundle or this category
      const existing = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          status: "COMPLETED",
          OR: [
            { purchaseType: PurchaseType.BUNDLE },
            { purchaseType: PurchaseType.CATEGORY, categoryId: category.id },
          ],
        },
      });

      if (existing) {
        return NextResponse.json({ error: "You already have access to this category!" }, { status: 400 });
      }

      amount = category.price;
      categoryId = category.id;
      description = `Category: ${category.title}`;
    } else if (type === "PROBLEM") {
      if (!id) return NextResponse.json({ error: "Problem ID required." }, { status: 400 });

      const problem = await prisma.problem.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!problem) return NextResponse.json({ error: "Problem not found." }, { status: 404 });
      if (problem.isFree || problem.category.isFree) {
        return NextResponse.json({ error: "This problem is already free!" }, { status: 400 });
      }

      // Check if user already owns bundle, category, or problem
      const existing = await prisma.purchase.findFirst({
        where: {
          userId: user.id,
          status: "COMPLETED",
          OR: [
            { purchaseType: PurchaseType.BUNDLE },
            { purchaseType: PurchaseType.CATEGORY, categoryId: problem.categoryId },
            { purchaseType: PurchaseType.PROBLEM, problemId: problem.id },
          ],
        },
      });

      if (existing) {
        return NextResponse.json({ error: "You already have access to this problem!" }, { status: 400 });
      }

      amount = problem.price;
      problemId = problem.id;
      description = `Problem: ${problem.title}`;
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
