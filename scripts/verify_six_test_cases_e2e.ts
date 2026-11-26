import prisma from "../src/lib/prisma";
import { POST as executeRoute } from "../src/app/api/playground/execute/route";
import { POST as submitRoute } from "../src/app/api/playground/submit/route";
import { getOnlineCompilerUsage } from "../src/lib/onlineCompiler";
import { signToken } from "../src/lib/auth";

async function main() {
  console.log("==========================================================");
  console.log("  VERIFY 6-TEST-CASE SYSTEM & MULTI-LANGUAGE REAL RUNS     ");
  console.log("==========================================================\n");

  // 1. Quota Check Before Runs
  const usageBefore = await getOnlineCompilerUsage();
  console.log("OnlineCompiler Account Quota Status:");
  console.log(`- Submissions This Month: ${usageBefore.submissions} / ${usageBefore.monthly_limit}`);
  console.log(`- Remaining: ${usageBefore.remaining}`);
  console.log(`- Rate Limit Window: ${usageBefore.submissions_per_minute} req/min\n`);

  // Find Plus User
  const plusUser = await prisma.user.findFirst({
    where: {
      membershipType: "PLUS",
      membershipExpiresAt: { gt: new Date() },
    },
  });

  if (!plusUser) {
    throw new Error("No active Plus user found in database for testing.");
  }

  const token = signToken({
    id: plusUser.id,
    name: plusUser.name,
    email: plusUser.email,
    role: plusUser.role,
  });

  // Find Two Sum Problem
  const twoSum = await prisma.problem.findUnique({
    where: { slug: "two-sum" },
    include: {
      testCases: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!twoSum) {
    throw new Error("Two Sum problem not found.");
  }

  console.log(`Found Two Sum (ID: ${twoSum.id}) with ${twoSum.testCases.length} active test cases.`);
  console.log(`Sample test cases (order <= 3): ${twoSum.testCases.filter(t => t.isSample).length}`);
  console.log(`Active non-sample test cases (order 4..6): ${twoSum.testCases.filter(t => !t.isSample).length}\n`);

  // Clean any previous progress on Two Sum for clean test
  await prisma.userProgress.deleteMany({
    where: { userId: plusUser.id, problemId: twoSum.id },
  });

  // Solutions in 4 languages
  const solutions = {
    python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
    javascript: `class Solution {
    twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
            const comp = target - nums[i];
            if (map.has(comp)) return [map.get(comp), i];
            map.set(nums[i], i);
        }
        return [];
    }
}`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[] { map.get(comp), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < (int)nums.size(); i++) {
            int comp = target - nums[i];
            if (mp.count(comp)) {
                return {mp[comp], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
  };

  // -------------------------------------------------------------
  // Test 1: RUN CODE across all 4 languages (First 3 Cases)
  // -------------------------------------------------------------
  console.log("----------------------------------------------------------");
  console.log("TEST 1: RUN CODE (First 3 Active Test Cases)");
  console.log("----------------------------------------------------------");

  for (const [lang, code] of Object.entries(solutions)) {
    const fakeReq = new Request("http://localhost:3000/api/playground/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `beenext_token=${token}`,
      },
      body: JSON.stringify({
        problemId: twoSum.id,
        language: lang,
        sourceCode: code,
      }),
    });

    const res = await executeRoute(fakeReq);
    const json = await res.json();

    console.log(`[${lang.toUpperCase()}] Run Result:`);
    console.log(`  - Status Code: ${res.status}`);
    console.log(`  - Verdict: ${json.verdict}`);
    console.log(`  - Passed Cases: ${json.passedTests} / ${json.totalTests}`);
    console.log(`  - Execution Time: ${json.executionTime}s, Memory: ${json.memoryUsage} KB`);
    console.log(`  - Evaluated Cases Count: ${json.testResults?.length}`);
    if (json.testResults?.[0]) {
      console.log(`  - Case 1 Input: "${json.testResults[0].input}"`);
      console.log(`  - Case 1 Expected: "${json.testResults[0].expectedOutput}"`);
      console.log(`  - Case 1 Actual: "${json.testResults[0].actualOutput}"`);
    }

    if (json.verdict !== "Accepted" || json.passedTests !== 3 || json.totalTests !== 3) {
      throw new Error(`Run Code failed for ${lang}: expected 3/3 Accepted, got ${json.verdict} (${json.passedTests}/${json.totalTests})`);
    }
  }

  // Confirm NO user progress created during Run Code
  const progressAfterRun = await prisma.userProgress.findUnique({
    where: { userId_problemId: { userId: plusUser.id, problemId: twoSum.id } },
  });
  console.log(`\nVerified UserProgress after Run Code: ${progressAfterRun ? "INCORRECTLY CREATED" : "None (Correct - only Submit updates progress)"}\n`);

  // -------------------------------------------------------------
  // Test 2: SUBMIT CODE across all 4 languages (All 6 Cases)
  // -------------------------------------------------------------
  console.log("----------------------------------------------------------");
  console.log("TEST 2: SUBMIT CODE (All 6 Active Test Cases)");
  console.log("----------------------------------------------------------");

  for (const [lang, code] of Object.entries(solutions)) {
    const fakeReq = new Request("http://localhost:3000/api/playground/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `beenext_token=${token}`,
      },
      body: JSON.stringify({
        problemId: twoSum.id,
        language: lang,
        sourceCode: code,
      }),
    });

    const res = await submitRoute(fakeReq);
    const json = await res.json();

    console.log(`[${lang.toUpperCase()}] Submit Result:`);
    console.log(`  - Status Code: ${res.status}`);
    console.log(`  - Verdict: ${json.verdict}`);
    console.log(`  - Passed Cases: ${json.passedTests} / ${json.totalTests}`);
    console.log(`  - Execution Time: ${json.executionTime}s, Memory: ${json.memoryUsage} KB`);
    console.log(`  - Evaluated Cases Count: ${json.testResults?.length}`);
    console.log(`  - All 6 Cases Have Expected & Actual Output: ${json.testResults?.every((t: any) => t.expectedOutput && t.actualOutput !== undefined)}`);
    json.testResults?.forEach((t: any) => {
      console.log(`    Case ${t.testIndex}: passed=${t.passed}, expected="${t.expectedOutput}", actual="${t.actualOutput}"`);
    });

    if (json.verdict !== "Accepted" || json.passedTests !== 6 || json.totalTests !== 6) {
      throw new Error(`Submit Code failed for ${lang}: expected 6/6 Accepted, got ${json.verdict} (${json.passedTests}/${json.totalTests})`);
    }
  }

  // Confirm user progress IS created and marked COMPLETED
  const progressAfterSubmit = await prisma.userProgress.findUnique({
    where: { userId_problemId: { userId: plusUser.id, problemId: twoSum.id } },
  });
  console.log(`\nVerified UserProgress after genuine Submit: Status = ${progressAfterSubmit?.status} (Expected: COMPLETED)\n`);

  // -------------------------------------------------------------
  // Test 3: FAILURE MODES VERIFICATION
  // -------------------------------------------------------------
  console.log("----------------------------------------------------------");
  console.log("TEST 3: FAILURE MODES (Wrong Answer, Syntax, Runtime, TLE)");
  console.log("----------------------------------------------------------");

  // 1. Wrong Answer
  const wrongReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      problemId: twoSum.id,
      language: "python",
      sourceCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 0] # Intentionally wrong answer`,
    }),
  });
  const wrongRes = await (await submitRoute(wrongReq)).json();
  console.log(`1. Wrong Answer: verdict = "${wrongRes.verdict}", passed = ${wrongRes.passedTests}/${wrongRes.totalTests}`);

  // 2. Compilation / Syntax Error
  const syntaxReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      problemId: twoSum.id,
      language: "cpp",
      sourceCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        INVALID_SYNTAX_HERE;
    }
};`,
    }),
  });
  const syntaxRes = await (await submitRoute(syntaxReq)).json();
  console.log(`2. Syntax Error: verdict = "${syntaxRes.verdict}", hasErrorOutput = ${!!syntaxRes.errorOutput}`);

  // 3. Runtime Error
  const runtimeReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      problemId: twoSum.id,
      language: "python",
      sourceCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        raise ZeroDivisionError("Deliberate exception for testing")`,
    }),
  });
  const runtimeRes = await (await submitRoute(runtimeReq)).json();
  console.log(`3. Runtime Error: verdict = "${runtimeRes.verdict}", hasErrorOutput = ${!!runtimeRes.errorOutput}`);

  // 4. Time Limit Exceeded (Infinite Loop)
  const tleReq = new Request("http://localhost:3000/api/playground/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `beenext_token=${token}`,
    },
    body: JSON.stringify({
      problemId: twoSum.id,
      language: "javascript",
      sourceCode: `class Solution {
    twoSum(nums, target) {
        while(true) {} // Deliberate infinite loop
    }
}`,
    }),
  });
  const tleRes = await (await submitRoute(tleReq)).json();
  console.log(`4. Time Limit Exceeded: verdict = "${tleRes.verdict}"`);

  // Final Quota Check
  const usageAfter = await getOnlineCompilerUsage();
  console.log("\n----------------------------------------------------------");
  console.log("FINAL QUOTA CONSUMPTION REPORT:");
  console.log(`- Submissions Used in This Session: ${usageAfter.submissions - usageBefore.submissions}`);
  console.log(`- Total Account Submissions: ${usageAfter.submissions} / ${usageAfter.monthly_limit}`);
  console.log(`- Remaining Quota: ${usageAfter.remaining}`);
  console.log("==========================================================\n");
}

main()
  .catch((e) => console.error("Verification failed:", e))
  .finally(() => prisma.$disconnect());
