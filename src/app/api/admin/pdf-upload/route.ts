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
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("pdfFile") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== ".pdf") {
      return NextResponse.json({ error: "Only PDF (.pdf) documents are accepted." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const notesDir = path.join(process.cwd(), "public", "notes");
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    const fileName = `strivers-a2z-notes-${Date.now()}.pdf`;
    const targetPath = path.join(notesDir, fileName);
    fs.writeFileSync(targetPath, buffer);

    const pdfUrl = `/notes/${fileName}`;

    // Update active master PDF configuration
    const updated = await prisma.bundleConfig.upsert({
      where: { id: "default" },
      update: { pdfUrl },
      create: {
        id: "default",
        title: "Complete Striver's A to Z DSA Sheet – Handwritten Notes PDF",
        description: "Get the complete collection of handwritten DSA notes in digital PDF format.",
        price: 199,
        originalPrice: 999,
        pdfUrl,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Master PDF updated successfully.",
      pdfUrl: updated.pdfUrl,
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    return NextResponse.json({ error: "Failed to upload master PDF" }, { status: 500 });
  }
}
