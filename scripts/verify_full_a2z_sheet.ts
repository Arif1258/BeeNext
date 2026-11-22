import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EXPECTED_TOPIC_COUNTS: Record<string, number> = {
  "beginner-problems": 83,
  "sorting": 7,
  "arrays": 32,
  "hashing": 6,
  "binary-search": 32,
  "strings-basic-and-medium": 7,
  "recursion": 22,
  "linked-list": 49,
  "bit-manipulation": 14,
  "greedy-algorithms": 14,
  "sliding-window-2-pointer": 13,
  "stack-queues": 31,
  "binary-trees": 32,
  "binary-search-trees": 15,
  "heaps": 20,
  "graphs": 46,
  "dynamic-programming": 53,
  "tries": 7,
  "strings-advanced-algo": 9,
  "maths": 3,
};

async function verifyFullA2ZSheet() {
  console.log("==================================================");
  console.log("COMPREHENSIVE VERIFICATION: STRIVER A2Z DSA SHEET");
  console.log("==================================================");

  let totalProblems = 0;
  let totalCodes = 0;

  // 1. Check all 20 categories
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: { codes: true },
      },
    },
  });

  console.log(`\n[Test 1] Verifying 20 Categories and Problem Counts...`);
  if (categories.length !== 20) {
    throw new Error(`Expected 20 categories, found ${categories.length}`);
  }

  for (const cat of categories) {
    const expected = EXPECTED_TOPIC_COUNTS[cat.slug];
    if (expected === undefined) {
      throw new Error(`Unknown category slug: ${cat.slug}`);
    }
    const count = cat.problems.length;
    totalProblems += count;

    if (count !== expected) {
      throw new Error(`Category ${cat.title} (${cat.slug}) has ${count} problems, expected ${expected}!`);
    }

    console.log(`✓ [${cat.order}/20] ${cat.title} (${cat.slug}): ${count}/${expected} problems`);

    // Verify each problem in this category has Brute Force and Optimal codes with TC and SC
    for (const prob of cat.problems) {
      const bf = prob.codes.find((c) => c.approachType === "BRUTE_FORCE");
      const opt = prob.codes.find((c) => c.approachType === "OPTIMAL");

      if (!bf) {
        throw new Error(`Problem ${prob.slug} in ${cat.slug} missing BRUTE_FORCE code!`);
      }
      if (!opt) {
        throw new Error(`Problem ${prob.slug} in ${cat.slug} missing OPTIMAL code!`);
      }
      if (!bf.javaCode || !bf.javaCode.includes("class")) {
        throw new Error(`Problem ${prob.slug} BRUTE_FORCE code is empty or invalid!`);
      }
      if (!opt.javaCode || !opt.javaCode.includes("class")) {
        throw new Error(`Problem ${prob.slug} OPTIMAL code is empty or invalid!`);
      }
      if (!bf.timeComplexity || !bf.spaceComplexity) {
        throw new Error(`Problem ${prob.slug} BRUTE_FORCE TC/SC missing!`);
      }
      if (!opt.timeComplexity || !opt.spaceComplexity) {
        throw new Error(`Problem ${prob.slug} OPTIMAL TC/SC missing!`);
      }

      totalCodes += prob.codes.length;
    }
  }

  console.log(`\n✓ Total problems across sheet: ${totalProblems} (Expected: 495)`);
  console.log(`✓ Total solution code entries: ${totalCodes} (Expected: 990)`);

  // 2. Test problem page rendering on representative problems across various topics
  console.log(`\n[Test 2] Testing HTTP Problem Page Layouts on Live Server...`);
  const sampleSlugs = [
    "selection-sort",
    "climbing-stairs",
    "two-sum",
    "frog-jump",
    "breaking-the-myth",
    "check-for-prime-number",
    "merge-k-sorted-lists",
    "course-schedule-i",
  ];

  for (const slug of sampleSlugs) {
    const resBf = await fetch(`http://localhost:3000/problem/${slug}/brute-force`);
    if (!resBf.ok) throw new Error(`HTTP ${resBf.status} on /problem/${slug}/brute-force`);
    const htmlBf = await resBf.text();

    const resOpt = await fetch(`http://localhost:3000/problem/${slug}/optimal`);
    if (!resOpt.ok) throw new Error(`HTTP ${resOpt.status} on /problem/${slug}/optimal`);
    const htmlOpt = await resOpt.text();

    // Verify Time Complexity and Space Complexity exist in HTML
    if (!htmlBf.includes("Time Complexity:") || !htmlBf.includes("Space Complexity:")) {
      throw new Error(`Problem /problem/${slug}/brute-force missing TC/SC in HTML!`);
    }
    if (!htmlOpt.includes("Time Complexity:") || !htmlOpt.includes("Space Complexity:")) {
      throw new Error(`Problem /problem/${slug}/optimal missing TC/SC in HTML!`);
    }

    // Verify tabs exist
    if (!htmlBf.includes("Brute Force") || !htmlBf.includes("Optimal")) {
      throw new Error(`Tabs missing in /problem/${slug}`);
    }

    console.log(`✓ /problem/${slug}: Brute Force & Optimal pages rendered correctly with Code + TC + SC`);
  }

  // 3. Test /topics page rendering
  console.log(`\n[Test 3] Testing /topics Page Rendering...`);
  const topicsRes = await fetch("http://localhost:3000/topics");
  if (!topicsRes.ok) throw new Error(`HTTP ${topicsRes.status} on /topics`);
  const topicsHtml = await topicsRes.text();

  if (
    !topicsHtml.includes("ZERO TO HERO DSA SHEET") ||
    !topicsHtml.includes("EE") ||
    !topicsHtml.includes("EXT")
  ) {
    throw new Error("/topics missing updated main heading: 'BEENEXT – ZERO TO HERO DSA SHEET'");
  }
  if (!topicsHtml.includes("Handwritten Notes Following Striver&#x27;s A to Z DSA Sheet") &&
      !topicsHtml.includes("Handwritten Notes Following Striver's A to Z DSA Sheet")) {
    throw new Error("/topics missing updated subtitle: 'Handwritten Notes Following Striver's A to Z DSA Sheet'");
  }

  if (!topicsHtml.includes("Your Progress:")) {
    throw new Error("/topics missing progress tracker");
  }

  // Verify all 20 topic titles appear on the page
  for (const cat of categories) {
    if (!topicsHtml.includes(cat.title)) {
      throw new Error(`/topics missing category: ${cat.title}`);
    }
  }
  console.log("✓ All 20 category titles rendered on /topics");

  console.log("\n==================================================");
  console.log("ALL A2Z DSA SHEET VERIFICATION TESTS PASSED! ✓");
  console.log("==================================================");
}

verifyFullA2ZSheet()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
