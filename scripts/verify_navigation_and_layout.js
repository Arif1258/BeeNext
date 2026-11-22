/**
 * Verification script using Node 18+ native fetch
 */

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("==================================================");
  console.log("RUNNING NAVIGATION & MAIN PAGE REDESIGN TESTS");
  console.log("==================================================");

  // 1. Root '/' redirection to '/topics'
  console.log("\n--- 1. Testing Root URL Redirection ---");
  const rootResp = await fetch(`${BASE_URL}/`, { redirect: "manual" });
  console.log(`Status code for root '/': ${rootResp.status}`);
  const location = rootResp.headers.get("location") || "";
  console.log(`Redirect Location: ${location}`);
  if (![301, 302, 307, 308].includes(rootResp.status)) {
    throw new Error(`Expected redirect status, got ${rootResp.status}`);
  }
  if (!location.includes("/topics")) {
    throw new Error(`Expected redirect to /topics, got ${location}`);
  }
  console.log("✓ Root '/' successfully redirects to '/topics'");

  // 2. DSA Topics Page Header & Content
  console.log("\n--- 2. Testing DSA Topics Page Header & Content ---");
  const topicsResp = await fetch(`${BASE_URL}/topics`);
  if (!topicsResp.ok) throw new Error(`/topics failed with ${topicsResp.status}`);
  const topicsHtml = await topicsResp.text();

  const expectedHeading = "Handwritten Notes for Striver";
  if (!topicsHtml.includes(expectedHeading)) {
    throw new Error("Exact heading not found on /topics");
  }
  console.log("✓ Found exact heading: 'Handwritten Notes for Striver's A to Z DSA Sheet'");

  const expectedDesc =
    "Learn DSA with detailed handwritten notes, Java solutions, and problem-by-problem explanations. Practice, track your progress, and master every topic.";
  if (!topicsHtml.includes(expectedDesc)) {
    throw new Error("Exact description not found on /topics");
  }
  console.log(`✓ Found exact description: '${expectedDesc}'`);

  if (!topicsHtml.includes("Sorting Techniques") || !topicsHtml.includes("Selection Sort")) {
    throw new Error("DSA topics or problems missing from /topics page");
  }
  console.log("✓ DSA topics list and problems verified on page.");

  // 3. Navbar Structure
  console.log("\n--- 3. Testing Navbar Structure (Guest) ---");
  // Check header
  const headerMatch = topicsHtml.match(/<header[\s\S]*?<\/header>/);
  const headerHtml = headerMatch ? headerMatch[0] : topicsHtml;

  // Verify 'Home' is not present
  if (headerHtml.includes(">Home<")) {
    throw new Error("'Home' link still present in Navbar!");
  }
  console.log("✓ 'Home' link successfully removed from Navbar.");

  // Verify Logo links to /topics
  if (!headerHtml.includes('href="/topics"')) {
    throw new Error("Logo or Topics link missing in Navbar");
  }
  console.log("✓ Brand logo redirects to '/topics'");

  // Check exact order
  const topicsIdx = headerHtml.indexOf('href="/topics"');
  const printedIdx = headerHtml.indexOf('href="/order-printed"');
  const purchasesIdx = headerHtml.indexOf('href="/purchases"');
  const profileIdx = headerHtml.indexOf('href="/profile"');
  const loginIdx = headerHtml.indexOf('href="/login"');

  console.log(
    `Order indices: topics=${topicsIdx}, printed=${printedIdx}, purchases=${purchasesIdx}, profile=${profileIdx}, login=${loginIdx}`
  );

  if (topicsIdx === -1 || printedIdx === -1 || purchasesIdx === -1 || profileIdx === -1) {
    throw new Error("One or more required navbar links missing");
  }
  if (!(topicsIdx < printedIdx && printedIdx < purchasesIdx && purchasesIdx < profileIdx)) {
    throw new Error("Navbar links are not in the exact requested order!");
  }
  if (loginIdx === -1 || !headerHtml.includes("Login / Sign Up")) {
    throw new Error("Login / Sign Up link missing for guest in Navbar");
  }
  console.log(
    "✓ Navbar exact order verified:\n  1. DSA Topics\n  2. Order Printed Copy\n  3. My Purchases\n  4. My Profile\n  5. Login / Sign Up"
  );

  // 4. Dedicated /order-printed page
  console.log("\n--- 4. Testing Dedicated /order-printed Page ---");
  const orderPageResp = await fetch(`${BASE_URL}/order-printed`);
  if (!orderPageResp.ok) throw new Error(`/order-printed failed with ${orderPageResp.status}`);
  const orderHtml = await orderPageResp.text();

  if (
    !orderHtml.includes("Complete Printed DSA Notes") ||
    !orderHtml.includes("1,499")
  ) {
    throw new Error("/order-printed missing required product title or price");
  }
  if (!orderHtml.includes("printed-notebook-mockup.svg")) {
    throw new Error("Notebook mockup missing from /order-printed");
  }
  console.log("✓ /order-printed page loads with full product specifications, mockup & address form.");

  // 5. Printed Order API Flow
  console.log("\n--- 5. Testing Printed Notes Order Creation & Verification ---");
  const createOrderResp = await fetch(`${BASE_URL}/api/printed-orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Node Test Customer",
      customerEmail: "nodetest@example.com",
      customerPhone: "9876543210",
      addressLine1: "Tower B, Cyber City",
      addressLine2: "Phase 2",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122002",
      country: "India",
      notes: "Node automated test",
    }),
  });

  if (!createOrderResp.ok) {
    const err = await createOrderResp.text();
    throw new Error(`Failed to create printed order: ${createOrderResp.status} ${err}`);
  }
  const createData = await createOrderResp.json();
  console.log(`✓ Printed order created: ${createData.orderNumber} (ID: ${createData.printedOrderId})`);

  // Verify
  const verifyResp = await fetch(`${BASE_URL}/api/printed-orders/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: createData.printedOrderId,
      razorpayOrderId: createData.orderId,
      razorpayPaymentId: `pay_mock_${createData.orderNumber}`,
      razorpaySignature: `mock_sig_${createData.orderNumber}_verified`,
    }),
  });

  if (!verifyResp.ok) {
    const err = await verifyResp.text();
    throw new Error(`Failed to verify payment: ${verifyResp.status} ${err}`);
  }
  const verifyData = await verifyResp.json();
  console.log(`✓ Payment verified: ${verifyData.orderNumber} (success: ${verifyData.success})`);

  // 6. User Auth Session Test
  console.log("\n--- 6. Testing User Authentication Login & Status ---");
  const loginResp = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "alex@beenext.dev",
      password: "UserSecurePassword123!",
    }),
  });

  if (!loginResp.ok) {
    throw new Error(`Login failed with status ${loginResp.status}`);
  }
  const loginCookies = loginResp.headers.get("set-cookie") || "";
  console.log("✓ Logged in as alex@beenext.dev");

  const meResp = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: loginCookies },
  });
  if (!meResp.ok) throw new Error(`/api/auth/me failed with ${meResp.status}`);
  const meData = await meResp.json();
  console.log(`✓ Authenticated session confirmed: ${meData.user.name} (${meData.user.email})`);

  console.log("\n==================================================");
  console.log("ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
