import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "notes",
      "BeeNext-Sorting-Sample.pdf"
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Sample PDF not found" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="BeeNext-Sorting-Sample.pdf"',
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error serving sample PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
