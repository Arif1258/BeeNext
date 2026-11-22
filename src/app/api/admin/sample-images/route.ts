import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await prisma.homepageSampleImage.findMany({
      orderBy: { slotIndex: "asc" },
    });
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Admin fetch sample images error:", err);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const formData = await req.formData();
    const slotIndexRaw = formData.get("slotIndex");
    const title = formData.get("title") as string | null;
    const caption = formData.get("caption") as string | null;
    const file = formData.get("file") as File | null;
    const directImageUrl = formData.get("imageUrl") as string | null;

    const slotIndex = Number(slotIndexRaw);
    if (!slotIndex || slotIndex < 1 || slotIndex > 4) {
      return NextResponse.json(
        { error: "Invalid slotIndex. Must be 1, 2, 3, or 4." },
        { status: 400 }
      );
    }

    let imageUrl = directImageUrl || undefined;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name).toLowerCase();
      const allowedExts = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
      if (!allowedExts.includes(ext)) {
        return NextResponse.json(
          { error: "Unsupported image format. Use PNG, JPG, SVG, or WEBP." },
          { status: 400 }
        );
      }

      const uploadsDir = path.join(process.cwd(), "public", "notes", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `sample_slot_${slotIndex}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      imageUrl = `/notes/uploads/${fileName}`;
    }

    const updated = await prisma.homepageSampleImage.upsert({
      where: { slotIndex },
      update: {
        ...(title ? { title: title.trim() } : {}),
        ...(caption !== null && caption !== undefined ? { caption: caption.trim() } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      },
      create: {
        slotIndex,
        title: title ? title.trim() : `Sample Slot ${slotIndex}`,
        caption: caption ? caption.trim() : `Handwritten DSA Blueprint #${slotIndex}`,
        imageUrl: imageUrl || "",
        order: slotIndex,
      },
    });

    return NextResponse.json({
      success: true,
      image: updated,
      message: `Sample image for Slot ${slotIndex} updated successfully.`,
    });
  } catch (err) {
    console.error("Admin update sample image error:", err);
    return NextResponse.json({ error: "Failed to update sample image." }, { status: 500 });
  }
}
