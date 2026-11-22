import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch real full book orders (exclude test-mode orders, test names, cancelled)
    const orders = await prisma.printedOrder.findMany({
      where: {
        paymentMethod: { not: "TEST_MODE" },
        orderNumber: { not: { contains: "TEST" } },
        customerName: { not: { contains: "[TEST]" } },
        orderStatus: { not: "CANCELLED" },
        OR: [
          { productTitle: { contains: "Book", mode: "insensitive" } },
          { productTitle: { contains: "Complete", mode: "insensitive" } },
        ],
      },
      select: {
        language: true,
        quantity: true,
        productTitle: true,
      },
    });

    const byLanguage: Record<string, number> = {
      C: 0,
      "C++": 0,
      Java: 0,
      Python: 0,
    };

    let totalBooks = 0;
    for (const order of orders) {
      const qty = order.quantity || 1;
      totalBooks += qty;
      const lang = order.language?.trim();
      if (lang && byLanguage[lang] !== undefined) {
        byLanguage[lang] += qty;
      } else if (order.productTitle) {
        if (order.productTitle.includes("C++")) byLanguage["C++"] += qty;
        else if (/\bC\b/.test(order.productTitle)) byLanguage["C"] += qty;
        else if (/Java\b/i.test(order.productTitle)) byLanguage["Java"] += qty;
        else if (/Python\b/i.test(order.productTitle)) byLanguage["Python"] += qty;
      }
    }

    // 2. Fetch genuine customer ratings and reviews from the database
    const ratingsRaw = await prisma.bookRating.groupBy({
      by: ["language"],
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratings: Record<string, { average: number | null; count: number }> = {
      C: { average: null, count: 0 },
      "C++": { average: null, count: 0 },
      Java: { average: null, count: 0 },
      Python: { average: null, count: 0 },
    };

    for (const r of ratingsRaw) {
      const lang = r.language?.trim();
      if (lang && ratings[lang]) {
        ratings[lang] = {
          average: r._avg.rating ? Math.round(r._avg.rating * 10) / 10 : null,
          count: r._count.rating || 0,
        };
      }
    }

    return NextResponse.json({
      totalPurchased: {
        total: totalBooks,
        byLanguage,
      },
      ratings,
    });
  } catch (err) {
    console.error("Error fetching full book stats:", err);
    return NextResponse.json(
      {
        totalPurchased: {
          total: 0,
          byLanguage: { C: 0, "C++": 0, Java: 0, Python: 0 },
        },
        ratings: {
          C: { average: null, count: 0 },
          "C++": { average: null, count: 0 },
          Java: { average: null, count: 0 },
          Python: { average: null, count: 0 },
        },
      },
      { status: 200 }
    );
  }
}
