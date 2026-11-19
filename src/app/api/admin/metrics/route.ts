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
      totalPurchases,
      revenueAggregate,
      freeCategoriesCount,
      premiumCategoriesCount,
      totalProblemsCount,
      recentPurchases,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.purchase.count({ where: { status: "COMPLETED" } }),
      prisma.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.category.count({ where: { isFree: true } }),
      prisma.category.count({ where: { isFree: false } }),
      prisma.problem.count(),
      prisma.purchase.findMany({
        where: { status: "COMPLETED" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          category: { select: { title: true } },
          problem: { select: { title: true } },
        },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: { select: { purchases: true } },
        },
      }),
    ]);

    const totalRevenue = revenueAggregate._sum.amount || 0;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalRevenue,
        totalPurchases,
        freeTopics: freeCategoriesCount,
        premiumTopics: premiumCategoriesCount,
        totalProblems: totalProblemsCount,
      },
      recentPurchases,
      recentUsers,
    });
  } catch (err) {
    console.error("Admin metrics error:", err);
    return NextResponse.json({ error: "Failed to fetch admin metrics" }, { status: 500 });
  }
}
