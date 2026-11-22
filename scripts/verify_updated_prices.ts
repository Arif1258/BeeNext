import prisma from "../src/lib/prisma";
import { TOPIC_BOOK_PRICES, PRICING, getTopicPrice } from "../src/lib/pricing";

const EXPECTED_PRICES: Record<string, number> = {
  "beginner-problems": 241,
  "sorting": 89,
  "arrays": 139,
  "hashing": 87,
  "binary-search": 139,
  "strings-basic-and-medium": 89,
  "recursion": 119,
  "linked-list": 173,
  "bit-manipulation": 103,
  "greedy-algorithms": 103,
  "sliding-window-2-pointer": 101,
  "stack-queues": 137,
  "binary-trees": 139,
  "binary-search-trees": 105,
  "heaps": 115,
  "graphs": 167,
  "dynamic-programming": 181,
  "tries": 89,
  "strings-advanced-algo": 93,
  "maths": 81,
};

async function main() {
  console.log("=== VERIFYING PRICES ===");
  let failed = false;

  // 1. Verify DB Categories
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  console.log(`Found ${categories.length} categories in database.`);

  for (const cat of categories) {
    const expected = EXPECTED_PRICES[cat.slug];
    if (expected === undefined) {
      console.warn(`[WARN] Unknown category in DB: ${cat.slug}`);
      continue;
    }
    if (cat.price !== expected) {
      console.error(`[FAIL] DB Price mismatch for ${cat.title} (${cat.slug}): DB has ${cat.price}, expected ${expected}`);
      failed = true;
    } else {
      console.log(`[PASS] DB ${cat.title.padEnd(28)}: ₹${cat.price}`);
    }
  }

  // 2. Verify Configs
  const printedConfig = await prisma.printedProductConfig.findUnique({
    where: { id: "default" },
  });
  if (printedConfig?.price !== 1499) {
    console.error(`[FAIL] PrintedProductConfig price is ${printedConfig?.price}, expected 1499`);
    failed = true;
  } else {
    console.log(`[PASS] PrintedProductConfig price: ₹${printedConfig.price}`);
  }

  const bundleConfig = await prisma.bundleConfig.findUnique({
    where: { id: "default" },
  });
  if (bundleConfig?.price !== 1499) {
    console.error(`[FAIL] BundleConfig price is ${bundleConfig?.price}, expected 1499`);
    failed = true;
  } else {
    console.log(`[PASS] BundleConfig price: ₹${bundleConfig.price}`);
  }

  // 3. Verify PRICING constant
  if (PRICING.COMPLETE_BOOK.price !== 1499) {
    console.error(`[FAIL] PRICING.COMPLETE_BOOK.price is ${PRICING.COMPLETE_BOOK.price}, expected 1499`);
    failed = true;
  } else {
    console.log(`[PASS] PRICING.COMPLETE_BOOK.price is ₹${PRICING.COMPLETE_BOOK.price}`);
  }

  for (const [slug, expPrice] of Object.entries(EXPECTED_PRICES)) {
    if (TOPIC_BOOK_PRICES[slug] !== expPrice) {
      console.error(`[FAIL] TOPIC_BOOK_PRICES[${slug}] is ${TOPIC_BOOK_PRICES[slug]}, expected ${expPrice}`);
      failed = true;
    }
  }

  if (failed) {
    console.error("❌ Price verification failed!");
    process.exit(1);
  } else {
    console.log("✅ All price configurations and DB records verified successfully!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
