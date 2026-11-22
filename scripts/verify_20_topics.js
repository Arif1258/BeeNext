const http = require("http");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EXPECTED_TOPIC_NAMES = [
  "Beginner Problems",
  "Sorting",
  "Arrays",
  "Hashing",
  "Binary Search",
  "Strings (Basic and Medium)",
  "Recursion",
  "Linked-List",
  "Bit Manipulation",
  "Greedy Algorithms",
  "Sliding Window / 2 Pointer",
  "Stack / Queues",
  "Binary Trees",
  "Binary Search Trees",
  "Heaps",
  "Graphs",
  "Dynamic Programming",
  "Tries",
  "Strings (Advanced Algo)",
  "Maths",
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
      res.on("error", reject);
    });
  });
}

async function verify() {
  console.log("=== VERIFYING 20 DSA TOPICS IMPLEMENTATION ===\n");

  // 1. Database Check
  console.log("1. Verifying Database Categories...");
  const categories = await prisma.category.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      problems: {
        where: { isPublished: true },
        select: { id: true, title: true, slug: true },
      },
    },
  });

  if (categories.length !== 20) {
    throw new Error(`Expected exactly 20 categories, but found ${categories.length}`);
  }
  console.log(`✅ Category count is exactly 20`);

  for (let i = 0; i < 20; i++) {
    const expectedName = EXPECTED_TOPIC_NAMES[i];
    const cat = categories[i];
    if (cat.order !== i + 1) {
      throw new Error(`Category ${cat.title} order expected ${i + 1}, but got ${cat.order}`);
    }
    if (cat.title !== expectedName) {
      throw new Error(`Category at index ${i} expected "${expectedName}", but got "${cat.title}"`);
    }

    if (cat.order === 2) {
      // Sorting
      if (cat.problems.length !== 8) {
        throw new Error(`Sorting expected 8 problems, but has ${cat.problems.length}`);
      }
      console.log(`✅ #${(i + 1).toString().padStart(2, "0")} ${cat.title}: Contains 8 active problems (Selection, Bubble, Insertion, Merge, Recursive Bubble, Recursive Insertion, Quick, Count Inversions)`);
    } else {
      if (cat.problems.length !== 0) {
        throw new Error(`Topic "${cat.title}" expected to be empty (0 problems), but has ${cat.problems.length}`);
      }
      console.log(`✅ #${(i + 1).toString().padStart(2, "0")} ${cat.title}: Empty (0 problems)`);
    }
  }

  // 2. Fetch /topics Page HTML
  console.log("\n2. Verifying /topics Web Page HTML...");
  const pageRes = await fetchUrl("http://localhost:3000/topics");
  if (pageRes.status !== 200) {
    throw new Error(`/topics returned status ${pageRes.status}`);
  }
  const html = pageRes.data;

  // Check each of the 20 topic names is present in the rendered HTML
  for (const name of EXPECTED_TOPIC_NAMES) {
    if (!html.includes(name)) {
      throw new Error(`/topics HTML missing expected topic title "${name}"`);
    }
  }
  console.log("✅ All 20 topic titles appear in rendered page HTML");

  // Check that Sorting problems appear in the HTML
  const expectedSortingProblems = [
    "Selection Sort",
    "Bubble Sort",
    "Insertion Sort",
    "Merge Sort",
    "Recursive Bubble Sort",
    "Recursive Insertion Sort",
    "Quick Sort",
    "Count Inversions",
  ];
  for (const pName of expectedSortingProblems) {
    if (!html.includes(pName)) {
      throw new Error(`Sorting problem "${pName}" not found in /topics HTML`);
    }
  }
  console.log("✅ All 8 Sorting problems are rendered in /topics HTML");

  // Check action links for Sorting problems
  if (!html.includes("Striver&#x27;s YouTube") && !html.includes("Striver's YouTube")) {
    throw new Error("Striver's YouTube link not found in /topics HTML");
  }
  if (!html.includes("LeetCode")) {
    throw new Error("LeetCode link not found in /topics HTML");
  }
  if (!html.includes("Brute")) {
    throw new Error("Brute link not found in /topics HTML");
  }
  if (!html.includes("Optimal")) {
    throw new Error("Optimal link not found in /topics HTML");
  }
  if (!html.includes("Handwritten")) {
    throw new Error("Handwritten link not found in /topics HTML");
  }
  console.log("✅ All problem actions (Striver's YouTube | LeetCode | Brute | Optimal | Handwritten) are present");

  // Check that placeholder text is NOT in the HTML
  if (html.includes("Problems are being curated for this topic")) {
    throw new Error("Found placeholder text 'Problems are being curated for this topic' in HTML!");
  }
  console.log("✅ No placeholder text found in HTML (empty topics appear clean and empty)");

  // Check overall progress bar text
  if (!html.includes("Your Progress:")) {
    throw new Error("Progress bar 'Your Progress:' not found in /topics HTML");
  }
  console.log("✅ Overall progress indicator is present above topics list");

  // 3. API Check (/api/categories)
  console.log("\n3. Verifying /api/categories Endpoint for Admin Dashboard...");
  const apiRes = await fetchUrl("http://localhost:3000/api/categories");
  if (apiRes.status !== 200) {
    throw new Error(`/api/categories returned status ${apiRes.status}`);
  }
  const apiData = JSON.parse(apiRes.data);
  if (!apiData.categories || apiData.categories.length !== 20) {
    throw new Error(`Expected 20 categories from /api/categories, got ${apiData.categories?.length}`);
  }
  console.log(`✅ /api/categories returned all 20 categories for Admin Dashboard dropdowns`);

  console.log("\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

verify()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
