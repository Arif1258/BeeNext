import React from "react";
import prisma from "@/lib/prisma";
import PurchaseClient from "@/components/PurchaseClient";

export const dynamic = "force-dynamic";

interface PurchaseMainPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function PurchaseMainPage({ searchParams }: PurchaseMainPageProps) {
  const [categories, printedConfig, fullBookOrders, ratingsRaw, allCompletedPrintedOrders] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        order: true,
        price: true,
        description: true,
        _count: {
          select: { problems: true },
        },
      },
    }),
    prisma.printedProductConfig.findUnique({
      where: { id: "default" },
      select: {
        title: true,
        description: true,
        price: true,
        originalPrice: true,
      },
    }),
    prisma.printedOrder.findMany({
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
    }),
    prisma.bookRating.groupBy({
      by: ["language"],
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.printedOrder.findMany({
      where: {
        paymentStatus: "COMPLETED",
        paymentMethod: { not: "TEST_MODE" },
        orderNumber: { not: { contains: "TEST" } },
        customerName: { not: { contains: "[TEST]" } },
        orderStatus: { not: "CANCELLED" },
      },
      select: {
        productTitle: true,
        notes: true,
        quantity: true,
      },
    }),
  ]);

  const byLanguage: Record<string, number> = {
    C: 0,
    "C++": 0,
    Java: 0,
    Python: 0,
  };
  let totalBooks = 0;
  for (const o of fullBookOrders) {
    const qty = o.quantity || 1;
    totalBooks += qty;
    const lang = o.language?.trim();
    if (lang && byLanguage[lang] !== undefined) {
      byLanguage[lang] += qty;
    } else if (o.productTitle) {
      if (o.productTitle.includes("C++")) byLanguage["C++"] += qty;
      else if (/\bC\b/.test(o.productTitle)) byLanguage["C"] += qty;
      else if (/Java\b/i.test(o.productTitle)) byLanguage["Java"] += qty;
      else if (/Python\b/i.test(o.productTitle)) byLanguage["Python"] += qty;
    }
  }

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

  // Database-backed real sold counts per product
  const salesCounts: Record<string, number> = {
    topicWise: 0,
    fullBook: 0,
    oops: 0,
    cn: 0,
    dbms: 0,
    os: 0,
    sql: 0,
    mongodb: 0,
  };

  for (const o of allCompletedPrintedOrders) {
    const qty = o.quantity || 1;
    const title = (o.productTitle || "").toLowerCase();
    const notes = (o.notes || "").toLowerCase();

    if (title.includes("oops") || notes.includes("oops")) {
      salesCounts.oops += qty;
    } else if (title.includes("network") || notes.includes("network")) {
      salesCounts.cn += qty;
    } else if (title.includes("dbms") || notes.includes("dbms")) {
      salesCounts.dbms += qty;
    } else if (title.includes("operating") || notes.includes("operating") || notes.includes("topic: operating-systems")) {
      salesCounts.os += qty;
    } else if (title.includes("sql") || notes.includes("sql")) {
      salesCounts.sql += qty;
    } else if (title.includes("mongo") || notes.includes("mongo")) {
      salesCounts.mongodb += qty;
    } else if (title.includes("full dsa") || title.includes("complete")) {
      salesCounts.fullBook += qty;
    } else if (notes.includes("topic:") || title.includes("– book") || title.includes("- book")) {
      salesCounts.topicWise += qty;
    }
  }

  const targetTopic = typeof searchParams?.topic === "string" ? searchParams.topic : undefined;
  const optionParam = typeof searchParams?.option === "string" ? searchParams.option.toLowerCase() : undefined;
  const initialOption = targetTopic
    ? "TOPIC_WISE"
    : optionParam === "book"
    ? "FULL_BOOK"
    : optionParam === "topics" || optionParam === "topic"
    ? "TOPIC_WISE"
    : null;

  return (
    <PurchaseClient
      categories={categories}
      bookConfig={printedConfig}
      initialOption={initialOption}
      initialTargetTopic={targetTopic}
      initialTotalPurchased={{ total: totalBooks, byLanguage }}
      initialRatings={ratings}
      initialSalesCounts={salesCounts}
    />
  );
}
