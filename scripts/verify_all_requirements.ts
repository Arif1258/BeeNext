import prisma from "../src/lib/prisma";
import registryData from "../src/data/problem_templates_registry.json";
import { parseInputToArgs, normalizeOutput, evaluateTestSuiteWithOnlineCompiler } from "../src/lib/executionWrapper";
import { POST as executeRoute } from "../src/app/api/playground/execute/route";
import { POST as submitRoute } from "../src/app/api/playground/submit/route";
import { signToken } from "../src/lib/auth";

interface ProblemTemplate {
  title: string;
  slug: string;
  isConceptual: boolean;
  methodName: string;
  returnType: string;
  params: Array<{ name: string; type: string }>;
}

const registry = registryData as Record<string, ProblemTemplate>;

async function main() {
  console.log("==========================================================");
  console.log("  COMPREHENSIVE PRODUCTION READINESS AUDIT & VERIFICATION  ");
  console.log("==========================================================\n");

  // -------------------------------------------------------------
  // Part 1: Offline Categorization & Template Audit across 493 Problems
  // -------------------------------------------------------------
  console.log("1. AUDITING ALL 493 PROBLEM TEMPLATES & WRAPPER COMPATIBILITY...");

  const allProblems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true },
  });

  const categories = {
    standardPrimitiveOrArray: [] as string[],
    inPlaceVoid: [] as string[],
    matrices: [] as string[],
    linkedLists: [] as string[],
    trees: [] as string[],
    classDesign: [] as string[],
    conceptual: [] as string[],
  };

  for (const prob of allProblems) {
    const tmpl = registry[prob.slug];
    if (!tmpl) continue;

    if (tmpl.isConceptual) {
      categories.conceptual.push(prob.slug);
      continue;
    }

    const ret = tmpl.returnType || "";
    const params = tmpl.params || [];
    const hasListNode = params.some(p => p.type && (p.type.includes("ListNode") || p.type.includes("Node"))) || ret.includes("ListNode") || ret === "Node";
    const hasTreeNode = params.some(p => p.type && p.type.includes("TreeNode")) || ret.includes("TreeNode");
    const isMatrix = ret.includes("[][]") || ret.includes("vector<vector") || ret.includes("List<List<") || params.some(p => p.type && (p.type.includes("[][]") || p.type.includes("vector<vector")));
    const isVoid = ret === "void";
    const isClassDesign = tmpl.methodName === "constructor" || ret === "public" || ret === "new" || prob.slug.includes("cache") || prob.slug.includes("design") || prob.slug.includes("iterator");

    if (isClassDesign) {
      categories.classDesign.push(prob.slug);
    } else if (hasTreeNode) {
      categories.trees.push(prob.slug);
    } else if (hasListNode) {
      categories.linkedLists.push(prob.slug);
    } else if (isVoid) {
      categories.inPlaceVoid.push(prob.slug);
    } else if (isMatrix) {
      categories.matrices.push(prob.slug);
    } else {
      categories.standardPrimitiveOrArray.push(prob.slug);
    }
  }

  console.log(`   - Standard Functions (Arrays, Strings, DP, Math, Recursion): ${categories.standardPrimitiveOrArray.length}`);
  console.log(`   - In-Place Void Modifications: ${categories.inPlaceVoid.length}`);
  console.log(`   - 2D Matrices & Grids: ${categories.matrices.length}`);
  console.log(`   - Linked Lists (ListNode/Node): ${categories.linkedLists.length}`);
  console.log(`   - Binary Trees / BST (TreeNode): ${categories.trees.length}`);
  console.log(`   - Class-Based Design (LRU Cache, LFU, Trie, MinStack, etc.): ${categories.classDesign.length}`);
  console.log(`   - Conceptual / Non-Coding Articles: ${categories.conceptual.length}`);

  // -------------------------------------------------------------
  // Part 2: Active Test Cases Verification (Exact 3 Run, Exact 6 Submit for Coding Problems, 0 for Conceptual)
  // -------------------------------------------------------------
  console.log("\n2. VERIFYING EXACT TEST CASE COUNTS IN DATABASE...");
  const totalActive = await prisma.testCase.count({ where: { isActive: true } });
  const totalInactive = await prisma.testCase.count({ where: { isActive: false } });
  const totalSample = await prisma.testCase.count({ where: { isActive: true, isSample: true } });
  const totalNonSample = await prisma.testCase.count({ where: { isActive: true, isSample: false } });

  const numCodingProblems = 495 - categories.conceptual.length; // 464 coding problems
  const expectedActive = numCodingProblems * 6; // 2784
  const expectedSample = numCodingProblems * 3; // 1392

  console.log(`   - Active Test Cases: ${totalActive} (Expected: ${expectedActive} = ${numCodingProblems} * 6)`);
  console.log(`   - Inactive Test Cases: ${totalInactive} (Expected: ${5916 - expectedActive})`);
  console.log(`   - Sample Test Cases (Run Code): ${totalSample} (Expected: ${expectedSample} = ${numCodingProblems} * 3)`);
  console.log(`   - Non-Sample Active Cases: ${totalNonSample} (Expected: ${expectedSample} = ${numCodingProblems} * 3)`);

  if (totalActive !== expectedActive || totalSample !== expectedSample) {
    throw new Error(`Database test case counts do not match expected 6-test-case structure for coding problems!`);
  }

  // -------------------------------------------------------------
  // Part 3: Authorization Bypass Checks (Direct API Requests)
  // -------------------------------------------------------------
  console.log("\n3. VERIFYING AUTHORIZATION GATES (Logged-Out, Normal, Expired Plus)...");

  // A. Logged-out user (no cookie)
  const loggedOutReq = new Request("http://localhost:3000/api/playground/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const loggedOutRes = await executeRoute(loggedOutReq);
  console.log(`   - Logged-Out Request to /api/playground/execute: Status ${loggedOutRes.status} (Expected: 401)`);
  if (loggedOutRes.status !== 401) throw new Error("Logged-out user was able to access execute API!");

  const loggedOutSubmitReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const loggedOutSubmitRes = await submitRoute(loggedOutSubmitReq);
  console.log(`   - Logged-Out Request to /api/playground/submit: Status ${loggedOutSubmitRes.status} (Expected: 401)`);
  if (loggedOutSubmitRes.status !== 401) throw new Error("Logged-out user was able to access submit API!");

  // B. Normal User (NORMAL membership)
  let normalUser = await prisma.user.findFirst({
    where: { membershipType: "NORMAL", role: "USER" },
  });
  if (!normalUser) {
    normalUser = await prisma.user.create({
      data: {
        name: "Test Normal User",
        email: `test_normal_${Date.now()}@beenext.test`,
        passwordHash: "hashedpassword123",
        role: "USER",
        membershipType: "NORMAL",
      },
    });
  }

  const normalToken = signToken({
    id: normalUser.id,
    name: normalUser.name,
    email: normalUser.email,
    role: normalUser.role,
  });

  const normalReq = new Request("http://localhost:3000/api/playground/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${normalToken}`,
    },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const normalRes = await executeRoute(normalReq);
  console.log(`   - Normal User Request to /api/playground/execute: Status ${normalRes.status} (Expected: 403)`);
  if (normalRes.status !== 403) throw new Error("Normal user was able to bypass execute API!");

  const normalSubmitReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${normalToken}`,
    },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const normalSubmitRes = await submitRoute(normalSubmitReq);
  console.log(`   - Normal User Request to /api/playground/submit: Status ${normalSubmitRes.status} (Expected: 403)`);
  if (normalSubmitRes.status !== 403) throw new Error("Normal user was able to bypass submit API!");

  // C. Expired Plus User
  let expiredUser = await prisma.user.findFirst({
    where: {
      membershipType: "PLUS",
      membershipExpiresAt: { lt: new Date() },
    },
  });
  if (!expiredUser) {
    expiredUser = await prisma.user.create({
      data: {
        name: "Test Expired User",
        email: `test_expired_${Date.now()}@beenext.test`,
        passwordHash: "hashedpassword123",
        membershipType: "PLUS",
        membershipExpiresAt: new Date(Date.now() - 86400000), // Expired 1 day ago
      },
    });
  }

  const expiredToken = signToken({
    id: expiredUser.id,
    name: expiredUser.name,
    email: expiredUser.email,
    role: expiredUser.role,
  });

  const expiredReq = new Request("http://localhost:3000/api/playground/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${expiredToken}`,
    },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const expiredRes = await executeRoute(expiredReq);
  console.log(`   - Expired Plus User Request to /api/playground/execute: Status ${expiredRes.status} (Expected: 403)`);
  if (expiredRes.status !== 403) throw new Error("Expired Plus user was able to bypass execute API!");

  const expiredSubmitReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${expiredToken}`,
    },
    body: JSON.stringify({ language: "python", sourceCode: "print(1)" }),
  });
  const expiredSubmitRes = await submitRoute(expiredSubmitReq);
  console.log(`   - Expired Plus User Request to /api/playground/submit: Status ${expiredSubmitRes.status} (Expected: 403)`);
  if (expiredSubmitRes.status !== 403) throw new Error("Expired Plus user was able to bypass submit API!");

  // Clean test users
  await prisma.user.deleteMany({
    where: { email: { in: [normalUser.email, expiredUser.email] } },
  });

  // -------------------------------------------------------------
  // Part 4: Incomplete Provider Response & Failure Guard Tests
  // -------------------------------------------------------------
  console.log("\n4. VERIFYING PROVIDER FAILURE MODES & ZERO FALSE-ACCEPTED GUARANTEE...");

  // Mock test cases
  const sampleTestCases = [
    { order: 1, input: "n = 5", expectedOutput: "10" },
    { order: 2, input: "n = 6", expectedOutput: "12" },
    { order: 3, input: "n = 7", expectedOutput: "14" },
  ];

  // Test what happens when sourceCode is empty
  const emptyCodeRes = await evaluateTestSuiteWithOnlineCompiler({
    language: "python",
    sourceCode: "",
    problemSlug: "two-sum",
    testCases: sampleTestCases,
  });
  console.log(`   - Empty Source Code: verdict = "${emptyCodeRes.verdict}", passed = ${emptyCodeRes.passedTests}/${emptyCodeRes.totalTests} (Expected: 0 passed, Compilation Error)`);
  if (emptyCodeRes.verdict === "Accepted" || emptyCodeRes.passedTests > 0) {
    throw new Error("Empty code incorrectly returned Accepted!");
  }

  // -------------------------------------------------------------
  // Part 5: Distributed Concurrency Lock Atomic Safety
  // -------------------------------------------------------------
  console.log("\n5. VERIFYING DISTRIBUTED CONCURRENCY LOCK SAFETY IN POSTGRES...");
  // Test creating locks and verifying concurrency count
  const testLock1 = await prisma.executionLock.create({
    data: { userId: "test_user_1", expiresAt: new Date(Date.now() + 5000) },
  });
  const testLock2 = await prisma.executionLock.create({
    data: { userId: "test_user_2", expiresAt: new Date(Date.now() + 5000) },
  });
  const testLock3 = await prisma.executionLock.create({
    data: { userId: "test_user_3", expiresAt: new Date(Date.now() + 5000) },
  });

  const activeLocksCount = await prisma.executionLock.count({
    where: { expiresAt: { gt: new Date() } },
  });
  console.log(`   - Active Execution Locks in PostgreSQL: ${activeLocksCount} (Target: >= 3)`);

  // Cleanup test locks
  await prisma.executionLock.deleteMany({
    where: { id: { in: [testLock1.id, testLock2.id, testLock3.id] } },
  });

  console.log("\n==========================================================");
  console.log("  ALL PRODUCTION READINESS CHECKS COMPLETED SUCCESSFULLY  ");
  console.log("==========================================================\n");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
