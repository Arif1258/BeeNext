import fs from "fs";
import jwt from "jsonwebtoken";

// Load .env
const envContent = fs.readFileSync(".env", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
});

const jwtSecret = env.JWT_SECRET;
const cookieName = env.SESSION_COOKIE_NAME || "beenext_token";
const baseUrl = "http://localhost:3000";

// Tokens
const plusToken = jwt.sign(
  { id: "cmwp4hkkq0001zsg4p4jmhn3e", email: "arifahmedma490@gmail.com", role: "USER" },
  jwtSecret,
  { expiresIn: "7d" }
);

const adminToken = jwt.sign(
  { id: "cmwp4hkkm0000zsg4bkv3woni", email: "supportbeenext@gmail.com", role: "ADMIN" },
  jwtSecret,
  { expiresIn: "7d" }
);

const normalToken = jwt.sign(
  { id: "cmwthrssz000076t3xx4yaean", email: "skasif@test.com", role: "USER" },
  jwtSecret,
  { expiresIn: "7d" }
);

const expiredToken = jwt.sign(
  { id: "cmwuif5zg0000q7ki21s6syfa", email: "expired_plus_test@test.com", role: "USER" },
  jwtSecret,
  { expiresIn: "7d" }
);

// All 21 mapped PDF notes required by the notes library
const MAPPED_21_NOTES = [
  "Sorting_Algorithms.pdf",
  "DBMS.pdf",
  "Operating_Systems.pdf",
  "Computer_Networks.pdf",
  "OOPS.pdf",
  "C_Programming.pdf",
  "C++_Programming.pdf",
  "Java_Programming.pdf",
  "Python_Programming.pdf",
  "HTML.pdf",
  "CSS.pdf",
  "JavaScript.pdf",
  "React.pdf",
  "Node_js.pdf",
  "Express_js.pdf",
  "Spring_Boot.pdf",
  "MySQL.pdf",
  "MongoDB.pdf",
  "Docker.pdf",
  "Kubernetes.pdf",
  "Git_and_GitHub.pdf",
];

async function runSuite() {
  console.log("=================================================");
  console.log("   BEENEXT NOTES API: INTEGRATION & SECURITY SUITE");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(title, condition, extra = "") {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${title} ${extra}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${title} ${extra}`);
    }
  }

  // TEST 1: Unauthenticated access
  console.log("--- 1. AUTHENTICATION GATES ---");
  const res1 = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`);
  const body1 = await res1.json();
  assert("Unauthenticated request blocked", res1.status === 401 && body1.error?.includes("Authentication required"));

  // TEST 2: Normal user (no plus)
  const res2 = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`, {
    headers: { Cookie: `${cookieName}=${normalToken}` },
  });
  const body2 = await res2.json();
  assert("Normal user (no plus) blocked", res2.status === 403 && body2.code === "PLUS_REQUIRED");

  // TEST 3: Expired Plus user
  const res3 = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`, {
    headers: { Cookie: `${cookieName}=${expiredToken}` },
  });
  const body3 = await res3.json();
  assert("Expired Plus user blocked", res3.status === 403 && body3.code === "PLUS_REQUIRED");

  // TEST 4: Active Plus user
  const res4 = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`, {
    headers: { Cookie: `${cookieName}=${plusToken}` },
  });
  const len4 = res4.headers.get("content-length");
  const type4 = res4.headers.get("content-type");
  const buf4 = await res4.arrayBuffer();
  assert(
    "Active Plus user authorized",
    res4.status === 200 && type4 === "application/pdf" && buf4.byteLength > 1000000,
    `(${buf4.byteLength} bytes received)`
  );

  // TEST 5: Admin user
  const res5 = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`, {
    headers: { Cookie: `${cookieName}=${adminToken}` },
  });
  const buf5 = await res5.arrayBuffer();
  assert(
    "Admin user authorized",
    res5.status === 200 && buf5.byteLength > 1000000,
    `(${buf5.byteLength} bytes received)`
  );

  // TEST 6: All 21 Mapped PDFs streaming
  console.log("\n--- 2. ALL 21 MAPPED PDFS FROM R2 ---");
  for (let i = 0; i < MAPPED_21_NOTES.length; i++) {
    const filename = MAPPED_21_NOTES[i];
    const res = await fetch(`${baseUrl}/api/notes/stream?file=${filename}`, {
      headers: { Cookie: `${cookieName}=${plusToken}` },
    });
    const cType = res.headers.get("content-type");
    const cCache = res.headers.get("cache-control");
    const ab = await res.arrayBuffer();

    const ok = res.status === 200 && cType === "application/pdf" && ab.byteLength > 100000;
    assert(
      `[${i + 1}/21] Stream "${filename}"`,
      ok,
      `size: ${(ab.byteLength / 1024 / 1024).toFixed(2)} MB, cache: ${cCache}`
    );
  }

  // TEST 7: Range Requests (206 Partial Content)
  console.log("\n--- 3. HTTP RANGE REQUESTS (PDF.js CHUNK STREAMING) ---");
  const rangeHeader = "bytes=0-1023";
  const resRange = await fetch(`${baseUrl}/api/notes/stream?file=DBMS.pdf`, {
    headers: {
      Cookie: `${cookieName}=${plusToken}`,
      Range: rangeHeader,
    },
  });
  const rangeStatus = resRange.status;
  const contentRange = resRange.headers.get("content-range");
  const rangeLength = resRange.headers.get("content-length");
  const rangeBuf = await resRange.arrayBuffer();

  assert(
    "Range request HTTP 206 Partial Content",
    rangeStatus === 206 && contentRange?.startsWith("bytes 0-1023/") && rangeBuf.byteLength === 1024,
    `status: ${rangeStatus}, Content-Range: ${contentRange}, Content-Length: ${rangeLength}, bytes: ${rangeBuf.byteLength}`
  );

  // Mid-document range request
  const rangeHeader2 = "bytes=10000-20239";
  const resRange2 = await fetch(`${baseUrl}/api/notes/stream?file=Sorting_Algorithms.pdf`, {
    headers: {
      Cookie: `${cookieName}=${plusToken}`,
      Range: rangeHeader2,
    },
  });
  const rangeBuf2 = await resRange2.arrayBuffer();
  assert(
    "Mid-file Range request (10240 bytes)",
    resRange2.status === 206 && rangeBuf2.byteLength === 10240,
    `status: ${resRange2.status}, Content-Range: ${resRange2.headers.get("content-range")}`
  );

  // TEST 8: Security, Path Traversal & Arbitrary Files
  console.log("\n--- 4. SECURITY & TRAVERSAL REJECTION ---");
  const maliciousAttempts = [
    { name: "Path traversal /etc/passwd", param: "../../../../etc/passwd" },
    { name: "Local .env traversal", param: "../.env" },
    { name: "Local package.json traversal", param: "../package.json" },
    { name: "Arbitrary unknown file", param: "secret_admin_passwords.txt" },
    { name: "Empty file parameter", param: "" },
    { name: "Non-allowlisted PDF", param: "fake_malicious.pdf" },
  ];

  for (const att of maliciousAttempts) {
    const resAtt = await fetch(`${baseUrl}/api/notes/stream?file=${encodeURIComponent(att.param)}`, {
      headers: { Cookie: `${cookieName}=${plusToken}` },
    });
    const isBlocked = resAtt.status === 400 || resAtt.status === 404;
    assert(`Blocked ${att.name}`, isBlocked, `(status: ${resAtt.status})`);
  }

  console.log("\n=================================================");
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`PASSED:      ${passedTests}`);
  console.log(`FAILED:      ${totalTests - passedTests}`);
  console.log("=================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test suite runtime failure:", err);
  process.exit(1);
});
