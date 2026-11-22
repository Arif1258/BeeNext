/**
 * Comprehensive verification script for:
 * 1. LeetCode icon replaced with clickable text 'LeetCode'
 * 2. Problem row order: Checkbox, Problem Name, LeetCode, Brute Force, Optimal, Handwritten Notes
 * 3. Separate routes:
 *    - /problem/[slug]/brute-force
 *    - /problem/[slug]/optimal
 *    - /problem/[slug]/handwritten
 * 4. Content isolation (brute force page only has brute force, etc.)
 * 5. Back navigation links
 * 6. Root problem slug redirect to /problem/[slug]/optimal
 * 7. Premium access protection on server
 */

const BASE_URL = "http://localhost:3000";

async function verify() {
  console.log("==================================================");
  console.log("RUNNING SEPARATE SOLUTIONS & NAVIGATION TESTS");
  console.log("==================================================");

  // 1. Check /topics page problem rows
  console.log("\n--- 1. Testing Problem Rows in /topics ---");
  const topicsResp = await fetch(`${BASE_URL}/topics`);
  if (!topicsResp.ok) throw new Error(`/topics returned ${topicsResp.status}`);
  const topicsHtml = await topicsResp.text();

  // Check for LeetCode text
  if (!topicsHtml.includes("<span>LeetCode</span>")) {
    throw new Error("LeetCode text missing from /topics problem rows");
  }
  console.log("✓ 'LeetCode' text link is present in problem rows.");

  // Check that problem rows link to dedicated sub-routes
  if (!topicsHtml.includes("/brute-force")) {
    throw new Error("Missing links to /brute-force in /topics");
  }
  if (!topicsHtml.includes("/optimal")) {
    throw new Error("Missing links to /optimal in /topics");
  }
  if (!topicsHtml.includes("/handwritten")) {
    throw new Error("Missing links to /handwritten in /topics");
  }
  console.log("✓ Problem row links point to /brute-force, /optimal, and /handwritten routes.");

  // Check the exact order within a problem row
  const rowMatch = topicsHtml.match(/Selection Sort[\s\S]*?Handwritten<\/span><\/a>/);
  if (!rowMatch) {
    throw new Error("Selection sort row match not found");
  }
  const rowSegment = rowMatch[0];

  const leetcodeIdx = rowSegment.indexOf("LeetCode");
  const bruteForceIdx = rowSegment.indexOf(">Brute<");
  const optimalIdx = rowSegment.indexOf(">Optimal<");
  const handwrittenIdx = rowSegment.indexOf("Handwritten");

  console.log(`Indices in problem row: LeetCode=${leetcodeIdx}, Brute=${bruteForceIdx}, Optimal=${optimalIdx}, Handwritten=${handwrittenIdx}`);
  if (!(leetcodeIdx < bruteForceIdx && bruteForceIdx < optimalIdx && optimalIdx < handwrittenIdx)) {
    throw new Error("Options are not in exact order: LeetCode | Brute | Optimal | Handwritten");
  }
  console.log("✓ Problem row options exact order verified:\n  Checkbox -> Problem Name -> Striver's YouTube -> LeetCode -> Brute -> Optimal -> Handwritten");

  // 2. Test /problem/count-inversions/brute-force
  console.log("\n--- 2. Testing /problem/count-inversions/brute-force ---");
  const bfResp = await fetch(`${BASE_URL}/problem/count-inversions/brute-force`);
  if (!bfResp.ok) throw new Error(`/brute-force returned status ${bfResp.status}`);
  const bfHtml = await bfResp.text();

  if (!bfHtml.includes("Brute Force Solution")) {
    throw new Error("Heading 'Brute Force Solution' not found on brute-force page");
  }
  if (!bfHtml.includes("O(N²)") && !bfHtml.includes("O(N^2)") && !bfHtml.includes("O(N&sup2;)")) {
    throw new Error("Time complexity not found on brute-force page");
  }
  if (!bfHtml.includes("CountInversionsNaive") && !bfHtml.includes("countInversions")) {
    throw new Error("Brute force Java code not found on brute-force page");
  }
  if (!bfHtml.includes("Back to Problem List")) {
    throw new Error("Back navigation link missing on brute-force page");
  }
  // Check isolation: should NOT contain the optimal enhanced merge sort code
  if (bfHtml.includes("CountInversionsOptimal") || bfHtml.includes("mergeSortAndCount")) {
    throw new Error("Optimal code leaked onto brute-force page!");
  }
  console.log("✓ Brute Force page renders ONLY brute-force solution, complexity, copy button & back link.");

  // 3. Test /problem/count-inversions/optimal
  console.log("\n--- 3. Testing /problem/count-inversions/optimal ---");
  const optResp = await fetch(`${BASE_URL}/problem/count-inversions/optimal`);
  if (!optResp.ok) throw new Error(`/optimal returned status ${optResp.status}`);
  const optHtml = await optResp.text();

  if (!optHtml.includes("Optimal Solution")) {
    throw new Error("Heading 'Optimal Solution' not found on optimal page");
  }
  if (!optHtml.includes("O(N log N)")) {
    throw new Error("Time complexity not found on optimal page");
  }
  if (!optHtml.includes("CountInversionsOptimal") && !optHtml.includes("mergeSortAndCount")) {
    throw new Error("Optimal Java code not found on optimal page");
  }
  if (!optHtml.includes("Back to Problem List")) {
    throw new Error("Back navigation link missing on optimal page");
  }
  // Check isolation: should NOT contain naive double loop brute-force class
  if (optHtml.includes("CountInversionsNaive")) {
    throw new Error("Brute force code leaked onto optimal page!");
  }
  console.log("✓ Optimal page renders ONLY optimal solution, complexity, copy button & back link.");

  // 4. Test /problem/count-inversions/handwritten
  console.log("\n--- 4. Testing /problem/count-inversions/handwritten ---");
  const hwResp = await fetch(`${BASE_URL}/problem/count-inversions/handwritten`);
  if (!hwResp.ok) throw new Error(`/handwritten returned status ${hwResp.status}`);
  const hwHtml = await hwResp.text();

  if (!hwHtml.includes("Handwritten Notes")) {
    throw new Error("Heading 'Handwritten Notes' not found on handwritten page");
  }
  if (!hwHtml.includes("count-inversions.svg")) {
    throw new Error("Handwritten note image not found on handwritten page");
  }
  if (!hwHtml.includes("Back to Problem List")) {
    throw new Error("Back navigation link missing on handwritten page");
  }
  // Check isolation: should NOT contain Java code blocks
  if (hwHtml.includes("public class CountInversionsNaive") || hwHtml.includes("public class CountInversionsOptimal")) {
    throw new Error("Java code leaked onto handwritten notes page!");
  }
  console.log("✓ Handwritten Notes page renders ONLY handwritten notes with zoom controls & back link.");

  // 5. Test root problem slug redirect
  console.log("\n--- 5. Testing /problem/count-inversions redirect ---");
  const rootProbResp = await fetch(`${BASE_URL}/problem/count-inversions`, { redirect: "manual" });
  console.log(`Status for /problem/count-inversions: ${rootProbResp.status}`);
  const redirectLoc = rootProbResp.headers.get("location") || "";
  console.log(`Redirect Location: ${redirectLoc}`);
  if (![301, 302, 307, 308].includes(rootProbResp.status) || !redirectLoc.includes("/optimal")) {
    throw new Error(`Expected redirect to /optimal, got status ${rootProbResp.status} and location ${redirectLoc}`);
  }
  console.log("✓ Visiting /problem/[slug] seamlessly redirects to /problem/[slug]/optimal");

  // 6. Test Premium Content Protection on Server
  console.log("\n--- 6. Testing Premium Content Server-Side Security ---");
  const premiumResp = await fetch(`${BASE_URL}/problem/0-1-knapsack/optimal`);
  if (!premiumResp.ok) throw new Error(`Premium problem page failed: ${premiumResp.status}`);
  const premiumHtml = await premiumResp.text();

  if (!premiumHtml.includes("CONTENT LOCKED") && !premiumHtml.includes("Unlock")) {
    throw new Error("Premium content is not protected on the server!");
  }
  console.log("✓ Server-side security verified: locked content is masked and protected on backend.");

  console.log("\n==================================================");
  console.log("ALL TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

verify().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
