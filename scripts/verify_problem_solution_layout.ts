export {};

const BASE_URL = "http://localhost:3000";

async function verifyProblemPageLayout() {
  console.log("==================================================");
  console.log("VERIFYING SIMPLIFIED BRUTE FORCE & OPTIMAL LAYOUT");
  console.log("==================================================");

  // 1. Test /problem/count-inversions
  console.log("\n[Test 1] Testing /problem/count-inversions (Combined Page)...");
  const res = await fetch(`${BASE_URL}/problem/count-inversions`);
  if (res.status !== 200) {
    throw new Error(`/problem/count-inversions returned ${res.status}`);
  }
  const html = await res.text();

  // Verify simple headings: "Brute Force" and "Optimal"
  if (!html.includes(">Brute Force<")) {
    throw new Error("Missing simple heading 'Brute Force'");
  }
  if (!html.includes(">Optimal<")) {
    throw new Error("Missing simple heading 'Optimal'");
  }
  // Verify it does NOT use "Brute Force Solution" or "Optimal Solution"
  if (html.includes("Brute Force Solution") || html.includes("Optimal Solution")) {
    throw new Error("Heading should be strictly 'Brute Force' and 'Optimal', without 'Solution'");
  }
  console.log("✓ Headings are strictly simple: 'Brute Force' and 'Optimal'");

  // Verify order of appearance:
  const bfIdx = html.indexOf(">Brute Force<");
  const optIdx = html.indexOf(">Optimal<", bfIdx);

  if (bfIdx === -1 || optIdx === -1 || !(bfIdx < optIdx)) {
    throw new Error("Headings not in expected order: Brute Force -> Optimal");
  }
  console.log("✓ Order verified: Brute Force -> Optimal");

  // Verify Time & Space Complexity under Brute Force
  const bfSegment = html.substring(bfIdx, optIdx);
  if (!bfSegment.includes("Time Complexity:") || !bfSegment.includes("Space Complexity:")) {
    throw new Error("Brute force segment missing Time Complexity or Space Complexity");
  }
  console.log("✓ Brute force complexity info verified:\n   " +
    bfSegment.match(/Time Complexity:[^<]*/)?.[0] + " | " +
    bfSegment.match(/Space Complexity:[^<]*/)?.[0]
  );

  // Verify Time & Space Complexity under Optimal
  const optSegment = html.substring(optIdx);
  if (!optSegment.includes("Time Complexity:") || !optSegment.includes("Space Complexity:")) {
    throw new Error("Optimal segment missing Time Complexity or Space Complexity");
  }
  console.log("✓ Optimal complexity info verified:\n   " +
    optSegment.match(/Time Complexity:[^<]*/)?.[0] + " | " +
    optSegment.match(/Space Complexity:[^<]*/)?.[0]
  );

  // Verify Java code boxes
  if (!bfSegment.includes("Copy Code") || !optSegment.includes("Copy Code")) {
    throw new Error("Missing 'Copy Code' button in Java code boxes");
  }
  console.log("✓ 'Copy Code' buttons present in both code boxes");

  // Verify Java source code is present
  if (!bfSegment.includes("countInversions") && !bfSegment.includes("CountInversions")) {
    throw new Error("Brute force Java code not found");
  }
  if (!optSegment.includes("mergeSortAndCount") && !optSegment.includes("CountInversionsOptimal")) {
    throw new Error("Optimal Java code not found");
  }
  console.log("✓ Complete Java code rendered in both code boxes");

  // Verify NO unnecessary descriptions, approaches, or explanations
  if (html.includes("Approach Explanation") || html.includes("Approach 01") || html.includes("Recommended Approach")) {
    throw new Error("Approach descriptions/badges still present! Must be removed");
  }
  console.log("✓ No explanations, descriptions, approaches, or extra text");

  // Verify NO unnecessary decorative elements (like colored dots in code block)
  if (html.includes("bg-red-500/80") && html.includes("bg-amber-500/80")) {
    throw new Error("Decorative dots still present in code header bar!");
  }
  console.log("✓ No decorative elements in code header");

  // 2. Test /problem/count-inversions/brute-force (Isolated Brute Force Page)
  console.log("\n[Test 2] Testing /problem/count-inversions/brute-force (Isolated)...");
  const bfOnlyRes = await fetch(`${BASE_URL}/problem/count-inversions/brute-force`);
  if (bfOnlyRes.status !== 200) {
    throw new Error(`/problem/count-inversions/brute-force returned ${bfOnlyRes.status}`);
  }
  const bfOnlyHtml = await bfOnlyRes.text();

  if (!bfOnlyHtml.includes(">Brute Force<")) {
    throw new Error("Brute force route missing 'Brute Force' heading");
  }
  if (!bfOnlyHtml.includes("Time Complexity:") || !bfOnlyHtml.includes("Space Complexity:")) {
    throw new Error("Brute force route missing complexity info");
  }
  if (!bfOnlyHtml.includes("CountInversions") && !bfOnlyHtml.includes("countInversions")) {
    throw new Error("Brute force route missing Java code");
  }
  // Must NOT leak Optimal solution
  if (bfOnlyHtml.includes(">Optimal<") || bfOnlyHtml.includes("mergeSortAndCount")) {
    throw new Error("Optimal code leaked onto brute-force page!");
  }
  console.log("✓ /problem/count-inversions/brute-force strictly isolates Brute Force solution");

  // 3. Test /problem/count-inversions/optimal (Isolated Optimal Page)
  console.log("\n[Test 3] Testing /problem/count-inversions/optimal (Isolated)...");
  const optOnlyRes = await fetch(`${BASE_URL}/problem/count-inversions/optimal`);
  if (optOnlyRes.status !== 200) {
    throw new Error(`/problem/count-inversions/optimal returned ${optOnlyRes.status}`);
  }
  const optOnlyHtml = await optOnlyRes.text();

  if (!optOnlyHtml.includes(">Optimal<")) {
    throw new Error("Optimal route missing 'Optimal' heading");
  }
  if (!optOnlyHtml.includes("Time Complexity:") || !optOnlyHtml.includes("Space Complexity:")) {
    throw new Error("Optimal route missing complexity info");
  }
  if (!optOnlyHtml.includes("CountInversionsOptimal") && !optOnlyHtml.includes("mergeSortAndCount")) {
    throw new Error("Optimal route missing Java code");
  }
  // Must NOT leak Brute Force solution
  if (optOnlyHtml.includes(">Brute Force<") || optOnlyHtml.includes("CountInversionsNaive")) {
    throw new Error("Brute force code leaked onto optimal page!");
  }
  console.log("✓ /problem/count-inversions/optimal strictly isolates Optimal solution");

  // 4. Test another problem: /problem/selection-sort
  console.log("\n[Test 4] Testing /problem/selection-sort...");
  const selRes = await fetch(`${BASE_URL}/problem/selection-sort`);
  if (selRes.status !== 200) {
    throw new Error(`/problem/selection-sort returned ${selRes.status}`);
  }
  const selHtml = await selRes.text();
  if (!selHtml.includes(">Brute Force<") || !selHtml.includes(">Optimal<")) {
    throw new Error("Selection sort missing simplified headings");
  }
  if (!selHtml.includes("selectionSort") && !selHtml.includes("SelectionSort")) {
    throw new Error("Selection sort Java code missing");
  }
  console.log("✓ /problem/selection-sort renders same clean layout with Java code");

  console.log("\n==================================================");
  console.log("ALL SIMPLIFIED SOLUTION TESTS PASSED! ✓");
  console.log("==================================================");
}

verifyProblemPageLayout().catch((err) => {
  console.error("Layout verification failed:", err);
  process.exit(1);
});
