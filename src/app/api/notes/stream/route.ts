import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to access premium notes." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
      },
    });

    const isPlus = user?.role === "ADMIN" || isUserActivePlus(user);
    if (!isPlus) {
      return NextResponse.json(
        {
          error: "BeeNext Plus membership is required to access premium notes.",
          code: "PLUS_REQUIRED",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedPath = searchParams.get("file") || searchParams.get("noteId");

    let targetPath = path.join(
      process.cwd(),
      "public",
      "notes",
      "strivers-a2z-dsa-notes.pdf"
    );

    if (requestedPath) {
      // Sanitize path to prevent directory traversal
      const safeName = path.basename(requestedPath);
      const customPath = path.join(process.cwd(), "public", "notes", safeName);
      if (fs.existsSync(customPath)) {
        targetPath = customPath;
      }
    }

    if (!fs.existsSync(targetPath)) {
      // Fallback to any pdf in public/notes
      const notesDir = path.join(process.cwd(), "public", "notes");
      if (fs.existsSync(notesDir)) {
        const files = fs.readdirSync(notesDir).filter((f) => f.endsWith(".pdf"));
        if (files.length > 0) {
          targetPath = path.join(notesDir, files[0]);
        }
      }
    }

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json(
        { error: "Note document is currently being prepared." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(targetPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="beenext-premium-note.pdf"',
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Notes stream error:", error);
    return NextResponse.json(
      { error: "Failed to stream note document." },
      { status: 500 }
    );
  }
}
