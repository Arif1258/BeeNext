import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NoteFileType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const problemId = formData.get("problemId") as string | null;
    const title = formData.get("title") as string | null;
    const isProtected = formData.get("isProtected") === "true";

    if (!file || !problemId || !title) {
      return NextResponse.json(
        { error: "File, problemId, and title are required." },
        { status: 400 }
      );
    }

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate mime type & extension
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    const allowedExts = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf"];

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only PNG, JPG, SVG, and PDF allowed." },
        { status: 400 }
      );
    }

    const isPdf = ext === ".pdf";
    const fileType = isPdf ? NoteFileType.PDF : NoteFileType.IMAGE;

    const uploadsDir = path.join(process.cwd(), "public", "notes", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/notes/uploads/${fileName}`;

    // Get current order count
    const count = await prisma.handwrittenNote.count({
      where: { problemId },
    });

    const note = await prisma.handwrittenNote.create({
      data: {
        problemId,
        title: title.trim(),
        fileUrl,
        fileType,
        isProtected,
        order: count + 1,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload note file." }, { status: 500 });
  }
}
