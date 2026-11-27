import fs from "fs";
import { executeJava } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));

const healInputs: Record<string, string[]> = {
  "search-x-in-sorted-array": [
    "nums = [-1, 0, 3, 5, 9, 12], target = 9",
    "nums = [-1, 0, 3, 5, 9, 12], target = 2",
    "nums = [1, 3, 5, 7, 9, 11], target = 1",
    "nums = [1, 3, 5, 7, 9, 11], target = 11",
    "nums = [5], target = 5",
    "nums = [2, 4, 6, 8, 10], target = 5"
  ],
  "basic-hashing": [
    "arr = [1, 3, 2, 1, 3]",
    "arr = [5, 5, 5]",
    "arr = [1]",
    "arr = [2, 4, 2, 4, 4]",
    "arr = [3, 3, 3, 1]",
    "arr = [1, 2, 3, 4, 5]"
  ],
  "traversal-in-linked-list": [
    "head = [1, 2, 3, 4, 5]",
    "head = [1]",
    "head = [10, 20, 30]",
    "head = [4, 5, 6, 7]",
    "head = [100]",
    "head = [9, 8, 7, 6, 5]"
  ],
  "deletion-in-linked-list": [
    "head = [1, 2, 3, 4], position = 1",
    "head = [1, 2, 3, 4], position = 3",
    "head = [1, 2], position = 2",
    "head = [10, 20, 30, 40, 50], position = 4",
    "head = [5, 10], position = 1",
    "head = [1, 2, 3, 4, 5], position = 5"
  ],
  "rabin-karp-algorithm": [
    'pat = "GEEK", txt = "GEEKS FOR GEEKS"',
    'pat = "AABA", txt = "AABAACAADAABAABA"',
    'pat = "abc", txt = "abcdeabc"',
    'pat = "test", txt = "this is a test text"',
    'pat = "xyz", txt = "abcde"',
    'pat = "a", txt = "aaaaa"'
  ],
  "longest-palindromic-substring": [
    's = "babad"',
    's = "cbbd"',
    's = "abcba"',
    's = "racecar"',
    's = "leetcode"',
    's = "a"'
  ],
  "find-missing-number": [
    "nums = [3, 0, 1]",
    "nums = [0, 1]",
    "nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]",
    "nums = [0]",
    "nums = [1]",
    "nums = [1, 2]"
  ],
  "combination-sum": [
    "candidates = [2, 3, 6, 7], target = 7",
    "candidates = [2, 3, 5], target = 8",
    "candidates = [2], target = 1",
    "candidates = [1], target = 2",
    "candidates = [7, 3, 2], target = 18",
    "candidates = [6, 10, 11, 12], target = 22"
  ],
  "single-number---ii": [
    "nums = [2, 2, 3, 2]",
    "nums = [0, 1, 0, 1, 0, 1, 99]",
    "nums = [5]",
    "nums = [-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]",
    "nums = [30000, 500, 100, 30000, 100, 30000, 100]",
    "nums = [-1, -1, -1, -5]"
  ],
  "union-of-two-sorted-arrays": [
    "a = [1, 2, 3, 4, 5], b = [1, 2, 3, 6, 7]",
    "a = [2, 2, 3, 4, 5], b = [1, 1, 2, 3, 4]",
    "a = [1, 2, 3], b = [4, 5, 6]",
    "a = [1, 3, 5, 7], b = [2, 4, 6, 8]",
    "a = [1], b = [1, 2, 3]",
    "a = [2, 4, 6], b = [2, 4, 6]"
  ],
  "intersection-of-two-sorted-arrays": [
    "a = [1, 2, 2, 3, 4], b = [2, 2, 3, 5]",
    "a = [1, 2, 3], b = [4, 5, 6]",
    "a = [1, 2, 3, 4, 5], b = [2, 3, 4, 4, 5]",
    "a = [1, 1, 1], b = [1, 1]",
    "a = [2, 4, 6, 8], b = [4, 8, 12]",
    "a = [5], b = [5]"
  ],
  "single-element-in-sorted-array": [
    "nums = [1, 1, 2, 3, 3, 4, 4, 8, 8]",
    "nums = [3, 3, 7, 7, 10, 11, 11]",
    "nums = [1]",
    "nums = [1, 1, 2]",
    "nums = [1, 2, 2]",
    "nums = [1, 1, 2, 2, 3, 3, 4, 8, 8]"
  ],
  "sort-a-k-sorted-array": [
    "arr = [6, 5, 3, 2, 8, 10, 9], num = 7, k = 3",
    "arr = [10, 9, 8, 7, 4, 70, 60, 50], num = 8, k = 4",
    "arr = [2, 1, 3], num = 3, k = 1",
    "arr = [3, 2, 1, 5, 4, 6], num = 6, k = 2",
    "arr = [1], num = 1, k = 0",
    "arr = [2, 3, 1, 4], num = 4, k = 2"
  ],
  "majority-element-i": [
    "nums = [3, 2, 3]",
    "nums = [2, 2, 1, 1, 1, 2, 2]",
    "nums = [1]",
    "nums = [6, 5, 5]",
    "nums = [3, 3, 4]",
    "nums = [1, 1, 1, 2, 3, 1, 1]"
  ],
  "count-occurrences-in-a-sorted-array": [
    "arr = [1, 1, 2, 2, 2, 2, 3], n = 7, x = 2",
    "arr = [1, 1, 2, 2, 2, 2, 3], n = 7, x = 4",
    "arr = [1, 2, 3, 4, 5], n = 5, x = 3",
    "arr = [2, 2, 2, 2], n = 4, x = 2",
    "arr = [1], n = 1, x = 1",
    "arr = [1, 2, 3, 3, 3, 4], n = 6, x = 3"
  ],
  "jump-game-ii": [
    "nums = [2, 3, 1, 1, 4]",
    "nums = [2, 3, 0, 1, 4]",
    "nums = [1]",
    "nums = [1, 2, 3]",
    "nums = [3, 3, 3]",
    "nums = [1, 1, 1, 1]"
  ],
  "deletion-in-doubly-ll": [
    "head = [1, 3, 4], x = 3",
    "head = [1, 5, 2, 9], x = 1",
    "head = [1, 2], x = 2",
    "head = [10, 20, 30, 40], x = 2",
    "head = [5, 10, 15], x = 3",
    "head = [1, 2, 3, 4, 5], x = 1"
  ],
  "vertical-order-traversal": [
    "root = [3, 9, 20, null, null, 15, 7]",
    "root = [1, 2, 3, 4, 5, 6, 7]",
    "root = [1, 2, 3, 4, 6, 5, 7]",
    "root = [1]",
    "root = [1, 2, null, 3, null, 4]",
    "root = [1, 2, 3]"
  ],
  "alient-dictionary": [
    'dict = ["baa", "abcd", "abca", "cab", "cad"], N = 5, K = 4',
    'dict = ["caa", "aaa", "aab"], N = 3, K = 3',
    'dict = ["a", "b", "c"], N = 3, K = 3',
    'dict = ["ba", "bc", "ac"], N = 3, K = 3',
    'dict = ["d", "b", "c", "a"], N = 4, K = 4',
    'dict = ["a"], N = 1, K = 1'
  ],
  "aggressive-cows": [
    "stalls = [1, 2, 4, 8, 9], k = 3",
    "stalls = [10, 1, 2, 7, 5], k = 3",
    "stalls = [0, 3, 4, 7, 10, 9], k = 4",
    "stalls = [1, 5, 9], k = 2",
    "stalls = [2, 12, 11, 10, 6], k = 3",
    "stalls = [1, 2, 3], k = 2"
  ],
  "partition-equal-subset-sum": [
    "nums = [1, 5, 11, 5]",
    "nums = [1, 2, 3, 5]",
    "nums = [1]",
    "nums = [2, 2]",
    "nums = [1, 2, 3, 4, 5, 6, 7]",
    "nums = [1, 2, 5]"
  ],
  "find-peak-element": [
    "nums = [1, 2, 3, 1]",
    "nums = [1, 2, 3, 4, 5]",
    "nums = [5, 4, 3, 2, 1]",
    "nums = [1]",
    "nums = [1, 3, 2]",
    "nums = [1, 2, 1, 3, 5, 6, 4]"
  ],
  "median-of-2-sorted-arrays": [
    "nums1 = [1, 3], nums2 = [2]",
    "nums1 = [1, 2], nums2 = [3, 4]",
    "nums1 = [0, 0], nums2 = [0, 0]",
    "nums1 = [], nums2 = [1]",
    "nums1 = [2], nums2 = []",
    "nums1 = [1, 2], nums2 = [1, 2, 3]"
  ],
  "sort-an-array-of-0's-1's-and-2's": [
    "nums = [2, 0, 2, 1, 1, 0]",
    "nums = [2, 0, 1]",
    "nums = [0]",
    "nums = [1]",
    "nums = [2, 2, 1, 1, 0, 0]",
    "nums = [1, 2, 0]"
  ],
  "minimise-max-distance-to-gas-stations": [
    "stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], K = 9",
    "stations = [1, 13, 17, 23], K = 5",
    "stations = [1, 2, 3, 4, 5], K = 2",
    "stations = [1, 7], K = 2",
    "stations = [1, 5, 9, 13], K = 3",
    "stations = [10, 20, 30], K = 1"
  ],
  "find-the-repeating-and-missing-number": [
    "arr = [3, 1, 2, 5, 3]",
    "arr = [3, 1, 3]",
    "arr = [1, 2, 2, 4]",
    "arr = [2, 2]",
    "arr = [1, 1]",
    "arr = [4, 3, 6, 2, 1, 1]"
  ],
  "sort-a-ll-of-0's-1's-and-2's": [
    "head = [1, 2, 2, 1, 2, 0, 2, 2]",
    "head = [2, 0, 1]",
    "head = [0, 0, 0]",
    "head = [1, 0, 2]",
    "head = [2, 1]",
    "head = [2, 2, 1, 1, 0, 0]"
  ],
  "remove-nth-node-from-the-back-of-the-ll": [
    "head = [1, 2, 3, 4, 5], n = 2",
    "head = [1], n = 1",
    "head = [1, 2], n = 1",
    "head = [1, 2], n = 2",
    "head = [1, 2, 3], n = 3",
    "head = [1, 2, 3, 4], n = 1"
  ],
  "add-one-to-a-number-represented-by-ll": [
    "head = [4, 5, 6]",
    "head = [9, 9, 9]",
    "head = [1, 2, 3]",
    "head = [0]",
    "head = [9]",
    "head = [1, 9, 9]"
  ],
  "highest-occurring-element-in-an-array": [
    "nums = [1, 3, 2, 1, 4, 1]",
    "nums = [4, 4, 5, 5, 6]",
    "nums = [1]",
    "nums = [2, 2, 3, 3, 3]",
    "nums = [3, 3, 3]",
    "nums = [10, 20, 20, 30]"
  ],
  "isomorphic-string": [
    's = "egg", t = "add"',
    's = "foo", t = "bar"',
    's = "paper", t = "title"',
    's = "badc", t = "baba"',
    's = "a", t = "b"',
    's = "ab", t = "aa"'
  ]
};

async function heal() {
  console.log(`Running healing for ${Object.keys(healInputs).length} problems...`);
  let passedCount = 0;

  for (const [slug, inputs] of Object.entries(healInputs)) {
    const tmpl = reg[slug];
    const sol = sols[slug];
    if (!tmpl || !sol) {
      console.error(`Missing tmpl or sol for ${slug}`);
      continue;
    }

    const dummyCases = inputs.map((inp, idx) => ({ order: idx + 1, input: inp, expectedOutput: "" }));
    const execRes = executeJava(sol, tmpl, dummyCases);
    if (!execRes.success) {
      console.error(`FAIL [${slug}] compile/exec error:`, execRes.error?.split("\n")[0]);
      continue;
    }

    const verifiedCases = inputs.map((inp, idx) => ({
      order: idx + 1,
      isSample: idx < 3,
      input: inp,
      expectedOutput: execRes.outputs[idx + 1] ?? ""
    }));

    // Verify self-consistency
    const verifyRes = executeJava(sol, tmpl, verifiedCases);
    let ok = verifyRes.success;
    for (let i = 1; i <= 6; i++) {
      if (verifyRes.outputs[i] !== verifiedCases[i - 1].expectedOutput) {
        ok = false;
        console.error(`  Mismatch on case ${i}: expected ${verifiedCases[i - 1].expectedOutput}, got ${verifyRes.outputs[i]}`);
      }
    }

    if (ok) {
      curated[slug] = verifiedCases;
      passedCount++;
      console.log(`PASS [${slug}] => 6/6 verified!`);
    } else {
      console.error(`FAIL [${slug}] self-consistency mismatch!`);
    }
  }

  fs.writeFileSync("scripts/curated_active_test_cases.json", JSON.stringify(curated, null, 2));
  console.log(`\nHealing Complete: ${passedCount}/${Object.keys(healInputs).length} passed!`);
}

heal();
