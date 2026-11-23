import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PrintedOrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, trackingNumber, carrier, certificateStatus, requiresCertificate } = body;

    const existing = await prisma.printedOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Printed order not found." }, { status: 404 });
    }

    const validStatuses = Object.values(PrintedOrderStatus);
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const validCertificateStatuses = ["PENDING", "PRINTED", "PACKED", "SHIPPED", "DELIVERED"];
    if (certificateStatus && !validCertificateStatuses.includes(certificateStatus)) {
      return NextResponse.json(
        { error: `Invalid certificate status. Must be one of: ${validCertificateStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.printedOrder.update({
      where: { id },
      data: {
        ...(orderStatus ? { orderStatus } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(carrier !== undefined ? { carrier } : {}),
        ...(certificateStatus ? { certificateStatus } : {}),
        ...(requiresCertificate !== undefined ? { requiresCertificate } : {}),
      },
    });

    if (certificateStatus) {
      await prisma.certificateOrder.updateMany({
        where: {
          OR: [
            { printedOrderId: id },
            { orderNumber: existing.orderNumber },
            ...(existing.userId ? [{ userId: existing.userId }] : []),
          ],
        },
        data: {
          deliveryStatus: certificateStatus,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(carrier ? { carrier } : {}),
        },
      });
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("Admin update printed order error:", err);
    return NextResponse.json({ error: "Failed to update printed order" }, { status: 500 });
  }
}
