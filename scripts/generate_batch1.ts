import fs from "fs";
import { executeJava, prepareReferenceSolution } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));

const batch1Inputs: Record<string, string[]> = {
  "0-and-1-knapsack": [
    "weight = [1, 2, 4, 5], value = [5, 4, 8, 6], n = 4, maxWeight = 5",
    "weight = [3, 2, 5], value = [30, 40, 60], n = 3, maxWeight = 6",
    "weight = [10], value = [100], n = 1, maxWeight = 5",
    "weight = [1, 2, 3], value = [10, 15, 40], n = 3, maxWeight = 6",
    "weight = [4, 5, 1], value = [1, 2, 3], n = 3, maxWeight = 4",
    "weight = [2, 3, 4, 5], value = [3, 4, 5, 6], n = 4, maxWeight = 5"
  ],
  "accounts-merge": [
    'accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]',
    'accounts = [["Gabe","Gabe0@m.co","Gabe3@m.co","Gabe1@m.co"],["Kevin","Kevin3@m.co","Kevin5@m.co","Kevin0@m.co"],["Ethan","Ethan5@m.co","Ethan4@m.co","Ethan0@m.co"],["Hanzo","Hanzo3@m.co","Hanzo1@m.co","Hanzo0@m.co"],["Fern","Fern5@m.co","Fern1@m.co","Fern0@m.co"]]',
    'accounts = [["Alex","alex@m.co"]]',
    'accounts = [["David","d1@m.co","d2@m.co"],["David","d2@m.co","d3@m.co"],["David","d4@m.co"]]',
    'accounts = [["Bob","b1@m.co"],["Bob","b2@m.co"]]',
    'accounts = [["Alice","a1@m.co","a2@m.co"],["Alice","a3@m.co","a4@m.co"],["Alice","a2@m.co","a3@m.co"]]'
  ],
  "alient-dictionary": [
    'dict = ["baa", "abcd", "abca", "cab", "cad"], N = 5, K = 4',
    'dict = ["caa", "aaa", "aab"], N = 3, K = 3',
    'dict = ["z", "x"], N = 2, K = 2',
    'dict = ["wrt", "wrf", "er", "ett", "rftt"], N = 5, K = 5',
    'dict = ["a", "b", "c"], N = 3, K = 3',
    'dict = ["ab", "cd", "ef"], N = 3, K = 6'
  ],
  "assign-cookies": [
    "g = [1, 2, 3], s = [1, 1]",
    "g = [1, 2], s = [1, 2, 3]",
    "g = [1, 2, 3], s = [3]",
    "g = [10, 9, 8, 7], s = [5, 6, 7, 8]",
    "g = [1, 2, 3, 4], s = []",
    "g = [2, 3, 5], s = [1, 5, 2, 4]"
  ],
  "bipartite-graph": [
    "graph = [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]",
    "graph = [[1, 3], [0, 2], [1, 3], [0, 2]]",
    "graph = [[]]",
    "graph = [[1], [0]]",
    "graph = [[1, 2], [0, 2], [0, 1]]",
    "graph = [[3], [2, 3], [1, 3], [0, 1, 2]]"
  ],
  "celebrity-problem": [
    "M = [[0, 1, 0], [0, 0, 0], [0, 1, 0]], n = 3",
    "M = [[0, 1], [1, 0]], n = 2",
    "M = [[0]], n = 1",
    "M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], n = 3",
    "M = [[0, 1, 1], [0, 0, 1], [0, 0, 0]], n = 3",
    "M = [[0, 1, 0, 1], [0, 0, 0, 1], [0, 1, 0, 1], [0, 0, 0, 0]], n = 4"
  ],
  "cheapest-flight-within-k-stops": [
    "n = 4, flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src = 0, dst = 3, k = 1",
    "n = 3, flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src = 0, dst = 2, k = 1",
    "n = 3, flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src = 0, dst = 2, k = 0",
    "n = 2, flights = [[0, 1, 500]], src = 0, dst = 1, k = 0",
    "n = 4, flights = [[0, 1, 1], [0, 2, 5], [1, 2, 1], [2, 3, 1]], src = 0, dst = 3, k = 1",
    "n = 3, flights = [[0, 1, 10], [1, 2, 20]], src = 0, dst = 2, k = 2"
  ],
  "check-if-the-array-is-sorted-i": [
    "n = 5, a = [1, 2, 3, 4, 5]",
    "n = 4, a = [5, 4, 6, 7, 8]",
    "n = 1, a = [10]",
    "n = 3, a = [1, 1, 1]",
    "n = 5, a = [3, 4, 5, 1, 2]",
    "n = 4, a = [2, 1, 3, 4]"
  ],
  "check-if-two-trees-are-identical-or-not": [
    "p = [1, 2, 3], q = [1, 2, 3]",
    "p = [1, 2], q = [1, null, 2]",
    "p = [1, 2, 1], q = [1, 1, 2]",
    "p = [], q = []",
    "p = [1], q = [1]",
    "p = [1, 2, 3, 4], q = [1, 2, 3, 5]"
  ],
  "cherry-pickup-ii": [
    "grid = [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]]",
    "grid = [[1, 0, 0, 0, 0, 0, 1], [2, 0, 0, 0, 0, 3, 0], [2, 0, 9, 0, 0, 0, 0], [0, 3, 0, 5, 4, 0, 0], [1, 0, 2, 3, 0, 0, 6]]",
    "grid = [[1, 0, 3], [0, 5, 0], [2, 0, 4]]",
    "grid = [[4, 2, 3], [1, 1, 2]]",
    "grid = [[0, 1, 0], [1, 0, 1]]",
    "grid = [[5, 2, 1, 3], [2, 4, 1, 5], [1, 3, 2, 4]]"
  ],
  "connected-components": [
    "V = 4, adj = [[1, 2], [0, 2], [0, 1], []]",
    "V = 7, adj = [[1, 2], [0, 2, 3], [0, 1, 4], [1, 4], [2, 3], [6], [5]]",
    "V = 1, adj = [[]]",
    "V = 3, adj = [[], [], []]",
    "V = 2, adj = [[1], [0]]",
    "V = 5, adj = [[1], [0], [3], [2], []]"
  ],
  "construct-a-bt-from-postorder-and-inorder": [
    "inorder = [9, 3, 15, 20, 7], postorder = [9, 15, 7, 20, 3]",
    "inorder = [-1], postorder = [-1]",
    "inorder = [2, 1, 3], postorder = [2, 3, 1]",
    "inorder = [1, 2], postorder = [2, 1]",
    "inorder = [4, 2, 5, 1, 6, 3, 7], postorder = [4, 5, 2, 6, 7, 3, 1]",
    "inorder = [1], postorder = [1]"
  ],
  "construct-a-bt-from-preorder-and-inorder": [
    "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]",
    "preorder = [-1], inorder = [-1]",
    "preorder = [1, 2, 3], inorder = [2, 1, 3]",
    "preorder = [1, 2], inorder = [2, 1]",
    "preorder = [1, 2, 4, 5, 3, 6, 7], inorder = [4, 2, 5, 1, 6, 3, 7]",
    "preorder = [1], inorder = [1]"
  ],
  "count-inversions": [
    "arr = [2, 4, 1, 3, 5]",
    "arr = [2, 3, 4, 5, 6]",
    "arr = [5, 4, 3, 2, 1]",
    "arr = [1]",
    "arr = [10, 10, 10]",
    "arr = [1, 20, 6, 4, 5]"
  ],
  "count-partitions-with-given-difference": [
    "n = 4, d = 3, arr = [5, 2, 6, 4]",
    "n = 4, d = 0, arr = [1, 1, 1, 1]",
    "n = 5, d = 1, arr = [3, 2, 2, 5, 1]",
    "n = 3, d = 1, arr = [1, 2, 3]",
    "n = 2, d = 0, arr = [2, 2]",
    "n = 4, d = 2, arr = [1, 2, 1, 2]"
  ],
  "count-square-submatrices-with-all-one": [
    "matrix = [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]",
    "matrix = [[1, 0, 1], [1, 1, 0], [1, 1, 0]]",
    "matrix = [[1]]",
    "matrix = [[0]]",
    "matrix = [[1, 1], [1, 1]]",
    "matrix = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]"
  ],
  "count-subarrays-with-given-xor-k": [
    "A = [4, 2, 2, 6, 4], B = 6",
    "A = [5, 6, 7, 8, 9], B = 5",
    "A = [1, 1, 1], B = 0",
    "A = [1], B = 1",
    "A = [2, 2, 2, 2], B = 2",
    "A = [1, 2, 3, 4, 5], B = 1"
  ],
  "count-subsets-with-sum-k": [
    "num = [1, 2, 2, 3], tar = 3",
    "num = [1, 1, 1], tar = 2",
    "num = [1, 2, 3, 4], tar = 5",
    "num = [5], tar = 5",
    "num = [1, 2], tar = 10",
    "num = [2, 3, 5, 6, 8, 10], tar = 10"
  ],
  "detect-a-cycle-in-a-directed-graph": [
    "V = 4, adj = [[1], [2], [3], [1]]",
    "V = 3, adj = [[1], [2], []]",
    "V = 1, adj = [[]]",
    "V = 2, adj = [[1], [0]]",
    "V = 4, adj = [[1, 2], [2], [3], []]",
    "V = 3, adj = [[1], [2], [0]]"
  ],
  "dijkstra's-algorithm": [
    "V = 3, adj = [[[1, 1], [2, 6]], [[2, 3], [0, 1]], [[1, 3], [0, 6]]], S = 2",
    "V = 2, adj = [[[1, 9]], [[0, 9]]], S = 0",
    "V = 1, adj = [[]], S = 0",
    "V = 4, adj = [[[1, 4], [2, 1]], [[3, 1]], [[1, 2], [3, 5]], []], S = 0",
    "V = 3, adj = [[[1, 5]], [[2, 2]], []], S = 0",
    "V = 3, adj = [[], [], []], S = 1"
  ],
  "disjoint-set-": [
    "node = 2",
    "node = 4",
    "node = 1",
    "node = 7",
    "node = 12",
    "node = 20"
  ],
  "distance-of-nearest-cell-having-one": [
    "mat = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
    "mat = [[0, 0, 0], [0, 1, 0], [1, 1, 1]]",
    "mat = [[1]]",
    "mat = [[0, 1], [1, 0]]",
    "mat = [[0, 0], [0, 0]]",
    "mat = [[1, 0, 0], [0, 0, 0], [0, 0, 1]]"
  ],
  "expression-add-operators": [
    'num = "123", target = 6',
    'num = "232", target = 8',
    'num = "3456237490", target = 9191',
    'num = "105", target = 5',
    'num = "00", target = 0',
    'num = "1", target = 1'
  ],
  "find-eventual-safe-states": [
    "graph = [[1, 2], [2, 3], [5], [0], [5], [], []]",
    "graph = [[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]",
    "graph = [[]]",
    "graph = [[], [0], [0, 1]]",
    "graph = [[1], [2], [0]]",
    "graph = [[1], []]"
  ],
  "find-peak-element-ii": [
    "mat = [[1, 4], [3, 2]]",
    "mat = [[10, 20, 15], [21, 30, 14], [7, 16, 32]]",
    "mat = [[5]]",
    "mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    "mat = [[1, 3, 2], [4, 6, 5], [7, 9, 8]]",
    "mat = [[10, 50, 40], [20, 30, 10]]"
  ]
};

async function run() {
  console.log("Running Batch 1 (25 problems)...");
  let passedCount = 0;
  for (const [slug, inputs] of Object.entries(batch1Inputs)) {
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
  console.log(`Batch 1 Complete: ${passedCount}/25 passed!`);
}

run();
