import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING DSA TOPICS: SEARCH REMOVAL & CIRCULAR GRAPH");
  console.log("==================================================");

  const topicsClientPath = path.join(process.cwd(), "src/components/TopicsClient.tsx");
  const topicsClientContent = fs.readFileSync(topicsClientPath, "utf8");

  // [Test 1] Verify search is completely removed
  console.log("\n[Test 1] Checking that search is completely removed from TopicsClient...");
  if (topicsClientContent.includes("searchQuery") || topicsClientContent.includes("setSearchQuery")) {
    throw new Error("searchQuery state should be completely removed!");
  }
  if (topicsClientContent.includes('placeholder="Search problems') || topicsClientContent.includes('type="text"')) {
    throw new Error("Search input field still exists in TopicsClient.tsx!");
  }
  if (topicsClientContent.includes("Search className") || topicsClientContent.includes("import { Search")) {
    throw new Error("Search icon still imported or rendered in TopicsClient.tsx!");
  }
  console.log("✓ Search bar, input, and icon completely removed from code");

  // [Test 2] Verify small circular progress graph above Completed Problems
  console.log("\n[Test 2] Checking circular progress graph...");
  if (!topicsClientContent.includes("<svg") || !topicsClientContent.includes("viewBox=\"0 0 36 36\"")) {
    throw new Error("Circular progress SVG missing from TopicsClient.tsx!");
  }
  if (!topicsClientContent.includes("text-emerald-400") || !topicsClientContent.includes("text-neutral-800")) {
    throw new Error("Circular progress graph must use green indicator (emerald) and subtle neutral background!");
  }
  if (!topicsClientContent.includes("{progressPercentage}%")) {
    throw new Error("Percentage must be displayed inside the circular progress graph!");
  }

  // Ensure circular graph comes before "Completed:" count
  const svgIndex = topicsClientContent.indexOf("<svg");
  const completedIndex = topicsClientContent.indexOf("Completed:", svgIndex);
  if (svgIndex === -1 || completedIndex === -1 || svgIndex > completedIndex) {
    throw new Error("Circular progress graph must be positioned ABOVE the Completed Problems section!");
  }
  console.log("✓ Small circular progress graph properly configured directly above Completed Problems section");

  // [Test 3] Verify HTML on live server
  console.log("\n[Test 3] Checking live /topics HTML rendering...");
  const res = await fetch("http://localhost:3000/topics");
  if (!res.ok) throw new Error(`/topics returned status ${res.status}`);
  const html = await res.text();
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "");

  // Verify no search input on page
  if (cleanHtml.includes('placeholder="Search') || cleanHtml.includes('placeholder="search')) {
    throw new Error("Search input still rendered in live /topics HTML!");
  }
  console.log("✓ Live /topics HTML confirmed free of search bar");

  // Verify circular progress SVG and completed count present in live HTML
  if (!cleanHtml.includes("viewBox=\"0 0 36 36\"") || !cleanHtml.includes("Overall problem completion progress")) {
    throw new Error("Circular progress graph SVG not found in live /topics HTML!");
  }
  if (!cleanHtml.includes("Completed:") || !cleanHtml.includes("Problems")) {
    throw new Error("Completed Problems section missing in live /topics HTML!");
  }
  console.log("✓ Live /topics HTML renders circular progress graph and completed count");

  // [Test 4] Verify topics list renders normally
  console.log("\n[Test 4] Checking topic list and navigation...");
  if (!cleanHtml.includes("Beginner Problems") || !cleanHtml.includes("Sorting") || !cleanHtml.includes("Arrays")) {
    throw new Error("Topic list failed to render on /topics!");
  }
  console.log("✓ All topics render normally with problem navigation preserved");

  console.log("\n==================================================");
  console.log("ALL DSA TOPICS PROGRESS & SEARCH CHECKS PASSED! ✓");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
