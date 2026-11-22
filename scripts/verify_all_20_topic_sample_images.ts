import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyAllTopicSampleImages() {
  console.log("==================================================");
  console.log("VERIFYING 20 TOPIC SAMPLE IMAGES IN PURCHASE");
  console.log("==================================================");

  const imagesDir = path.join(process.cwd(), "public", "images", "purchase", "topic-samples");
  if (!fs.existsSync(imagesDir)) {
    throw new Error(`Directory not found: ${imagesDir}`);
  }

  // 1. Fetch all 20 categories from DB
  console.log("\n[Test 1] Checking DB Categories & Corresponding Files...");
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  if (categories.length !== 20) {
    throw new Error(`Expected 20 categories in DB, found ${categories.length}`);
  }

  for (const cat of categories) {
    const filename = `${cat.slug}.jpg`;
    const filePath = path.join(imagesDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing sample image for topic ${cat.title} at: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size < 50000) {
      throw new Error(`Sample image for ${cat.title} is suspiciously small: ${stats.size} bytes`);
    }

    console.log(`✓ [${String(cat.order).padStart(2, "0")}/20] ${cat.title.padEnd(30)} -> ${filename} (${Math.round(stats.size / 1024)} KB)`);
  }

  // 2. Test HTTP accessibility of all 20 images
  console.log("\n[Test 2] Testing HTTP Accessibility on Live Server...");
  for (const cat of categories) {
    const url = `http://localhost:3000/images/purchase/topic-samples/${cat.slug}.jpg`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} when fetching ${url}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("image/jpeg")) {
      throw new Error(`Expected image/jpeg for ${cat.slug}, got ${contentType}`);
    }
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength < 50000) {
      throw new Error(`Downloaded buffer too small for ${cat.slug}: ${arrayBuf.byteLength}`);
    }
    console.log(`✓ HTTP 200 OK: /images/purchase/topic-samples/${cat.slug}.jpg (${Math.round(arrayBuf.byteLength / 1024)} KB)`);
  }

  // 3. Test /purchase page HTML
  console.log("\n[Test 3] Testing /purchase page rendering...");
  const purchaseRes = await fetch("http://localhost:3000/purchase?option=topics");
  if (!purchaseRes.ok) throw new Error(`HTTP ${purchaseRes.status} on /purchase`);
  const purchaseHtml = await purchaseRes.text();

  // Count Sample Image buttons (one for each topic)
  const sampleBtnCount = (purchaseHtml.match(/Sample Image/g) || []).length;
  console.log(`✓ 'Sample Image' button occurs ${sampleBtnCount} times in purchase page (expected >= 20)`);
  if (sampleBtnCount < 20) {
    throw new Error(`Expected at least 20 Sample Image buttons, found ${sampleBtnCount}`);
  }

  // Verify PurchaseClient.tsx integration
  const clientCode = fs.readFileSync(path.join(process.cwd(), "src/components/PurchaseClient.tsx"), "utf-8");
  if (!clientCode.includes("Topic Sample Image")) {
    throw new Error("Missing 'Topic Sample Image' in PurchaseClient.tsx");
  }
  if (!clientCode.includes("/images/purchase/topic-samples/")) {
    throw new Error("Missing '/images/purchase/topic-samples/' in PurchaseClient.tsx");
  }
  console.log("✓ PurchaseClient modal correctly wired to /images/purchase/topic-samples/${topic.slug}.jpg");

  // 4. Test physical book covers for Sorting and Arrays
  console.log("\n[Test 4] Verifying physical book covers for Sorting and Arrays...");
  const sortingRef = path.join(imagesDir, "sorting.jpg");
  const arraysRef = path.join(imagesDir, "arrays.jpg");
  const sortingSize = fs.statSync(sortingRef).size;
  const arraysSize = fs.statSync(arraysRef).size;

  if (sortingSize < 200000) {
    throw new Error(`Sorting book cover suspiciously small: ${sortingSize} bytes`);
  }
  if (arraysSize < 200000) {
    throw new Error(`Arrays book cover suspiciously small: ${arraysSize} bytes`);
  }
  console.log(`✓ Sorting (${Math.round(sortingSize / 1024)} KB) and Arrays (${Math.round(arraysSize / 1024)} KB) physical book covers verified.`);

  console.log("\n==================================================");
  console.log("ALL 20 TOPIC SAMPLE IMAGE TESTS PASSED! ✓");
  console.log("==================================================");
}

verifyAllTopicSampleImages()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
