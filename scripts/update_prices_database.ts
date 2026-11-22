import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOPIC_PRICES: Record<string, number> = {
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
  console.log("==================================================");
  console.log("UPDATING PRICES IN DATABASE");
  console.log("==================================================");

  // 1. Update 20 Category prices
  console.log("\n[1] Updating 20 Category prices in database...");
  for (const [slug, price] of Object.entries(TOPIC_PRICES)) {
    const updated = await prisma.category.updateMany({
      where: { slug },
      data: { price },
    });
    console.log(`✓ Updated ${slug.padEnd(28)} -> ₹${price} (count: ${updated.count})`);
  }

  // 2. Update PrintedProductConfig to ₹1,499
  console.log("\n[2] Updating PrintedProductConfig to ₹1,499...");
  await prisma.printedProductConfig.upsert({
    where: { id: "default" },
    update: { price: 1499 },
    create: {
      id: "default",
      title: "Complete DSA Notes Book",
      description: "Physical printed DSA notes book covering all 20 DSA sections (~500 pages).",
      price: 1499,
      originalPrice: 2999,
      deliveryCharge: 0,
      isFreeShipping: true,
      isActive: true,
    },
  });
  console.log("✓ PrintedProductConfig price updated to ₹1,499");

  // 3. Update BundleConfig to ₹1,499
  console.log("\n[3] Updating BundleConfig to ₹1,499...");
  await prisma.bundleConfig.upsert({
    where: { id: "default" },
    update: { price: 1499 },
    create: {
      id: "default",
      title: "Complete DSA Notes Book",
      description: "Complete DSA notes book with computer-written Java solutions covering all 20 DSA sections (~500 pages).",
      price: 1499,
      originalPrice: 2999,
      topicPrice: 100,
      pdfUrl: "/notes/strivers-a2z-dsa-notes.pdf",
      isActive: true,
    },
  });
  console.log("✓ BundleConfig price updated to ₹1,499");

  // Verify all categories
  console.log("\n[4] Verifying updated category prices from database...");
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  for (const cat of categories) {
    const expected = TOPIC_PRICES[cat.slug];
    if (cat.price !== expected) {
      throw new Error(`Price mismatch for ${cat.title}! Expected ₹${expected}, got ₹${cat.price}`);
    }
    console.log(`✓ [${String(cat.order).padStart(2, "0")}] ${cat.title.padEnd(30)}: ₹${cat.price}`);
  }

  console.log("\n==================================================");
  console.log("DATABASE PRICES UPDATED & VERIFIED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
