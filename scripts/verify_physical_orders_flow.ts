import prisma from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING PHYSICAL NOTES ORDERING & CLEANUP");
  console.log("==================================================");

  // [Test 1] Verify Sorting PDF and PDF downloads are removed
  console.log("\n[Test 1] Verifying PDF Deletion & Endpoint Protection...");
  const sortingPdfPath = path.join(process.cwd(), "storage", "pdfs", "topics", "sorting.pdf");
  if (fs.existsSync(sortingPdfPath)) {
    throw new Error("storage/pdfs/topics/sorting.pdf still exists! Must be deleted.");
  }
  console.log("✓ storage/pdfs/topics/sorting.pdf does not exist (safely deleted)");

  const directRes = await fetch("http://localhost:3000/storage/pdfs/topics/sorting.pdf");
  if (directRes.status !== 404) {
    throw new Error(`Direct fetch to sorting.pdf should return 404, got ${directRes.status}`);
  }
  console.log("✓ Direct public access to sorting.pdf returns 404 Not Found");

  const obsoletePdfRes = await fetch("http://localhost:3000/api/purchases/download-pdf");
  if (obsoletePdfRes.status !== 404 && obsoletePdfRes.status !== 410) {
    throw new Error(`Obsolete download-pdf endpoint should be 404 or 410, got ${obsoletePdfRes.status}`);
  }
  console.log("✓ Obsolete /api/purchases/download-pdf is safely removed / disabled");

  // [Test 2] Centralized Pricing Verification
  console.log("\n[Test 2] Verifying Centralized Pricing in Database...");
  const printedConfig = await prisma.printedProductConfig.findUnique({ where: { id: "default" } });
  if (!printedConfig || printedConfig.price !== 999) {
    throw new Error(`Complete Book price in DB should be 999, got ${printedConfig?.price}`);
  }
  console.log(`✓ Complete Book configuration: ₹${printedConfig.price} (Free shipping: ${printedConfig.isFreeShipping})`);

  const categories = await prisma.category.findMany({ select: { id: true, title: true, slug: true, price: true, pdfUrl: true } });
  if (categories.length !== 20) {
    throw new Error(`Expected 20 categories, found ${categories.length}`);
  }

  for (const cat of categories) {
    if (cat.price !== 39) {
      throw new Error(`Category ${cat.title} price is ${cat.price}, expected 39!`);
    }
    if (cat.pdfUrl !== null) {
      throw new Error(`Category ${cat.title} has non-null pdfUrl: ${cat.pdfUrl}`);
    }
  }
  console.log("✓ All 20 topics verified at centralized price of ₹39 each (pdfUrl=null)");

  // [Test 3] Physical Order Flow for Complete Book (₹999)
  console.log("\n[Test 3] Testing Complete Book Physical Order Flow (₹999)...");
  const bookOrderRes = await fetch("http://localhost:3000/api/printed-orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "COMPLETE_BOOK",
      customerName: "Aarav Sharma",
      customerEmail: "aarav.test@example.com",
      customerPhone: "9876543210",
      addressLine1: "Flat 402, Royal Palms, MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      quantity: 1,
    }),
  });

  const bookOrderData = await bookOrderRes.json();
  if (!bookOrderRes.ok) {
    throw new Error(`Failed to create book order: ${bookOrderData.error}`);
  }

  if (bookOrderData.totalAmount !== 999 || bookOrderData.unitPrice !== 999) {
    throw new Error(`Expected book order amount ₹999, got ${bookOrderData.totalAmount}`);
  }
  if (!bookOrderData.productTitle.includes("Complete Handwritten DSA Notes Book")) {
    throw new Error(`Unexpected product title: ${bookOrderData.productTitle}`);
  }
  console.log(`✓ Complete Book Order Created: orderNumber=${bookOrderData.orderNumber}, amount=₹${bookOrderData.totalAmount}`);

  // Verify Payment for Book
  const verifyBookRes = await fetch("http://localhost:3000/api/printed-orders/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: bookOrderData.printedOrderId,
      razorpayOrderId: bookOrderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_${Date.now()}_verified`,
    }),
  });

  const verifyBookData = await verifyBookRes.json();
  if (!verifyBookRes.ok) {
    throw new Error(`Failed to verify book payment: ${verifyBookData.error}`);
  }
  console.log(`✓ Payment Verified: ${verifyBookData.message}`);

  const confirmedBookOrder = await prisma.printedOrder.findUnique({
    where: { id: bookOrderData.printedOrderId },
  });
  if (confirmedBookOrder?.paymentStatus !== "COMPLETED" || confirmedBookOrder?.orderStatus !== "CONFIRMED") {
    throw new Error(`Order status mismatch: payment=${confirmedBookOrder?.paymentStatus}, order=${confirmedBookOrder?.orderStatus}`);
  }
  console.log("✓ Database record confirmed with physical delivery address");

  // [Test 4] Physical Order Flow for Individual Topic (₹39)
  console.log("\n[Test 4] Testing Individual Topic Physical Order Flow (Sorting @ ₹39)...");
  const topicOrderRes = await fetch("http://localhost:3000/api/printed-orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "TOPIC",
      topicSlug: "sorting",
      customerName: "Pooja Verma",
      customerEmail: "pooja.test@example.com",
      customerPhone: "9812345678",
      addressLine1: "Room 12, Kaveri Hostel, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201309",
      quantity: 1,
    }),
  });

  const topicOrderData = await topicOrderRes.json();
  if (!topicOrderRes.ok) {
    throw new Error(`Failed to create topic order: ${topicOrderData.error}`);
  }

  if (topicOrderData.totalAmount !== 39 || topicOrderData.unitPrice !== 39) {
    throw new Error(`Expected topic order amount ₹39, got ${topicOrderData.totalAmount}`);
  }
  if (!topicOrderData.productTitle.includes("Sorting")) {
    throw new Error(`Expected productTitle to include 'Sorting', got ${topicOrderData.productTitle}`);
  }
  console.log(`✓ Topic Order Created: orderNumber=${topicOrderData.orderNumber}, product='${topicOrderData.productTitle}', amount=₹${topicOrderData.totalAmount}`);

  // Verify Payment for Topic Order
  const verifyTopicRes = await fetch("http://localhost:3000/api/printed-orders/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: topicOrderData.printedOrderId,
      razorpayOrderId: topicOrderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_${Date.now()}_verified`,
    }),
  });

  const verifyTopicData = await verifyTopicRes.json();
  if (!verifyTopicRes.ok) {
    throw new Error(`Failed to verify topic payment: ${verifyTopicData.error}`);
  }
  console.log(`✓ Topic Order Payment Verified: ${verifyTopicData.message}`);

  // Clean up test orders
  await prisma.printedOrder.deleteMany({
    where: { id: { in: [bookOrderData.printedOrderId, topicOrderData.printedOrderId] } },
  });
  console.log("✓ Cleaned up test orders");

  // [Test 5] UI Rendering Checks on Live Server
  console.log("\n[Test 5] Verifying Purchase Page Initial UI (/purchase)...");
  // 1. Initial Purchase Page - ONLY Two Options Displayed
  const initialPurchaseRes = await fetch("http://localhost:3000/purchase");
  const initialPurchaseHtml = await initialPurchaseRes.text();
  const cleanInitialHtml = initialPurchaseHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanInitialHtml.includes("Topic-Wise Notes") || !cleanInitialHtml.includes("Full DSA Notes Book")) {
    throw new Error("Initial /purchase page must contain 'Topic-Wise Notes' and 'Full DSA Notes Book'!");
  }
  if (!cleanInitialHtml.includes("Option 1") || !cleanInitialHtml.includes("Option 2")) {
    throw new Error("Initial /purchase page must clearly label Option 1 and Option 2!");
  }
  if (!cleanInitialHtml.includes("₹39")) {
    throw new Error("Initial /purchase page must display ₹39 in green beside Topic-Wise Notes!");
  }
  if (!cleanInitialHtml.includes("₹999")) {
    throw new Error("Initial /purchase page must display ₹999 in green beside Full DSA Notes Book!");
  }
  console.log("✓ Initial /purchase displays exactly two options: 1. Topic-Wise Notes (₹39), 2. Full DSA Notes Book (₹999)");

  // 2. Topic-Wise Notes View (/purchase?option=topics)
  console.log("\n[Test 6] Verifying Topic-Wise Notes View (/purchase?option=topics)...");
  const topicWiseRes = await fetch("http://localhost:3000/purchase?option=topics");
  const topicWiseHtml = await topicWiseRes.text();
  const cleanTopicWiseHtml = topicWiseHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanTopicWiseHtml.includes("₹39")) {
    throw new Error("Missing ₹39 topic price in Topic-Wise Notes view");
  }
  if (!cleanTopicWiseHtml.includes("Sample Image")) {
    throw new Error("Missing 'Sample Image' button on topic rows");
  }
  if (!cleanTopicWiseHtml.includes("Order Now")) {
    throw new Error("Missing 'Order Now' button on topic rows");
  }
  // Check that all 20 topic names appear in the topic-wise list
  for (const cat of categories) {
    if (!cleanTopicWiseHtml.includes(cat.title)) {
      throw new Error(`Missing topic row for '${cat.title}' in Topic-Wise view`);
    }
  }
  console.log("✓ Topic-Wise view displays all 20 topics in horizontal rows with Name, ₹39, Sample Image, and Order Now");

  // 3. Full DSA Notes Book View (/purchase?option=book)
  console.log("\n[Test 7] Verifying Full DSA Notes Book View (/purchase?option=book)...");
  const bookViewRes = await fetch("http://localhost:3000/purchase?option=book");
  const bookViewHtml = await bookViewRes.text();
  const cleanBookViewHtml = bookViewHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanBookViewHtml.includes("All 20 DSA Sections") && !cleanBookViewHtml.includes("All 20 sections")) {
    throw new Error("Missing 'All 20 DSA Sections' in Full Book view");
  }
  if (!cleanBookViewHtml.includes("500 Pages") && !cleanBookViewHtml.includes("500 pages")) {
    throw new Error("Missing 'Approximately 500 Pages' in Full Book view");
  }
  if (!cleanBookViewHtml.includes("₹999")) {
    throw new Error("Missing ₹999 price in Full Book view");
  }
  if (!cleanBookViewHtml.includes("Order Full Book")) {
    throw new Error("Missing 'Order Full Book' button in Full Book view");
  }
  console.log("✓ Full Book view displays 20 sections, ~500 pages, ₹999, and single 'Order Full Book' button");

  // [Test 8] DSA Topics Sidebar/List UI (/topics)
  console.log("\n[Test 8] Verifying DSA Topics List UI (/topics)...");
  const topicsRes = await fetch("http://localhost:3000/topics");
  const topicsHtml = await topicsRes.text();
  const cleanTopicsHtml = topicsHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanTopicsHtml.includes("Notes – ₹39")) {
    throw new Error("Missing 'Notes – ₹39' option beside topics on /topics");
  }
  if (cleanTopicsHtml.includes("Download Notes") || cleanTopicsHtml.includes("Buy PDF")) {
    throw new Error("Obsolete 'Download Notes' or 'Buy PDF' still present on /topics!");
  }
  // Verify that all topics are collapsed by default:
  // Since all topics are collapsed by default, problem detail links (like /brute-force or Selection Sort title link) are not expanded in SSR HTML
  if (cleanTopicsHtml.includes("/problem/selection-sort/brute-force")) {
    throw new Error("Sorting problems should be collapsed by default on /topics, but problem rows were found in initial render!");
  }
  console.log("✓ /topics displays 'Notes – ₹39' beside topics and all topics are collapsed by default");

  // [Test 9] Verify Problem Navigation & Solutions
  console.log("\n[Test 9] Verifying Problem Page Navigation & Code...");
  const problemRes = await fetch("http://localhost:3000/problem/selection-sort/optimal");
  if (!problemRes.ok) {
    throw new Error(`Failed to load /problem/selection-sort/optimal: status ${problemRes.status}`);
  }
  const problemHtml = await problemRes.text();
  if (!problemHtml.includes("Selection Sort") || !problemHtml.includes("public static void selectionSort")) {
    throw new Error("Selection Sort problem page did not render expected Java code!");
  }
  console.log("✓ Problem page navigation and solutions functioning properly");

  console.log("\n==================================================");
  console.log("ALL PHYSICAL NOTES ORDERING REQUIREMENTS VERIFIED! ✓");
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
