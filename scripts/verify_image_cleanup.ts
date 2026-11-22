export {};

const BASE_URL = "http://localhost:3000";

async function verifyImageCleanup() {
  console.log("==================================================");
  console.log("VERIFYING WEBSITE IMAGE CLEANUP REQUIREMENTS");
  console.log("==================================================");

  const allowedImages = [
    "/products/complete-dsa-notes-pdf.jpg",
    "/products/topic-wise-dsa-notes.jpg",
    "/products/complete-printed-notes.jpg",
  ];

  // 1. Verify that all 3 user-provided images exist and return 200 OK
  console.log("\n[Check 1] Verifying provided image assets exist and serve 200 OK...");
  for (const imgUrl of allowedImages) {
    const res = await fetch(`${BASE_URL}${imgUrl}`);
    if (res.status !== 200) {
      throw new Error(`Provided image ${imgUrl} returned HTTP ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image/jpeg") && !contentType.includes("image/")) {
      throw new Error(`Provided image ${imgUrl} returned unexpected content type: ${contentType}`);
    }
    console.log(`✓ ${imgUrl} accessible (HTTP 200, ${contentType})`);
  }

  // 2. Helper to extract all <img> src attributes from HTML
  function extractImgSources(html: string): string[] {
    const matches: string[] = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  // 3. Verify /purchase has only the 3 provided images
  console.log("\n[Check 2] Checking /purchase image sources...");
  const purchaseRes = await fetch(`${BASE_URL}/purchase`);
  const purchaseHtml = await purchaseRes.text();
  const purchaseImgs = extractImgSources(purchaseHtml);
  console.log(`  Found ${purchaseImgs.length} images on /purchase:`, purchaseImgs);
  if (purchaseImgs.length !== 3) {
    throw new Error(`/purchase should contain exactly 3 product images, found ${purchaseImgs.length}`);
  }
  for (const src of purchaseImgs) {
    if (!allowedImages.includes(src)) {
      throw new Error(`Unexpected image source on /purchase: ${src}`);
    }
  }
  console.log("✓ /purchase renders only the user-provided images");

  // 4. Verify /purchase/pdf has only the PDF product image
  console.log("\n[Check 3] Checking /purchase/pdf image sources...");
  const pdfRes = await fetch(`${BASE_URL}/purchase/pdf`);
  const pdfHtml = await pdfRes.text();
  const pdfImgs = extractImgSources(pdfHtml);
  console.log(`  Found ${pdfImgs.length} images on /purchase/pdf:`, pdfImgs);
  for (const src of pdfImgs) {
    if (src !== "/products/complete-dsa-notes-pdf.jpg") {
      throw new Error(`Unexpected image source on /purchase/pdf: ${src}`);
    }
  }
  if (pdfHtml.includes(".svg")) {
    throw new Error(`/purchase/pdf still contains .svg references!`);
  }
  console.log("✓ /purchase/pdf contains only the complete PDF product photo, no dummy SVGs");

  // 5. Verify /purchase/printed has only the Printed product image
  console.log("\n[Check 4] Checking /purchase/printed image sources...");
  const printedRes = await fetch(`${BASE_URL}/purchase/printed`);
  const printedHtml = await printedRes.text();
  const printedImgs = extractImgSources(printedHtml);
  console.log(`  Found ${printedImgs.length} images on /purchase/printed:`, printedImgs);
  for (const src of printedImgs) {
    if (src !== "/products/complete-printed-notes.jpg") {
      throw new Error(`Unexpected image source on /purchase/printed: ${src}`);
    }
  }
  if (printedHtml.includes(".svg")) {
    throw new Error(`/purchase/printed still contains .svg references!`);
  }
  console.log("✓ /purchase/printed contains only the complete printed notes photo, no dummy SVGs");

  // 6. Verify pages that should have 0 images have 0 images
  const zeroImagePages = [
    "/topics",
    "/profile",
    "/login",
    "/problem/selection-sort",
    "/problem/selection-sort/brute-force",
    "/problem/selection-sort/optimal",
  ];

  console.log("\n[Check 5] Verifying zero unnecessary images on learning and account pages...");
  for (const pagePath of zeroImagePages) {
    const pageRes = await fetch(`${BASE_URL}${pagePath}`);
    if (pageRes.status !== 200) throw new Error(`${pagePath} returned HTTP ${pageRes.status}`);
    const pageHtml = await pageRes.text();
    const imgs = extractImgSources(pageHtml);
    if (imgs.length > 0) {
      throw new Error(`${pagePath} has ${imgs.length} <img> tags: ${imgs.join(", ")}. Expected 0.`);
    }
    console.log(`✓ ${pagePath} has 0 unnecessary images`);
  }

  // 7. Verify downloadable deliverable PDF exists and is accessible
  console.log("\n[Check 6] Verifying downloadable notes PDF deliverables remain intact...");
  const pdfDeliverable = await fetch(`${BASE_URL}/notes/strivers-a2z-dsa-notes.pdf`);
  if (pdfDeliverable.status !== 200) {
    throw new Error(`/notes/strivers-a2z-dsa-notes.pdf returned ${pdfDeliverable.status}`);
  }
  console.log("✓ /notes/strivers-a2z-dsa-notes.pdf verified intact (HTTP 200)");

  console.log("\n==================================================");
  console.log("ALL IMAGE CLEANUP CHECKS PASSED PERFECTLY! ✓");
  console.log("==================================================");
}

verifyImageCleanup().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
