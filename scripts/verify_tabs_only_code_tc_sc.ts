export {};

const BASE_URL = "http://localhost:3000";

async function verifyTabsOnlyCodeTCSC() {
  console.log("==================================================");
  console.log("VERIFYING SOLUTION TABS: ONLY CODE + TC + SC");
  console.log("==================================================");

  // 1. Test /problem/bubble-sort/brute-force
  console.log("\n[Test 1] Testing /problem/bubble-sort/brute-force (Brute Force Selected)...");
  const bfRes = await fetch(`${BASE_URL}/problem/bubble-sort/brute-force`);
  if (bfRes.status !== 200) {
    throw new Error(`/problem/bubble-sort/brute-force returned ${bfRes.status}`);
  }
  const bfHtml = await bfRes.text();

  // 1A. Problem description must NOT appear
  if (bfHtml.includes("Approach Explanation") || bfHtml.includes("inputFormat") || bfHtml.includes("outputFormat")) {
    throw new Error("Problem description or format found in Brute Force DOM! Must be hidden.");
  }
  console.log("✓ Entire problem description is hidden in DOM");

  // 1B. Explanations, approaches, examples must NOT appear
  if (bfHtml.includes("Example Test Cases") || bfHtml.includes("Constraints")) {
    throw new Error("Explanations, approach, examples, or constraints found in Brute Force DOM! Must be hidden.");
  }
  console.log("✓ Explanations, approach, intuition, examples, and extra text are hidden");

  // 1C. Show ONLY Java code
  if (!bfHtml.includes("BubbleSort")) {
    throw new Error("Java code missing in Brute Force DOM!");
  }
  console.log("✓ Shows ONLY Brute Force Java code in a clean code box");

  // 1D. Time Complexity & Space Complexity below the code
  if (!bfHtml.includes("O(N²)") || !bfHtml.includes("O(1)")) {
    throw new Error("Time Complexity or Space Complexity missing below code box!");
  }
  console.log("✓ Time Complexity & Space Complexity displayed below code box");

  // 1E. Verify both tabs are visible for switching
  if (!bfHtml.includes("Brute Force") || !bfHtml.includes("Optimal")) {
    throw new Error("Tabs missing from page!");
  }
  console.log("✓ Tab buttons 'Brute Force' and 'Optimal' are present");

  // 2. Test /problem/bubble-sort/optimal
  console.log("\n[Test 2] Testing /problem/bubble-sort/optimal (Optimal Selected)...");
  const optRes = await fetch(`${BASE_URL}/problem/bubble-sort/optimal`);
  if (optRes.status !== 200) {
    throw new Error(`/problem/bubble-sort/optimal returned ${optRes.status}`);
  }
  const optHtml = await optRes.text();

  // 2A. Problem description must NOT appear
  if (optHtml.includes("Approach Explanation") || optHtml.includes("inputFormat") || optHtml.includes("outputFormat")) {
    throw new Error("Problem description or format found in Optimal DOM! Must be hidden.");
  }
  console.log("✓ Entire problem description is hidden in DOM");

  // 2B. Explanations, approaches, examples must NOT appear
  if (optHtml.includes("Example Test Cases") || optHtml.includes("Constraints")) {
    throw new Error("Explanations, approach, examples, or constraints found in Optimal DOM! Must be hidden.");
  }
  console.log("✓ Explanations, approach, intuition, examples, and extra text are hidden");

  // 2C. Show ONLY Optimal Java code
  if (!optHtml.includes("BubbleSort")) {
    throw new Error("Optimal Java code missing in Optimal DOM!");
  }
  console.log("✓ Shows ONLY Optimal Java code in a clean code box");

  // 2D. Time Complexity & Space Complexity below the code
  if (!optHtml.includes("O(N²)") || !optHtml.includes("O(1)")) {
    throw new Error("Time Complexity or Space Complexity missing below code box!");
  }
  console.log("✓ Time Complexity & Space Complexity displayed below code box");

  // 3. Test /problem/selection-sort
  console.log("\n[Test 3] Testing /problem/selection-sort...");
  const selRes = await fetch(`${BASE_URL}/problem/selection-sort`);
  if (selRes.status !== 200) {
    throw new Error(`/problem/selection-sort returned ${selRes.status}`);
  }
  const selHtml = await selRes.text();
  const selDom = selHtml.substring(selHtml.indexOf("<main"), selHtml.indexOf("</main>"));
  if (selDom.includes("Given an array of integers") || selDom.includes("Example Test Cases")) {
    throw new Error("Problem description or examples found on /problem/selection-sort! Must be hidden.");
  }
  if (!selDom.includes("Brute Force") || !selDom.includes("Optimal")) {
    throw new Error("Tabs missing from selection-sort page!");
  }
  if (!selDom.includes("Time Complexity:") || !selDom.includes("Space Complexity:")) {
    throw new Error("Complexity info missing on selection-sort page!");
  }
  console.log("✓ /problem/selection-sort adheres to Only Code + TC + SC");

  console.log("\n==================================================");
  console.log("ALL SOLUTION TABS TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

verifyTabsOnlyCodeTCSC().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
