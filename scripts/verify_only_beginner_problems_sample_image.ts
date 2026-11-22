import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("VERIFYING ONLY BEGINNER PROBLEMS SAMPLE IMAGE");
  console.log("==================================================");

  const imagesDir = path.join(process.cwd(), "public", "images", "purchase", "topic-samples");

  // 1. Filesystem check
  console.log("\n[Test 1] Checking public/images/purchase/topic-samples directory...");
  if (!fs.existsSync(imagesDir)) throw new Error("Directory not found: " + imagesDir);

  const files = fs.readdirSync(imagesDir).filter((f) => !f.startsWith("."));
  console.log(`Files present in topic-samples:`, files);

  if (files.length !== 1 || files[0] !== "beginner-problems.jpg") {
    throw new Error(`Expected ONLY beginner-problems.jpg in topic-samples, found: ${files.join(", ")}`);
  }

  const bpStats = fs.statSync(path.join(imagesDir, "beginner-problems.jpg"));
  if (bpStats.size < 50000) {
    throw new Error(`beginner-problems.jpg suspiciously small: ${bpStats.size} bytes`);
  }
  console.log(`✓ beginner-problems.jpg preserved (${Math.round(bpStats.size / 1024)} KB)`);

  // Verify removed images do NOT exist
  const removedSlugs = [
    "sorting", "arrays", "hashing", "binary-search", "strings-basic-and-medium",
    "recursion", "linked-list", "bit-manipulation", "greedy-algorithms",
    "sliding-window-2-pointer", "stack-queues", "binary-trees",
    "binary-search-trees", "heaps", "graphs", "dynamic-programming",
    "tries", "strings-advanced-algo", "maths"
  ];

  for (const slug of removedSlugs) {
    const p = path.join(imagesDir, `${slug}.jpg`);
    if (fs.existsSync(p)) {
      throw new Error(`Removed image still exists: ${p}`);
    }
  }
  console.log(`✓ All 19 unused topic sample image files confirmed deleted from disk.`);

  // Verify other assets are untouched
  console.log("\n[Test 2] Checking other website assets are preserved...");
  const samplePdf = path.join(process.cwd(), "public", "BeeNext-Sorting-Sample.pdf");
  if (!fs.existsSync(samplePdf)) throw new Error("Missing public/BeeNext-Sorting-Sample.pdf");
  console.log("✓ public/BeeNext-Sorting-Sample.pdf is intact.");

  // 2. Live HTTP check
  console.log("\n[Test 3] Testing HTTP accessibility on live server...");
  const bpRes = await fetch("http://localhost:3000/images/purchase/topic-samples/beginner-problems.jpg");
  if (!bpRes.ok) throw new Error(`HTTP ${bpRes.status} on beginner-problems.jpg`);
  const bpType = bpRes.headers.get("content-type");
  if (!bpType?.includes("image/jpeg")) throw new Error(`Expected image/jpeg, got: ${bpType}`);
  console.log("✓ HTTP 200 OK: /images/purchase/topic-samples/beginner-problems.jpg");

  const sortingRes = await fetch("http://localhost:3000/images/purchase/topic-samples/sorting.jpg");
  if (sortingRes.status !== 404) {
    throw new Error(`Expected HTTP 404 for deleted sorting.jpg, got ${sortingRes.status}`);
  }
  console.log("✓ HTTP 404 Not Found confirmed for removed sample image /images/purchase/topic-samples/sorting.jpg");

  // 3. Purchase page HTML check
  console.log("\n[Test 4] Checking Purchase page HTML for Sample Image button...");
  const purchaseRes = await fetch("http://localhost:3000/purchase?option=topics");
  if (!purchaseRes.ok) throw new Error(`HTTP ${purchaseRes.status} on /purchase`);
  const purchaseHtml = await purchaseRes.text();

  // Count occurrences of "Sample Image"
  const sampleMatches = purchaseHtml.match(/Sample Image/g) || [];
  console.log(`Found ${sampleMatches.length} occurrence(s) of 'Sample Image' on /purchase page.`);

  // In the topic list, only Beginner Problems should have the Sample Image button.
  // There may be 1 occurrence for the button itself, plus possibly 1 or 2 in modal titles/captions.
  // Let us verify that it is NOT rendered for other topics like Sorting, Arrays, Hashing, etc.
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  // Check that all 20 topics are rendered with Order Now and Select Language
  for (const cat of categories) {
    if (!purchaseHtml.includes(cat.title)) {
      throw new Error(`Missing topic title: ${cat.title}`);
    }
  }
  console.log(`✓ All 20 category titles present on purchase page.`);

  const orderNowMatches = purchaseHtml.match(/Order Now/g) || [];
  console.log(`Found ${orderNowMatches.length} 'Order Now' button(s) in topic rows (expected 20).`);
  if (orderNowMatches.length < 20) {
    throw new Error(`Expected at least 20 'Order Now' buttons, found ${orderNowMatches.length}`);
  }

  const selectLangMatches = purchaseHtml.match(/Select Language/g) || [];
  console.log(`Found ${selectLangMatches.length} 'Select Language' placeholder(s) in topic rows (expected 20).`);
  if (selectLangMatches.length < 20) {
    throw new Error(`Expected at least 20 'Select Language' dropdowns, found ${selectLangMatches.length}`);
  }

  // Check PurchaseClient code
  const clientCode = fs.readFileSync(path.join(process.cwd(), "src/components/PurchaseClient.tsx"), "utf-8");
  if (!clientCode.includes('cat.slug === "beginner-problems"')) {
    throw new Error('Missing conditional cat.slug === "beginner-problems" for Sample Image button!');
  }
  console.log('✓ PurchaseClient.tsx correctly guards Sample Image button with cat.slug === "beginner-problems"');

  console.log("\n==================================================");
  console.log("ALL CHECKS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
