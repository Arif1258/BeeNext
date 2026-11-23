import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, customerName, customerEmail, replacementNote } = body;

    if (!userId || !replacementNote) {
      return NextResponse.json(
        { error: "User ID and replacement audit note are required." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Customer account not found." }, { status: 404 });
    }

    // Generate replacement certificate order number
    const timestamp = Date.now().toString().slice(-6);
    const orderNumber = `BN-CERT-REP-${timestamp}`;

    const replacementRecord = await prisma.certificateOrder.create({
      data: {
        userId: targetUser.id,
        orderNumber,
        customerName: customerName || targetUser.name,
        customerEmail: customerEmail || targetUser.email,
        status: "CONFIRMED",
        deliveryStatus: "PENDING",
        isReplacement: true,
        replacementNote: replacementNote.trim(),
        recordedByAdmin: `${admin.name} (${admin.email})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Replacement certificate successfully recorded in audit history.",
      certificateOrder: replacementRecord,
    });
  } catch (err) {
    console.error("Create replacement certificate error:", err);
    return NextResponse.json({ error: "Failed to record replacement certificate." }, { status: 500 });
  }
}
