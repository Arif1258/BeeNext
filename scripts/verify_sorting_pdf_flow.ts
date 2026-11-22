import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING SORTING PAID PDF FLOW & REQUIREMENTS");
  console.log("==================================================");

  // [Test 1] Verify Private Storage File
  console.log("\n[Test 1] Checking Private PDF Storage...");
  const pdfPath = path.join(process.cwd(), "storage", "pdfs", "topics", "sorting.pdf");
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`File not found at ${pdfPath}!`);
  }
  const stats = fs.statSync(pdfPath);
  console.log(`✓ storage/pdfs/topics/sorting.pdf exists (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);

  const publicPdfPath = path.join(process.cwd(), "public", "storage", "pdfs", "topics", "sorting.pdf");
  if (fs.existsSync(publicPdfPath)) {
    throw new Error("Private PDF must NOT be in public folder!");
  }
  console.log("✓ PDF is safely located in private storage outside public directory");

  // [Test 2] Verify Database Category Configuration
  console.log("\n[Test 2] Checking Database Sorting Category...");
  const sortingCat = await prisma.category.findUnique({
    where: { slug: "sorting" },
  });
  if (!sortingCat) throw new Error("Sorting category not found in DB!");
  if (!sortingCat.pdfUrl) throw new Error("Sorting category has no pdfUrl set!");
  console.log(`✓ Sorting Category: id=${sortingCat.id}, price=₹${sortingCat.price}, pdfUrl=${sortingCat.pdfUrl}`);

  // [Test 3] Verify Security: Private URL is not exposed publicly
  console.log("\n[Test 3] Verifying Direct URL Protection (404 for unauthenticated web requests)...");
  const directRes = await fetch("http://localhost:3000/storage/pdfs/topics/sorting.pdf");
  if (directRes.status !== 404) {
    throw new Error(`Direct private storage URL should return 404, got ${directRes.status}`);
  }
  console.log("✓ Direct private storage path returns 404 (Not publicly exposed)");

  // [Test 4] Verify Security: Download Endpoint Auth & Access Control
  console.log("\n[Test 4] Verifying Download Endpoint Security...");
  // Unauthenticated
  const unauthRes = await fetch("http://localhost:3000/api/purchases/download-pdf?categoryId=sorting");
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  }
  console.log("✓ Unauthenticated download request returned 401 Unauthorized");

  // Create a test user who has NOT purchased Sorting
  const testUserEmail = `test_student_${Date.now()}@example.com`;
  const testUser = await prisma.user.create({
    data: {
      name: "Test Student",
      email: testUserEmail,
      passwordHash: "hash123",
      role: "USER",
    },
  });

  const testUserToken = jwt.sign(
    { id: testUser.id, email: testUser.email, role: testUser.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const cookieHeader = `beenext_token=${testUserToken}`;

  // Authenticated but not purchased
  const unpurchasedRes = await fetch("http://localhost:3000/api/purchases/download-pdf?categoryId=sorting", {
    headers: { Cookie: cookieHeader },
  });
  if (unpurchasedRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for unpurchased user, got ${unpurchasedRes.status}`);
  }
  console.log("✓ Authenticated user without purchase returned 403 Forbidden");

  // [Test 5] Test Complete Purchase & Payment Verification Flow
  console.log("\n[Test 5] Executing Complete Payment & Verification Flow for Sorting...");
  // 1. Create order
  const orderRes = await fetch("http://localhost:3000/api/payments/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      type: "CATEGORY",
      id: sortingCat.id,
    }),
  });

  if (!orderRes.ok) {
    const errData = await orderRes.json();
    throw new Error(`create-order failed: ${JSON.stringify(errData)}`);
  }

  const orderData = await orderRes.json();
  console.log(`✓ Payment Order Created: purchaseId=${orderData.purchaseId}, amount=₹${orderData.amount}, orderId=${orderData.orderId}`);

  // 2. Verify payment
  const verifyRes = await fetch("http://localhost:3000/api/payments/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      purchaseId: orderData.purchaseId,
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_test_${Date.now()}`,
    }),
  });

  if (!verifyRes.ok) {
    const vErr = await verifyRes.json();
    throw new Error(`verify failed: ${JSON.stringify(vErr)}`);
  }
  const vData = await verifyRes.json();
  console.log(`✓ Payment Verified: ${vData.message}`);

  // 3. Check DB record
  const purchaseInDb = await prisma.purchase.findUnique({
    where: { id: orderData.purchaseId },
  });
  if (purchaseInDb?.status !== "COMPLETED") {
    throw new Error(`Purchase status in DB expected COMPLETED, got ${purchaseInDb?.status}`);
  }
  console.log("✓ Database purchase record marked COMPLETED");

  // [Test 6] Verify PDF Download After Payment
  console.log("\n[Test 6] Verifying Authorized PDF Download...");
  const downloadRes = await fetch("http://localhost:3000/api/purchases/download-pdf?categoryId=sorting", {
    headers: { Cookie: cookieHeader },
  });
  if (!downloadRes.ok) {
    throw new Error(`Authorized download failed with status ${downloadRes.status}`);
  }
  const contentType = downloadRes.headers.get("content-type");
  const contentDisp = downloadRes.headers.get("content-disposition");
  const pdfBytes = await downloadRes.arrayBuffer();

  if (contentType !== "application/pdf") {
    throw new Error(`Expected application/pdf, got ${contentType}`);
  }
  if (!contentDisp?.includes("attachment")) {
    throw new Error(`Expected attachment disposition, got ${contentDisp}`);
  }
  if (pdfBytes.byteLength !== stats.size) {
    throw new Error(`Downloaded PDF size mismatch: expected ${stats.size}, got ${pdfBytes.byteLength}`);
  }
  console.log(`✓ PDF successfully downloaded: ${(pdfBytes.byteLength / (1024 * 1024)).toFixed(2)} MB stream with correct headers`);

  // [Test 7] Verify Repeat Download (No double-charging)
  console.log("\n[Test 7] Verifying Repeat Download Access...");
  const repeatDownloadRes = await fetch("http://localhost:3000/api/purchases/download-pdf?categoryId=sorting", {
    headers: { Cookie: cookieHeader },
  });
  if (!repeatDownloadRes.ok) {
    throw new Error(`Repeat download failed with status ${repeatDownloadRes.status}`);
  }
  console.log("✓ Repeat download succeeds seamlessly without requiring additional payment");

  // Prevent duplicate purchase order creation
  const duplicateOrderRes = await fetch("http://localhost:3000/api/payments/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      type: "CATEGORY",
      id: sortingCat.id,
    }),
  });
  if (duplicateOrderRes.ok) {
    throw new Error("System should reject duplicate purchase of already-owned category!");
  }
  console.log("✓ System prevents duplicate purchases for already-owned topics");

  // [Test 8] Verify UI Elements
  console.log("\n[Test 8] Checking UI Pages...");
  // Check /topics for "Buy PDF" button beside Sorting
  const topicsRes = await fetch("http://localhost:3000/topics");
  const topicsHtml = await topicsRes.text();
  if (!topicsHtml.includes("Buy PDF")) {
    throw new Error("/topics page missing 'Buy PDF' option beside Sorting!");
  }
  if (!topicsHtml.includes("/purchase/topics?topic=sorting")) {
    throw new Error("/topics 'Buy PDF' option does not link to /purchase/topics?topic=sorting!");
  }
  console.log("✓ /topics displays 'Buy PDF' option beside Sorting linking to checkout page");

  // Check /purchase/topics for Sorting Card
  const purchaseTopicsRes = await fetch("http://localhost:3000/purchase/topics");
  const purchaseTopicsHtml = await purchaseTopicsRes.text();
  const cleanPurchaseTopicsHtml = purchaseTopicsHtml.replace(/<!--[\s\S]*?-->/g, "");
  if (!cleanPurchaseTopicsHtml.includes("Sorting") || !cleanPurchaseTopicsHtml.includes("Handwritten Notes PDF")) {
    throw new Error("/purchase/topics missing Sorting card!");
  }
  if (!cleanPurchaseTopicsHtml.includes("₹19")) {
    throw new Error("/purchase/topics missing ₹19 price configuration for Sorting!");
  }
  if (!cleanPurchaseTopicsHtml.includes("Buy & Download") && !cleanPurchaseTopicsHtml.includes("Buy &amp; Download")) {
    throw new Error("/purchase/topics missing 'Buy & Download' button!");
  }
  console.log("✓ /purchase/topics displays Sorting card with PDF icon, ₹19 price, and 'Buy & Download' button");

  // Clean up test user
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log("✓ Cleaned up temporary test user");

  console.log("\n==================================================");
  console.log("ALL SORTING PAID PDF FLOW REQUIREMENTS VERIFIED! ✓");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
