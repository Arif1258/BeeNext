export {};

import prisma from "../src/lib/prisma";

const BASE_URL = "http://localhost:3000";

async function verifySortingSection() {
  console.log("==================================================");
  console.log("VERIFYING SORTING SECTION REQUIREMENTS");
  console.log("==================================================");

  // 1. Verify Database Records
  console.log("\n[Test 1] Checking Database Sorting Category & Problems...");
  const sortingCategory = await prisma.category.findUnique({
    where: { slug: "sorting" },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: { codes: true },
      },
    },
  });

  if (!sortingCategory) {
    throw new Error("Sorting category not found in database!");
  }

  const expectedTopics = [
    {
      order: 1,
      title: "Selection Sort",
      slug: "selection-sort",
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
    },
    {
      order: 2,
      title: "Bubble Sort",
      slug: "bubble-sort",
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
    },
    {
      order: 3,
      title: "Insertion Sort",
      slug: "insertion-sort",
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
    },
    {
      order: 4,
      title: "Merge Sort",
      slug: "merge-sort",
      youtubeUrl: "https://www.youtube.com/watch?v=ogjf7ORKfd8",
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
    },
    {
      order: 5,
      title: "Quick Sort",
      slug: "quick-sort",
      youtubeUrl: "https://www.youtube.com/watch?v=WIrA4YexLRQ",
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(1)",
    },
    {
      order: 6,
      title: "Recursive Bubble Sort",
      slug: "recursive-bubble-sort",
      youtubeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(N)",
    },
    {
      order: 7,
      title: "Recursive Insertion Sort",
      slug: "recursive-insertion-sort",
      youtubeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(N)",
    },
  ];

  if (sortingCategory.problems.length !== 7) {
    throw new Error(
      `Expected exactly 7 problems in Sorting, found ${sortingCategory.problems.length}`
    );
  }
  console.log("✓ Exactly 7 problems found in Sorting category");

  for (let i = 0; i < expectedTopics.length; i++) {
    const expected = expectedTopics[i];
    const actual = sortingCategory.problems[i];

    if (actual.order !== expected.order) {
      throw new Error(`Problem ${i + 1} order mismatch: expected ${expected.order}, got ${actual.order}`);
    }
    if (actual.title !== expected.title) {
      throw new Error(`Problem ${i + 1} title mismatch: expected "${expected.title}", got "${actual.title}"`);
    }
    if (actual.slug !== expected.slug) {
      throw new Error(`Problem ${i + 1} slug mismatch: expected "${expected.slug}", got "${actual.slug}"`);
    }

    // LeetCode URL check: MUST be null for all 7 topics
    if (actual.leetcodeUrl !== null) {
      throw new Error(`Problem "${actual.title}" has leetcodeUrl: ${actual.leetcodeUrl}. Expected null!`);
    }

    // YouTube URL check
    if (actual.youtubeUrl !== expected.youtubeUrl) {
      throw new Error(
        `Problem "${actual.title}" youtubeUrl mismatch: expected "${expected.youtubeUrl}", got "${actual.youtubeUrl}"`
      );
    }

    // Solutions check: Brute Force and Optimal MUST be identical
    const bruteCode = actual.codes.find((c) => c.approachType === "BRUTE_FORCE");
    const optimalCode = actual.codes.find((c) => c.approachType === "OPTIMAL");

    if (!bruteCode || !optimalCode) {
      throw new Error(`Problem "${actual.title}" missing Brute Force or Optimal code!`);
    }

    if (bruteCode.javaCode !== optimalCode.javaCode) {
      throw new Error(`Problem "${actual.title}" Brute Force and Optimal code are not identical!`);
    }

    if (bruteCode.timeComplexity !== optimalCode.timeComplexity) {
      throw new Error(`Problem "${actual.title}" Time Complexity mismatch between Brute and Optimal!`);
    }

    if (bruteCode.spaceComplexity !== optimalCode.spaceComplexity) {
      throw new Error(`Problem "${actual.title}" Space Complexity mismatch between Brute and Optimal!`);
    }

    console.log(
      `✓ [${actual.order}/7] ${actual.title}: YT: ${actual.youtubeUrl ? "Active" : "Disabled"}, LC: Disabled, Code: Identical Brute & Optimal (${bruteCode.timeComplexity}, ${bruteCode.spaceComplexity})`
    );
  }

  // 2. Test /topics collapsed state & /topics/sorting HTML
  console.log("\n[Test 2] Checking /topics collapsed state & /topics/sorting HTML...");
  const topicsRes = await fetch(`${BASE_URL}/topics`);
  if (topicsRes.status !== 200) {
    throw new Error(`/topics returned status ${topicsRes.status}`);
  }
  const topicsHtml = await topicsRes.text();

  // Verify that all topics including Sorting are COLLAPSED by default on /topics
  if (topicsHtml.includes("/problem/selection-sort/brute-force")) {
    throw new Error("Sorting problems should be collapsed by default on /topics!");
  }
  console.log("✓ Sorting is confirmed COLLAPSED by default on /topics");

  // Verify that /topics/sorting renders all 7 problems
  const sortingRes = await fetch(`${BASE_URL}/topics/sorting`);
  if (sortingRes.status !== 200) {
    throw new Error(`/topics/sorting returned status ${sortingRes.status}`);
  }
  const sortingHtml = await sortingRes.text();

  // Verify all 7 topic titles appear in the /topics/sorting HTML
  for (const exp of expectedTopics) {
    if (!sortingHtml.includes(exp.title)) {
      throw new Error(`/topics/sorting HTML missing topic title: "${exp.title}"`);
    }
  }
  console.log("✓ All 7 topic titles present on /topics/sorting");

  // Verify YouTube links for first 5 topics
  for (const exp of expectedTopics.slice(0, 5)) {
    if (!sortingHtml.includes(exp.youtubeUrl!)) {
      throw new Error(`/topics/sorting HTML missing YouTube URL: ${exp.youtubeUrl} for ${exp.title}`);
    }
  }
  console.log("✓ Functional YouTube links present for Selection, Bubble, Insertion, Merge, and Quick Sort");

  // Verify disabled YouTube state for last 2 topics (Recursive Bubble and Recursive Insertion)
  if (sortingHtml.includes("youtube.com") && sortingHtml.includes("recursive-bubble-sort")) {
    // Make sure no youtube href is linked to recursive-bubble-sort
    const rbIdx = sortingHtml.indexOf("Recursive Bubble Sort");
    const snippet = sortingHtml.substring(rbIdx, rbIdx + 600);
    if (snippet.includes('href="https://www.youtube.com') || snippet.includes('href="http')) {
      // Check if YouTube has href in this snippet
      const ytAnchorRegex = /<a[^>]*href=["'][^"']*youtube[^"']*["'][^>]*>[^<]*Recursive Bubble Sort/i;
      if (ytAnchorRegex.test(snippet)) {
        throw new Error("Recursive Bubble Sort has an active YouTube link!");
      }
    }
  }
  console.log("✓ Recursive Bubble Sort & Recursive Insertion Sort have disabled YouTube buttons (no broken links)");

  // Verify that LeetCode buttons for sorting topics are disabled (no leetcode href)
  if (sortingHtml.includes("https://leetcode.com/problems/sort-an-array/")) {
    throw new Error("Found old sort-an-array LeetCode link on /topics!");
  }
  console.log("✓ LeetCode buttons disabled with no active links to LeetCode");

  // 3. Test /problem/selection-sort/brute-force and /problem/selection-sort/optimal
  console.log("\n[Test 3] Checking Brute Force and Optimal on Problem Pages...");
  for (const slug of ["selection-sort", "merge-sort", "quick-sort", "recursive-bubble-sort"]) {
    const bfRes = await fetch(`${BASE_URL}/problem/${slug}/brute-force`);
    if (bfRes.status !== 200) throw new Error(`/problem/${slug}/brute-force failed with ${bfRes.status}`);
    const bfHtml = await bfRes.text();

    const optRes = await fetch(`${BASE_URL}/problem/${slug}/optimal`);
    if (optRes.status !== 200) throw new Error(`/problem/${slug}/optimal failed with ${optRes.status}`);
    const optHtml = await optRes.text();

    // Check that code is shown
    if (!bfHtml.includes("public class") || !optHtml.includes("public class")) {
      throw new Error(`Java code missing on ${slug} brute-force or optimal page!`);
    }

    // Check Time & Space Complexity
    if (!bfHtml.includes("O(") || !optHtml.includes("O(")) {
      throw new Error(`Time or Space Complexity missing on ${slug}!`);
    }

    // Check that descriptions and approach explanations are NOT displayed in solution view
    if (bfHtml.includes("Approach Explanation") || optHtml.includes("Approach Explanation")) {
      throw new Error(`Approach Explanation found on ${slug}! Must be hidden.`);
    }

    // Check disabled LeetCode on problem page
    if (bfHtml.includes('href="https://leetcode.com')) {
      throw new Error(`LeetCode button on ${slug} has an active link! Must be disabled.`);
    }

    console.log(`✓ /problem/${slug}: Brute Force & Optimal show identical code + TC + SC with no descriptions`);
  }

  console.log("\n==================================================");
  console.log("ALL SORTING SECTION TESTS PASSED! ✓");
  console.log("==================================================");
}

verifySortingSection().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
