import jwt from "jsonwebtoken";
import fs from "fs";

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

// Plus user token
const plusToken = jwt.sign(
  { id: "cmwp4hkkq0001zsg4p4jmhn3e", email: "arifahmedma490@gmail.com", role: "USER" },
  JWT_SECRET,
  { expiresIn: "1d" }
);

const problemId = "cmwolljv700fho76vu5t0fo3n"; // kth-missing-positive-number

const testSubmissions = [
  {
    language: "javascript",
    code: `var findKthPositive = function(arr, k) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let missing = arr[mid] - (mid + 1);
        if (missing < k) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return low + k;
};`,
  },
  {
    language: "java",
    code: `class Solution {
    public int findKthPositive(int[] arr, int k) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int missing = arr[mid] - (mid + 1);
            if (missing < k) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return low + k;
    }
}`,
  },
  {
    language: "cpp",
    code: `#include <vector>
using namespace std;

class Solution {
public:
    int findKthPositive(vector<int>& arr, int k) {
        int low = 0, high = arr.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int missing = arr[mid] - (mid + 1);
            if (missing < k) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return low + k;
    }
};`,
  },
];

async function run() {
  console.log("=== VERIFYING SUBMIT IN JAVASCRIPT, JAVA, C++ ===");
  for (const s of testSubmissions) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/playground/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${COOKIE_NAME}=${plusToken}`,
      },
      body: JSON.stringify({
        problemId,
        language: s.language,
        sourceCode: s.code,
      }),
    });
    const t1 = performance.now();
    const json = await res.json();
    console.log(`[Submit - ${s.language.toUpperCase()}]: HTTP ${res.status}, duration=${(t1-t0).toFixed(0)}ms`);
    console.log(`  Verdict: ${json.verdict}, Passed: ${json.passedTests}/${json.totalTests}, Success: ${json.success}`);
    if (!json.success || json.passedTests < 6) {
      console.error("  FAILED output:", json.errorOutput, json.testResults);
      process.exit(1);
    }
  }
  console.log("=== ALL LANGUAGES SUBMIT VERIFIED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
