import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim(),
        isFree: typeof body.isFree === "boolean" ? body.isFree : undefined,
        price: typeof body.price === "number" ? body.price : undefined,
        order: typeof body.order === "number" ? body.order : undefined,
        isPublished: typeof body.isPublished === "boolean" ? body.isPublished : undefined,
      },
    });

    return NextResponse.json({ category: updated });
  } catch (err: unknown) {
    console.error("Update category error:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;

    // Guard against deleting sorting category
    const cat = await prisma.category.findUnique({ where: { id } });
    if (cat?.slug === "sorting") {
      return NextResponse.json({ error: "Cannot delete the default free Sorting category" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (err: unknown) {
    console.error("Delete category error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
