import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();

    // Default total problems in Striver's A to Z Sheet
    const totalProblems = (await prisma.problem.count({ where: { isPublished: true } })) || 495;

    if (!session) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
        totalProblems,
        completedProblems: 0,
        completionPercentage: 0,
        is85Completed: false,
        dsaQualifiedAt: null,
        hasQualifyingOrder: false,
        qualifyingOrder: null,
        certificateClaimedAt: null,
        hasOrderedCertificate: false,
        certificateOrder: null,
        isEligible: false,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        dsaQualifiedAt: true,
        certificateClaimedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
        totalProblems,
        completedProblems: 0,
        completionPercentage: 0,
        is85Completed: false,
        dsaQualifiedAt: null,
        hasQualifyingOrder: false,
        qualifyingOrder: null,
        certificateClaimedAt: null,
        hasOrderedCertificate: false,
        certificateOrder: null,
        isEligible: false,
      });
    }

    // Count user's completed problems
    const completedProblems = await prisma.userProgress.count({
      where: {
        userId: user.id,
        status: ProgressStatus.COMPLETED,
      },
    });

    const completionPercentage = totalProblems > 0
      ? Math.round((completedProblems / totalProblems) * 100)
      : 0;

    const is85Completed = totalProblems > 0 && (completedProblems / totalProblems) >= 0.85;

    let dsaQualifiedAt = user.dsaQualifiedAt;
    if (is85Completed && !dsaQualifiedAt) {
      dsaQualifiedAt = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { dsaQualifiedAt },
      });
    }

    // Find any qualifying physical book order placed after achieving 85%
    let qualifyingOrder = null;
    let hasQualifyingOrder = false;

    if (is85Completed || dsaQualifiedAt) {
      const qualifyingOrderRecord = await prisma.printedOrder.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { customerEmail: { equals: user.email, mode: "insensitive" } },
          ],
          paymentStatus: "COMPLETED",
          orderStatus: { not: "CANCELLED" },
          ...(dsaQualifiedAt
            ? {
                createdAt: {
                  // Allow orders placed at or after dsaQualifiedAt (with a 5-minute buffer for clock drift)
                  gte: new Date(new Date(dsaQualifiedAt).getTime() - 5 * 60 * 1000),
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          productTitle: true,
          quantity: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          requiresCertificate: true,
          certificateStatus: true,
          createdAt: true,
        },
      });

      if (qualifyingOrderRecord) {
        hasQualifyingOrder = true;
        qualifyingOrder = qualifyingOrderRecord;
      }
    }

    // Check if customer has already successfully purchased/ordered a physical certificate
    const confirmedCertOrder = await prisma.certificateOrder.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
      },
      orderBy: { createdAt: "desc" },
    });

    const confirmedPrintedCert = await prisma.printedOrder.findFirst({
      where: {
        userId: user.id,
        requiresCertificate: true,
        paymentStatus: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    const hasOrderedCertificate = Boolean(
      user.certificateClaimedAt || confirmedCertOrder || confirmedPrintedCert
    );

    // Eligible if >=85% completed and has not yet claimed their free one-time physical certificate
    const isEligible = is85Completed && !hasOrderedCertificate;

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      totalProblems,
      completedProblems,
      completionPercentage,
      is85Completed,
      dsaQualifiedAt,
      hasQualifyingOrder,
      qualifyingOrder,
      certificateClaimedAt: user.certificateClaimedAt,
      hasOrderedCertificate,
      certificateOrder: confirmedCertOrder
        ? {
            id: confirmedCertOrder.id,
            orderNumber: confirmedCertOrder.orderNumber,
            deliveryStatus: confirmedCertOrder.deliveryStatus,
            trackingNumber: confirmedCertOrder.trackingNumber,
            carrier: confirmedCertOrder.carrier,
            isReplacement: confirmedCertOrder.isReplacement,
            createdAt: confirmedCertOrder.createdAt,
          }
        : confirmedPrintedCert
        ? {
            id: confirmedPrintedCert.id,
            orderNumber: confirmedPrintedCert.orderNumber,
            deliveryStatus: confirmedPrintedCert.certificateStatus || "PENDING",
            trackingNumber: confirmedPrintedCert.trackingNumber,
            carrier: confirmedPrintedCert.carrier,
            isReplacement: false,
            createdAt: confirmedPrintedCert.createdAt,
          }
        : null,
      isEligible,
    });
  } catch (err) {
    console.error("Certificate status API error:", err);
    return NextResponse.json({ error: "Failed to determine certificate status" }, { status: 500 });
  }
}
