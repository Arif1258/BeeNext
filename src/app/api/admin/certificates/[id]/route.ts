import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { deliveryStatus, trackingNumber, carrier, status } = body;

    const existing = await prisma.certificateOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Certificate record not found." }, { status: 404 });
    }

    const validDeliveryStatuses = ["PENDING", "PRINTED", "PACKED", "SHIPPED", "DELIVERED"];
    if (deliveryStatus && !validDeliveryStatuses.includes(deliveryStatus)) {
      return NextResponse.json(
        { error: `Invalid delivery status. Must be one of: ${validDeliveryStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.certificateOrder.update({
      where: { id },
      data: {
        ...(deliveryStatus ? { deliveryStatus } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(carrier !== undefined ? { carrier } : {}),
        ...(status ? { status } : {}),
      },
    });

    // Also sync to linked printed order if present
    if (existing.printedOrderId && deliveryStatus) {
      await prisma.printedOrder.update({
        where: { id: existing.printedOrderId },
        data: {
          certificateStatus: deliveryStatus,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(carrier ? { carrier } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Certificate order updated successfully.",
      certificateOrder: updated,
    });
  } catch (err) {
    console.error("Update certificate order error:", err);
    return NextResponse.json({ error: "Failed to update certificate order." }, { status: 500 });
  }
}
