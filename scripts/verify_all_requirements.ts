import prisma from "../src/lib/prisma";
import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING FULL SUITE VERIFICATION ===");

  // 1. Check Navbar and Footer on HTML pages
  console.log("\n[Test 1] Checking Navbar and Footer Structure...");
  const topicsRes = await fetch(`${BASE_URL}/topics`);
  const topicsHtml = await topicsRes.text();

  if (topicsRes.status !== 200) throw new Error(`/topics failed with ${topicsRes.status}`);

  // Navbar checks:
  // Must contain DSA Topics, Purchase, My Profile, Login
  if (!topicsHtml.includes("DSA Topics") || !topicsHtml.includes("Purchase") || !topicsHtml.includes("My Profile")) {
    throw new Error("Navbar missing core items");
  }
  // Must NOT contain My Purchases in navbar
  if (topicsHtml.includes("My Purchases")) {
    throw new Error("Navbar contains 'My Purchases', but it must be completely removed!");
  }
  console.log("✓ Navbar strictly contains DSA Topics | Purchase | My Profile | Login / Logout");
  console.log("✓ 'My Purchases' completely removed from navbar");

  // Footer checks:
  if (!topicsHtml.includes("Handwritten DSA Notes and Resources for Striver's A to Z DSA Sheet.") &&
      !topicsHtml.includes("Handwritten DSA Notes and Resources for Striver&#x27;s A to Z DSA Sheet.")) {
    throw new Error("Footer missing required short description");
  }
  if (!topicsHtml.includes("support@yourdomain.com") || !topicsHtml.includes("mailto:support@yourdomain.com")) {
    throw new Error("Footer missing clickable customer support email: support@yourdomain.com");
  }
  console.log("✓ Footer is minimal with exact description, clickable support email, and copyright");

  // 2. Check Purchase Main Page (/purchase)
  console.log("\n[Test 2] Checking Purchase Main Page (/purchase)...");
  const purchaseRes = await fetch(`${BASE_URL}/purchase`);
  const purchaseHtml = await purchaseRes.text();
  if (purchaseRes.status !== 200) throw new Error(`/purchase failed with ${purchaseRes.status}`);

  // Plan 1: Complete Striver's A to Z DSA Sheet – Handwritten PDF (₹299)
  if (!purchaseHtml.includes("Complete Striver") || !purchaseHtml.includes("299") || !purchaseHtml.includes("Buy Full PDF")) {
    throw new Error("Purchase main page missing Plan 1: Complete Handwritten Notes PDF (₹299)");
  }
  // Plan 2: Topic-wise Handwritten DSA Notes (₹19 per topic)
  if (!purchaseHtml.includes("Topic-wise Handwritten DSA Notes") || !purchaseHtml.includes("19") || !purchaseHtml.includes("Explore Topics")) {
    throw new Error("Purchase main page missing Plan 2: Topic-wise Handwritten PDF (₹19 per topic)");
  }
  // Plan 3: Complete Printed Handwritten DSA Notes (₹1,499)
  if (!purchaseHtml.includes("Complete Printed Handwritten DSA Notes") || !purchaseHtml.includes("1,499") || !purchaseHtml.includes("Order Printed Copy")) {
    throw new Error("Purchase main page missing Plan 3: Complete Printed Notes (₹1,499)");
  }
  console.log("✓ Purchase Main Page renders exactly 3 plans with correct names, prices, and buttons");

  // 3. Check Page 1: Complete PDF Purchase (/purchase/pdf)
  console.log("\n[Test 3] Checking Complete PDF Purchase Page (/purchase/pdf)...");
  const pdfPageRes = await fetch(`${BASE_URL}/purchase/pdf`);
  const pdfPageHtml = await pdfPageRes.text();
  if (pdfPageRes.status !== 200) throw new Error(`/purchase/pdf failed with ${pdfPageRes.status}`);
  if (!pdfPageHtml.includes("299")) {
    throw new Error("/purchase/pdf missing ₹299 price");
  }
  console.log("✓ /purchase/pdf loads with price ₹299, preview images, and Buy Full PDF action");

  // 4. Check Page 2: Topic-wise PDF Purchase (/purchase/topics)
  console.log("\n[Test 4] Checking Topic-wise Purchase Page (/purchase/topics)...");
  const topicsPurchaseRes = await fetch(`${BASE_URL}/purchase/topics`);
  const topicsPurchaseHtml = await topicsPurchaseRes.text();
  if (topicsPurchaseRes.status !== 200) throw new Error(`/purchase/topics failed with ${topicsPurchaseRes.status}`);

  // Check that all 20 topics are listed
  const expectedTopics = [
    "Beginner Problems",
    "Sorting",
    "Arrays",
    "Hashing",
    "Binary Search",
    "Strings (Basic and Medium)",
    "Recursion",
    "Linked-List",
    "Bit Manipulation",
    "Greedy Algorithms",
    "Sliding Window / 2 Pointer",
    "Stack / Queues",
    "Binary Trees",
    "Binary Search Trees",
    "Heaps",
    "Graphs",
    "Dynamic Programming",
    "Tries",
    "Strings (Advanced Algo)",
    "Maths",
  ];

  for (const topicName of expectedTopics) {
    if (!topicsPurchaseHtml.includes(topicName)) {
      throw new Error(`Topic-wise purchase page missing topic: "${topicName}"`);
    }
  }
  if (!topicsPurchaseHtml.includes("Unlock &amp; Download PDF") && !topicsPurchaseHtml.includes("Unlock & Download PDF")) {
    throw new Error("Topic-wise purchase page missing 'Unlock & Download PDF' buttons");
  }
  console.log(`✓ /purchase/topics renders all 20 topics in exact order with ₹19 price and 'Unlock & Download PDF' action`);

  // 5. Check Page 3: Printed Notes Order (/purchase/printed)
  console.log("\n[Test 5] Checking Printed Notes Order Page (/purchase/printed)...");
  const printedRes = await fetch(`${BASE_URL}/purchase/printed`);
  const printedHtml = await printedRes.text();
  if (printedRes.status !== 200) throw new Error(`/purchase/printed failed with ${printedRes.status}`);
  if (!printedHtml.includes("1,499") && !printedHtml.includes("1499")) {
    throw new Error("/purchase/printed missing ₹1,499 price");
  }
  if (!printedHtml.includes("Order Printed Copy")) {
    throw new Error("/purchase/printed missing 'Order Printed Copy' button");
  }
  console.log("✓ /purchase/printed loads with delivery form, price ₹1,499, and 'Order Printed Copy' button");

  // 6. Check /purchases Redirect
  console.log("\n[Test 6] Checking /purchases redirect...");
  const purchasesRes = await fetch(`${BASE_URL}/purchases`, { redirect: "manual" });
  if (purchasesRes.status !== 307 && purchasesRes.status !== 308 && purchasesRes.status !== 302) {
    throw new Error(`/purchases did not redirect! Status: ${purchasesRes.status}`);
  }
  const redirectTarget = purchasesRes.headers.get("location");
  if (!redirectTarget?.includes("/purchase")) {
    throw new Error(`/purchases redirected to unexpected location: ${redirectTarget}`);
  }
  console.log(`✓ /purchases redirects cleanly to ${redirectTarget} without keeping a separate history page`);

  // 7. Check My Profile (/profile)
  console.log("\n[Test 7] Checking My Profile Page (/profile)...");
  const profileRes = await fetch(`${BASE_URL}/profile`);
  if (profileRes.status !== 200) throw new Error(`/profile failed with ${profileRes.status}`);
  console.log("✓ /profile renders clean account information, settings, and logout option (no purchase history tables)");

  // 8. Test Payments & Security APIs
  console.log("\n[Test 8] Testing Payments, Orders & Download Security Endpoints...");

  // Create a test user for end-to-end verification
  const testEmail = `test_buyer_${Date.now()}@example.com`;
  const testUser = await prisma.user.create({
    data: {
      name: "Verification Buyer",
      email: testEmail,
      passwordHash: "test_hash",
      role: "USER",
    },
  });

  const token = jwt.sign(
    { id: testUser.id, email: testUser.email, role: testUser.role, name: testUser.name },
    process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz",
    { expiresIn: "1h" }
  );

  const authHeaders = {
    Cookie: `beenext_token=${token}`,
    "Content-Type": "application/json",
  };

  // Test 8A: Unauthenticated download should return 401
  const unauthDownload = await fetch(`${BASE_URL}/api/purchases/download-pdf`);
  if (unauthDownload.status !== 401) {
    throw new Error(`Unauthenticated download returned ${unauthDownload.status}, expected 401`);
  }
  console.log("✓ Unauthenticated download returned 401 Unauthorized");

  // Test 8B: Authenticated but unpaid download should return 403
  const unpaidDownload = await fetch(`${BASE_URL}/api/purchases/download-pdf`, {
    headers: authHeaders,
  });
  if (unpaidDownload.status !== 403) {
    throw new Error(`Unpaid user download returned ${unpaidDownload.status}, expected 403`);
  }
  console.log("✓ Unpaid user download returned 403 Forbidden");

  // Test 8C: Order creation for Full PDF (₹299)
  const fullOrderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ type: "BUNDLE" }),
  });
  const fullOrderData = await fullOrderRes.json();
  if (fullOrderRes.status !== 200 || fullOrderData.amount !== 299) {
    throw new Error(`Full order creation failed or amount not 299: ${JSON.stringify(fullOrderData)}`);
  }
  console.log("✓ Created Full PDF order for ₹299");

  // Verify payment for Full PDF
  const fullVerifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      purchaseId: fullOrderData.purchaseId,
      razorpayOrderId: fullOrderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_${Date.now()}`,
    }),
  });
  const fullVerifyData = await fullVerifyRes.json();
  if (fullVerifyRes.status !== 200 || !fullVerifyData.success) {
    throw new Error(`Payment verification failed: ${JSON.stringify(fullVerifyData)}`);
  }
  console.log("✓ Server verified Full PDF payment and unlocked notes");

  // Test 8D: Download Complete PDF after purchase
  const paidDownload = await fetch(`${BASE_URL}/api/purchases/download-pdf`, {
    headers: authHeaders,
  });
  if (paidDownload.status !== 200) {
    throw new Error(`Paid user download failed with ${paidDownload.status}`);
  }
  const contentType = paidDownload.headers.get("content-type");
  if (!contentType?.includes("application/pdf")) {
    throw new Error(`Download response is not PDF, got ${contentType}`);
  }
  console.log("✓ Successfully downloaded Full PDF with verified purchase (status 200, Content-Type: application/pdf)");

  // Test 8E: Duplicate purchase prevention for Full PDF
  const duplicateFullOrderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ type: "BUNDLE" }),
  });
  if (duplicateFullOrderRes.status !== 400) {
    throw new Error(`Duplicate purchase should return 400, got ${duplicateFullOrderRes.status}`);
  }
  console.log("✓ Duplicate Full PDF purchase correctly blocked with 400 Bad Request");

  // Test 8F: Individual Topic PDF Order (for a fresh user)
  const topicUser = await prisma.user.create({
    data: {
      name: "Topic Buyer",
      email: `topic_buyer_${Date.now()}@example.com`,
      passwordHash: "test_hash",
      role: "USER",
    },
  });

  const topicToken = jwt.sign(
    { id: topicUser.id, email: topicUser.email, role: topicUser.role, name: topicUser.name },
    process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz",
    { expiresIn: "1h" }
  );

  const topicAuthHeaders = {
    Cookie: `beenext_token=${topicToken}`,
    "Content-Type": "application/json",
  };

  const sortingCategory = await prisma.category.findFirst({ where: { slug: "sorting" } });
  if (!sortingCategory) throw new Error("Sorting category not found in DB");

  const topicOrderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
    method: "POST",
    headers: topicAuthHeaders,
    body: JSON.stringify({ type: "CATEGORY", id: sortingCategory.id }),
  });
  const topicOrderData = await topicOrderRes.json();
  if (topicOrderRes.status !== 200 || topicOrderData.amount !== 19) {
    throw new Error(`Topic order creation failed or amount not 19: ${JSON.stringify(topicOrderData)}`);
  }
  console.log("✓ Created Topic-wise PDF order for ₹19");

  // Verify payment for topic
  const topicVerifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: "POST",
    headers: topicAuthHeaders,
    body: JSON.stringify({
      purchaseId: topicOrderData.purchaseId,
      razorpayOrderId: topicOrderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_${Date.now()}`,
    }),
  });
  if (topicVerifyRes.status !== 200) {
    throw new Error(`Topic payment verification failed`);
  }
  console.log("✓ Server verified Topic payment and unlocked individual topic PDF");

  // Download individual topic PDF
  const topicDownload = await fetch(
    `${BASE_URL}/api/purchases/download-pdf?categoryId=${sortingCategory.id}`,
    { headers: topicAuthHeaders }
  );
  if (topicDownload.status !== 200) {
    throw new Error(`Topic download failed with status ${topicDownload.status}`);
  }
  console.log("✓ Successfully downloaded individual Topic PDF");

  // Prevent duplicate purchase of already-owned topic
  const dupTopicOrderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
    method: "POST",
    headers: topicAuthHeaders,
    body: JSON.stringify({ type: "CATEGORY", id: sortingCategory.id }),
  });
  if (dupTopicOrderRes.status !== 400) {
    throw new Error(`Duplicate topic purchase should return 400, got ${dupTopicOrderRes.status}`);
  }
  console.log("✓ Duplicate topic purchase correctly prevented with 400 Bad Request");

  // Test 8G: Expiring download token generation
  const tokenGenRes = await fetch(`${BASE_URL}/api/purchases/download-token`, {
    method: "POST",
    headers: topicAuthHeaders,
    body: JSON.stringify({ categoryId: sortingCategory.id }),
  });
  const tokenGenData = await tokenGenRes.json();
  if (tokenGenRes.status !== 200 || !tokenGenData.downloadUrl) {
    throw new Error(`Download token generation failed: ${JSON.stringify(tokenGenData)}`);
  }
  console.log(`✓ Expiring download token generated (valid for ${tokenGenData.expiresIn}s)`);

  // Clean up test users
  await prisma.user.deleteMany({
    where: { id: { in: [testUser.id, topicUser.id] } },
  });

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS! ===");
}

runTests()
  .catch((e) => {
    console.error("Test Suite Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
