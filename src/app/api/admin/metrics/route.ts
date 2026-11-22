import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const [
      totalUsers,
      totalProblems,
      actualPrintedOrdersCount,
      testPrintedOrdersCount,
      digitalPurchasesCount,
      printedRevenueAggregate,
      digitalRevenueAggregate,
      recentPrintedOrders,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count({ where: { isPublished: true } }),
      // Exclude test orders from real customer order counts
      prisma.printedOrder.count({
        where: {
          NOT: {
            orderNumber: { contains: "TEST" },
          },
        },
      }),
      // Count test orders specifically
      prisma.printedOrder.count({
        where: {
          orderNumber: { contains: "TEST" },
        },
      }),
      prisma.purchase.count({ where: { status: "COMPLETED" } }),
      // Exclude test orders from revenue calculations
      prisma.printedOrder.aggregate({
        where: {
          paymentStatus: "COMPLETED",
          NOT: {
            orderNumber: { contains: "TEST" },
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.printedOrder.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          productTitle: true,
          totalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalOrders = actualPrintedOrdersCount + digitalPurchasesCount;
    const totalRevenue = (printedRevenueAggregate._sum.totalAmount || 0) + (digitalRevenueAggregate._sum.amount || 0);

    return NextResponse.json({
      totalUsers,
      totalProblemsCount: totalProblems,
      totalOrders,
      actualOrdersCount: actualPrintedOrdersCount,
      testOrdersCount: testPrintedOrdersCount,
      totalRevenue,
      metrics: {
        totalUsers,
        totalProblems,
        totalOrders,
        actualOrdersCount: actualPrintedOrdersCount,
        testOrdersCount: testPrintedOrdersCount,
        totalRevenue,
        printedOrdersCount: actualPrintedOrdersCount,
        digitalPurchasesCount,
      },
      recentOrders: recentPrintedOrders,
      recentUsers,
    });
  } catch (err) {
    console.error("Admin metrics error:", err);
    return NextResponse.json({ error: "Failed to fetch admin metrics" }, { status: 500 });
  }
}
