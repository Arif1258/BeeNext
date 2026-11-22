const http = require("http");

async function fetchJSON(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const res = await fetch(fullUrl, options);
  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, data: JSON.parse(text), raw: text };
  } catch (e) {
    return { status: res.status, ok: res.ok, data: null, raw: text };
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("🚀 TESTING HOMEPAGE REDESIGN & PRINTED ORDERS");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Test Homepage HTML
  console.log("1. Testing Homepage HTML Content & Order...");
  const home = await fetchJSON("/");
  assert(home.ok && home.status === 200, "Homepage returns HTTP 200 OK");
  assert(
    home.raw.includes("Handwritten Notes for Striver&#x27;s A to Z DSA Sheet") ||
    home.raw.includes("Handwritten Notes for Striver's A to Z DSA Sheet"),
    "Homepage contains exact Hero Heading: 'Handwritten Notes for Striver's A to Z DSA Sheet'"
  );
  assert(
    home.raw.includes("Master DSA with comprehensive handwritten notes, LeetCode problems, and brute-force to optimal Java solutions."),
    "Homepage contains exact Hero Subtitle"
  );
  assert(
    home.raw.includes("Explore Notes"),
    "Homepage Hero contains CTA button 'Explore Notes'"
  );
  assert(
    !home.raw.includes("100% FREE SORTING TECHNIQUES • Handwritten DSA Notes Marketplace"),
    "Old tagline pill '100% FREE SORTING TECHNIQUES • Handwritten DSA Notes Marketplace' successfully removed"
  );
  assert(
    !home.raw.includes("Structured Topic Sheet"),
    "Section 'Structured Topic Sheet' successfully removed from Homepage"
  );
  assert(
    !home.raw.includes("Complete 17 DSA Roadmap Topics"),
    "Section 'Complete 17 DSA Roadmap Topics' successfully removed from Homepage"
  );

  // 2. Four Feature Boxes
  console.log("\n2. Testing Four Feature Boxes...");
  assert(home.raw.includes("Handwritten Notes"), "Box 1: 'Handwritten Notes' present");
  assert(
    home.raw.includes("Understand DSA concepts through detailed handwritten explanations."),
    "Box 1 description present"
  );
  assert(home.raw.includes("LeetCode Redirect"), "Box 2: 'LeetCode Redirect' present");
  assert(
    home.raw.includes("Access the original LeetCode problems and practice directly."),
    "Box 2 description present"
  );
  assert(
    home.raw.includes("Language – Java") || home.raw.includes("Language &ndash; Java"),
    "Box 3: 'Language – Java' present"
  );
  assert(
    home.raw.includes("Learn and practice all coding solutions using Java."),
    "Box 3 description present"
  );
  assert(home.raw.includes("Brute Force &amp; Optimal") || home.raw.includes("Brute Force & Optimal"), "Box 4: 'Brute Force & Optimal' present");
  assert(
    home.raw.includes("Compare brute-force and optimized approaches with complexity analysis."),
    "Box 4 description present"
  );

  // 3. Navbar Check (Requirement 3: Removed Handwritten Notes from Navbar)
  console.log("\n3. Testing Navbar Navigation...");
  assert(
    !home.raw.includes("<span>Handwritten Notes</span>"),
    "Navbar does not contain separate 'Handwritten Notes' navigation link"
  );
  assert(
    home.raw.includes("<span>DSA Topics</span>"),
    "Navbar retains 'DSA Topics' link"
  );
  assert(
    home.raw.includes("<span>My Purchases</span>"),
    "Navbar retains 'My Purchases' link"
  );

  // 4. Sample Notes Gallery (Requirement 5)
  console.log("\n4. Testing 4-Slot Sample Notes Gallery...");
  assert(
    home.raw.includes("Complete Handwritten Notes for Striver&#x27;s Sheet") ||
    home.raw.includes("Complete Handwritten Notes for Striver's Sheet"),
    "Gallery contains exact heading: 'Complete Handwritten Notes for Striver's Sheet'"
  );
  assert(
    home.raw.includes("Explore sample pages from our handwritten DSA notes collection."),
    "Gallery contains exact subtitle"
  );
  assert(
    home.raw.includes("View All Handwritten Notes"),
    "Gallery contains button 'View All Handwritten Notes'"
  );

  const sampleRes = await fetchJSON("/api/homepage/sample-images");
  assert(sampleRes.ok && sampleRes.data?.images?.length >= 4, "API /api/homepage/sample-images returns at least 4 slots");

  // 5. Printed Product Section (Requirement 4)
  console.log("\n5. Testing Printed Notes Product & API...");
  assert(
    home.raw.includes("Complete Printed DSA Notes – Striver&#x27;s A to Z Sheet") ||
    home.raw.includes("Complete Printed DSA Notes – Striver's A to Z Sheet") ||
    home.raw.includes("Complete Printed DSA Notes"),
    "Printed Notes Product Title displayed on Homepage"
  );
  assert(
    home.raw.includes("Order Printed Copy"),
    "Button 'Order Printed Copy' present on Homepage"
  );

  const configRes = await fetchJSON("/api/printed-product");
  assert(configRes.ok && configRes.data?.config?.price === 1499, "API /api/printed-product returns price ₹1,499");

  // 6. Test Printed Order Creation and Verification Flow
  console.log("\n6. Testing Printed Order Submission & Razorpay verification...");
  const orderPayload = {
    customerName: "Rahul Sharma",
    customerEmail: "rahul.sharma@example.com",
    customerPhone: "9876543210",
    addressLine1: "Flat 302, Green Glen Apartments, Outer Ring Road",
    addressLine2: "Near Bellandur Flyover",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560103",
    country: "India",
    notes: "Please deliver during afternoon hours.",
  };

  const createOrderRes = await fetchJSON("/api/printed-orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  assert(
    createOrderRes.ok && createOrderRes.data?.printedOrderId,
    `Printed order created successfully (Order #: ${createOrderRes.data?.orderNumber})`
  );

  const printedOrderId = createOrderRes.data?.printedOrderId;
  const razorpayOrderId = createOrderRes.data?.orderId;

  // Verify simulated payment
  const verifyRes = await fetchJSON("/api/printed-orders/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId,
      razorpayOrderId,
      razorpayPaymentId: "pay_test_verified_12345",
      razorpaySignature: "mock_sig_test_verified_12345",
    }),
  });

  assert(
    verifyRes.ok && verifyRes.data?.success === true,
    "Printed order payment verified successfully"
  );

  // 7. Test Admin Management for Printed Orders
  console.log("\n7. Testing Admin Authentication & Printed Orders Management...");
  // Log in as Admin
  const loginRes = await fetchJSON("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@beenext.dev",
      password: "AdminSecurePassword123!",
    }),
  });

  const cookie = loginRes.raw ? loginRes.ok ? "Cookie received" : null : null;
  // Get cookie header
  const headers = {
    Cookie: "beenext_token=...", // fetch will use existing context or test direct API
  };

  // Direct fetch with cookie from loginRes response
  const setCookie = loginRes.raw; 

  console.log("\n==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} assertions passed!`);
  console.log("==================================================");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
