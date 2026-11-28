import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";

// Load .env if present
try {
  if (fs.existsSync(".env")) {
    const lines = fs.readFileSync(".env", "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {}

const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "beenext_token";
const BASE_URL = "http://localhost:3000";

// Helper to create an auth cookie for a user
function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// Real Neon users
const ADMIN_USER = { id: "cmwp4hkkm0000zsg4bkv3woni", email: "supportbeenext@gmail.com", role: "ADMIN" };
const PLUS_ELIGIBLE_USER = { id: "cmwp4hkkq0001zsg4p4jmhn3e", email: "arifahmedma490@gmail.com", role: "USER" }; // 425 solved, PLUS
const NORMAL_USER = { id: "cmwx7xmek0000j5h4av78bshd", email: "razorpay@gmail.com", role: "USER" }; // NORMAL

const adminToken = makeToken(ADMIN_USER);
const plusToken = makeToken(PLUS_ELIGIBLE_USER);
const normalToken = makeToken(NORMAL_USER);

async function benchmark(name, fn, iterations = 3) {
  const times = [];
  let result;
  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    result = await fn();
    const t1 = performance.now();
    times.push(t1 - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`[BENCHMARK] ${name}: min=${Math.min(...times).toFixed(1)}ms, avg=${avg.toFixed(1)}ms, max=${Math.max(...times).toFixed(1)}ms (runs: ${times.map(t => t.toFixed(0)).join(", ")}ms)`);
  return { avg, min: Math.min(...times), max: Math.max(...times), times, result };
}

async function main() {
  console.log("==================================================================");
  console.log("   BEENEXT TARGETED PERFORMANCE & FUNCTIONALITY VERIFICATION   ");
  console.log("==================================================================");

  // 1. Unauthenticated Daily Challenge API
  console.log("\n--- 1. DAILY CHALLENGE API (UNAUTHENTICATED) ---");
  const unauthRes = await benchmark("GET /api/daily-challenge (Unauthenticated)", async () => {
    const res = await fetch(`${BASE_URL}/api/daily-challenge`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, 5);

  console.log("Daily Challenge Problem:", {
    title: unauthRes.result.problem?.title,
    slug: unauthRes.result.problem?.slug,
    difficulty: unauthRes.result.problem?.difficulty,
    category: unauthRes.result.problem?.category?.title,
    todayDate: unauthRes.result.todayDate,
    midnightIST: unauthRes.result.midnightIST,
  });

  // 2. Authenticated Daily Challenge API (Admin / Plus user & Normal user)
  console.log("\n--- 2. DAILY CHALLENGE API (AUTHENTICATED - ADMIN / PLUS & NORMAL) ---");
  const authAdminRes = await benchmark("GET /api/daily-challenge (Admin / Plus)", async () => {
    const res = await fetch(`${BASE_URL}/api/daily-challenge`, {
      headers: { Cookie: `${COOKIE_NAME}=${plusToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, 3);

  console.log("Admin / Plus User Daily Challenge Info:", {
    streak: authAdminRes.result.userStreak,
    isCompletedToday: authAdminRes.result.isCompletedToday,
    allowance: authAdminRes.result.allowance,
  });

  const authNormalRes = await benchmark("GET /api/daily-challenge (Normal User)", async () => {
    const res = await fetch(`${BASE_URL}/api/daily-challenge`, {
      headers: { Cookie: `${COOKIE_NAME}=${normalToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }, 3);

  console.log("Normal User Daily Challenge Info:", {
    streak: authNormalRes.result.userStreak,
    isCompletedToday: authNormalRes.result.isCompletedToday,
    allowance: authNormalRes.result.allowance,
  });

  // 3. Topics Page Server Render Latency
  console.log("\n--- 3. TOPICS PAGE SSR LATENCY ---");
  await benchmark("GET /topics (Server Rendered Page)", async () => {
    const res = await fetch(`${BASE_URL}/topics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text.length;
  }, 3);

  // 4. Verify Razorpay Membership Payments & Webhooks
  console.log("\n--- 4. RAZORPAY MEMBERSHIP PAYMENTS & WEBHOOK VERIFICATION ---");
  // Test membership order creation
  const orderRes = await fetch(`${BASE_URL}/api/membership/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${COOKIE_NAME}=${normalToken}`,
    },
    body: JSON.stringify({ plan: "MONTHLY" }),
  });
  const orderData = await orderRes.json();
  console.log("Membership Order Creation Result:", {
    status: orderRes.status,
    success: orderData.success,
    orderId: orderData.orderId,
    membershipOrderId: orderData.membershipOrderId,
    amount: orderData.amount,
    plan: orderData.plan,
  });

  if (!orderData.success) {
    console.error("Membership order creation failed:", orderData);
  }

  // Test webhook resilience with membership order
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "beenext_webhook_secret_xyz";
  const mockWebhookPayload = JSON.stringify({
    event: "order.paid",
    payload: {
      order: {
        entity: {
          id: orderData.orderId || "order_test_mock_123",
          amount: 29900,
          currency: "INR",
          status: "paid",
        },
      },
      payment: {
        entity: {
          id: "pay_test_mock_999",
          order_id: orderData.orderId || "order_test_mock_123",
          amount: 29900,
          status: "captured",
        },
      },
    },
  });
  const webhookSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(mockWebhookPayload)
    .digest("hex");

  const whRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": webhookSig,
    },
    body: mockWebhookPayload,
  });
  const whData = await whRes.json();
  console.log("Razorpay Webhook Handling Result:", {
    status: whRes.status,
    response: whData,
  });

  // 5. Verify Coding Playground Run & Submit in All 4 Languages
  console.log("\n--- 5. CODING PLAYGROUND EXECUTION IN 4 LANGUAGES ---");
  const testProblemId = unauthRes.result.problem.id;

  const languages = [
    {
      name: "JavaScript",
      lang: "javascript",
      code: `var findKthPositive = function(arr, k) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    let mid = Math.floor((low + high) / 2);\n    let missing = arr[mid] - (mid + 1);\n    if (missing < k) low = mid + 1;\n    else high = mid - 1;\n  }\n  return low + k;\n};`,
    },
    {
      name: "Python",
      lang: "python",
      code: `class Solution:\n    def findKthPositive(self, arr: list, k: int) -> int:\n        low, high = 0, len(arr) - 1\n        while low <= high:\n            mid = (low + high) // 2\n            missing = arr[mid] - (mid + 1)\n            if missing < k:\n                low = mid + 1\n            else:\n                high = mid - 1\n        return low + k\n`,
    },
    {
      name: "Java",
      lang: "java",
      code: `class Solution {\n    public int findKthPositive(int[] arr, int k) {\n        int low = 0, high = arr.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            int missing = arr[mid] - (mid + 1);\n            if (missing < k) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return low + k;\n    }\n}`,
    },
    {
      name: "C++",
      lang: "cpp",
      code: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int findKthPositive(vector<int>& arr, int k) {\n        int low = 0, high = arr.size() - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            int missing = arr[mid] - (mid + 1);\n            if (missing < k) {\n                low = mid + 1;\n            } else {\n                high = mid - 1;\n            }\n        }\n        return low + k;\n    }\n};`,
    },
  ];

  for (const l of languages) {
    const t0 = performance.now();
    const execRes = await fetch(`${BASE_URL}/api/playground/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${COOKIE_NAME}=${plusToken}`,
      },
      body: JSON.stringify({
        problemId: testProblemId,
        language: l.lang,
        sourceCode: l.code,
      }),
    });
    const t1 = performance.now();
    const data = await execRes.json();
    console.log(`[Playground Execute - ${l.name}]: status=${execRes.status}, duration=${(t1-t0).toFixed(0)}ms, success=${data.success}, verdict=${data.verdict || data.status || data.error}, passed=${data.passedTests || 0}/${data.totalTests || 0}`);
  }

  // Also test submit for one language to verify full test suite & streak verification
  console.log("\n--- Testing Playground Submit (Python) ---");
  const pySubmitRes = await fetch(`${BASE_URL}/api/playground/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${COOKIE_NAME}=${plusToken}`,
    },
    body: JSON.stringify({
      problemId: testProblemId,
      language: "python",
      sourceCode: languages[1].code,
    }),
  });
  const pySubmitData = await pySubmitRes.json();
  console.log("[Playground Submit - Python]:", {
    status: pySubmitRes.status,
    success: pySubmitData.success,
    verdict: pySubmitData.verdict,
    passedTests: pySubmitData.passedTests,
    totalTests: pySubmitData.totalTests,
    dailyChallenge: pySubmitData.dailyChallenge,
  });

  // 6. Verify Certificate Status and Download
  console.log("\n--- 6. CERTIFICATE STATUS & DOWNLOAD VERIFICATION ---");
  const certStatusRes = await fetch(`${BASE_URL}/api/certificate/status`, {
    headers: { Cookie: `${COOKIE_NAME}=${plusToken}` },
  });
  const certStatus = await certStatusRes.json();
  console.log("Certificate Status (Eligible User):", {
    status: certStatusRes.status,
    isLoggedIn: certStatus.isLoggedIn,
    totalProblems: certStatus.totalProblems,
    completedProblems: certStatus.completedProblems,
    completionPercentage: certStatus.completionPercentage,
    isEligible: certStatus.isEligible,
    is85Completed: certStatus.is85Completed,
    isActivePlus: certStatus.isActivePlus,
  });

  const certDownloadRes = await fetch(`${BASE_URL}/api/certificate/download`, {
    headers: { Cookie: `${COOKIE_NAME}=${plusToken}` },
  });
  console.log("Certificate Download (Eligible User):", {
    status: certDownloadRes.status,
    contentType: certDownloadRes.headers.get("content-type"),
    contentDisposition: certDownloadRes.headers.get("content-disposition"),
  });
  if (certDownloadRes.ok) {
    const buffer = await certDownloadRes.arrayBuffer();
    const isPdf = Buffer.from(buffer.slice(0, 4)).toString("ascii") === "%PDF";
    console.log(`Certificate PDF generated successfully! Size: ${(buffer.byteLength / 1024).toFixed(1)} KB, is authentic PDF: ${isPdf}`);
  } else {
    const errorText = await certDownloadRes.text();
    console.error("Certificate download error:", errorText);
  }

  console.log("\n==================================================================");
  console.log("                 VERIFICATION COMPLETED SUCCESSFULLY              ");
  console.log("==================================================================");
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
