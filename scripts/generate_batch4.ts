import fs from "fs";
import { executeJava } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));

const batch4Inputs: Record<string, string[]> = {
  "number-of-provinces": [
    "isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
    "isConnected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
    "isConnected = [[1]]",
    "isConnected = [[1, 1], [1, 1]]",
    "isConnected = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]",
    "isConnected = [[1, 1, 0, 0], [1, 1, 0, 1], [0, 0, 1, 0], [0, 1, 0, 1]]"
  ],
  "number-of-ways-to-arrive-at-destination": [
    "n = 7, roads = [[0, 6, 7], [0, 1, 2], [1, 2, 3], [1, 3, 3], [6, 3, 3], [3, 5, 1], [6, 5, 1], [2, 5, 1], [0, 4, 5], [4, 6, 2]]",
    "n = 2, roads = [[1, 0, 10]]",
    "n = 1, roads = []",
    "n = 3, roads = [[0, 1, 1], [1, 2, 1], [0, 2, 2]]",
    "n = 4, roads = [[0, 1, 1], [1, 3, 2], [0, 2, 1], [2, 3, 2]]",
    "n = 4, roads = [[0, 1, 2], [1, 2, 3], [2, 3, 4], [0, 3, 9]]"
  ],
  "path-with-minimum-effort": [
    "heights = [[1, 2, 2], [3, 8, 2], [5, 3, 5]]",
    "heights = [[1, 2, 3], [3, 8, 4], [5, 3, 5]]",
    "heights = [[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]",
    "heights = [[5]]",
    "heights = [[1, 10], [3, 8]]",
    "heights = [[3, 3, 3], [3, 3, 3]]"
  ],
  "pow(x,n)": [
    "x = 2.00000, n = 10",
    "x = 2.10000, n = 3",
    "x = 2.00000, n = -2",
    "x = 1.00000, n = 2147483647",
    "x = 0.50000, n = 2",
    "x = -2.00000, n = 3"
  ],
  "power-set": [
    's = "abc"',
    's = "ab"',
    's = "a"',
    's = "bca"',
    's = "c"',
    's = "xyz"'
  ],
  "power-set-bit-manipulation": [
    "nums = [1, 2, 3]",
    "nums = [0]",
    "nums = [1]",
    "nums = [1, 2]",
    "nums = [4, 5, 6]",
    "nums = [9, 10]"
  ],
  "print-the-matrix-in-spiral-manner": [
    "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    "matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]",
    "matrix = [[1]]",
    "matrix = [[1, 2], [3, 4]]",
    "matrix = [[1, 2, 3]]",
    "matrix = [[1], [2], [3]]"
  ],
  "rat-in-a-maze": [
    "m = [[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]], n = 4",
    "m = [[1, 0], [1, 0]], n = 2",
    "m = [[1]], n = 1",
    "m = [[0]], n = 1",
    "m = [[1, 1], [1, 1]], n = 2",
    "m = [[1, 1, 1], [1, 0, 1], [1, 1, 1]], n = 3"
  ],
  "recursive-insertion-sort": [
    "nums = [5, 4, 3, 2, 1]",
    "nums = [1, 2, 3, 4]",
    "nums = [42]",
    "nums = [3, 1, 2]",
    "nums = [10, -1, 2, 5, 0, 6]",
    "nums = [2, 2, 2, 2, 2]"
  ],
  "remove-k-digits": [
    'num = "1432219", k = 3',
    'num = "10200", k = 1',
    'num = "10", k = 2',
    'num = "9", k = 1',
    'num = "112", k = 1',
    'num = "123456", k = 3'
  ],
  "removing-given-node-in-dll": [
    "head = [1, 2, 3], val = 2",
    "head = [1, 2], val = 2",
    "head = [1, 2, 3, 4], val = 3",
    "head = [5, 10, 15], val = 10",
    "head = [2, 4, 6, 8], val = 6",
    "head = [1, 3, 5, 7, 9], val = 5"
  ],
  "requirements-needed-to-construct-a-unique-bt": [
    "a = 2, b = 1",
    "a = 1, b = 3",
    "a = 2, b = 3",
    "a = 1, b = 2",
    "a = 3, b = 2",
    "a = 1, b = 1"
  ],
  "reverse-a-stack": [
    "s = [3, 2, 1, 7, 6]",
    "s = [4, 3, 9, 6]",
    "s = [1]",
    "s = [5, 10]",
    "s = [1, 2, 3, 4]",
    "s = [100, 200, 300]"
  ],
  "reverse-an-array": [
    "n = 5, arr = [1, 2, 3, 4, 5]",
    "n = 4, arr = [10, 20, 30, 40]",
    "n = 1, arr = [7]",
    "n = 2, arr = [1, 2]",
    "n = 6, arr = [9, 8, 7, 6, 5, 4]",
    "n = 4, arr = [0, 0, 1, 1]"
  ],
  "rod-cutting-problem": [
    "price = [1, 5, 8, 9, 10, 17, 17, 20], n = 8",
    "price = [3, 5, 8, 9, 10, 17, 17, 20], n = 8",
    "price = [1], n = 1",
    "price = [1, 5], n = 2",
    "price = [2, 5, 7, 8], n = 4",
    "price = [3, 5, 6, 7], n = 4"
  ],
  "rotate-matrix-by-90-degrees": [
    "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    "matrix = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]",
    "matrix = [[1]]",
    "matrix = [[1, 2], [3, 4]]",
    "matrix = [[0, 1], [1, 0]]",
    "matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]"
  ],
  "rotten-oranges": [
    "grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]",
    "grid = [[2, 1, 1], [0, 1, 1], [1, 0, 1]]",
    "grid = [[0, 2]]",
    "grid = [[0]]",
    "grid = [[1]]",
    "grid = [[2, 2], [1, 1], [0, 0], [2, 0]]"
  ],
  "search-in-2d-matrix-ii": [
    "matrix = [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target = 5",
    "matrix = [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target = 20",
    "matrix = [[5]], target = 5",
    "matrix = [[1, 1]], target = 2",
    "matrix = [[1, 3, 5]], target = 3",
    "matrix = [[-5]], target = -5"
  ],
  "search-in-a-2d-matrix": [
    "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3",
    "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13",
    "matrix = [[1]], target = 1",
    "matrix = [[1]], target = 2",
    "matrix = [[1, 3]], target = 3",
    "matrix = [[1, 3, 5, 7]], target = 5"
  ],
  "set-matrix-zeroes": [
    "matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]",
    "matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]",
    "matrix = [[1]]",
    "matrix = [[0]]",
    "matrix = [[1, 2], [3, 0]]",
    "matrix = [[1, 0, 3]]"
  ],
  "shortest-path-in-undirected-graph-with-unit-weights": [
    "edges = [[0, 1], [0, 3], [3, 4], [4, 5], [5, 6], [1, 2], [2, 6], [6, 7], [7, 8], [6, 8]], n = 9, m = 10, src = 0",
    "edges = [[0, 1], [1, 2], [0, 3]], n = 4, m = 3, src = 2",
    "edges = [], n = 1, m = 0, src = 0",
    "edges = [[0, 1]], n = 2, m = 1, src = 0",
    "edges = [[0, 1], [1, 2]], n = 3, m = 2, src = 1",
    "edges = [[0, 1], [0, 2], [1, 3], [2, 3]], n = 4, m = 4, src = 0"
  ],
  "shortest-path-with-minimum-effort": [
    "grid = [[1, 1, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1], [1, 1, 0, 0], [1, 0, 0, 1]], source = [0, 1], destination = [2, 2]",
    "grid = [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 0], [1, 0, 1, 0, 1]], source = [0, 0], destination = [3, 4]",
    "grid = [[1]], source = [0, 0], destination = [0, 0]",
    "grid = [[1, 0], [1, 1]], source = [0, 0], destination = [1, 1]",
    "grid = [[1, 1], [0, 1]], source = [0, 0], destination = [1, 1]",
    "grid = [[1, 1, 1], [0, 0, 1], [1, 1, 1]], source = [0, 0], destination = [2, 2]"
  ],
  "subset-sum-equals-to-target": [
    "n = 4, k = 5, arr = [4, 3, 2, 1]",
    "n = 5, k = 4, arr = [2, 5, 1, 6, 7]",
    "n = 1, k = 10, arr = [10]",
    "n = 1, k = 5, arr = [10]",
    "n = 3, k = 6, arr = [1, 2, 3]",
    "n = 4, k = 9, arr = [1, 2, 7, 3]"
  ],
  "sudoko-solver": [
    'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]',
    'board = [[".",".","9","7","4","8",".",".","."],["7",".",".",".",".",".",".",".","."],[".","2",".","1",".","9",".",".","."],[".",".","7",".",".",".","2","4","."],[".","6","4",".","1",".","5","9","."],[".","9","8",".",".",".","3",".","."],[".",".",".","8",".","3",".","2","."],[".",".",".",".",".",".",".",".","6"],[".",".",".","2","7","5","9",".","."]]',
    'board = [["1","2","3","4","5","6","7","8","."],["4","5","6","7","8","9","1","2","3"],["7","8","9","1","2","3","4","5","6"],["2","3","4","5","6","7","8","9","1"],["5","6","7","8","9","1","2","3","4"],["8","9","1","2","3","4","5","6","7"],["3","4","5","6","7","8","9","1","2"],["6","7","8","9","1","2","3","4","5"],["9","1","2","3","4","5","6","7","8"]]',
    'board = [["8",".",".",".",".",".",".",".","."],[".",".","3","6",".",".",".",".","."],[".","7",".",".","9",".","2",".","."],[".","5",".",".",".","7",".",".","."],[".",".",".",".","4","5","7",".","."],[".",".",".","1",".",".",".","3","."],[".",".","1",".",".",".",".","6","8"],[".",".","8","5",".",".",".","1","."],[".","9",".",".",".",".","4",".","."]]',
    'board = [[".","8",".",".",".","3",".","7","."],[".",".",".","6",".",".",".",".","."],[".",".","2",".","1",".","5",".","."],[".",".","7",".",".",".","2","4","."],[".","6","4",".","1",".","5","9","."],[".","9","8",".",".",".","3",".","."],[".",".",".","8",".","3",".","2","."],[".",".",".",".",".",".",".",".","6"],[".",".",".","2","7","5","9",".","."]]',
    'board = [["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","."]]'
  ],
  "surrounded-regions": [
    'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]',
    'board = [["X"]]',
    'board = [["O"]]',
    'board = [["X","O"],["O","X"]]',
    'board = [["O","O"],["O","O"]]',
    'board = [["X","X","X"],["X","O","X"],["X","X","X"]]'
  ],
  "swim-in-rising-water": [
    "grid = [[0, 2], [1, 3]]",
    "grid = [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]",
    "grid = [[0]]",
    "grid = [[3, 2], [0, 1]]",
    "grid = [[0, 1, 4], [2, 8, 7], [3, 5, 6]]",
    "grid = [[1, 0], [2, 3]]"
  ],
  "task-scheduler": [
    'tasks = ["A", "A", "A", "B", "B", "B"], n = 2',
    'tasks = ["A", "A", "A", "B", "B", "B"], n = 0',
    'tasks = ["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], n = 2',
    'tasks = ["A"], n = 2',
    'tasks = ["A", "B"], n = 1',
    'tasks = ["A", "B", "C", "D"], n = 2'
  ],
  "topological-sort-or-kahns-algorithm": [
    "V = 6, adj = [[], [], [3], [1], [0, 1], [0, 2]]",
    "V = 4, adj = [[], [0], [0], [0]]",
    "V = 1, adj = [[]]",
    "V = 3, adj = [[1], [2], []]",
    "V = 2, adj = [[1], []]",
    "V = 5, adj = [[], [0], [0], [1, 2], [2]]"
  ],
  "triangle": [
    "triangle = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]",
    "triangle = [[-10]]",
    "triangle = [[1], [2, 3]]",
    "triangle = [[-1], [2, 3], [1, -1, -3]]",
    "triangle = [[7], [1, 2], [8, 9, 1]]",
    "triangle = [[0], [1, 1], [2, 2, 2]]"
  ],
  "trie-implementation-and-advanced-operations": [
    'insert("apple"), insert("apple"), insert("apps"), countWordsEqualTo("apple"), countWordsStartingWith("app"), erase("apple"), countWordsEqualTo("apple")',
    'insert("code"), erase("code"), countWordsEqualTo("code")',
    'insert("apple"), insert("banana"), countWordsStartingWith("a"), countWordsStartingWith("b"), countWordsStartingWith("c")',
    'insert("cat"), insert("car"), insert("cart"), countWordsStartingWith("ca"), countWordsEqualTo("car")',
    'insert("word"), countWordsEqualTo("word"), erase("word"), countWordsEqualTo("word")',
    'countWordsStartingWith("xyz"), countWordsEqualTo("xyz")'
  ],
  "unbounded-knapsack": [
    "n = 2, w = 3, val = [1, 1], wt = [2, 1]",
    "n = 3, w = 10, val = [5, 11, 13], wt = [2, 4, 6]",
    "n = 1, w = 5, val = [10], wt = [2]",
    "n = 1, w = 1, val = [5], wt = [2]",
    "n = 4, w = 8, val = [1, 4, 5, 7], wt = [1, 3, 4, 5]",
    "n = 3, w = 4, val = [6, 1, 8], wt = [2, 1, 3]"
  ],
  "unique-paths-ii": [
    "grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
    "grid = [[0, 1], [0, 0]]",
    "grid = [[1]]",
    "grid = [[0]]",
    "grid = [[0, 0], [0, 0]]",
    "grid = [[0, 0, 0], [1, 1, 0], [0, 0, 0]]"
  ],
  "word-break": [
    's = "leetcode", wordDict = ["leet", "code"]',
    's = "applepenapple", wordDict = ["apple", "pen"]',
    's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]',
    's = "a", wordDict = ["a"]',
    's = "a", wordDict = ["b"]',
    's = "bb", wordDict = ["a", "b", "bbb", "bbbb"]'
  ],
  "word-ladder-i": [
    'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log", "cog"]',
    'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log"]',
    'beginWord = "a", endWord = "c", wordList = ["a", "b", "c"]',
    'beginWord = "hot", endWord = "dog", wordList = ["hot", "dog", "dot"]',
    'beginWord = "cat", endWord = "sag", wordList = ["bat", "bag", "sag", "dag", "dot"]',
    'beginWord = "cold", endWord = "warm", wordList = ["cold", "cord", "card", "ward", "warm"]'
  ],
  "word-ladder-ii": [
    'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log", "cog"]',
    'beginWord = "hit", endWord = "cog", wordList = ["hot", "dot", "dog", "lot", "log"]',
    'beginWord = "a", endWord = "c", wordList = ["a", "b", "c"]',
    'beginWord = "hot", endWord = "dog", wordList = ["hot", "dog", "dot"]',
    'beginWord = "red", endWord = "tax", wordList = ["ted", "tex", "red", "tax", "tad", "den", "rex", "pee"]',
    'beginWord = "cold", endWord = "warm", wordList = ["cold", "cord", "card", "ward", "warm"]'
  ],
  "word-search": [
    'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
    'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"',
    'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"',
    'board = [["a"]], word = "a"',
    'board = [["a"]], word = "b"',
    'board = [["A","B"],["C","D"]], word = "ABCD"'
  ]
};

async function run() {
  console.log("Running Batch 4 (36 problems)...");
  let passedCount = 0;
  for (const [slug, inputs] of Object.entries(batch4Inputs)) {
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
  console.log(`Batch 4 Complete: ${passedCount}/36 passed!`);
}

run();
