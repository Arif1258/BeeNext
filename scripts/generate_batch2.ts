import fs from "fs";
import { executeJava } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));

const batch2Inputs: Record<string, string[]> = {
  "find-row-with-maximum-1's": [
    "arr = [[0, 1, 1], [1, 1, 1], [0, 0, 0]], n = 3, m = 3",
    "arr = [[0, 0], [1, 1]], n = 2, m = 2",
    "arr = [[0]], n = 1, m = 1",
    "arr = [[1]], n = 1, m = 1",
    "arr = [[0, 0, 1, 1], [0, 1, 1, 1], [0, 0, 0, 1]], n = 3, m = 4",
    "arr = [[0, 0, 0], [0, 0, 0]], n = 2, m = 3"
  ],
  "find-the-mst-weight": [
    "V = 3, E = 3, edges = [[0, 1, 5], [1, 2, 10], [0, 2, 1]]",
    "V = 2, E = 1, edges = [[0, 1, 5]]",
    "V = 4, E = 5, edges = [[0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]]",
    "V = 3, E = 3, edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3]]",
    "V = 4, E = 4, edges = [[0, 1, 1], [1, 2, 2], [2, 3, 3], [3, 0, 4]]",
    "V = 5, E = 6, edges = [[0, 1, 2], [0, 3, 6], [1, 2, 3], [1, 3, 8], [1, 4, 5], [2, 4, 7]]"
  ],
  "flattening-of-ll": [
    "root = [[5, 7, 8, 30], [10, 20], [19, 22, 50], [28, 35, 40, 45]]",
    "root = [[5, 10, 19, 28]]",
    "root = [[1, 2, 3]]",
    "root = [[1], [2], [3]]",
    "root = [[3, 4], [1, 5]]",
    "root = [[2, 8], [5, 6], [1, 10]]"
  ],
  "flood-fill-algorithm": [
    "image = [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr = 1, sc = 1, color = 2",
    "image = [[0, 0, 0], [0, 0, 0]], sr = 0, sc = 0, color = 0",
    "image = [[1]], sr = 0, sc = 0, color = 2",
    "image = [[0, 0, 0], [0, 1, 1]], sr = 1, sc = 1, color = 1",
    "image = [[1, 2], [3, 4]], sr = 0, sc = 0, color = 5",
    "image = [[2, 2, 2], [2, 2, 0], [2, 0, 1]], sr = 1, sc = 1, color = 3"
  ],
  "floor-and-ceil-in-sorted-array": [
    "a = [1, 2, 8, 10, 11, 12, 19], n = 7, x = 5",
    "a = [1, 2, 8, 10, 11, 12, 19], n = 7, x = 0",
    "a = [1, 2, 8, 10, 11, 12, 19], n = 7, x = 20",
    "a = [3, 4, 7, 8, 8, 10], n = 6, x = 8",
    "a = [5], n = 1, x = 5",
    "a = [2, 5], n = 2, x = 3"
  ],
  "floyd-warshall-algorithm": [
    "matrix = [[0, 2, -1, -1], [1, 0, 3, -1], [-1, -1, 0, -1], [3, 5, 4, 0]]",
    "matrix = [[0, 25], [-1, 0]]",
    "matrix = [[0]]",
    "matrix = [[0, 3, -1], [2, 0, -1], [-1, 7, 0]]",
    "matrix = [[0, 1, 43], [1, 0, 6], [-1, -1, 0]]",
    "matrix = [[0, 5, -1, 10], [-1, 0, 3, -1], [-1, -1, 0, 1], [-1, -1, -1, 0]]"
  ],
  "fractional-knapsack": [
    "w = 50, arr = [[60, 10], [100, 20], [120, 30]], n = 3",
    "w = 50, arr = [[60, 10], [100, 20]], n = 2",
    "w = 10, arr = [[500, 30]], n = 1",
    "w = 20, arr = [[100, 20]], n = 1",
    "w = 5, arr = [[10, 2], [5, 3], [15, 5]], n = 3",
    "w = 100, arr = [[10, 10], [20, 20], [30, 30]], n = 3"
  ],
  "frog-jump": [
    "n = 4, heights = [10, 20, 30, 10]",
    "n = 3, heights = [10, 50, 10]",
    "n = 1, heights = [10]",
    "n = 2, heights = [10, 30]",
    "n = 5, heights = [30, 10, 60, 10, 60]",
    "n = 6, heights = [40, 10, 20, 70, 80, 10]"
  ],
  "frog-jump-with-k-distances": [
    "n = 5, k = 3, height = [10, 30, 40, 50, 20]",
    "n = 3, k = 1, height = [10, 20, 10]",
    "n = 2, k = 2, height = [10, 50]",
    "n = 4, k = 2, height = [10, 20, 30, 10]",
    "n = 6, k = 4, height = [40, 10, 20, 70, 80, 10]",
    "n = 5, k = 2, height = [10, 40, 30, 10, 20]"
  ],
  "heapify-algorithm": [
    "arr = [4, 10, 3, 5, 1], n = 5, i = 0",
    "arr = [1, 3, 5, 4, 6, 13, 10, 9, 8, 15, 17], n = 11, i = 2",
    "arr = [10], n = 1, i = 0",
    "arr = [3, 5, 1], n = 3, i = 0",
    "arr = [1, 2, 3, 4], n = 4, i = 1",
    "arr = [12, 11, 13, 5, 6, 7], n = 6, i = 0"
  ],
  "implement-stack-using-linkedlist": [
    "push(10), push(20), pop(), top()",
    "pop()",
    "push(5), push(15), pop(), pop()",
    "push(1), top(), pop()",
    "push(3), push(2), push(1), pop()",
    "push(100), pop(), pop()"
  ],
  "insert-before-given-node-in-dll": [
    "head = [1, 3], node = 3, val = 2",
    "head = [10], node = 10, val = 5",
    "head = [1, 2, 4], node = 4, val = 3",
    "head = [2, 3, 4], node = 2, val = 1",
    "head = [5, 15], node = 15, val = 10",
    "head = [1, 2, 3, 5], node = 5, val = 4"
  ],
  "insert-interval": [
    "intervals = [[1, 3], [6, 9]], newInterval = [2, 5]",
    "intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]",
    "intervals = [], newInterval = [5, 7]",
    "intervals = [[1, 5]], newInterval = [2, 3]",
    "intervals = [[1, 5]], newInterval = [2, 7]",
    "intervals = [[1, 5]], newInterval = [6, 8]"
  ],
  "introduction-": [
    "root = [1, 2, 3, 4, 5]",
    "root = [1]",
    "root = []",
    "root = [1, 2, 3]",
    "root = [5, 3, 8, 1, 4]",
    "root = [10, 5, 15, null, 7, 12, 20]"
  ],
  "introduction-to-bits-and-tricks": [
    "n = 13, i = 2",
    "n = 13, i = 1",
    "n = 8, i = 3",
    "n = 8, i = 2",
    "n = 1, i = 0",
    "n = 16, i = 4"
  ],
  "introduction-to-doubly-ll": [
    "arr = [1, 2, 3, 4, 5]",
    "arr = [4, 2, 5, 1]",
    "arr = [1]",
    "arr = [10, 20]",
    "arr = [5, 4, 3, 2, 1]",
    "arr = [7, 7, 7]"
  ],
  "introduction-to-singly-linkedlist": [
    "arr = [1, 2, 3, 4, 5]",
    "arr = [4, 2, 5, 1]",
    "arr = [1]",
    "arr = [10, 20]",
    "arr = [5, 4, 3, 2, 1]",
    "arr = [7, 7, 7]"
  ],
  "job-sequencing-problem": [
    "arr = [[1, 4, 20], [2, 1, 10], [3, 1, 40], [4, 1, 30]], n = 4",
    "arr = [[1, 2, 100], [2, 1, 19], [3, 2, 27], [4, 1, 25], [5, 1, 15]], n = 5",
    "arr = [[1, 1, 50]], n = 1",
    "arr = [[1, 2, 50], [2, 2, 60]], n = 2",
    "arr = [[1, 3, 35], [2, 4, 30], [3, 4, 25], [4, 2, 20], [5, 3, 15], [6, 1, 12], [7, 2, 5]], n = 7",
    "arr = [[1, 1, 10], [2, 1, 20], [3, 1, 30]], n = 3"
  ],
  "kosaraju's-algorithm": [
    "V = 5, adj = [[2, 3], [0], [1], [4], []]",
    "V = 4, adj = [[1], [2], [0], []]",
    "V = 1, adj = [[]]",
    "V = 3, adj = [[1], [2], [0]]",
    "V = 3, adj = [[], [], []]",
    "V = 4, adj = [[1], [2], [3], [0]]"
  ],
  "kth-element-of-2-sorted-arrays": [
    "arr1 = [2, 3, 6, 7, 9], arr2 = [1, 4, 8, 10], n = 5, m = 4, k = 5",
    "arr1 = [100, 112, 256, 349, 770], arr2 = [72, 86, 113, 119, 265, 445, 892], n = 5, m = 7, k = 7",
    "arr1 = [1], arr2 = [2], n = 1, m = 1, k = 1",
    "arr1 = [2, 4], arr2 = [1, 3, 5], n = 2, m = 3, k = 4",
    "arr1 = [1, 2, 3], arr2 = [4, 5, 6], n = 3, m = 3, k = 6",
    "arr1 = [5], arr2 = [1, 2, 3, 4], n = 1, m = 4, k = 3"
  ],
  "kth-smallest-and-largest-element-in-bst": [
    "root = [3, 1, 4, null, 2], k = 1",
    "root = [5, 3, 6, 2, 4, null, null, 1], k = 3",
    "root = [2, 1, 3], k = 2",
    "root = [1], k = 1",
    "root = [4, 2, 5, 1, 3], k = 3",
    "root = [10, 5, 15, 2, 7, 12, 20], k = 4"
  ],
  "largest-bst-in-binary-tree": [
    "root = [10, 5, 15, 1, 8, null, 7]",
    "root = [1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]",
    "root = [1]",
    "root = [2, 1, 3]",
    "root = [5, 2, 4, 1, 3]",
    "root = [50, 30, 60, 5, 20, 45, 70, null, null, null, null, null, null, 65, 80]"
  ],
  "letter-combinations-of-a-phone-number": [
    'digits = "23"',
    'digits = ""',
    'digits = "2"',
    'digits = "7"',
    'digits = "45"',
    'digits = "234"'
  ],
  "longest-common-prefix": [
    'strs = ["flower", "flow", "flight"]',
    'strs = ["dog", "racecar", "car"]',
    'strs = ["a"]',
    'strs = ["cir", "car"]',
    'strs = ["interstellar", "interstate", "interview"]',
    'strs = ["throne", "throne"]'
  ],
  "longest-repeating-character-replacement": [
    's = "ABAB", k = 2',
    's = "AABABBA", k = 1',
    's = "A", k = 0',
    's = "AAAA", k = 2',
    's = "ABBB", k = 2',
    's = "BAAA", k = 0'
  ]
};

async function run() {
  console.log("Running Batch 2 (25 problems)...");
  let passedCount = 0;
  for (const [slug, inputs] of Object.entries(batch2Inputs)) {
    const tmpl = reg[slug];
    const sol = sols[slug];
    const dummyCases = inputs.map((inp, idx) => ({ order: idx + 1, input: inp, expectedOutput: "" }));
    const execRes = executeJava(sol, tmpl, dummyCases);
    if (!execRes.success) {
      console.error(`FAIL [${slug}] compile error:`, execRes.error?.split("\n")[0]);
      continue;
    }
    const verifiedCases = inputs.map((inp, idx) => ({
      order: idx + 1,
      isSample: idx < 3,
      input: inp,
      expectedOutput: execRes.outputs[idx + 1] || ""
    }));

    // Verify self-consistency
    const verifyRes = executeJava(sol, tmpl, verifiedCases);
    let ok = verifyRes.success;
    for (let i = 1; i <= 6; i++) {
      if (verifyRes.outputs[i] !== verifiedCases[i - 1].expectedOutput) ok = false;
    }
    if (ok) {
      curated[slug] = verifiedCases;
      passedCount++;
      console.log(`PASS [${slug}] => 6/6 verified!`);
    } else {
      console.error(`FAIL [${slug}] verification mismatch!`);
    }
  }
  fs.writeFileSync("scripts/curated_active_test_cases.json", JSON.stringify(curated, null, 2));
  console.log(`Batch 2 Complete: ${passedCount}/25 passed!`);
}

run();
