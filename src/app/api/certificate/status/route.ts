import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const totalProblems =
      (await prisma.problem.count({ where: { isPublished: true } })) || 495;

    if (!session) {
      return NextResponse.json({
        isLoggedIn: false,
        user: null,
        totalProblems,
        completedProblems: 0,
        completionPercentage: 0,
        is85Completed: false,
        isActivePlus: false,
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
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
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
        isActivePlus: false,
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

    const completionPercentage =
      totalProblems > 0
        ? Math.round((completedProblems / totalProblems) * 100)
        : 0;

    // Strict requirements:
    // 1. >= 85% DSA sheet completed (for 495 problems, >= 421)
    // 2. Active Plus membership (valid PLUS type and membershipExpiresAt > now)
    const is85Completed =
      totalProblems > 0 && completedProblems / totalProblems >= 0.85;

    const isActivePlus = isUserActivePlus(user);

    let dsaQualifiedAt = user.dsaQualifiedAt;
    if (is85Completed && !dsaQualifiedAt) {
      dsaQualifiedAt = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: { dsaQualifiedAt },
      });
    }

    // Check existing certificate order
    const existingCertOrder = await prisma.certificateOrder.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
      },
      orderBy: { createdAt: "desc" },
    });

    const hasOrderedCertificate = Boolean(
      user.certificateClaimedAt || existingCertOrder
    );

    // Eligible only when BOTH conditions are satisfied
    const isEligible = is85Completed && isActivePlus;

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
      isActivePlus,
      dsaQualifiedAt,
      certificateClaimedAt: user.certificateClaimedAt,
      hasOrderedCertificate,
      certificateOrder: existingCertOrder
        ? {
            id: existingCertOrder.id,
            orderNumber: existingCertOrder.orderNumber,
            deliveryStatus: existingCertOrder.deliveryStatus,
            trackingNumber: existingCertOrder.trackingNumber,
            carrier: existingCertOrder.carrier,
            isReplacement: existingCertOrder.isReplacement,
            createdAt: existingCertOrder.createdAt,
          }
        : null,
      isEligible,
    });
  } catch (err) {
    console.error("Certificate status API error:", err);
    return NextResponse.json(
      { error: "Failed to determine certificate status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
        certificateClaimedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalProblems =
      (await prisma.problem.count({ where: { isPublished: true } })) || 495;
    const completedProblems = await prisma.userProgress.count({
      where: {
        userId: user.id,
        status: ProgressStatus.COMPLETED,
      },
    });

    const is85Completed =
      totalProblems > 0 && completedProblems / totalProblems >= 0.85;
    const isActivePlus = user.role === "ADMIN" || isUserActivePlus(user);

    if (!is85Completed) {
      return NextResponse.json(
        {
          error: `Criterion 1 not met: You have completed ${completedProblems}/${totalProblems} problems. 85% completion is required.`,
        },
        { status: 400 }
      );
    }

    if (!isActivePlus) {
      return NextResponse.json(
        {
          error:
            "Criterion 2 not met: Active BeeNext Plus membership is required to claim your completion certificate.",
        },
        { status: 400 }
      );
    }

    // Check duplicate
    const existingCertOrder = await prisma.certificateOrder.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
      },
    });

    if (user.certificateClaimedAt || existingCertOrder) {
      return NextResponse.json(
        { error: "You have already claimed your completion certificate." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const customerName = body.fullName?.trim() || user.name || "BeeNext Scholar";

    const orderNumber = `BN-CERT-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const [certOrder] = await prisma.$transaction([
      prisma.certificateOrder.create({
        data: {
          userId: user.id,
          orderNumber,
          customerName,
          customerEmail: user.email,
          status: "CONFIRMED",
          deliveryStatus: "PENDING",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          certificateClaimedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Certificate claimed successfully at no cost!",
      certificateOrder: certOrder,
    });
  } catch (error) {
    console.error("Certificate claim error:", error);
    return NextResponse.json(
      { error: "Failed to process certificate claim." },
      { status: 500 }
    );
  }
}
