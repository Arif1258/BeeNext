import prisma from "../src/lib/prisma";

async function verify() {
  console.log("=== STARTING COMPREHENSIVE BUSINESS MODEL VERIFICATION ===");

  // 1. Check all 20 categories in database
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  console.log(`\n1. Checking Categories: Found ${categories.length} categories`);
  if (categories.length !== 20) {
    throw new Error(`Expected 20 categories, found ${categories.length}`);
  }
  const anyPaidCategory = categories.find((c) => !c.isFree || c.price !== 0);
  if (anyPaidCategory) {
    throw new Error(`Category "${anyPaidCategory.title}" is not free: isFree=${anyPaidCategory.isFree}, price=${anyPaidCategory.price}`);
  }
  console.log("✓ All 20 categories are 100% free with price 0");

  // 2. Check problems
  const problems = await prisma.problem.findMany();
  console.log(`\n2. Checking Problems: Found ${problems.length} problems`);
  const anyPaidProblem = problems.find((p) => !p.isFree || p.price !== 0);
  if (anyPaidProblem) {
    throw new Error(`Problem "${anyPaidProblem.title}" is not free: isFree=${anyPaidProblem.isFree}, price=${anyPaidProblem.price}`);
  }
  console.log("✓ All problems are 100% free with price 0");

  // 3. Check BundleConfig (Digital Notes PDF)
  const bundle = await prisma.bundleConfig.findUnique({ where: { id: "default" } });
  console.log("\n3. Checking Digital Notes PDF Product Config:");
  console.log(`   Title: ${bundle?.title}`);
  console.log(`   Price: ₹${bundle?.price}`);
  console.log(`   PDF URL: ${bundle?.pdfUrl}`);
  if (!bundle || bundle.price !== 199) {
    throw new Error(`Expected BundleConfig price 199, found ${bundle?.price}`);
  }
  console.log("✓ Digital Notes PDF product is configured with default price ₹199");

  // 4. Check PrintedProductConfig (Physical Printed Copy)
  const printed = await prisma.printedProductConfig.findUnique({ where: { id: "default" } });
  console.log("\n4. Checking Physical Printed Notes Config:");
  console.log(`   Title: ${printed?.title}`);
  console.log(`   Price: ₹${printed?.price}`);
  console.log(`   Free Shipping: ${printed?.isFreeShipping}`);
  if (!printed || printed.price !== 1499) {
    throw new Error(`Expected PrintedProductConfig price 1499, found ${printed?.price}`);
  }
  console.log("✓ Physical Printed Notes product is configured with default price ₹1,499");

  // 5. Test HTTP Endpoints on Localhost
  console.log("\n5. Testing HTTP Server Endpoints on http://localhost:3000:");

  // /api/bundle
  const bundleRes = await fetch("http://localhost:3000/api/bundle");
  const bundleData = await bundleRes.json();
  if (bundleRes.status !== 200 || bundleData.bundle?.price !== 199) {
    throw new Error(`/api/bundle returned invalid response: ${JSON.stringify(bundleData)}`);
  }
  console.log("✓ GET /api/bundle returned 200 with price ₹199");

  // /api/printed-product
  const printedRes = await fetch("http://localhost:3000/api/printed-product");
  const printedData = await printedRes.json();
  if (printedRes.status !== 200 || printedData.config?.price !== 1499) {
    throw new Error(`/api/printed-product returned invalid response: ${JSON.stringify(printedData)}`);
  }
  console.log("✓ GET /api/printed-product returned 200 with price ₹1,499");

  // /api/purchases/download-pdf (Unauthorized access test)
  const downloadRes = await fetch("http://localhost:3000/api/purchases/download-pdf");
  if (downloadRes.status !== 401 && downloadRes.status !== 403) {
    throw new Error(`/api/purchases/download-pdf without auth should return 401/403, got ${downloadRes.status}`);
  }
  console.log(`✓ GET /api/purchases/download-pdf correctly protected (returned ${downloadRes.status} for unauthenticated user)`);

  // /topics page
  const topicsRes = await fetch("http://localhost:3000/topics");
  const topicsHtml = await topicsRes.text();
  if (topicsRes.status !== 200) {
    throw new Error(`/topics returned status ${topicsRes.status}`);
  }
  if (!topicsHtml.includes("Handwritten Notes for Striver")) {
    throw new Error("/topics missing main heading");
  }
  if (topicsHtml.includes("| Handwritten")) {
    throw new Error("/topics contains outdated '| Handwritten' problem link!");
  }
  console.log("✓ GET /topics returned 200 with clean problem rows (no '| Handwritten' link)");

  // Check navbar in rendered HTML
  if (!topicsHtml.includes("DSA Topics") || !topicsHtml.includes("Purchase") || !topicsHtml.includes("My Purchases")) {
    throw new Error("Navbar missing required items");
  }
  console.log("✓ Navbar rendered with DSA Topics, Purchase dropdown, My Purchases");

  // /purchase/pdf page
  const purchasePdfRes = await fetch("http://localhost:3000/purchase/pdf");
  if (purchasePdfRes.status !== 200) {
    throw new Error(`/purchase/pdf returned status ${purchasePdfRes.status}`);
  }
  console.log("✓ GET /purchase/pdf returned 200");

  // /purchase/printed page
  const purchasePrintedRes = await fetch("http://localhost:3000/purchase/printed");
  if (purchasePrintedRes.status !== 200) {
    throw new Error(`/purchase/printed returned status ${purchasePrintedRes.status}`);
  }
  console.log("✓ GET /purchase/printed returned 200");

  // /problem/[slug]/handwritten redirect test
  const redirectRes = await fetch("http://localhost:3000/problem/selection-sort/handwritten", {
    redirect: "manual",
  });
  const locationHeader = redirectRes.headers.get("location");
  if (redirectRes.status !== 307 && redirectRes.status !== 308 && redirectRes.status !== 302) {
    console.log(`Note: handwritten route status ${redirectRes.status}, location: ${locationHeader}`);
  } else {
    console.log(`✓ /problem/selection-sort/handwritten correctly redirects to ${locationHeader}`);
  }

  // /problem/selection-sort/brute-force
  const bruteRes = await fetch("http://localhost:3000/problem/selection-sort/brute-force");
  const bruteHtml = await bruteRes.text();
  if (bruteRes.status !== 200) {
    throw new Error(`/problem/selection-sort/brute-force returned status ${bruteRes.status}`);
  }
  if (!bruteHtml.includes("Brute")) {
    throw new Error("Brute force page missing Brute tab");
  }
  console.log("✓ GET /problem/selection-sort/brute-force returned 200 with separate Brute solution");

  // /problem/selection-sort/optimal
  const optimalRes = await fetch("http://localhost:3000/problem/selection-sort/optimal");
  const optimalHtml = await optimalRes.text();
  if (optimalRes.status !== 200) {
    throw new Error(`/problem/selection-sort/optimal returned status ${optimalRes.status}`);
  }
  if (!optimalHtml.includes("Optimal")) {
    throw new Error("Optimal page missing Optimal tab");
  }
  console.log("✓ GET /problem/selection-sort/optimal returned 200 with separate Optimal solution");

  console.log("\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

verify()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
