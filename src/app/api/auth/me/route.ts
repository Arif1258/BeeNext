import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        dsaQualifiedAt: true,
        certificateClaimedAt: true,
        createdAt: true,
        purchases: {
          where: { status: "COMPLETED" },
          select: {
            id: true,
            purchaseType: true,
            categoryId: true,
            problemId: true,
            amount: true,
            status: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                title: true,
                slug: true,
                pdfUrl: true,
              },
            },
          },
        },
        bookmarks: { select: { problemId: true } },
        progress: { select: { problemId: true, status: true } },
        printedOrders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            postalCode: true,
            productTitle: true,
            totalAmount: true,
            orderStatus: true,
            paymentStatus: true,
            requiresCertificate: true,
            certificateStatus: true,
            trackingNumber: true,
            carrier: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null });
  }
}
