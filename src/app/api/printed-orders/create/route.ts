import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { PRICING, getTopicPrice, getBookPrice, getCsFundamentalPrice } from "@/lib/pricing";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = "India",
      notes,
      productType = "COMPLETE_BOOK", // "COMPLETE_BOOK" | "TOPIC"
      topicSlug,
      categoryId,
      quantity = 1,
      language,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: "Please fill in all required shipping address and contact fields." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    // Phone validation (at least 10 digits)
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
    }

    // Quantity validation (1 to 10)
    const orderQty = Math.max(1, Math.min(10, parseInt(String(quantity), 10) || 1));

    let productTitle: string;
    let unitPrice: number;
    let selectedTopicSlug: string | null = null;

    const csBook = getCsFundamentalPrice(topicSlug || body.productTitle || categoryId);

    if (productType === "CS_FUNDAMENTAL" || csBook) {
      const book = csBook || {
        slug: topicSlug || "book",
        title: body.productTitle || "Book",
        price: 119,
        originalPrice: 249,
        subtitle: "Computer Science reference book",
      };
      unitPrice = book.price;
      selectedTopicSlug = book.slug;
      const langText = language ? ` (${language})` : "";
      const baseTitle = book.title.toLowerCase().includes("book")
        ? book.title
        : `${book.title} – Book`;
      productTitle = `${baseTitle}${langText}`;
    } else if (productType === "TOPIC" || topicSlug || categoryId) {
      // Individual Topic Notes Sheets
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            ...(categoryId ? [{ id: categoryId }] : []),
            ...(topicSlug ? [{ slug: topicSlug }] : []),
          ],
        },
      });

      if (!category) {
        return NextResponse.json({ error: "Selected topic not found." }, { status: 404 });
      }

      selectedTopicSlug = category.slug;
      unitPrice = getTopicPrice(category);
      const langText = language ? ` (${language})` : "";
      productTitle = `${category.title}${langText} – Book`;
    } else {
      // Complete DSA Book (₹1,499 across all programming languages)
      unitPrice = 1499;
      const langText = language ? ` (${language})` : "";
      productTitle = `Full DSA Book${langText} (All 20 Topics, ~500 Pages)`;
    }

    const deliveryCharge = 0; // Free doorstep delivery across India
    const totalAmount = unitPrice * orderQty + deliveryCharge;

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid product price calculation." }, { status: 400 });
    }

    // Unique Human-readable order number
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const isTest = Boolean(
      body.isTest ||
      (notes && notes.toUpperCase().includes("TEST")) ||
      customerName.includes("[TEST]") ||
      customerName.toUpperCase().includes("TEST")
    );
    const orderPrefix = isTest ? "BN-TEST" : "BN-PRINT";
    const orderNumber = `${orderPrefix}-${timestamp}-${randomDigits}`;

    // Create Razorpay Order
    const receipt = `pt_${orderNumber.slice(-10)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: totalAmount,
      receipt,
      notes: {
        orderType: productType === "TOPIC" ? "TOPIC_PRINTED_SHEETS" : "PRINTED_BOOK",
        orderNumber,
        customerEmail,
        customerPhone,
        userId: user ? user.id : "guest",
        topicSlug: selectedTopicSlug || "all-topics",
        language: language ? String(language).trim() : "None",
        quantity: String(orderQty),
      },
    });

    // Check if customer qualifies for a one-time physical certificate
    let requiresCertificate = false;
    let certificateStatus: string | null = null;

    let targetUserId = user ? user.id : null;
    if (!targetUserId && customerEmail) {
      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: customerEmail.trim(), mode: "insensitive" } },
        select: { id: true },
      });
      if (existingUser) {
        targetUserId = existingUser.id;
      }
    }

    if (targetUserId) {
      const userProfile = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          dsaQualifiedAt: true,
          certificateClaimedAt: true,
        },
      });

      if (userProfile && !userProfile.certificateClaimedAt) {
        let isQualified = Boolean(userProfile.dsaQualifiedAt);
        if (!isQualified) {
          const [totalProblems, completedProblems] = await Promise.all([
            prisma.problem.count({ where: { isPublished: true } }),
            prisma.userProgress.count({
              where: { userId: targetUserId, status: ProgressStatus.COMPLETED },
            }),
          ]);
          if (totalProblems > 0 && completedProblems / totalProblems >= 0.85) {
            isQualified = true;
            await prisma.user.update({
              where: { id: targetUserId },
              data: { dsaQualifiedAt: new Date() },
            });
          }
        }

        if (isQualified) {
          requiresCertificate = true;
          certificateStatus = "PENDING";
        }
      }
    }

    // Save PrintedOrder in database with PENDING status
    const printedOrder = await prisma.printedOrder.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        notes: notes
          ? `${notes.trim()}${selectedTopicSlug ? ` [Topic: ${selectedTopicSlug}]` : ""}${language ? ` [Language: ${language}]` : ""}`
          : (selectedTopicSlug ? `[Topic: ${selectedTopicSlug}]` : (language ? `[Language: ${language}]` : null)),
        language: language ? String(language).trim() : null,
        productTitle,
        quantity: orderQty,
        unitPrice,
        deliveryCharge,
        totalAmount,
        currency: "INR",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        razorpayOrderId: razorpayOrder.orderId,
        requiresCertificate,
        certificateStatus,
      },
    });

    return NextResponse.json({
      printedOrderId: printedOrder.id,
      orderNumber: printedOrder.orderNumber,
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
      isMock: razorpayOrder.isMock,
      totalAmount,
      deliveryCharge,
      unitPrice,
      quantity: orderQty,
      productTitle,
      language: printedOrder.language,
    });
  } catch (err) {
    console.error("Create printed order error:", err);
    return NextResponse.json({ error: "Failed to initiate physical notes order." }, { status: 500 });
  }
}
