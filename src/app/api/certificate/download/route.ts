import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isUserActivePlus } from "@/lib/membership";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ProgressStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Helper to draw a centered diamond using SVG path
function drawDiamond(page: any, cx: number, cy: number, radius: number, color: any) {
  const path = `M 0 ${-radius} L ${radius} 0 L 0 ${radius} L ${-radius} 0 Z`;
  page.drawSvgPath(path, { x: cx, y: cy, color });
}

// Helper to draw a centered 5-pointed star
function drawStar(page: any, cx: number, cy: number, outerR: number, innerR: number, color: any) {
  let path = "";
  const points = 5;
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) path += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
    else path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  path += "Z";
  page.drawSvgPath(path, { x: cx, y: cy, color });
}

// Helper to create an SVG path for a 24-point star rosette (seal) centered at (0, 0)
function createCenteredRosette(outerRadius: number, innerRadius: number, points = 24) {
  let path = "";
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) path += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
    else path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  path += "Z";
  return path;
}

// Ribbon tail: hanging downwards in SVG means +Y
function createRibbonTail(angleDeg: number, width = 18, length = 54) {
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  // Top edge centered at (0, 0)
  const tL = { x: -width / 2, y: 0 };
  const tR = { x: width / 2, y: 0 };
  // Bottom edge following angle downwards (+Y)
  const bL = { x: tL.x + length * sin, y: length * cos };
  const bR = { x: tR.x + length * sin, y: length * cos };
  // Inward notch (V cut)
  const notch = 12;
  const bM = { x: (bL.x + bR.x) / 2 - notch * sin, y: (bL.y + bR.y) / 2 - notch * cos };
  return `M ${tL.x.toFixed(1)} ${tL.y.toFixed(1)} L ${tR.x.toFixed(1)} ${tR.y.toFixed(1)} L ${bR.x.toFixed(1)} ${bR.y.toFixed(1)} L ${bM.x.toFixed(1)} ${bM.y.toFixed(1)} L ${bL.x.toFixed(1)} ${bL.y.toFixed(1)} Z`;
}

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
    // A4 Landscape: width = 842 pt, height = 595 pt
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();
    const cx = width / 2;

    // Standard high-quality vector fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Color Palette: Pure White, Rich Black, BeeNext Red
    const cWhite = rgb(1, 1, 1);
    const cBlack = rgb(0.08, 0.08, 0.1);
    const cDarkGray = rgb(0.2, 0.2, 0.24);
    const cMidGray = rgb(0.45, 0.45, 0.5);
    const cLightGray = rgb(0.85, 0.85, 0.88);
    const cBrandRed = rgb(0.89, 0.14, 0.19); // #E3242B BeeNext signature red
    const cRedDark = rgb(0.72, 0.08, 0.12);

    // 1. Pure White Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: cWhite,
    });

    // 2. Subtle Security Watermark in background center
    const wmCenterY = 275;
    page.drawCircle({
      x: cx,
      y: wmCenterY,
      size: 165,
      borderColor: rgb(0.95, 0.95, 0.96),
      borderWidth: 1.25,
      opacity: 0.6,
    });
    page.drawCircle({
      x: cx,
      y: wmCenterY,
      size: 148,
      borderColor: rgb(0.96, 0.96, 0.97),
      borderWidth: 0.75,
      opacity: 0.5,
    });
    page.drawCircle({
      x: cx,
      y: wmCenterY,
      size: 130,
      borderColor: rgb(0.95, 0.95, 0.96),
      borderWidth: 1,
      opacity: 0.5,
    });

    // Watermark text
    const wmText = "BEENEXT";
    const wmSize = 68;
    const wmW = helveticaBold.widthOfTextAtSize(wmText, wmSize);
    page.drawText(wmText, {
      x: cx - wmW / 2,
      y: wmCenterY - 22,
      size: wmSize,
      font: helveticaBold,
      color: rgb(0.93, 0.93, 0.95),
      opacity: 0.45,
    });

    // Watermark subtle star
    drawStar(page, cx, wmCenterY + 36, 16, 7, rgb(0.93, 0.93, 0.95));

    // 3. Elegant Multi-Layered Borders
    // Layer 1: Outer subtle hairline
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: cLightGray,
      borderWidth: 0.75,
    });

    // Layer 2: Main bold black frame
    page.drawRectangle({
      x: 27,
      y: 27,
      width: width - 54,
      height: height - 54,
      borderColor: cBlack,
      borderWidth: 2.5,
    });

    // Layer 3: Vibrant BeeNext Red accent border
    page.drawRectangle({
      x: 34,
      y: 34,
      width: width - 68,
      height: height - 68,
      borderColor: cBrandRed,
      borderWidth: 1,
    });

    // Layer 4: Inset fine inner hairline
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: height - 80,
      borderColor: rgb(0.88, 0.88, 0.9),
      borderWidth: 0.5,
    });

    // Modern Corner Ornaments (At all 4 corners of the red border)
    const cornerCoords = [
      { x: 34, y: 34, signX: 1, signY: 1 },
      { x: width - 34, y: 34, signX: -1, signY: 1 },
      { x: 34, y: height - 34, signX: 1, signY: -1 },
      { x: width - 34, y: height - 34, signX: -1, signY: -1 },
    ];

    for (const c of cornerCoords) {
      // Red accent diamond exactly on corner
      drawDiamond(page, c.x, c.y, 4.5, cBrandRed);

      // Inner bracket node
      const bx = c.x + c.signX * 8;
      const by = c.y + c.signY * 8;
      drawDiamond(page, bx, by, 3, cBlack);

      // Modern L-bracket flourishes in Red
      const armLen = 24;
      page.drawLine({
        start: { x: bx, y: by },
        end: { x: bx + c.signX * armLen, y: by },
        thickness: 1.25,
        color: cBrandRed,
      });
      page.drawLine({
        start: { x: bx, y: by },
        end: { x: bx, y: by + c.signY * armLen },
        thickness: 1.25,
        color: cBrandRed,
      });

      // Inner fine black bracket
      const inArmLen = 16;
      const ibx = bx + c.signX * 4;
      const iby = by + c.signY * 4;
      page.drawLine({
        start: { x: ibx, y: iby },
        end: { x: ibx + c.signX * inArmLen, y: iby },
        thickness: 0.75,
        color: cBlack,
      });
      page.drawLine({
        start: { x: ibx, y: iby },
        end: { x: ibx, y: by + c.signY * inArmLen },
        thickness: 0.75,
        color: cBlack,
      });
    }

    // 4. Header: BEE in Black, NEXT in Red
    const logoBee = "BEE";
    const logoNext = "NEXT";
    const logoSize = 25;
    const wBee = helveticaBold.widthOfTextAtSize(logoBee, logoSize);
    const wNext = helveticaBold.widthOfTextAtSize(logoNext, logoSize);
    const totalLogoW = wBee + wNext;
    const logoStartX = cx - totalLogoW / 2;
    const logoY = height - 74;

    page.drawText(logoBee, {
      x: logoStartX,
      y: logoY,
      size: logoSize,
      font: helveticaBold,
      color: cBlack,
    });
    page.drawText(logoNext, {
      x: logoStartX + wBee,
      y: logoY,
      size: logoSize,
      font: helveticaBold,
      color: cBrandRed,
    });

    // Subtitle under logo
    const logoTag = "ADVANCED ALGORITHMIC EXCELLENCE";
    const tagSize = 7.5;
    const tagW = helveticaBold.widthOfTextAtSize(logoTag, tagSize);
    page.drawText(logoTag, {
      x: cx - tagW / 2,
      y: logoY - 14,
      size: tagSize,
      font: helveticaBold,
      color: cMidGray,
    });

    // Divider line with central diamond under logo
    const divW = 120;
    page.drawLine({
      start: { x: cx - divW / 2, y: logoY - 22 },
      end: { x: cx - 10, y: logoY - 22 },
      thickness: 0.75,
      color: cLightGray,
    });
    drawDiamond(page, cx, logoY - 22, 2.5, cBrandRed);
    page.drawLine({
      start: { x: cx + 10, y: logoY - 22 },
      end: { x: cx + divW / 2, y: logoY - 22 },
      thickness: 0.75,
      color: cLightGray,
    });

    // 5. Title: "CERTIFICATE OF ACHIEVEMENT" prominently in black with red accents
    const titleText = "CERTIFICATE OF ACHIEVEMENT";
    const titleSize = 28;
    const titleW = helveticaBold.widthOfTextAtSize(titleText, titleSize);
    const titleY = height - 138;

    // Red accent lines flanking the title
    const titleFlankW = 50;
    page.drawLine({
      start: { x: cx - titleW / 2 - titleFlankW - 14, y: titleY + 9 },
      end: { x: cx - titleW / 2 - 14, y: titleY + 9 },
      thickness: 2,
      color: cBrandRed,
    });
    drawDiamond(page, cx - titleW / 2 - 14, titleY + 9, 3.5, cBrandRed);

    page.drawText(titleText, {
      x: cx - titleW / 2,
      y: titleY,
      size: titleSize,
      font: helveticaBold,
      color: cBlack,
    });

    drawDiamond(page, cx + titleW / 2 + 14, titleY + 9, 3.5, cBrandRed);
    page.drawLine({
      start: { x: cx + titleW / 2 + 14, y: titleY + 9 },
      end: { x: cx + titleW / 2 + titleFlankW + 14, y: titleY + 9 },
      thickness: 2,
      color: cBrandRed,
    });

    // 6. Presentation lead-in: "THIS IS PROUDLY PRESENTED TO"
    const presentText = "THIS IS PROUDLY PRESENTED TO";
    const presentSize = 10;
    const presentW = helveticaBold.widthOfTextAtSize(presentText, presentSize);
    page.drawText(presentText, {
      x: cx - presentW / 2,
      y: height - 176,
      size: presentSize,
      font: helveticaBold,
      color: rgb(0.46, 0.46, 0.5),
    });

    // 7. Recipient's Name: Large, bold, attractive serif in deep black (auto-scaled for long names)
    const recipientName = (user.name || "Software Engineer").trim();
    let nameSize = 38;
    let nameW = timesBold.widthOfTextAtSize(recipientName, nameSize);
    const maxAllowedNameW = 580;
    if (nameW > maxAllowedNameW) {
      nameSize = Math.max(22, Math.floor((maxAllowedNameW / nameW) * nameSize));
      nameW = timesBold.widthOfTextAtSize(recipientName, nameSize);
    }
    const nameY = height - 232;

    page.drawText(recipientName, {
      x: cx - nameW / 2,
      y: nameY,
      size: nameSize,
      font: timesBold,
      color: cBlack,
    });

    // Decorative name underline with central diamond
    const uHalfW = Math.min(Math.max(nameW * 0.7, 180), 320);
    page.drawLine({
      start: { x: cx - uHalfW, y: nameY - 12 },
      end: { x: cx - 12, y: nameY - 12 },
      thickness: 1.25,
      color: cBlack,
    });
    drawDiamond(page, cx, nameY - 12, 3.5, cBrandRed);
    page.drawLine({
      start: { x: cx + 12, y: nameY - 12 },
      end: { x: cx + uHalfW, y: nameY - 12 },
      thickness: 1.25,
      color: cBlack,
    });

    // 8. Certificate Description Citation
    const p1 =
      "For successfully completing at least 85% of BeeNext's Infinity DSA Sheet, demonstrating dedication,";
    const p2 =
      "proficiency in Data Structures and Algorithms, and a strong commitment to problem-solving excellence.";
    const pSize = 12.5;
    const p1W = timesRoman.widthOfTextAtSize(p1, pSize);
    const p2W = timesRoman.widthOfTextAtSize(p2, pSize);

    page.drawText(p1, {
      x: cx - p1W / 2,
      y: height - 278,
      size: pSize,
      font: timesRoman,
      color: cDarkGray,
    });

    page.drawText(p2, {
      x: cx - p2W / 2,
      y: height - 296,
      size: pSize,
      font: timesRoman,
      color: cDarkGray,
    });

    // 9. Decorative Red Achievement Seal with Ribbon
    const sealX = cx;
    const sealY = 168;

    // Hanging Ribbons behind the medallion (flowing downwards)
    page.drawSvgPath(createRibbonTail(-18, 17, 54), {
      x: sealX - 10,
      y: sealY,
      color: cRedDark,
    });
    page.drawSvgPath(createRibbonTail(18, 17, 54), {
      x: sealX + 10,
      y: sealY,
      color: cBrandRed,
    });

    // 24-point Rosette Seal
    const rosettePath = createCenteredRosette(41, 35, 24);
    page.drawSvgPath(rosettePath, { x: sealX, y: sealY, color: cBrandRed });

    // Outer White Border Ring
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 30,
      color: cRedDark,
      borderColor: cWhite,
      borderWidth: 1.5,
    });

    // Inner Fine White Hairline Ring
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 26,
      borderColor: rgb(1, 0.85, 0.85),
      borderWidth: 0.75,
    });

    // Center Emblem: Star & Ribbon text in pure white
    drawStar(page, sealX, sealY + 7, 9, 3.8, cWhite);

    const sealText = "EXCELLENCE";
    const sealTextSize = 5.5;
    const sealTextW = helveticaBold.widthOfTextAtSize(sealText, sealTextSize);
    page.drawText(sealText, {
      x: sealX - sealTextW / 2,
      y: sealY - 6,
      size: sealTextSize,
      font: helveticaBold,
      color: cWhite,
    });

    // Three small decorative stars below text
    drawStar(page, sealX - 9, sealY - 14, 2.8, 1.2, cWhite);
    drawStar(page, sealX, sealY - 14, 3.5, 1.5, cWhite);
    drawStar(page, sealX + 9, sealY - 14, 2.8, 1.2, cWhite);

    // 10. Footer Section
    // Bottom Left: Date, Certificate ID, Production Verification URL
    const footLeftX = 68;
    const issueDateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Issue Date
    page.drawText(`ISSUED: ${issueDateStr.toUpperCase()}`, {
      x: footLeftX,
      y: 96,
      size: 8.5,
      font: helveticaBold,
      color: cBlack,
    });

    // Certificate ID
    page.drawText(`CERTIFICATE ID: #${certOrder.orderNumber}`, {
      x: footLeftX,
      y: 82,
      size: 8.5,
      font: helveticaBold,
      color: cBrandRed,
    });

    // Verified URL (Matches actual production domain)
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const prodDomain =
      rawAppUrl && !rawAppUrl.includes("localhost") && !rawAppUrl.includes("127.0.0.1")
        ? rawAppUrl
        : "https://beenext-seven.vercel.app";
    const verificationUrl = `${prodDomain}/certificate`;

    page.drawText(`Official Verification: ${verificationUrl}`, {
      x: footLeftX,
      y: 68,
      size: 7.5,
      font: helvetica,
      color: cMidGray,
    });

    // Bottom Right: Issuing Authority & Professional Signature Line
    const footRightEndX = width - 68;
    const sigLineW = 185;
    const sigStartX = footRightEndX - sigLineW;
    const sigY = 96;

    // Signature line
    page.drawLine({
      start: { x: sigStartX, y: sigY },
      end: { x: footRightEndX, y: sigY },
      thickness: 1,
      color: cBlack,
    });
    // Small vertical decorative notch ticks at each end
    page.drawLine({
      start: { x: sigStartX, y: sigY - 3 },
      end: { x: sigStartX, y: sigY + 3 },
      thickness: 1,
      color: cBrandRed,
    });
    page.drawLine({
      start: { x: footRightEndX, y: sigY - 3 },
      end: { x: footRightEndX, y: sigY + 3 },
      thickness: 1,
      color: cBrandRed,
    });

    // Authority Titles
    const auth1 = "BeeNext Academic Board";
    const auth1Size = 10.5;
    const auth1W = helveticaBold.widthOfTextAtSize(auth1, auth1Size);
    page.drawText(auth1, {
      x: footRightEndX - auth1W,
      y: sigY - 14,
      size: auth1Size,
      font: helveticaBold,
      color: cBlack,
    });

    const auth2 = "Authorised Certification Authority";
    const auth2Size = 8;
    const auth2W = helvetica.widthOfTextAtSize(auth2, auth2Size);
    page.drawText(auth2, {
      x: footRightEndX - auth2W,
      y: sigY - 26,
      size: auth2Size,
      font: helvetica,
      color: cMidGray,
    });

    const auth3 = "BeeNext Learning Technologies";
    const auth3Size = 7;
    const auth3W = helvetica.widthOfTextAtSize(auth3, auth3Size);
    page.drawText(auth3, {
      x: footRightEndX - auth3W,
      y: sigY - 37,
      size: auth3Size,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.65),
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
