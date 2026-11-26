/**
 * Live End-to-End Verification of Specialized Categories on OnlineCompiler.io
 *
 * Tests:
 * 1. Linked List: reverse-a-ll across Run (3 cases) and Submit (6 cases)
 * 2. Binary Tree: maximum-depth-in-bt across Run (3 cases) and Submit (6 cases)
 * 3. Class-Based Design: lru-cache across Run (3 cases) and Submit (6 cases)
 */

import prisma from "../src/lib/prisma";
import { evaluateTestSuiteWithOnlineCompiler } from "../src/lib/executionWrapper";

async function main() {
  console.log("=== Starting Live Specialized Category Verification ===\n");

  // -------------------------------------------------------------
  // Test 1: Linked List (Python) on reverse-a-ll
  // -------------------------------------------------------------
  console.log("--- 1. Testing Linked List: reverse-a-ll (Python) ---");
  const llCases = await prisma.testCase.findMany({
    where: { problem: { slug: "reverse-a-ll" }, isActive: true },
    orderBy: { order: "asc" },
  });
  console.log(`Loaded ${llCases.length} active test cases for reverse-a-ll.`);

  const pythonLLCode = `
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev
`;

  // Run Code (first 3 cases)
  const llRunRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "python",
    sourceCode: pythonLLCode,
    problemSlug: "reverse-a-ll",
    testCases: llCases.slice(0, 3),
    isSubmission: false,
  });
  console.log(`Run Code Verdict: ${llRunRes.verdict} (${llRunRes.passedTests}/${llRunRes.totalTests} passed)`);
  if (llRunRes.testResults[0]) {
    console.log(`Case 1: input=${llRunRes.testResults[0].input}, actual=${llRunRes.testResults[0].actualOutput}, expected=${llRunRes.testResults[0].expectedOutput}, passed=${llRunRes.testResults[0].passed}`);
  }

  // Submit Code (all 6 cases)
  const llSubmitRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "python",
    sourceCode: pythonLLCode,
    problemSlug: "reverse-a-ll",
    testCases: llCases,
    isSubmission: true,
  });
  console.log(`Submit Code Verdict: ${llSubmitRes.verdict} (${llSubmitRes.passedTests}/${llSubmitRes.totalTests} passed)\n`);

  // -------------------------------------------------------------
  // Test 2: Binary Tree (Java) on maximum-depth-in-bt
  // -------------------------------------------------------------
  console.log("--- 2. Testing Binary Tree: maximum-depth-in-bt (Java) ---");
  const treeCases = await prisma.testCase.findMany({
    where: { problem: { slug: "maximum-depth-in-bt" }, isActive: true },
    orderBy: { order: "asc" },
  });
  console.log(`Loaded ${treeCases.length} active test cases for maximum-depth-in-bt.`);

  const javaTreeCode = `
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}
`;

  const treeSubmitRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "java",
    sourceCode: javaTreeCode,
    problemSlug: "maximum-depth-in-bt",
    testCases: treeCases,
    isSubmission: true,
  });
  console.log(`Submit Code Verdict: ${treeSubmitRes.verdict} (${treeSubmitRes.passedTests}/${treeSubmitRes.totalTests} passed)`);
  if (treeSubmitRes.testResults[0]) {
    console.log(`Case 1: input=${treeSubmitRes.testResults[0].input}, actual=${treeSubmitRes.testResults[0].actualOutput}, expected=${treeSubmitRes.testResults[0].expectedOutput}, passed=${treeSubmitRes.testResults[0].passed}\n`);
  }

  // -------------------------------------------------------------
  // Test 3: Class-Based Design (Python) on lru-cache
  // -------------------------------------------------------------
  console.log("--- 3. Testing Class-Based Design: lru-cache (Python) ---");
  const lruCases = await prisma.testCase.findMany({
    where: { problem: { slug: "lru-cache" }, isActive: true },
    orderBy: { order: "asc" },
  });
  console.log(`Loaded ${lruCases.length} active test cases for lru-cache.`);

  const pythonLRUCode = `
import collections

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = collections.OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        self.map.move_to_end(key)
        return self.map[key]

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self.map.move_to_end(key)
        self.map[key] = value
        if len(self.map) > self.cap:
            self.map.popitem(last=False)
`;

  const lruRunRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "python",
    sourceCode: pythonLRUCode,
    problemSlug: "lru-cache",
    testCases: lruCases.slice(0, 3),
    isSubmission: false,
  });
  console.log(`Run Code Verdict: ${lruRunRes.verdict} (${lruRunRes.passedTests}/${lruRunRes.totalTests} passed)`);

  const lruSubmitRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "python",
    sourceCode: pythonLRUCode,
    problemSlug: "lru-cache",
    testCases: lruCases,
    isSubmission: true,
  });
  console.log(`Submit Code Verdict: ${lruSubmitRes.verdict} (${lruSubmitRes.passedTests}/${lruSubmitRes.totalTests} passed)`);
  for (let i = 0; i < lruSubmitRes.testResults.length; i++) {
    const tr = lruSubmitRes.testResults[i];
    console.log(`Case ${tr.testIndex}: actual=${tr.actualOutput.slice(0, 30)}, expected=${tr.expectedOutput?.slice(0, 30)}, passed=${tr.passed}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
