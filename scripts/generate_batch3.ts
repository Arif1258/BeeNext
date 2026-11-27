import fs from "fs";
import { executeJava } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));

const batch3Inputs: Record<string, string[]> = {
  "longest-string-chain": [
    'words = ["a", "b", "ba", "bca", "bda", "bdca"]',
    'words = ["xbc", "pcxbcf", "xb", "cxbc", "pcxbc"]',
    'words = ["abcd", "dbqca"]',
    'words = ["a"]',
    'words = ["q", "w", "e", "r"]',
    'words = ["a", "ab", "abc", "abcd"]'
  ],
  "longest-word-with-all-prefixes": [
    'n = 6, a = ["n", "ni", "nin", "ninj", "ninja", "ninga"]',
    'n = 4, a = ["ab", "bc", "cd", "de"]',
    'n = 2, a = ["a", "banana"]',
    'n = 6, a = ["a", "app", "appl", "ap", "apply", "apple"]',
    'n = 1, a = ["z"]',
    'n = 3, a = ["m", "mo", "mod"]'
  ],
  "m-coloring-problem": [
    "graph = [[false, true, true, true], [true, false, true, false], [true, true, false, true], [true, false, true, false]], m = 3, n = 4",
    "graph = [[false, true, true], [true, false, true], [true, true, false]], m = 2, n = 3",
    "graph = [[false]], m = 1, n = 1",
    "graph = [[false, true], [true, false]], m = 2, n = 2",
    "graph = [[false, true], [true, false]], m = 1, n = 2",
    "graph = [[false, true, true], [true, false, true], [true, true, false]], m = 3, n = 3"
  ],
  "making-a-large-island": [
    "grid = [[1, 0], [0, 1]]",
    "grid = [[1, 1], [1, 0]]",
    "grid = [[1, 1], [1, 1]]",
    "grid = [[0, 0], [0, 0]]",
    "grid = [[1, 0, 1], [0, 0, 0], [0, 1, 1]]",
    "grid = [[1]]"
  ],
  "matrix-median": [
    "matrix = [[1, 3, 5], [2, 6, 9], [3, 6, 9]]",
    "matrix = [[1], [2], [3]]",
    "matrix = [[5]]",
    "matrix = [[1, 1, 2], [2, 3, 3], [1, 2, 4]]",
    "matrix = [[1, 3, 8], [2, 3, 4], [1, 2, 5]]",
    "matrix = [[2, 4, 6], [1, 3, 5], [2, 3, 7]]"
  ],
  "maximum-rectangles": [
    'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]',
    'matrix = [["0"]]',
    'matrix = [["1"]]',
    'matrix = [["0","0"],["0","0"]]',
    'matrix = [["1","1"],["1","1"]]',
    'matrix = [["1","0"],["1","0"]]'
  ],
  "maximum-sum-combination": [
    "N = 2, K = 2, A = [3, 2], B = [1, 4]",
    "N = 4, K = 3, A = [1, 4, 2, 3], B = [2, 5, 1, 6]",
    "N = 1, K = 1, A = [10], B = [20]",
    "N = 3, K = 1, A = [1, 2, 3], B = [4, 5, 6]",
    "N = 3, K = 3, A = [5, 2, 1], B = [3, 1, 4]",
    "N = 2, K = 1, A = [100, 200], B = [300, 400]"
  ],
  "maximum-width-of-bt": [
    "root = [1, 3, 2, 5, 3, null, 9]",
    "root = [1, 3, 2, 5, null, null, 9, 6, null, 7]",
    "root = [1, 3, 2, 5]",
    "root = [1]",
    "root = [1, 2, 3, 4, 5, 6, 7]",
    "root = [1, 3, null, 5, 3]"
  ],
  "merge-intervals": [
    "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]",
    "intervals = [[1, 4], [4, 5]]",
    "intervals = [[1, 4]]",
    "intervals = [[1, 4], [2, 3]]",
    "intervals = [[1, 4], [0, 4]]",
    "intervals = [[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]"
  ],
  "merge-k-sorted-lists": [
    "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]",
    "lists = []",
    "lists = [[]]",
    "lists = [[1], [0]]",
    "lists = [[1, 2, 3], [4, 5, 6]]",
    "lists = [[2], [], [-1]]"
  ],
  "merge-two-sorted-arrays-without-extra-space": [
    "a = [1, 4, 8, 10], b = [2, 3, 9]",
    "a = [1, 5, 9], b = [2, 4, 6]",
    "a = [1], b = [2]",
    "a = [2, 4], b = [1, 3]",
    "a = [1, 2, 3], b = [4, 5, 6]",
    "a = [10], b = [0]"
  ],
  "minimum-falling-path-sum": [
    "matrix = [[2, 1, 3], [6, 5, 4], [7, 8, 9]]",
    "matrix = [[-19, 57], [-40, -5]]",
    "matrix = [[7]]",
    "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    "matrix = [[-48]]",
    "matrix = [[10, 20], [30, 40]]"
  ],
  "minimum-number-of-platforms-required-for-a-railway": [
    "arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000], n = 6",
    "arr = [900, 1235, 1100], dep = [1000, 1240, 1200], n = 3",
    "arr = [1000], dep = [1030], n = 1",
    "arr = [900, 940], dep = [910, 1200], n = 2",
    "arr = [900, 1000, 1100], dep = [930, 1030, 1130], n = 3",
    "arr = [100, 200, 300], dep = [400, 500, 600], n = 3"
  ],
  "minimum-window-subsequence": [
    's1 = "abcdebdde", s2 = "bde"',
    's1 = "fgrqsqsnodwmxzkzxwqegkndaa", s2 = "fn"',
    's1 = "abc", s2 = "ac"',
    's1 = "a", s2 = "a"',
    's1 = "b", s2 = "a"',
    's1 = "geeksforgeeks", s2 = "eks"'
  ],
  "minimum-window-substring-": [
    's = "ADOBECODEBANC", t = "ABC"',
    's = "a", t = "a"',
    's = "a", t = "aa"',
    's = "ab", t = "b"',
    's = "bba", t = "ab"',
    's = "cabwefgewcwaefgcf", t = "cae"'
  ],
  "most-stones-removed-with-same-row-or-column": [
    "stones = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]",
    "stones = [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]]",
    "stones = [[0, 0]]",
    "stones = [[0, 1], [1, 0], [1, 1]]",
    "stones = [[0, 0], [1, 1], [2, 2]]",
    "stones = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]"
  ],
  "n-meetings-in-one-room": [
    "start = [1, 3, 0, 5, 8, 5], end = [2, 4, 6, 7, 9, 9], n = 6",
    "start = [10, 12, 20], end = [20, 25, 30], n = 3",
    "start = [1], end = [2], n = 1",
    "start = [1, 2], end = [3, 4], n = 2",
    "start = [7, 2, 3], end = [9, 8, 4], n = 3",
    "start = [1, 3, 5], end = [2, 4, 6], n = 3"
  ],
  "network-delay-time": [
    "times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2",
    "times = [[1, 2, 1]], n = 2, k = 1",
    "times = [[1, 2, 1]], n = 2, k = 2",
    "times = [[1, 2, 1], [2, 3, 2], [1, 3, 4]], n = 3, k = 1",
    "times = [[1, 2, 1], [2, 1, 3]], n = 2, k = 2",
    "times = [[1, 2, 1], [2, 3, 2], [3, 4, 1]], n = 4, k = 1"
  ],
  "next-greater-element": [
    "arr = [1, 3, 2, 4], n = 4",
    "arr = [6, 8, 0, 1, 3], n = 5",
    "arr = [5], n = 1",
    "arr = [4, 3, 2, 1], n = 4",
    "arr = [1, 2, 3, 4], n = 4",
    "arr = [10, 20, 15, 30], n = 4"
  ],
  "ninja's-training": [
    "n = 3, points = [[1, 2, 5], [3, 1, 1], [3, 3, 3]]",
    "n = 3, points = [[10, 40, 70], [20, 50, 80], [30, 60, 90]]",
    "n = 1, points = [[10, 20, 30]]",
    "n = 2, points = [[1, 5, 2], [3, 1, 4]]",
    "n = 4, points = [[2, 1, 3], [3, 4, 6], [10, 1, 6], [8, 3, 7]]",
    "n = 2, points = [[7, 8, 9], [4, 5, 6]]"
  ],
  "non-overlapping-intervals": [
    "intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]",
    "intervals = [[1, 2], [1, 2], [1, 2]]",
    "intervals = [[1, 2], [2, 3]]",
    "intervals = [[1, 100], [11, 22], [1, 11], [2, 12]]",
    "intervals = [[1, 2]]",
    "intervals = [[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]"
  ],
  "number-of-distinct-islands": [
    "grid = [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1]]",
    "grid = [[1, 1, 0, 1, 1], [1, 0, 0, 0, 0], [0, 0, 0, 0, 1], [1, 1, 0, 1, 1]]",
    "grid = [[1]]",
    "grid = [[0]]",
    "grid = [[1, 0], [0, 1]]",
    "grid = [[1, 1, 1], [0, 0, 0], [1, 1, 1]]"
  ],
  "number-of-enclaves": [
    "grid = [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]",
    "grid = [[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]",
    "grid = [[0]]",
    "grid = [[1]]",
    "grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
    "grid = [[0, 1, 0], [1, 1, 1], [0, 1, 0]]"
  ],
  "number-of-greater-elements-to-the-right": [
    "arr = [3, 4, 2, 7, 5, 8, 10, 6], query = [0, 5]",
    "arr = [1, 2, 3, 4, 5], query = [4]",
    "arr = [5], query = [0]",
    "arr = [5, 4, 3, 2, 1], query = [0, 2, 4]",
    "arr = [2, 2, 2], query = [0, 1]",
    "arr = [1, 5, 2, 8, 3], query = [1, 2]"
  ],
  "number-of-islands": [
    'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
    'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
    'grid = [["1"]]',
    'grid = [["0"]]',
    'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]',
    'grid = [["1","1"],["1","1"]]'
  ]
};

async function run() {
  console.log("Running Batch 3 (25 problems)...");
  let passedCount = 0;
  for (const [slug, inputs] of Object.entries(batch3Inputs)) {
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
  console.log(`Batch 3 Complete: ${passedCount}/25 passed!`);
}

run();
