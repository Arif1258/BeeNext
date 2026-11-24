import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const now = new Date();

    const [
      totalUsers,
      normalUsersCount,
      activePlusCount,
      expiredPlusCount,
      monthlyPlansCount,
      yearlyPlansCount,
      membershipRevenueAggregate,
      monthlyRevenueAggregate,
      yearlyRevenueAggregate,
      recentMembershipOrders,
      totalProblems,
      actualPrintedOrdersCount,
      testPrintedOrdersCount,
      digitalPurchasesCount,
      printedRevenueAggregate,
      digitalRevenueAggregate,
      recentPrintedOrders,
      recentUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Normal tier users
      prisma.user.count({
        where: { membershipType: "NORMAL" },
      }),

      // Active Plus users
      prisma.user.count({
        where: {
          membershipType: "PLUS",
          OR: [
            { membershipExpiresAt: null },
            { membershipExpiresAt: { gt: now } },
          ],
        },
      }),

      // Expired Plus users
      prisma.user.count({
        where: {
          membershipType: "PLUS",
          membershipExpiresAt: { lte: now },
        },
      }),

      // Active Monthly Subscribers
      prisma.user.count({
        where: {
          membershipType: "PLUS",
          membershipPlan: "MONTHLY",
          OR: [
            { membershipExpiresAt: null },
            { membershipExpiresAt: { gt: now } },
          ],
        },
      }),

      // Active Yearly Subscribers
      prisma.user.count({
        where: {
          membershipType: "PLUS",
          membershipPlan: "YEARLY",
          OR: [
            { membershipExpiresAt: null },
            { membershipExpiresAt: { gt: now } },
          ],
        },
      }),

      // Total Membership Revenue
      prisma.membershipOrder.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),

      // Monthly Membership Revenue
      prisma.membershipOrder.aggregate({
        where: { status: "COMPLETED", plan: "MONTHLY" },
        _sum: { amount: true },
      }),

      // Yearly Membership Revenue
      prisma.membershipOrder.aggregate({
        where: { status: "COMPLETED", plan: "YEARLY" },
        _sum: { amount: true },
      }),

      // Recent Membership Transactions
      prisma.membershipOrder.findMany({
        where: { status: "COMPLETED" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),

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

      // Exclude test orders from printed revenue calculations
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
          membershipType: true,
          membershipPlan: true,
          membershipExpiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const membershipRevenue = membershipRevenueAggregate._sum.amount || 0;
    const printedRevenue = printedRevenueAggregate._sum.totalAmount || 0;
    const digitalRevenue = digitalRevenueAggregate._sum.amount || 0;
    const totalRevenue = membershipRevenue + printedRevenue + digitalRevenue;
    const totalOrders =
      actualPrintedOrdersCount +
      digitalPurchasesCount +
      monthlyPlansCount +
      yearlyPlansCount;

    return NextResponse.json({
      totalUsers,
      normalUsersCount,
      activePlusCount,
      expiredPlusCount,
      monthlyPlansCount,
      yearlyPlansCount,
      membershipRevenue,
      monthlyRevenue: monthlyRevenueAggregate._sum.amount || 0,
      yearlyRevenue: yearlyRevenueAggregate._sum.amount || 0,
      recentMembershipOrders,
      totalProblemsCount: totalProblems,
      totalOrders,
      actualOrdersCount: actualPrintedOrdersCount,
      testOrdersCount: testPrintedOrdersCount,
      totalRevenue,
      metrics: {
        totalUsers,
        normalUsersCount,
        activePlusCount,
        expiredPlusCount,
        monthlyPlansCount,
        yearlyPlansCount,
        membershipRevenue,
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
    return NextResponse.json(
      { error: "Failed to fetch admin metrics" },
      { status: 500 }
    );
  }
}
