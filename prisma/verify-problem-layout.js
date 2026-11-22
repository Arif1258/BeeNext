async function verifyProblemLayout() {
  console.log("==================================================");
  console.log("🔍 TESTING SIMPLIFIED PROBLEM DETAIL PAGE LAYOUT");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Fetch Count Inversions Problem Page
  console.log("1. Testing Count Inversions Problem Detail Page...");
  const res = await fetch("http://localhost:3000/problem/count-inversions");
  assert(res.ok && res.status === 200, "URL /problem/count-inversions returns HTTP 200 OK");

  const html = await res.text();

  // Problem Header & LeetCode redirect link
  assert(html.includes("Count Inversions"), "Page displays problem title 'Count Inversions'");
  assert(html.includes("Solve on LeetCode"), "Page contains 'Solve on LeetCode' redirect button");
  assert(html.includes("https://leetcode.com/problems/global-and-local-inversions/"), "LeetCode link preserved");

  // Section 1: Brute Force Solution
  assert(html.includes("Brute Force Solution"), "SECTION 1: Heading 'Brute Force Solution' present");
  assert(html.includes("O(N^2)") || html.includes("O(N&sup2;)"), "Section 1: Time complexity O(N^2) displayed");
  assert(html.includes("O(1)"), "Section 1: Space complexity O(1) displayed");
  assert(html.includes("Copy Code"), "Section 1: 'Copy Code' button present");
  assert(html.includes("CountInversionsNaive") || html.includes("countInversions"), "Section 1: Complete Java code displayed");

  // Section 2: Optimal Solution
  assert(html.includes("Optimal Solution"), "SECTION 2: Heading 'Optimal Solution' present");
  assert(html.includes("O(N log N)"), "Section 2: Time complexity O(N log N) displayed");
  assert(html.includes("CountInversionsOptimal") || html.includes("mergeSortAndCount"), "Section 2: Complete optimized Java code displayed");

  // Section 3: Handwritten Notes
  assert(html.includes("Handwritten Notes"), "SECTION 3: Heading 'Handwritten Notes' present");
  assert(html.includes("count-inversions.svg"), "Section 3: Handwritten note image rendered");

  // Check Exact Vertical Order: Brute Force < Optimal < Handwritten Notes
  const idxBrute = html.indexOf("Brute Force Solution");
  const idxOptimal = html.indexOf("Optimal Solution");
  const idxNotes = html.indexOf("Handwritten Notes");

  assert(
    idxBrute !== -1 && idxOptimal !== -1 && idxNotes !== -1,
    "All three sections found in document"
  );
  assert(
    idxBrute < idxOptimal,
    "Section 1 (Brute Force) appears BEFORE Section 2 (Optimal Solution)"
  );
  assert(
    idxOptimal < idxNotes,
    "Section 2 (Optimal Solution) appears BEFORE Section 3 (Handwritten Notes)"
  );

  // Check that clutter/tabs were removed
  assert(!html.includes("A. Problem Statement"), "Old Section Tab 'A. Problem Statement' removed");
  assert(!html.includes("B. Java Code Notes"), "Old Section Tab 'B. Java Code Notes' removed");
  assert(!html.includes("All Sections"), "Old 'All Sections' filter button removed");

  // 2. Test Other Problem Pages to verify global application
  console.log("\n2. Testing Global Reusability across other DSA problems...");
  const testSlugs = ["quick-sort", "merge-sort", "selection-sort", "bubble-sort"];

  for (const slug of testSlugs) {
    const pRes = await fetch(`http://localhost:3000/problem/${slug}`);
    assert(pRes.ok, `Problem page /problem/${slug} returns 200 OK`);
    const pHtml = await pRes.text();
    const pBrute = pHtml.indexOf("Brute Force Solution");
    const pOpt = pHtml.indexOf("Optimal Solution");
    const pNotes = pHtml.indexOf("Handwritten Notes");
    assert(
      pBrute !== -1 && pOpt !== -1 && pNotes !== -1 && pBrute < pOpt && pOpt < pNotes,
      `Problem /problem/${slug} follows exact 3-section vertical structure (Brute < Optimal < Notes)`
    );
  }

  console.log("\n==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed!`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyProblemLayout().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
