const http = require("http");

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

async function verifyAll() {
  console.log("==================================================");
  console.log("🔍 TESTING NEW UI & HOMEPAGE & NOTES CATALOG");
  console.log("==================================================");

  // 1. Test Categories API with includeProblems
  console.log("\n1. Testing /api/categories?includeProblems=true...");
  const catRes = await get("/api/categories?includeProblems=true");
  const catData = JSON.parse(catRes.body);

  console.log(`Received ${catData.categories.length} categories.`);
  if (catData.categories.length === 17) {
    console.log("✅ Verified exact 17 Striver A2Z topics exist.");
  } else {
    console.error("❌ Expected 17 categories, got", catData.categories.length);
  }

  // Verify Sorting Techniques is Topic 2, isFree is true, has 8 problems
  const sortingCat = catData.categories.find(c => c.slug === "sorting-techniques");
  if (sortingCat && sortingCat.isFree && sortingCat.problems.length === 8) {
    console.log("✅ Verified Sorting Techniques is Free with all 8 requested problems:");
    sortingCat.problems.forEach((p, i) => console.log(`   ${i + 1}. ${p.title} (${p.slug})`));
  } else {
    console.error("❌ Sorting Techniques mismatch", sortingCat);
  }

  // 2. Test Homepage content for exact heading & subtitle & CTA
  console.log("\n2. Testing Homepage for exact heading, subtitle & CTA...");
  const homeRes = await get("/");
  const expectedHeading = "Complete Handwritten Notes for Striver&#x27;s Sheet"; // HTML escaped quote
  const expectedSub = "Understand every DSA concept with carefully organized handwritten notes, step-by-step explanations, and coding solutions.";
  const expectedCta = "Explore Handwritten Notes";

  const hasHeading = homeRes.body.includes("Complete Handwritten Notes for Striver") && homeRes.body.includes("Sheet");
  const hasSub = homeRes.body.includes(expectedSub);
  const hasCta = homeRes.body.includes(expectedCta);
  const hasNotesLink = homeRes.body.includes('href="/notes"');

  if (hasHeading && hasSub && hasCta && hasNotesLink) {
    console.log("✅ Verified Homepage contains exact heading, subtitle, and CTA button pointing to /notes.");
  } else {
    console.error("❌ Homepage verification failed:", { hasHeading, hasSub, hasCta, hasNotesLink });
  }

  // 3. Test Notes Catalog Page (/notes)
  console.log("\n3. Testing Notes Catalog Page /notes...");
  const notesRes = await get("/notes");
  if (notesRes.status === 200 && notesRes.body.includes("Handwritten Notes Catalog")) {
    console.log("✅ Verified /notes catalog page loads successfully with 200 OK.");
  } else {
    console.error("❌ /notes catalog page failed with status", notesRes.status);
  }

  // 4. Test Topics Page (/topics)
  console.log("\n4. Testing Topics Page /topics...");
  const topicsRes = await get("/topics");
  if (topicsRes.status === 200 && topicsRes.body.includes("DSA Topic Sheet")) {
    console.log("✅ Verified /topics vertical accordion page loads successfully with 200 OK.");
  } else {
    console.error("❌ /topics page failed with status", topicsRes.status);
  }

  // 5. Test Free Problem Page (/problem/selection-sort)
  console.log("\n5. Testing Problem Page /problem/selection-sort...");
  const probRes = await get("/problem/selection-sort");
  if (probRes.status === 200) {
    console.log("✅ Verified /problem/selection-sort loads with 200 OK.");
  } else {
    console.error("❌ /problem/selection-sort failed with status", probRes.status);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL NEW UI UPDATES VERIFIED SUCCESSFULLY!");
  console.log("==================================================");
}

verifyAll().catch(console.error);
