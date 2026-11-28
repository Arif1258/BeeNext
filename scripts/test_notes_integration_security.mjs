import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";
const BASE_URL = "http://localhost:3000";

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name || "Test User",
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const USERS = {
  normal: {
    id: "cmwx7xmek0000j5h4av78bshd",
    name: "Normal User",
    email: "razorpay@gmail.com",
    role: "USER",
  },
  secondNormal: {
    id: "cmwx8kdy70000igos5d40jz76",
    name: "Second Normal User",
    email: "skasifahmed78@gmail.com",
    role: "USER",
  },
  activePlus: {
    id: "cmwp4hkkq0001zsg4p4jmhn3e",
    name: "Active Plus User",
    email: "arifahmedma490@gmail.com",
    role: "USER",
  },
  admin: {
    id: "cmwp4hkkm0000zsg4bkv3woni",
    name: "Admin User",
    email: "supportbeenext@gmail.com",
    role: "ADMIN",
  },
};

const TEST_FILES = [
  // S1
  "Sorting_Algorithms.pdf",
  // S2
  "DBMS.pdf",
  "Operating_Systems.pdf",
  "Computer_Networks.pdf",
  "OOPS.pdf",
  // S3
  "C_Programming.pdf",
  "C++_Programming.pdf",
  "Java_Programming.pdf",
  "Python_Programming.pdf",
  // S4
  "HTML.pdf",
  "CSS.pdf",
  "JavaScript.pdf",
  "React.pdf",
  // S5
  "Node_js.pdf",
  "Express_js.pdf",
  "Spring_Boot.pdf",
  // S6
  "MySQL.pdf",
  "MongoDB.pdf",
  // S7
  "Docker.pdf",
  "Kubernetes.pdf",
  // S8
  "Git_and_GitHub.pdf",
];

async function runTests() {
  console.log("=================================================");
  console.log("BEENEXT NOTES STREAMING & ACCESS SECURITY SUITE");
  console.log("=================================================\n");

  let passedAll = true;

  // 1. Logged-out Visitor Test
  console.log("1. Testing Logged-out Visitor Access...");
  try {
    const res = await fetch(`${BASE_URL}/api/notes/stream?file=DBMS.pdf`);
    const status = res.status;
    const body = await res.json();
    if (status === 401) {
      console.log("  ✓ PASS: Logged-out visitor received HTTP 401 Unauthorized.");
    } else {
      console.error(`  ❌ FAIL: Expected 401, got ${status}:`, body);
      passedAll = false;
    }
  } catch (err) {
    console.error("  ❌ Request failed:", err);
    passedAll = false;
  }

  // 2. Normal User Test
  console.log("\n2. Testing Normal User Access (razorpay@gmail.com)...");
  try {
    const token = createToken(USERS.normal);
    const res = await fetch(`${BASE_URL}/api/notes/stream?file=DBMS.pdf`, {
      headers: { Cookie: `beenext_token=${token}` },
    });
    const status = res.status;
    const body = await res.json();
    if (status === 403 && body.code === "PLUS_REQUIRED") {
      console.log("  ✓ PASS: Normal user received HTTP 403 Forbidden (PLUS_REQUIRED).");
    } else {
      console.error(`  ❌ FAIL: Expected 403 PLUS_REQUIRED, got ${status}:`, body);
      passedAll = false;
    }
  } catch (err) {
    console.error("  ❌ Request failed:", err);
    passedAll = false;
  }

  // 3. Second Normal User Test
  console.log("\n3. Testing Second Normal User Access (skasifahmed78@gmail.com)...");
  try {
    const token = createToken(USERS.secondNormal);
    const res = await fetch(`${BASE_URL}/api/notes/stream?file=DBMS.pdf`, {
      headers: { Cookie: `beenext_token=${token}` },
    });
    const status = res.status;
    const body = await res.json();
    if (status === 403 && body.code === "PLUS_REQUIRED") {
      console.log("  ✓ PASS: Normal user received HTTP 403 Forbidden (PLUS_REQUIRED).");
    } else {
      console.error(`  ❌ FAIL: Expected 403 PLUS_REQUIRED, got ${status}:`, body);
      passedAll = false;
    }
  } catch (err) {
    console.error("  ❌ Request failed:", err);
    passedAll = false;
  }

  // 4. Admin User Test
  console.log("\n4. Testing Administrator Access (supportbeenext@gmail.com)...");
  try {
    const token = createToken(USERS.admin);
    const res = await fetch(`${BASE_URL}/api/notes/stream?file=Docker.pdf`, {
      headers: { Cookie: `beenext_token=${token}` },
    });
    const status = res.status;
    const contentType = res.headers.get("content-type");
    if (status === 200 && contentType?.includes("application/pdf")) {
      const buffer = await res.arrayBuffer();
      console.log(`  ✓ PASS: Admin received HTTP 200 OK (${Math.round(buffer.byteLength / 1024)} KB streamed).`);
    } else {
      console.error(`  ❌ FAIL: Expected 200 application/pdf, got ${status}`);
      passedAll = false;
    }
  } catch (err) {
    console.error("  ❌ Request failed:", err);
    passedAll = false;
  }

  // 5. Active Plus User Tests Across ALL 21 PDFs
  console.log("\n5. Testing Active Plus User Access Across All 21 Mapped PDFs...");
  const activePlusToken = createToken(USERS.activePlus);
  for (const fileName of TEST_FILES) {
    try {
      const res = await fetch(`${BASE_URL}/api/notes/stream?file=${encodeURIComponent(fileName)}`, {
        headers: { Cookie: `beenext_token=${activePlusToken}` },
      });
      const status = res.status;
      const contentType = res.headers.get("content-type");
      const cacheControl = res.headers.get("cache-control");
      const nosniff = res.headers.get("x-content-type-options");

      if (status === 200 && contentType?.includes("application/pdf")) {
        const buffer = await res.arrayBuffer();
        console.log(`  ✓ [200 OK] ${fileName.padEnd(28)} Size: ${Math.round(buffer.byteLength / 1024).toString().padStart(4)} KB | Cache: ${cacheControl} | nosniff: ${nosniff}`);
      } else {
        const errText = await res.text();
        console.error(`  ❌ FAIL: ${fileName} returned status ${status}:`, errText);
        passedAll = false;
      }
    } catch (err) {
      console.error(`  ❌ FAIL: ${fileName} request threw error:`, err);
      passedAll = false;
    }
  }

  // 6. Path Traversal & Unauthorized Resource Attacks
  console.log("\n6. Testing Path Traversal & Tampering Defenses...");
  const maliciousInputs = [
    "../../../../etc/passwd",
    "../../package.json",
    "../.env",
    "protected_notes/../../.env.local",
    "arbitrary_nonexistent.pdf",
    "unauthorized_secret.pdf",
  ];

  for (const input of maliciousInputs) {
    try {
      const res = await fetch(`${BASE_URL}/api/notes/stream?file=${encodeURIComponent(input)}`, {
        headers: { Cookie: `beenext_token=${activePlusToken}` },
      });
      const status = res.status;
      if (status === 404 || status === 400) {
        console.log(`  ✓ BLOCKED (${status}): Attempt with '${input}' safely rejected.`);
      } else {
        console.error(`  ❌ VULNERABILITY: Attack payload '${input}' returned unexpected status ${status}!`);
        passedAll = false;
      }
    } catch (err) {
      console.error(`  ❌ Request error on '${input}':`, err);
      passedAll = false;
    }
  }

  console.log("\n=================================================");
  if (passedAll) {
    console.log("✓ ALL ACCESS CONTROL, STREAMING & SECURITY TESTS PASSED!");
  } else {
    console.error("❌ ONE OR MORE SECURITY TESTS FAILED!");
    process.exit(1);
  }
}

runTests();
