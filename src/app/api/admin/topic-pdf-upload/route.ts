import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const categoryId = formData.get("categoryId") as string | null;
    const file = formData.get("pdfFile") as File | null;

    if (!categoryId) {
      return NextResponse.json({ error: "Target topic must be selected." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== ".pdf") {
      return NextResponse.json(
        { error: "Only PDF (.pdf) documents are accepted." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const topicsDir = path.join(process.cwd(), "public", "notes", "topics");
    if (!fs.existsSync(topicsDir)) {
      fs.mkdirSync(topicsDir, { recursive: true });
    }

    const fileName = `${category.slug}-${Date.now()}.pdf`;
    const targetPath = path.join(topicsDir, fileName);
    fs.writeFileSync(targetPath, buffer);

    const pdfUrl = `/notes/topics/${fileName}`;

    // Update category in database
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: { pdfUrl },
    });

    return NextResponse.json({
      success: true,
      message: `Handwritten PDF for ${category.title} updated successfully.`,
      pdfUrl: updated.pdfUrl,
      category: updated,
    });
  } catch (err) {
    console.error("Topic PDF upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload topic PDF." },
      { status: 500 }
    );
  }
}
