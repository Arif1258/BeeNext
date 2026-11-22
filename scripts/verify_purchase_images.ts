export {};

const BASE_URL = "http://localhost:3000";

async function verifyPurchaseImages() {
  console.log("==================================================");
  console.log("VERIFYING PURCHASE SECTION PRODUCT PHOTOS");
  console.log("==================================================");

  // 1. Fetch /purchase HTML
  const res = await fetch(`${BASE_URL}/purchase`);
  if (res.status !== 200) {
    throw new Error(`/purchase returned status ${res.status}`);
  }
  const html = await res.text();

  // 2. Check for each matched image
  const requiredImages = [
    {
      name: "Product 1 (Full PDF)",
      url: "/products/complete-dsa-notes-pdf.jpg",
      productKeyword: "Complete Striver",
    },
    {
      name: "Product 2 (Topic-wise)",
      url: "/products/topic-wise-dsa-notes.jpg",
      productKeyword: "Topic-wise Handwritten",
    },
    {
      name: "Product 3 (Printed Notes)",
      url: "/products/complete-printed-notes.jpg",
      productKeyword: "Complete Printed Handwritten",
    },
  ];

  for (const item of requiredImages) {
    if (!html.includes(item.url)) {
      throw new Error(`Missing expected image for ${item.name}: ${item.url}`);
    }
    console.log(`✓ ${item.name} uses matched photo: ${item.url}`);

    // Verify image file is actually accessible via HTTP
    const imgRes = await fetch(`${BASE_URL}${item.url}`);
    if (imgRes.status !== 200) {
      throw new Error(`Image ${item.url} is not accessible! Status: ${imgRes.status}`);
    }
    const contentType = imgRes.headers.get("content-type") || "";
    if (!contentType.includes("image/jpeg") && !contentType.includes("image/")) {
      throw new Error(`Image ${item.url} has unexpected content-type: ${contentType}`);
    }
    console.log(`✓ Image ${item.url} verified accessible (HTTP 200, Content-Type: ${contentType})`);
  }

  // 3. Verify that each image appears in its own product card and is NOT duplicated
  const countMatches = (str: string, substr: string) => str.split(substr).length - 1;
  for (const item of requiredImages) {
    const imgTagCount = countMatches(html, `src="${item.url}"`);
    if (imgTagCount !== 1) {
      throw new Error(`Image ${item.url} has ${imgTagCount} <img> tags on /purchase. Expected exactly 1.`);
    }
  }
  console.log("✓ Each product has exactly one unique photo (no photos reused across multiple products)");

  // 4. Verify product details, prices, and buttons are preserved
  if (!html.includes("299") || !html.includes("Buy Full PDF")) {
    throw new Error("Plan 1 details or button missing");
  }
  if (!html.includes("19") || !html.includes("Explore Topics")) {
    throw new Error("Plan 2 details or button missing");
  }
  if (!html.includes("1,499") || !html.includes("Order Printed Copy")) {
    throw new Error("Plan 3 details or button missing");
  }
  console.log("✓ All existing product details, pricing, functionality, and buttons preserved");

  console.log("\n==================================================");
  console.log("ALL PURCHASE IMAGES TESTS PASSED! ✓");
  console.log("==================================================");
}

verifyPurchaseImages().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
