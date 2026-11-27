/**
 * Patch 28 Specific Problems in Curated Active Test Cases
 */

import fs from "fs";
import path from "path";

const CURATED_PATH = path.resolve("scripts/curated_active_test_cases.json");
const data = JSON.parse(fs.readFileSync(CURATED_PATH, "utf-8"));

const patches: Record<string, Array<{ order: number; isSample: boolean; input: string; expectedOutput: string }>> = {
  "remove-outermost-parentheses": [
    { order: 1, isSample: true, input: 's = "(()())(())"', expectedOutput: '"()()()"' },
    { order: 2, isSample: true, input: 's = "(()())(())(()(()))"', expectedOutput: '"()()()()(())"' },
    { order: 3, isSample: true, input: 's = "()()"', expectedOutput: '""' },
    { order: 4, isSample: false, input: 's = "((()))"', expectedOutput: '"(())"' },
    { order: 5, isSample: false, input: 's = "(()(()))"', expectedOutput: '"()(())"' },
    { order: 6, isSample: false, input: 's = "(()())((()))"', expectedOutput: '"()()(())"' },
  ],

  "traversal-in-linked-list": [
    { order: 1, isSample: true, input: "head = [1, 2, 3, 4]", expectedOutput: "[1, 2, 3, 4]" },
    { order: 2, isSample: true, input: "head = [1]", expectedOutput: "[1]" },
    { order: 3, isSample: true, input: "head = [5, 4, 3, 2, 1]", expectedOutput: "[5, 4, 3, 2, 1]" },
    { order: 4, isSample: false, input: "head = [10, 20, 30]", expectedOutput: "[10, 20, 30]" },
    { order: 5, isSample: false, input: "head = [-1, -2, -3]", expectedOutput: "[-1, -2, -3]" },
    { order: 6, isSample: false, input: "head = [7, 14, 21, 28, 35]", expectedOutput: "[7, 14, 21, 28, 35]" },
  ],

  "maximum-points-you-can-obtain-from-cards-": [
    { order: 1, isSample: true, input: "cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3", expectedOutput: "12" },
    { order: 2, isSample: true, input: "cardPoints = [2, 2, 2], k = 2", expectedOutput: "4" },
    { order: 3, isSample: true, input: "cardPoints = [9, 7, 7, 9, 7, 7, 9], k = 7", expectedOutput: "55" },
    { order: 4, isSample: false, input: "cardPoints = [1, 1000, 1], k = 1", expectedOutput: "1" },
    { order: 5, isSample: false, input: "cardPoints = [1, 79, 80, 1, 1, 1, 200, 1], k = 3", expectedOutput: "202" },
    { order: 6, isSample: false, input: "cardPoints = [100, 40, 17, 9, 73, 75], k = 3", expectedOutput: "248" },
  ],

  "roman-to-integer": [
    { order: 1, isSample: true, input: 's = "III"', expectedOutput: "3" },
    { order: 2, isSample: true, input: 's = "LVIII"', expectedOutput: "58" },
    { order: 3, isSample: true, input: 's = "MCMXCIV"', expectedOutput: "1994" },
    { order: 4, isSample: false, input: 's = "IV"', expectedOutput: "4" },
    { order: 5, isSample: false, input: 's = "IX"', expectedOutput: "9" },
    { order: 6, isSample: false, input: 's = "XL"', expectedOutput: "40" },
  ],

  "build-heap-from-a-given-array": [
    { order: 1, isSample: true, input: "arr = [4, 10, 3, 5, 1], n = 5", expectedOutput: "[10, 5, 3, 4, 1]" },
    { order: 2, isSample: true, input: "arr = [1, 3, 5, 4, 6, 13, 10, 9, 8, 15, 17], n = 11", expectedOutput: "[17, 15, 13, 9, 6, 5, 10, 4, 8, 3, 1]" },
    { order: 3, isSample: true, input: "arr = [1], n = 1", expectedOutput: "[1]" },
    { order: 4, isSample: false, input: "arr = [3, 2, 1], n = 3", expectedOutput: "[3, 2, 1]" },
    { order: 5, isSample: false, input: "arr = [1, 2, 3, 4], n = 4", expectedOutput: "[4, 2, 3, 1]" },
    { order: 6, isSample: false, input: "arr = [12, 11, 13, 5, 6, 7], n = 6", expectedOutput: "[13, 11, 12, 5, 6, 7]" },
  ],

  "largest-subarray-with-sum-0": [
    { order: 1, isSample: true, input: "arr = [15, -2, 2, -8, 1, 7, 10, 23], n = 8", expectedOutput: "5" },
    { order: 2, isSample: true, input: "arr = [2, 10, 4], n = 3", expectedOutput: "0" },
    { order: 3, isSample: true, input: "arr = [1, 0, 3], n = 3", expectedOutput: "1" },
    { order: 4, isSample: false, input: "arr = [1, 2, -3, 3], n = 4", expectedOutput: "3" },
    { order: 5, isSample: false, input: "arr = [0, 0, 0], n = 3", expectedOutput: "3" },
    { order: 6, isSample: false, input: "arr = [-1, 1, -1, 1], n = 4", expectedOutput: "4" },
  ],

  "check-if-an-array-represents-a-min-heap-": [
    { order: 1, isSample: true, input: "arr = [10, 15, 14, 25, 30], n = 5", expectedOutput: "true" },
    { order: 2, isSample: true, input: "arr = [30, 25, 14, 15, 10], n = 5", expectedOutput: "false" },
    { order: 3, isSample: true, input: "arr = [1], n = 1", expectedOutput: "true" },
    { order: 4, isSample: false, input: "arr = [1, 2, 3, 4, 5, 6], n = 6", expectedOutput: "true" },
    { order: 5, isSample: false, input: "arr = [2, 1, 3], n = 3", expectedOutput: "false" },
    { order: 6, isSample: false, input: "arr = [5, 10, 15, 20, 25, 30], n = 6", expectedOutput: "true" },
  ],

  "kth-smallest-and-largest-element-in-bst": [
    { order: 1, isSample: true, input: "root = [3, 1, 4, null, 2], k = 1", expectedOutput: "1" },
    { order: 2, isSample: true, input: "root = [5, 3, 6, 2, 4, null, null, 1], k = 3", expectedOutput: "3" },
    { order: 3, isSample: true, input: "root = [2, 1, 3], k = 2", expectedOutput: "2" },
    { order: 4, isSample: false, input: "root = [1], k = 1", expectedOutput: "1" },
    { order: 5, isSample: false, input: "root = [4, 2, 5], k = 1", expectedOutput: "2" },
    { order: 6, isSample: false, input: "root = [10, 5, 15, 2, 7, 12, 20], k = 4", expectedOutput: "7" },
  ],

  "longest-happy-prefix": [
    { order: 1, isSample: true, input: 's = "level"', expectedOutput: '"l"' },
    { order: 2, isSample: true, input: 's = "ababab"', expectedOutput: '"abab"' },
    { order: 3, isSample: true, input: 's = "leetcodeleet"', expectedOutput: '"leet"' },
    { order: 4, isSample: false, input: 's = "a"', expectedOutput: '""' },
    { order: 5, isSample: false, input: 's = "aaaaa"', expectedOutput: '"aaaa"' },
    { order: 6, isSample: false, input: 's = "bba"', expectedOutput: '""' },
  ],

  "k-th-largest-element-in-an-array": [
    { order: 1, isSample: true, input: "nums = [3, 2, 1, 5, 6, 4], k = 2", expectedOutput: "5" },
    { order: 2, isSample: true, input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", expectedOutput: "4" },
    { order: 3, isSample: true, input: "nums = [1], k = 1", expectedOutput: "1" },
    { order: 4, isSample: false, input: "nums = [-1, 2, 0], k = 1", expectedOutput: "2" },
    { order: 5, isSample: false, input: "nums = [7, 10, 4, 3, 20, 15], k = 3", expectedOutput: "10" },
    { order: 6, isSample: false, input: "nums = [5, 5, 5, 5], k = 2", expectedOutput: "5" },
  ],

  "find-out-how-many-times-the-array-is-rotated": [
    { order: 1, isSample: true, input: "arr = [5, 1, 2, 3, 4], n = 5", expectedOutput: "1" },
    { order: 2, isSample: true, input: "arr = [1, 2, 3, 4, 5], n = 5", expectedOutput: "0" },
    { order: 3, isSample: true, input: "arr = [4, 5, 6, 7, 0, 1, 2], n = 7", expectedOutput: "4" },
    { order: 4, isSample: false, input: "arr = [2, 1], n = 2", expectedOutput: "1" },
    { order: 5, isSample: false, input: "arr = [3, 4, 5, 1, 2], n = 5", expectedOutput: "3" },
    { order: 6, isSample: false, input: "arr = [1], n = 1", expectedOutput: "0" },
  ],

  "number-of-substrings-containing-all-three-characters": [
    { order: 1, isSample: true, input: 's = "abcabc"', expectedOutput: "10" },
    { order: 2, isSample: true, input: 's = "aaacb"', expectedOutput: "3" },
    { order: 3, isSample: true, input: 's = "abc"', expectedOutput: "1" },
    { order: 4, isSample: false, input: 's = "ababbbc"', expectedOutput: "3" },
    { order: 5, isSample: false, input: 's = "a"', expectedOutput: "0" },
    { order: 6, isSample: false, input: 's = "acbbcac"', expectedOutput: "11" },
  ],

  "single-number---iii": [
    { order: 1, isSample: true, input: "nums = [1, 2, 1, 3, 2, 5]", expectedOutput: "[3, 5]" },
    { order: 2, isSample: true, input: "nums = [-1, 0]", expectedOutput: "[-1, 0]" },
    { order: 3, isSample: true, input: "nums = [0, 1]", expectedOutput: "[1, 0]" },
    { order: 4, isSample: false, input: "nums = [2, 1, 2, 3, 4, 1]", expectedOutput: "[3, 4]" },
    { order: 5, isSample: false, input: "nums = [10, 20]", expectedOutput: "[10, 20]" },
    { order: 6, isSample: false, input: "nums = [7, 8, 9, 7]", expectedOutput: "[8, 9]" },
  ],

  "subsets-i": [
    { order: 1, isSample: true, input: "arr = [2, 3], n = 2", expectedOutput: "[0, 2, 3, 5]" },
    { order: 2, isSample: true, input: "arr = [5, 2, 1], n = 3", expectedOutput: "[0, 1, 2, 3, 5, 6, 7, 8]" },
    { order: 3, isSample: true, input: "arr = [1], n = 1", expectedOutput: "[0, 1]" },
    { order: 4, isSample: false, input: "arr = [1, 2], n = 2", expectedOutput: "[0, 1, 2, 3]" },
    { order: 5, isSample: false, input: "arr = [3, 1, 4], n = 3", expectedOutput: "[0, 1, 3, 4, 4, 5, 7, 8]" },
    { order: 6, isSample: false, input: "arr = [5], n = 1", expectedOutput: "[0, 5]" },
  ],

  "replace-elements-by-their-rank": [
    { order: 1, isSample: true, input: "arr = [40, 10, 20, 30], N = 4", expectedOutput: "[4, 1, 2, 3]" },
    { order: 2, isSample: true, input: "arr = [10, 100, 10], N = 3", expectedOutput: "[1, 2, 1]" },
    { order: 3, isSample: true, input: "arr = [1], N = 1", expectedOutput: "[1]" },
    { order: 4, isSample: false, input: "arr = [5, 4, 3, 2, 1], N = 5", expectedOutput: "[5, 4, 3, 2, 1]" },
    { order: 5, isSample: false, input: "arr = [20, 15, 26, 2, 98, 6], N = 6", expectedOutput: "[4, 3, 5, 1, 6, 2]" },
    { order: 6, isSample: false, input: "arr = [100, 100, 100], N = 3", expectedOutput: "[1, 1, 1]" },
  ],

  "rearrange-array-elements-by-sign": [
    { order: 1, isSample: true, input: "nums = [3, 1, -2, -5, 2, -4]", expectedOutput: "[3, -2, 1, -5, 2, -4]" },
    { order: 2, isSample: true, input: "nums = [-1, 1]", expectedOutput: "[1, -1]" },
    { order: 3, isSample: true, input: "nums = [1, -1]", expectedOutput: "[1, -1]" },
    { order: 4, isSample: false, input: "nums = [2, 8, -5, -2, -4, 10]", expectedOutput: "[2, -5, 8, -2, 10, -4]" },
    { order: 5, isSample: false, input: "nums = [4, -2, 1, -3]", expectedOutput: "[4, -2, 1, -3]" },
    { order: 6, isSample: false, input: "nums = [1, 2, -1, -2]", expectedOutput: "[1, -1, 2, -2]" },
  ],

  "letter-combinations-of-a-phone-number": [
    { order: 1, isSample: true, input: 'digits = "23"', expectedOutput: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]' },
    { order: 2, isSample: true, input: 'digits = ""', expectedOutput: '[]' },
    { order: 3, isSample: true, input: 'digits = "2"', expectedOutput: '["a", "b", "c"]' },
    { order: 4, isSample: false, input: 'digits = "9"', expectedOutput: '["w", "x", "y", "z"]' },
    { order: 5, isSample: false, input: 'digits = "79"', expectedOutput: '["pw", "px", "py", "pz", "qw", "qx", "qy", "qz", "rw", "rx", "ry", "rz", "sw", "sx", "sy", "sz"]' },
    { order: 6, isSample: false, input: 'digits = "45"', expectedOutput: '["gj", "gk", "gl", "hj", "hk", "hl", "ij", "ik", "il"]' },
  ],

  "top-k-frequent-elements": [
    { order: 1, isSample: true, input: "nums = [1, 1, 1, 2, 2, 3], k = 2", expectedOutput: "[1, 2]" },
    { order: 2, isSample: true, input: "nums = [1], k = 1", expectedOutput: "[1]" },
    { order: 3, isSample: true, input: "nums = [4, 1, -1, 2, -1, 2, 3], k = 2", expectedOutput: "[-1, 2]" },
    { order: 4, isSample: false, input: "nums = [1, 2, 2, 3, 3, 3], k = 1", expectedOutput: "[3]" },
    { order: 5, isSample: false, input: "nums = [1, 1, 2, 2, 3, 3], k = 3", expectedOutput: "[1, 2, 3]" },
    { order: 6, isSample: false, input: "nums = [5, 3, 1, 1, 1, 3, 73, 1], k = 2", expectedOutput: "[1, 3]" },
  ],

  "removing-given-node-in-dll": [
    { order: 1, isSample: true, input: "head = [1, 2, 3], val = 2", expectedOutput: "[1, 3]" },
    { order: 2, isSample: true, input: "head = [1, 2, 3, 4], val = 3", expectedOutput: "[1, 2, 4]" },
    { order: 3, isSample: true, input: "head = [5, 10, 15], val = 10", expectedOutput: "[5, 15]" },
    { order: 4, isSample: false, input: "head = [1, 2], val = 2", expectedOutput: "[1]" },
    { order: 5, isSample: false, input: "head = [10, 20, 30, 40], val = 20", expectedOutput: "[10, 30, 40]" },
    { order: 6, isSample: false, input: "head = [7, 8, 9], val = 8", expectedOutput: "[7, 9]" },
  ],

  "partition-a-set-into-two-subsets-with-minimum-absolute-sum-difference": [
    { order: 1, isSample: true, input: "arr = [1, 6, 11, 5], n = 4", expectedOutput: "1" },
    { order: 2, isSample: true, input: "arr = [1, 4], n = 2", expectedOutput: "3" },
    { order: 3, isSample: true, input: "arr = [1, 2, 3, 9], n = 4", expectedOutput: "3" },
    { order: 4, isSample: false, input: "arr = [3, 1, 5, 2, 8], n = 5", expectedOutput: "1" },
    { order: 5, isSample: false, input: "arr = [1, 2, 7], n = 3", expectedOutput: "4" },
    { order: 6, isSample: false, input: "arr = [8, 6, 5], n = 3", expectedOutput: "3" },
  ],

  "sliding-window-maximum": [
    { order: 1, isSample: true, input: "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3", expectedOutput: "[3, 3, 5, 5, 6, 7]" },
    { order: 2, isSample: true, input: "nums = [1], k = 1", expectedOutput: "[1]" },
    { order: 3, isSample: true, input: "nums = [1, -1], k = 1", expectedOutput: "[1, -1]" },
    { order: 4, isSample: false, input: "nums = [9, 11], k = 2", expectedOutput: "[11]" },
    { order: 5, isSample: false, input: "nums = [4, -2], k = 2", expectedOutput: "[4]" },
    { order: 6, isSample: false, input: "nums = [7, 2, 4], k = 2", expectedOutput: "[7, 4]" },
  ],

  "insert-before-given-node-in-dll": [
    { order: 1, isSample: true, input: "head = [1, 3], node = 3, val = 2", expectedOutput: "[1, 2, 3]" },
    { order: 2, isSample: true, input: "head = [1, 2, 4], node = 4, val = 3", expectedOutput: "[1, 2, 3, 4]" },
    { order: 3, isSample: true, input: "head = [10, 30], node = 30, val = 20", expectedOutput: "[10, 20, 30]" },
    { order: 4, isSample: false, input: "head = [5, 15], node = 15, val = 10", expectedOutput: "[5, 10, 15]" },
    { order: 5, isSample: false, input: "head = [2, 4, 6], node = 4, val = 3", expectedOutput: "[2, 3, 4, 6]" },
    { order: 6, isSample: false, input: "head = [100, 300], node = 300, val = 200", expectedOutput: "[100, 200, 300]" },
  ],

  "longest-bitonic-subsequence": [
    { order: 1, isSample: true, input: "arr = [1, 2, 5, 3, 2], n = 5", expectedOutput: "5" },
    { order: 2, isSample: true, input: "arr = [1, 11, 2, 10, 4, 5, 2, 1], n = 8", expectedOutput: "6" },
    { order: 3, isSample: true, input: "arr = [10, 20, 30], n = 3", expectedOutput: "3" },
    { order: 4, isSample: false, input: "arr = [10, 10, 10], n = 3", expectedOutput: "1" },
    { order: 5, isSample: false, input: "arr = [1, 2, 1, 2, 1], n = 5", expectedOutput: "3" },
    { order: 6, isSample: false, input: "arr = [12, 11, 40, 5, 3, 1], n = 6", expectedOutput: "5" },
  ],

  "clone-a-ll-with-random-and-next-pointer": [
    { order: 1, isSample: true, input: "head = [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]", expectedOutput: "[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]" },
    { order: 2, isSample: true, input: "head = [[1, 1], [2, 1]]", expectedOutput: "[[1, 1], [2, 1]]" },
    { order: 3, isSample: true, input: "head = [[3, null], [3, 0], [3, null]]", expectedOutput: "[[3, null], [3, 0], [3, null]]" },
    { order: 4, isSample: false, input: "head = [[1, null]]", expectedOutput: "[[1, null]]" },
    { order: 5, isSample: false, input: "head = []", expectedOutput: "[]" },
    { order: 6, isSample: false, input: "head = [[2, null], [4, 0]]", expectedOutput: "[[2, null], [4, 0]]" },
  ],

  "matrix-chain-multiplication": [
    { order: 1, isSample: true, input: "arr = [40, 20, 30, 10, 30], N = 5", expectedOutput: "26000" },
    { order: 2, isSample: true, input: "arr = [10, 20, 30], N = 3", expectedOutput: "6000" },
    { order: 3, isSample: true, input: "arr = [10, 30, 5, 60], N = 4", expectedOutput: "4500" },
    { order: 4, isSample: false, input: "arr = [1, 2, 3, 4, 3], N = 5", expectedOutput: "30" },
    { order: 5, isSample: false, input: "arr = [2, 1, 3, 4], N = 4", expectedOutput: "20" },
    { order: 6, isSample: false, input: "arr = [1, 2, 3], N = 3", expectedOutput: "6" },
  ],

  "sum-of-array-elements": [
    { order: 1, isSample: true, input: "arr = [1, 2, 3, 4], n = 4", expectedOutput: "10" },
    { order: 2, isSample: true, input: "arr = [1, 3, 3], n = 3", expectedOutput: "7" },
    { order: 3, isSample: true, input: "arr = [5], n = 1", expectedOutput: "5" },
    { order: 4, isSample: false, input: "arr = [-1, -2, -3], n = 3", expectedOutput: "-6" },
    { order: 5, isSample: false, input: "arr = [0, 0, 0], n = 3", expectedOutput: "0" },
    { order: 6, isSample: false, input: "arr = [10, -5, 20, -10], n = 4", expectedOutput: "15" },
  ],

  "count-of-odd-numbers-in-array": [
    { order: 1, isSample: true, input: "arr = [1, 2, 3, 4, 5], n = 5", expectedOutput: "3" },
    { order: 2, isSample: true, input: "arr = [2, 4, 6, 8], n = 4", expectedOutput: "0" },
    { order: 3, isSample: true, input: "arr = [1], n = 1", expectedOutput: "1" },
    { order: 4, isSample: false, input: "arr = [1, 3, 5, 7], n = 4", expectedOutput: "4" },
    { order: 5, isSample: false, input: "arr = [10, 21, 32, 43], n = 4", expectedOutput: "2" },
    { order: 6, isSample: false, input: "arr = [0, 2, 4], n = 3", expectedOutput: "0" },
  ],

  "check-if-the-array-is-sorted-ii": [
    { order: 1, isSample: true, input: "arr = [1, 2, 3, 4, 5], n = 5", expectedOutput: "true" },
    { order: 2, isSample: true, input: "arr = [5, 4, 3, 2, 1], n = 5", expectedOutput: "false" },
    { order: 3, isSample: true, input: "arr = [1], n = 1", expectedOutput: "true" },
    { order: 4, isSample: false, input: "arr = [1, 2, 2, 3], n = 4", expectedOutput: "true" },
    { order: 5, isSample: false, input: "arr = [1, 3, 2], n = 3", expectedOutput: "false" },
    { order: 6, isSample: false, input: "arr = [10, 20, 30, 40], n = 4", expectedOutput: "true" },
  ],
};

for (const [slug, cases] of Object.entries(patches)) {
  data[slug] = cases;
}

fs.writeFileSync(CURATED_PATH, JSON.stringify(data, null, 2));
console.log(`Successfully patched all ${Object.keys(patches).length} problems!`);
