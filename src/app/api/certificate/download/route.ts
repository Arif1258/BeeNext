import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to download certificate." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        membershipType: true,
        membershipExpiresAt: true,
        certificateClaimedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const totalProblems =
      (await prisma.problem.count({ where: { isPublished: true } })) || 495;
    const completedProblems = await prisma.userProgress.count({
      where: {
        userId: user.id,
        status: ProgressStatus.COMPLETED,
      },
    });

    const is85Completed =
      totalProblems > 0 && completedProblems / totalProblems >= 0.85;
    const isActivePlus = isUserActivePlus(user);

    // Server-side strict verification of both requirements
    if (!is85Completed) {
      return NextResponse.json(
        {
          error: `Criterion 1 incomplete: You have solved ${completedProblems}/${totalProblems} problems. 85% completion (421+ problems) is required.`,
        },
        { status: 403 }
      );
    }

    if (!isActivePlus) {
      return NextResponse.json(
        {
          error:
            "Criterion 2 incomplete: An active BeeNext Plus membership is required to download your completion certificate.",
        },
        { status: 403 }
      );
    }

    // Check or retrieve existing certificate record (one certificate per user)
    let certOrder = await prisma.certificateOrder.findFirst({
      where: {
        userId: user.id,
        status: "CONFIRMED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!certOrder) {
      const orderNumber = `BN-CERT-${Date.now().toString().slice(-6)}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      certOrder = await prisma.certificateOrder.create({
        data: {
          userId: user.id,
          orderNumber,
          customerName: user.name,
          customerEmail: user.email,
          status: "CONFIRMED",
          deliveryStatus: "ISSUED",
        },
      });

      if (!user.certificateClaimedAt) {
        await prisma.user.update({
          where: { id: user.id },
          data: { certificateClaimedAt: new Date() },
        });
      }
    }

    // Generate high-resolution PDF certificate using pdf-lib
    const pdfDoc = await PDFDocument.create();
    // A4 Landscape: width = 841.89, height = 595.28
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Dark sleek background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.06, 0.06, 0.07),
    });

    // Outer double-line border (Red & Gold)
    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      borderColor: rgb(0.89, 0.14, 0.19), // brand red
      borderWidth: 3,
    });

    page.drawRectangle({
      x: 32,
      y: 32,
      width: width - 64,
      height: height - 64,
      borderColor: rgb(0.25, 0.25, 0.28),
      borderWidth: 1,
    });

    // Top logo / Branding
    const brandText = "BEENEXT";
    const brandWidth = helveticaBold.widthOfTextAtSize(brandText, 20);
    page.drawText(brandText, {
      x: (width - brandWidth) / 2,
      y: height - 75,
      size: 20,
      font: helveticaBold,
      color: rgb(0.89, 0.14, 0.19),
    });

    // Certificate Title
    const titleText = "CERTIFICATE OF ACHIEVEMENT";
    const titleWidth = helveticaBold.widthOfTextAtSize(titleText, 28);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 120,
      size: 28,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    // Subtitle
    const subText = "THIS IS PROUDLY PRESENTED TO";
    const subWidth = helvetica.widthOfTextAtSize(subText, 11);
    page.drawText(subText, {
      x: (width - subWidth) / 2,
      y: height - 165,
      size: 11,
      font: helvetica,
      color: rgb(0.65, 0.65, 0.7),
    });

    // Recipient Name
    const recipientName = (user.name || "Software Engineer").toUpperCase();
    const nameWidth = timesBold.widthOfTextAtSize(recipientName, 34);
    page.drawText(recipientName, {
      x: (width - nameWidth) / 2,
      y: height - 225,
      size: 34,
      font: timesBold,
      color: rgb(1, 0.85, 0.4), // warm gold
    });

    // Decorative underline beneath name
    page.drawLine({
      start: { x: (width - Math.max(nameWidth, 320)) / 2 - 20, y: height - 238 },
      end: { x: (width + Math.max(nameWidth, 320)) / 2 + 20, y: height - 238 },
      thickness: 1.5,
      color: rgb(0.89, 0.14, 0.19),
    });

    // Citation paragraph
    const p1 =
      "For successfully completing and mastering at least 85% of Striver's A to Z Data Structures & Algorithms curriculum";
    const p2 =
      "(solving 421+ comprehensive problems across all 20 topics) and demonstrating outstanding technical dedication.";

    const p1Width = timesRoman.widthOfTextAtSize(p1, 13);
    const p2Width = timesRoman.widthOfTextAtSize(p2, 13);

    page.drawText(p1, {
      x: (width - p1Width) / 2,
      y: height - 280,
      size: 13,
      font: timesRoman,
      color: rgb(0.85, 0.85, 0.88),
    });

    page.drawText(p2, {
      x: (width - p2Width) / 2,
      y: height - 302,
      size: 13,
      font: timesRoman,
      color: rgb(0.85, 0.85, 0.88),
    });

    // Footer credentials bar
    const issueDateStr = `Issued: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    const certSerialStr = `Certificate ID: #${certOrder.orderNumber}`;

    // Left info
    page.drawText(issueDateStr, {
      x: 60,
      y: 90,
      size: 10,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.65),
    });

    page.drawText(certSerialStr, {
      x: 60,
      y: 74,
      size: 10,
      font: helveticaBold,
      color: rgb(0.8, 0.8, 0.85),
    });

    // Right Signature / Verification
    const sigLabel1 = "BeeNext Academic Board";
    const sigLabel2 = "Verified Credential • beenext.in";

    const s1Width = helveticaBold.widthOfTextAtSize(sigLabel1, 11);
    const s2Width = helvetica.widthOfTextAtSize(sigLabel2, 9);

    page.drawText(sigLabel1, {
      x: width - 60 - s1Width,
      y: 90,
      size: 11,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(sigLabel2, {
      x: width - 60 - s2Width,
      y: 74,
      size: 9,
      font: helvetica,
      color: rgb(0.89, 0.14, 0.19),
    });

    page.drawLine({
      start: { x: width - 60 - Math.max(s1Width, s2Width), y: 108 },
      end: { x: width - 60, y: 108 },
      thickness: 1,
      color: rgb(0.4, 0.4, 0.45),
    });

    const pdfBytes = await pdfDoc.save();

    const safeFilename = `BeeNext-Certificate-${(user.name || "achievement")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30)}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF." },
      { status: 500 }
    );
  }
}
