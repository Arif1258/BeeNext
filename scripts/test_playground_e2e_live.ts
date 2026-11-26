import prisma from "../src/lib/prisma";
import { POST as executeRoute } from "../src/app/api/playground/execute/route";
import { POST as submitRoute } from "../src/app/api/playground/submit/route";
import { signToken } from "../src/lib/auth";

async function main() {
  console.log("=== TESTING PLAYGROUND EXECUTION FLOW & UI DISPLAY ===");

  const plusUser = await prisma.user.findFirst({
    where: {
      membershipType: "PLUS",
      membershipExpiresAt: { gt: new Date() },
    },
  });

  if (!plusUser) throw new Error("No active Plus user found");

  const token = signToken({
    id: plusUser.id,
    name: plusUser.name,
    email: plusUser.email,
    role: plusUser.role,
  });

  const loopProblem = await prisma.problem.findUnique({
    where: { slug: "detect-a-loop-in-ll" },
    select: { id: true, slug: true },
  });
  if (!loopProblem) throw new Error("detect-a-loop-in-ll not found");

  const intersectProblem = await prisma.problem.findUnique({
    where: { slug: "find-the-intersection-point-of-y-ll" },
    select: { id: true, slug: true },
  });
  if (!intersectProblem) throw new Error("find-the-intersection-point-of-y-ll not found");

  // 1. Test "detect-a-loop-in-ll" with CORRECT solution
  console.log("\n1. Testing detect-a-loop-in-ll with CORRECT solution (Python)...");
  const correctPythonCode = `
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False
`;

  // RUN CODE (Execute - 3 cases)
  const runReq = new Request("http://localhost:3000/api/playground/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      language: "python",
      sourceCode: correctPythonCode,
      problemId: loopProblem.id,
    }),
  });

  const runRes = await executeRoute(runReq);
  const runData = await runRes.json();
  console.log("RUN CODE (3 cases):");
  console.log(`- Success: ${runData.success}`);
  console.log(`- Verdict: ${runData.verdict}`);
  console.log(`- Passed: ${runData.passedTests} / ${runData.totalTests}`);
  runData.testResults.forEach((tr: any) => {
    console.log(`  Case ${tr.testIndex}: Status: ${tr.status} | Input: "${tr.input}" | Exp: "${tr.expectedOutput}" | Act: "${tr.actualOutput}"`);
  });

  if (runData.passedTests !== 3 || runData.totalTests !== 3) {
    throw new Error(`Run Code expected 3/3 passed, got ${runData.passedTests}/${runData.totalTests}`);
  }

  // SUBMIT CODE (Submit - 6 cases)
  console.log("\nSUBMIT CODE (6 cases):");
  const submitReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      language: "python",
      sourceCode: correctPythonCode,
      problemId: loopProblem.id,
    }),
  });

  const submitRes = await submitRoute(submitReq);
  const submitData = await submitRes.json();
  console.log(`- Success: ${submitData.success}`);
  console.log(`- Verdict: ${submitData.verdict}`);
  console.log(`- Passed: ${submitData.passedTests} / ${submitData.totalTests}`);
  submitData.testResults.forEach((tr: any) => {
    console.log(`  Case ${tr.testIndex}: Status: ${tr.status} | Exp: "${tr.expectedOutput}" | Act: "${tr.actualOutput}"`);
  });

  if (submitData.passedTests !== 6 || submitData.totalTests !== 6 || submitData.verdict !== "Accepted") {
    throw new Error(`Submit Code expected 6/6 passed and Accepted, got ${submitData.passedTests}/${submitData.totalTests} (${submitData.verdict})`);
  }

  // 2. Test "detect-a-loop-in-ll" with INCORRECT solution
  console.log("\n2. Testing detect-a-loop-in-ll with INCORRECT solution (Always return False)...");
  const incorrectPythonCode = `
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        return False
`;

  const runIncorrectReq = new Request("http://localhost:3000/api/playground/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      language: "python",
      sourceCode: incorrectPythonCode,
      problemId: loopProblem.id,
    }),
  });

  const runIncorrectRes = await executeRoute(runIncorrectReq);
  const runIncorrectData = await runIncorrectRes.json();
  console.log("INCORRECT RUN RESULT:");
  console.log(`- Success: ${runIncorrectData.success}`);
  console.log(`- Verdict: ${runIncorrectData.verdict}`);
  console.log(`- Passed: ${runIncorrectData.passedTests} / ${runIncorrectData.totalTests}`);
  runIncorrectData.testResults.forEach((tr: any) => {
    console.log(`  Case ${tr.testIndex}: Status: ${tr.status} | Exp: "${tr.expectedOutput}" | Act: "${tr.actualOutput}"`);
  });

  if (runIncorrectData.passedTests === runIncorrectData.totalTests || runIncorrectData.verdict === "Accepted") {
    throw new Error(`Grading integrity failure: incorrect solution was marked Accepted!`);
  }

  // 3. Test "find-the-intersection-point-of-y-ll" with JavaScript
  console.log("\n3. Testing find-the-intersection-point-of-y-ll with JavaScript...");
  const jsIntersectionCode = `
var getIntersectionNode = function(headA, headB) {
    if (!headA || !headB) return null;
    let a = headA, b = headB;
    while (a !== b) {
        a = a ? a.next : headB;
        b = b ? b.next : headA;
    }
    return a;
};
`;

  const submitJsReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      language: "javascript",
      sourceCode: jsIntersectionCode,
      problemId: intersectProblem.id,
    }),
  });

  const submitJsRes = await submitRoute(submitJsReq);
  const submitJsData = await submitJsRes.json();
  console.log(`- JS Intersection Passed: ${submitJsData.passedTests} / ${submitJsData.totalTests}`);
  console.log(`- Verdict: ${submitJsData.verdict}`);
  submitJsData.testResults.forEach((tr: any) => {
    console.log(`  Case ${tr.testIndex}: Status: ${tr.status} | Exp: "${tr.expectedOutput}" | Act: "${tr.actualOutput}"`);
  });

  if (submitJsData.passedTests !== 6 || submitJsData.totalTests !== 6) {
    throw new Error(`JS Intersection expected 6/6 passed, got ${submitJsData.passedTests}/${submitJsData.totalTests}`);
  }

  console.log("\nALL PLAYGROUND EXECUTION FLOW CHECKS PASSED!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
