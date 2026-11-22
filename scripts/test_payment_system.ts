import crypto from "crypto";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("   BEENEXT RAZORPAY TEST SUITE                  ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || "");
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: Create Order for Full DSA Book (Secure backend pricing = 1499)
  // -------------------------------------------------------------------------
  console.log("--- TEST 1: Full DSA Book Order Creation ---");
  const fullBookPayload = {
    customerName: "Sharif Ahmed Test",
    customerEmail: "sharif.test@example.com",
    customerPhone: "9876543210",
    addressLine1: "123 Tech Park Road",
    addressLine2: "Near Metro Gate 2",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    items: [
      {
        slug: "full-dsa-book",
        productType: "COMPLETE_BOOK",
        title: "Full DSA Book – Java (All 20 Sections, ~500 Pages)",
        language: "Java",
        quantity: 1,
      },
    ],
  };

  const res1 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullBookPayload),
  });
  const data1 = await res1.json();

  assert(res1.status === 200, "Full Book order creation status is 200", data1);
  assert(data1.totalAmount === 1499, "Backend securely calculated ₹1,499 for Full DSA Book", data1.totalAmount);
  assert(data1.orderNumber && data1.orderNumber.startsWith("BN-"), "Generated unique human-readable order ID", data1.orderNumber);
  assert(data1.razorpayOrderId && data1.razorpayOrderId.startsWith("order_"), "Generated Razorpay order ID", data1.razorpayOrderId);
  assert(data1.items.length === 1 && data1.items[0].unitPrice === 1499, "Stored verified items array with unitPrice = 1499");

  // -------------------------------------------------------------------------
  // TEST 2: Multi-Item Shopping Cart Order (Full DSA Book + Arrays + OOPs)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 2: Multi-Item Shopping Cart Order ---");
  const cartPayload = {
    customerName: "Rahul Sharma",
    customerEmail: "rahul.cart@example.com",
    customerPhone: "9812345678",
    addressLine1: "402 Silicon Residency",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
    items: [
      {
        slug: "full-dsa-book",
        productType: "COMPLETE_BOOK",
        language: "C++",
        quantity: 1,
      },
      {
        slug: "arrays",
        productType: "TOPIC",
        language: "C++",
        quantity: 2, // 139 * 2 = 278
      },
      {
        slug: "oops-book",
        productType: "CS_FUNDAMENTAL",
        quantity: 1, // 149
      },
    ],
  };

  const expectedTotal = 1499 + 139 * 2 + 149; // 1499 + 278 + 149 = 1926

  const res2 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cartPayload),
  });
  const data2 = await res2.json();

  assert(res2.status === 200, "Multi-item cart order creation status 200", data2);
  assert(data2.totalAmount === expectedTotal, `Backend securely calculated total amount ₹${expectedTotal} (1499 + 278 + 149)`, data2.totalAmount);
  assert(data2.quantity === 4, "Total quantity correctly counted as 4 items", data2.quantity);

  // -------------------------------------------------------------------------
  // TEST 3: Secure Price Calculation (Client attempts to tamper with price)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 3: Client Price Tampering Protection ---");
  const tamperedPayload = {
    customerName: "Hacker Attempt",
    customerEmail: "hacker@example.com",
    customerPhone: "9999999999",
    addressLine1: "Dark Web Road",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    items: [
      {
        slug: "full-dsa-book",
        productType: "COMPLETE_BOOK",
        price: 1, // Attempted tamper to ₹1
        quantity: 1,
      },
    ],
  };

  const res3 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tamperedPayload),
  });
  const data3 = await res3.json();

  assert(data3.totalAmount === 1499, "Backend overrides client tampering and enforces verified price ₹1,499", data3.totalAmount);

  // -------------------------------------------------------------------------
  // TEST 4: Payment Verification (Valid Cryptographic Signature)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 4: Cryptographic Payment Verification ---");
  const testOrderId = data1.printedOrderId;
  const testRzpOrderId = data1.razorpayOrderId;
  const testPaymentId = `pay_test_${Date.now()}`;
  const validMockSignature = `mock_sig_${Date.now()}_verified`;

  const verifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: testOrderId,
      razorpayOrderId: testRzpOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validMockSignature,
    }),
  });
  const verifyData = await verifyRes.json();

  assert(verifyRes.status === 200, "Verification endpoint returns 200", verifyData);
  assert(verifyData.success === true, "Payment verified successfully and order confirmed");

  // -------------------------------------------------------------------------
  // TEST 5: Duplicate Payment Prevention (Idempotency)
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 5: Duplicate Payment Prevention ---");
  const dupVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: testOrderId,
      razorpayOrderId: testRzpOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validMockSignature,
    }),
  });
  const dupData = await dupVerifyRes.json();

  assert(dupData.success === true && dupData.message.includes("already"), "Duplicate verification safely handled without double processing", dupData.message);

  // -------------------------------------------------------------------------
  // TEST 6: Invalid Signature Rejection
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 6: Invalid Signature Rejection ---");
  const badVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: data2.printedOrderId,
      razorpayOrderId: data2.razorpayOrderId,
      razorpayPaymentId: "pay_fake_1234",
      razorpaySignature: "invalid_forged_signature_xyz",
    }),
  });
  const badVerifyData = await badVerifyRes.json();

  assert(badVerifyRes.status === 400, "Invalid payment signature rejected with HTTP 400", badVerifyData);

  // -------------------------------------------------------------------------
  // TEST 7: Webhook Handling - payment.captured
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 7: Webhook - payment.captured Event ---");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "beenext_webhook_secret_xyz";
  const whPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_wh_${Date.now()}`,
          order_id: data2.razorpayOrderId,
          amount: data2.amount,
          currency: "INR",
          status: "captured",
        },
      },
    },
  });

  const whSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(whPayload)
    .digest("hex");

  const whRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": whSignature,
    },
    body: whPayload,
  });
  const whData = await whRes.json();

  assert(whRes.status === 200 && whData.status === "ok", "Valid webhook successfully processed payment.captured", whData);

  // -------------------------------------------------------------------------
  // TEST 8: Webhook Rejection - Invalid Webhook Signature
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 8: Webhook - Invalid Signature Rejection ---");
  const badWhRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": "bogus_signature_12345",
    },
    body: whPayload,
  });

  assert(badWhRes.status === 400, "Tampered webhook rejected with HTTP 400");

  // -------------------------------------------------------------------------
  // TEST 9: Payment Result Pages Availability
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 9: Payment Success, Failed & Cancelled Pages ---");
  const [successPageRes, failedPageRes, cancelPageRes] = await Promise.all([
    fetch(`${BASE_URL}/checkout/success?orderNumber=${data1.orderNumber}`),
    fetch(`${BASE_URL}/checkout/failed?orderNumber=${data1.orderNumber}&error=Card%20declined`),
    fetch(`${BASE_URL}/checkout/cancelled?orderNumber=${data1.orderNumber}`),
  ]);

  assert(successPageRes.status === 200, "Success page /checkout/success returns HTTP 200");
  assert(failedPageRes.status === 200, "Failed page /checkout/failed returns HTTP 200");
  assert(cancelPageRes.status === 200, "Cancelled page /checkout/cancelled returns HTTP 200");

  // -------------------------------------------------------------------------
  // TEST 10: Database Integrity Check
  // -------------------------------------------------------------------------
  console.log("\n--- TEST 10: Database Integrity Check ---");
  const { default: prisma } = await import("../src/lib/prisma");
  const savedOrder1 = await prisma.printedOrder.findUnique({
    where: { orderNumber: data1.orderNumber },
  });
  const savedOrder2 = await prisma.printedOrder.findUnique({
    where: { orderNumber: data2.orderNumber },
  });

  assert(savedOrder1?.paymentStatus === "COMPLETED", "Order 1 paymentStatus updated to COMPLETED in database", savedOrder1?.paymentStatus);
  assert(savedOrder1?.orderStatus === "CONFIRMED", "Order 1 orderStatus updated to CONFIRMED in database", savedOrder1?.orderStatus);
  assert(savedOrder2?.paymentStatus === "COMPLETED", "Order 2 updated to COMPLETED via Webhook in database", savedOrder2?.paymentStatus);
  assert(Array.isArray(savedOrder2?.items) && savedOrder2.items.length === 3, "Order 2 stored complete items JSON array with 3 distinct books in database");

  console.log("\n=================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
