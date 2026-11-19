import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, checkProblemAccess } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();

    const note = await prisma.handwrittenNote.findUnique({
      where: { id },
      include: {
        problem: {
          select: {
            id: true,
            isFree: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                isFree: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Access control check
    if (note.isProtected) {
      const access = await checkProblemAccess(session?.id, note.problemId);
      if (!access.hasAccess) {
        return NextResponse.json(
          {
            error: "Access denied. Protected handwritten content requires verified purchase.",
            code: "PAYMENT_REQUIRED",
          },
          { status: 403 }
        );
      }
    }

    // Serve file securely
    const filePath = path.join(process.cwd(), "public", note.fileUrl.replace(/^\//, ""));

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on server storage" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-transform, max-age=3600",
        "Content-Disposition": ext === ".pdf" ? "inline" : "inline",
      },
    });
  } catch (err) {
    console.error("Protected media route error:", err);
    return NextResponse.json({ error: "Failed to deliver media" }, { status: 500 });
  }
}
