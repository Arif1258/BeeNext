import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { TOPIC_BOOK_PRICES, PRICING, getCsFundamentalPrice } from "@/lib/pricing";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface OrderItemInput {
  id?: string;
  slug?: string;
  productType?: "COMPLETE_BOOK" | "TOPIC" | "CS_FUNDAMENTAL" | "CERTIFICATE";
  title?: string;
  language?: string;
  quantity?: number;
  categoryId?: string;
}

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
      items: rawItems,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json(
        { error: "Please fill in all required shipping address and contact fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Parse and validate items array
    const itemsList: OrderItemInput[] = Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems
      : [
          {
            slug: body.topicSlug || "full-dsa-book",
            productType: body.productType || "COMPLETE_BOOK",
            title: body.productTitle || "Full DSA Book",
            language: body.language,
            quantity: body.quantity || 1,
            categoryId: body.categoryId,
          },
        ];

    // Identify target user ID early for one-time verification
    let targetUserId = user ? user.id : null;
    if (!targetUserId && customerEmail) {
      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: customerEmail.trim(), mode: "insensitive" } },
        select: { id: true },
      });
      if (existingUser) targetUserId = existingUser.id;
    }

    // Check if the request explicitly asks for a physical certificate
    const hasCertificateItem = itemsList.some(
      (it) =>
        it.productType === "CERTIFICATE" ||
        it.slug === "physical-certificate" ||
        (it.slug && it.slug.includes("certificate")) ||
        (it.title && it.title.toLowerCase().includes("certificate"))
    );

    const explicitlyRequestedCert =
      hasCertificateItem || Boolean(body.requiresCertificate) || Boolean(body.claimCertificate);

    // Filter book items (Complete Book, CS Fundamentals, or Topic Books)
    const bookItems = itemsList.filter(
      (it) =>
        it.productType !== "CERTIFICATE" &&
        it.slug !== "physical-certificate" &&
        !(it.slug && it.slug.includes("certificate")) &&
        !(it.title && it.title.toLowerCase().includes("certificate"))
    );

    // Requirement 1: Make Physical Certificate Completely Free.
    // The physical certificate cannot be ordered or checked out separately.
    // It must be included inside a physical book order at no extra cost.
    if (bookItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "Physical certificates cannot be ordered separately. Eligible customers (85%+ DSA sheet completed) automatically receive a free physical certificate included with any physical book order.",
        },
        { status: 400 }
      );
    }

    // One-Time Physical Certificate Restriction & Direct API Bypass Prevention
    if (targetUserId) {
      const [existingClaim, existingCertOrder] = await Promise.all([
        prisma.user.findUnique({
          where: { id: targetUserId },
          select: { certificateClaimedAt: true, dsaQualifiedAt: true },
        }),
        prisma.certificateOrder.findFirst({
          where: { userId: targetUserId, status: "CONFIRMED" },
        }),
      ]);

      const hasAlreadyClaimed = Boolean(existingClaim?.certificateClaimedAt || existingCertOrder);

      // Scenario 6: Direct API attempt to claim a second certificate is rejected
      if (hasAlreadyClaimed && explicitlyRequestedCert) {
        return NextResponse.json(
          {
            error:
              "You have already received your free physical certificate. This benefit is available only once per customer.",
          },
          { status: 400 }
        );
      }
    }

    // Compute verified prices on backend
    const verifiedItems: Array<{
      slug: string;
      productType: string;
      title: string;
      language?: string;
      quantity: number;
      unitPrice: number;
      totalItemPrice: number;
    }> = [];

    let calculatedTotal = 0;
    let totalQuantity = 0;

    for (const it of itemsList) {
      const qty = Math.max(1, Math.min(10, parseInt(String(it.quantity), 10) || 1));
      totalQuantity += qty;

      let verifiedPrice = 1499; // fallback default
      let itemTitle = it.title || "DSA Book";
      const pType = it.productType || "COMPLETE_BOOK";
      const slug = (it.slug || "").toLowerCase();
      const lang = it.language?.trim();
      const langSuffix = lang ? ` (${lang})` : "";

      if (pType === "COMPLETE_BOOK" || slug.includes("full-dsa") || slug.includes("complete")) {
        verifiedPrice = PRICING.COMPLETE_BOOK.price; // 1499
        itemTitle = `Full DSA Book${langSuffix} (All 20 Topics, ~500 Pages)`;
      } else if (pType === "CERTIFICATE" || slug === "physical-certificate" || slug.includes("certificate") || (it.title && it.title.toLowerCase().includes("certificate"))) {
        verifiedPrice = 0; // 100% Free Physical Certificate
        itemTitle = "BeeNext Physical Certificate of Achievement (Free)";
      } else if (pType === "CS_FUNDAMENTAL" || getCsFundamentalPrice(slug || it.title)) {
        const cs = getCsFundamentalPrice(slug || it.title);
        verifiedPrice = cs?.price || 149;
        itemTitle = cs?.title ? `${cs.title}${langSuffix}` : `${it.title || "CS Fundamental"}${langSuffix}`;
      } else {
        // Individual topic book
        if (slug && TOPIC_BOOK_PRICES[slug]) {
          verifiedPrice = TOPIC_BOOK_PRICES[slug];
        } else if (it.categoryId) {
          const cat = await prisma.category.findUnique({
            where: { id: it.categoryId },
            select: { price: true, slug: true, title: true },
          });
          if (cat) {
            verifiedPrice = (cat.slug && TOPIC_BOOK_PRICES[cat.slug]) || cat.price || 89;
            itemTitle = `${cat.title}${langSuffix} – Book`;
          }
        }
      }

      const totalItemPrice = verifiedPrice * qty;
      calculatedTotal += totalItemPrice;

      verifiedItems.push({
        slug: slug || "book",
        productType: pType,
        title: itemTitle,
        language: lang,
        quantity: qty,
        unitPrice: verifiedPrice,
        totalItemPrice,
      });
    }

    if (calculatedTotal <= 0) {
      return NextResponse.json({ error: "Invalid order price calculation." }, { status: 400 });
    }

    const deliveryCharge = 0; // Free Doorstep Delivery across India
    const totalAmount = calculatedTotal + deliveryCharge;

    // Generate Human-Readable Unique Order ID
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const isTest = Boolean(
      body.isTest ||
      customerName.toUpperCase().includes("TEST") ||
      (notes && notes.toUpperCase().includes("TEST"))
    );
    const orderPrefix = isTest ? "BN-TEST" : "BN-ORD";
    const orderNumber = `${orderPrefix}-${timestamp}-${randomDigits}`;

    // Overall product title summary for order
    const primaryTitle = verifiedItems.length === 1
      ? verifiedItems[0].title
      : `${verifiedItems[0].title} + ${verifiedItems.length - 1} other ${verifiedItems.length - 1 === 1 ? "book" : "books"}`;

    // Create Razorpay Order
    const receipt = `rc_${orderNumber.slice(-10)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: totalAmount,
      receipt,
      notes: {
        orderNumber,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: cleanPhone,
        userId: user ? user.id : "guest",
        itemsCount: String(totalQuantity),
      },
    });

    // Check certificate qualification for physical book orders
    let requiresCertificate = false;
    let certificateStatus: string | null = null;

    if (targetUserId) {
      const userProfile = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { dsaQualifiedAt: true, certificateClaimedAt: true },
      });

      const existingCertOrder = await prisma.certificateOrder.findFirst({
        where: { userId: targetUserId, status: "CONFIRMED" },
      });

      const hasAlreadyClaimed = Boolean(userProfile?.certificateClaimedAt || existingCertOrder);

      if (!hasAlreadyClaimed) {
        // Calculate exact DSA completion ratio
        const [totalProblems, completedProblems] = await Promise.all([
          prisma.problem.count({ where: { isPublished: true } }),
          prisma.userProgress.count({
            where: { userId: targetUserId, status: ProgressStatus.COMPLETED },
          }),
        ]);

        const completionRatio = totalProblems > 0 ? completedProblems / totalProblems : 0;
        const is85Completed = completionRatio >= 0.85;

        if (is85Completed) {
          // Automatic free physical certificate inclusion with book shipment
          requiresCertificate = true;
          certificateStatus = "PENDING";
          if (!userProfile?.dsaQualifiedAt) {
            await prisma.user.update({
              where: { id: targetUserId },
              data: { dsaQualifiedAt: new Date() },
            });
          }
        } else if (explicitlyRequestedCert) {
          return NextResponse.json(
            {
              error: `You must complete at least 85% of the DSA sheet to qualify for the free physical certificate. Current progress: ${Math.round(completionRatio * 100)}%.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Save PrintedOrder in database with status PENDING
    const printedOrder = await prisma.printedOrder.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: cleanPhone,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        notes: notes ? notes.trim() : null,
        language: verifiedItems[0]?.language || null,
        productTitle: primaryTitle,
        quantity: totalQuantity,
        unitPrice: verifiedItems[0]?.unitPrice || calculatedTotal,
        deliveryCharge,
        totalAmount,
        currency: "INR",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        razorpayOrderId: razorpayOrder.orderId,
        items: verifiedItems as any,
        requiresCertificate,
        certificateStatus,
      },
    });

    return NextResponse.json({
      printedOrderId: printedOrder.id,
      orderNumber: printedOrder.orderNumber,
      razorpayOrderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount * 100, // amount in paise for Razorpay
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
      isMock: razorpayOrder.isMock,
      totalAmount,
      deliveryCharge,
      quantity: totalQuantity,
      productTitle: primaryTitle,
      items: verifiedItems,
    });
  } catch (err: any) {
    console.error("Create checkout order error:", err);
    return NextResponse.json({ error: "Failed to initiate checkout order." }, { status: 500 });
  }
}
