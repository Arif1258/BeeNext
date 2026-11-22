async function verifyTopicsUI() {
  console.log("==================================================");
  console.log("🔍 TESTING CLEAN TOPICS UI & PROBLEM ROWS");
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

  // 1. Fetch Topics Page
  console.log("1. Testing DSA Topics Page (/topics)...");
  const topicsRes = await fetch("http://localhost:3000/topics");
  assert(topicsRes.ok && topicsRes.status === 200, "/topics loads with 200 OK");
  const topicsHtml = await topicsRes.text();

  assert(topicsHtml.includes("DSA Topics"), "Header displays clean 'DSA Topics'");
  assert(
    !topicsHtml.includes("Lomuto &amp; Hoare partition, recursion tree depths") &&
    !topicsHtml.includes("Lomuto & Hoare partition"),
    "Extra descriptive paragraph below topic title successfully removed"
  );

  // Check simplified single-row problem items
  assert(topicsHtml.includes("Selection Sort"), "Problem 'Selection Sort' present in list");
  assert(topicsHtml.includes("Brute Force"), "Compact 'Brute Force' link present in problem row");
  assert(topicsHtml.includes("Optimal Sol."), "Compact 'Optimal Sol.' link present in problem row");
  assert(topicsHtml.includes("Handwritten Notes"), "Compact 'Handwritten Notes' link present in problem row");
  assert(topicsHtml.includes("#brute-force"), "Link contains anchor #brute-force");
  assert(topicsHtml.includes("#optimal"), "Link contains anchor #optimal");
  assert(topicsHtml.includes("#handwritten-notes"), "Link contains anchor #handwritten-notes");
  assert(topicsHtml.includes("aria-label=\"Solve on LeetCode\""), "LeetCode icon present beside problem");
  assert(topicsHtml.includes("title=\"Mark as completed\"") || topicsHtml.includes("Mark as completed"), "Completion checkbox present before problem name");

  // 2. Fetch Topic Detail Page (/topics/sorting-techniques)
  console.log("\n2. Testing Single Topic Detail Page (/topics/sorting-techniques)...");
  const catRes = await fetch("http://localhost:3000/topics/sorting-techniques");
  assert(catRes.ok && catRes.status === 200, "/topics/sorting-techniques loads with 200 OK");
  const catHtml = await catRes.text();

  assert(catHtml.includes("Selection Sort"), "Topic page contains Selection Sort problem row");
  assert(catHtml.includes("Brute Force"), "Topic page contains compact 'Brute Force' link");
  assert(catHtml.includes("Optimal Sol."), "Topic page contains compact 'Optimal Sol.' link");
  assert(catHtml.includes("Handwritten Notes"), "Topic page contains compact 'Handwritten Notes' link");
  assert(catHtml.includes("#brute-force"), "Topic page link points to #brute-force");
  assert(catHtml.includes("#optimal"), "Topic page link points to #optimal");
  assert(catHtml.includes("#handwritten-notes"), "Topic page link points to #handwritten-notes");

  // 3. Test Progress Persistence API
  console.log("\n3. Testing User Progress Persistence in Database...");
  // Login as alex
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "alex@beenext.dev",
      password: "UserSecurePassword123!",
    }),
  });

  const cookie = loginRes.headers.get("set-cookie");
  assert(Boolean(cookie), "Test user login succeeds and returns cookie");

  // Get problem ID for selection-sort
  const probDataRes = await fetch("http://localhost:3000/api/problems/selection-sort");
  const probData = await probDataRes.json();
  const selectionSortId = probData.problem?.id;
  assert(Boolean(selectionSortId), "Fetched selection-sort problem ID");

  // Mark completed
  const progressRes = await fetch("http://localhost:3000/api/user/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      problemId: selectionSortId,
      status: "COMPLETED",
    }),
  });
  const progressJson = await progressRes.json();
  assert(
    progressRes.ok && progressJson.progress?.status === "COMPLETED",
    "Marking problem COMPLETED persists to database via /api/user/progress"
  );

  // Check /api/auth/me returns the completed progress
  const meRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { Cookie: cookie },
  });
  const meJson = await meRes.json();
  const hasCompletedInMe = meJson.user?.progress?.some(
    (p) => p.problemId === selectionSortId && p.status === "COMPLETED"
  );
  assert(hasCompletedInMe, "User profile (/api/auth/me) reflects saved COMPLETED progress");

  // 4. Test Problem Detail Anchors
  console.log("\n4. Testing Problem Page Anchor Targets...");
  const problemRes = await fetch("http://localhost:3000/problem/selection-sort");
  assert(problemRes.ok, "/problem/selection-sort loads with 200 OK");
  const problemHtml = await problemRes.text();
  assert(problemHtml.includes('id="brute-force"'), "Problem detail page contains id='brute-force'");
  assert(problemHtml.includes('id="optimal"'), "Problem detail page contains id='optimal'");
  assert(problemHtml.includes('id="handwritten-notes"'), "Problem detail page contains id='handwritten-notes'");

  console.log("\n==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed!`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyTopicsUI().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
