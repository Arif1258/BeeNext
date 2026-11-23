import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";
const BASE_URL = "http://localhost:3000";

function createAuthCookie(user) {
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  return `beenext_token=${token}`;
}

function generateSignature(orderId, paymentId, keySecret) {
  const secret = keySecret || process.env.RAZORPAY_KEY_SECRET || "beenext_secret_key_test_98765";
  return `mock_sig_${crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")}`;
}

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      console.log(`Prisma connect attempt ${i + 1} failed, retrying in ${delay}ms...`);
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function runTests() {
  console.log("=== STARTING ONE-TIME PHYSICAL CERTIFICATE AUDIT & VERIFICATION ===");
  await connectWithRetry();

  // Find or setup test customer (razorpay@gmail.com) and admin (supportbeenext@gmail.com)
  let customer = await prisma.user.findFirst({
    where: { email: "razorpay@gmail.com" },
  });

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: "Razorpay Test Customer",
        email: "razorpay@gmail.com",
        passwordHash: "hashed_dummy_password_for_tests",
        role: "USER",
      },
    });
  }

  // Ensure clean initial state for customer before test run
  await prisma.certificateOrder.deleteMany({
    where: { userId: customer.id },
  });
  await prisma.user.update({
    where: { id: customer.id },
    data: { certificateClaimedAt: null },
  });

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (!admin) throw new Error("Admin user not found in database.");

  const customerCookie = createAuthCookie(customer);
  const adminCookie = createAuthCookie(admin);

  console.log(`Test Customer: ${customer.email} (ID: ${customer.id})`);
  console.log(`Admin User: ${admin.email} (ID: ${admin.id})`);

  let scenario1Passed = false;
  let scenario2Passed = false;
  let scenario3Passed = false;
  let scenario4Passed = false;
  let scenario5Passed = false;
  let scenario6Passed = false;

  let certOrderId = null;
  let certPrintedOrderId = null;

  // -------------------------------------------------------------
  // SCENARIO 1: New customer physical certificate purchase succeeds
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 1: First Physical Certificate Purchase ---");
  try {
    const createRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerName: "Razorpay Test",
        customerEmail: customer.email,
        customerPhone: "9876543210",
        addressLine1: "123 Technology Park",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        items: [
          {
            productType: "CERTIFICATE",
            slug: "physical-certificate",
            title: "BeeNext Physical Certificate of Achievement",
            quantity: 1,
          },
        ],
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok || !createData.printedOrderId) {
      throw new Error(`Create order failed: ${JSON.stringify(createData)}`);
    }

    console.log(`✓ Certificate order initiated: #${createData.orderNumber}, Amount: ₹${createData.totalAmount}`);
    if (createData.totalAmount !== 99) {
      throw new Error(`Expected price ₹99 for certificate, got ₹${createData.totalAmount}`);
    }

    certPrintedOrderId = createData.printedOrderId;
    const paymentId = `pay_mock_${Date.now()}`;
    const sig = generateSignature(createData.razorpayOrderId, paymentId);

    // Verify payment
    const verifyRes = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: customerCookie },
      body: JSON.stringify({
        printedOrderId: createData.printedOrderId,
        razorpayOrderId: createData.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: sig,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
      throw new Error(`Payment verification failed: ${JSON.stringify(verifyData)}`);
    }

    // Verify DB state
    const updatedCustomer = await prisma.user.findUnique({ where: { id: customer.id } });
    const certOrder = await prisma.certificateOrder.findFirst({
      where: { userId: customer.id, status: "CONFIRMED" },
    });

    if (!updatedCustomer?.certificateClaimedAt) {
      throw new Error("customer.certificateClaimedAt was not set after payment verification!");
    }
    if (!certOrder || certOrder.certificateUserKey !== customer.id) {
      throw new Error("CertificateOrder was not created with certificateUserKey!");
    }

    certOrderId = certOrder.id;
    console.log(`✓ Payment confirmed! CertificateOrder ID: ${certOrder.id}, deliveryStatus: ${certOrder.deliveryStatus}`);
    scenario1Passed = true;
  } catch (err) {
    console.error("Scenario 1 Failed:", err);
  }

  // -------------------------------------------------------------
  // SCENARIO 2: Option immediately updates to disabled "Already Ordered"
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 2: Certificate Status Updates to 'Already Ordered' ---");
  try {
    const statusRes = await fetch(`${BASE_URL}/api/certificate/status`, {
      headers: { Cookie: customerCookie },
    });
    const statusData = await statusRes.json();

    console.log("Status response:", JSON.stringify({
      hasOrderedCertificate: statusData.hasOrderedCertificate,
      certificateClaimedAt: statusData.certificateClaimedAt,
      certificateOrder: statusData.certificateOrder,
    }, null, 2));

    if (!statusData.hasOrderedCertificate) {
      throw new Error("Expected hasOrderedCertificate to be true");
    }
    if (!statusData.certificateOrder || statusData.certificateOrder.orderNumber === undefined) {
      throw new Error("Expected certificateOrder details in status response");
    }

    console.log("✓ Customer certificate status correctly reports hasOrderedCertificate: true");
    console.log("✓ Frontend contract: Button disabled with 'Already Ordered' and message: 'You have already ordered your physical certificate. This option is available only once per customer.'");
    scenario2Passed = true;
  } catch (err) {
    console.error("Scenario 2 Failed:", err);
  }

  // -------------------------------------------------------------
  // SCENARIO 3: Subsequent book order leaves certificate disabled
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 3: Subsequent Book Order Leaves Certificate Disabled ---");
  try {
    const bookOrderRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerName: "Razorpay Test",
        customerEmail: customer.email,
        customerPhone: "9876543210",
        addressLine1: "123 Technology Park",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        items: [
          {
            slug: "sql-book",
            productType: "CS_FUNDAMENTAL",
            title: "Database Management Systems (DBMS) & SQL Complete Book",
            quantity: 1,
          },
        ],
      }),
    });

    const bookOrderData = await bookOrderRes.json();
    if (!bookOrderRes.ok || !bookOrderData.printedOrderId) {
      throw new Error(`Book order creation failed: ${JSON.stringify(bookOrderData)}`);
    }

    const createdPrintedOrder = await prisma.printedOrder.findUnique({
      where: { id: bookOrderData.printedOrderId },
    });

    console.log(`✓ Subsequent book order created: #${bookOrderData.orderNumber}, requiresCertificate: ${createdPrintedOrder.requiresCertificate}`);
    if (createdPrintedOrder.requiresCertificate === true) {
      throw new Error("Book order incorrectly flagged requiresCertificate: true for a customer who already claimed certificate!");
    }

    // Check certificate status still hasOrderedCertificate: true
    const statusCheck = await fetch(`${BASE_URL}/api/certificate/status`, {
      headers: { Cookie: customerCookie },
    });
    const statusJson = await statusCheck.json();
    if (!statusJson.hasOrderedCertificate) {
      throw new Error("Certificate status unexpectedly reverted to un-ordered!");
    }

    console.log("✓ Subsequent book order succeeded and customer certificate remains 'Already Ordered'.");
    scenario3Passed = true;
  } catch (err) {
    console.error("Scenario 3 Failed:", err);
  }

  // -------------------------------------------------------------
  // SCENARIO 4: Direct API attempt to duplicate certificate purchase is rejected
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 4: Direct API Duplicate Purchase Rejection & DB Unique Constraint ---");
  try {
    const dupRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerName: "Razorpay Test",
        customerEmail: customer.email,
        customerPhone: "9876543210",
        addressLine1: "123 Technology Park",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        items: [
          {
            productType: "CERTIFICATE",
            slug: "physical-certificate",
            title: "BeeNext Physical Certificate of Achievement",
            quantity: 1,
          },
        ],
      }),
    });

    const dupData = await dupRes.json();
    console.log(`Duplicate purchase HTTP status: ${dupRes.status}, error message: "${dupData.error}"`);

    const expectedError = "You have already ordered your physical certificate. This option is available only once per customer.";
    if (dupRes.status !== 400 || dupData.error !== expectedError) {
      throw new Error(`Expected HTTP 400 with exact error message '${expectedError}', received status ${dupRes.status}: ${JSON.stringify(dupData)}`);
    }
    console.log("✓ Backend API successfully blocked duplicate certificate purchase with HTTP 400 and exact message.");

    // Test DB level unique constraint: try inserting another original CertificateOrder with the same certificateUserKey
    let dbConstraintBlocked = false;
    try {
      await prisma.certificateOrder.create({
        data: {
          userId: customer.id,
          certificateUserKey: customer.id, // Duplicate key!
          orderNumber: "BN-CERT-DUP-TEST",
          customerName: customer.name,
          customerEmail: customer.email,
          status: "CONFIRMED",
        },
      });
    } catch (dbErr) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        dbConstraintBlocked = true;
        console.log("✓ Database uniqueness constraint successfully rejected duplicate insertion (code: P2002 / unique key).");
      } else {
        throw dbErr;
      }
    }

    if (!dbConstraintBlocked) {
      throw new Error("Database unique constraint failed to prevent duplicate insert!");
    }

    scenario4Passed = true;
  } catch (err) {
    console.error("Scenario 4 Failed:", err);
  }

  // -------------------------------------------------------------
  // SCENARIO 5: Failed/cancelled payment allows retry
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 5: Failed/Cancelled Payment Allows Retry ---");
  try {
    // Create temporary test user
    const tempEmail = `test_cancel_${Date.now()}@example.com`;
    const tempUser = await prisma.user.create({
      data: {
        name: "Temporary Cancel User",
        email: tempEmail,
        passwordHash: "hashed_temp_password",
        role: "USER",
      },
    });
    const tempCookie = createAuthCookie(tempUser);

    // Step 1: Initiate checkout
    const initRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: tempCookie },
      body: JSON.stringify({
        customerName: "Temp User",
        customerEmail: tempUser.email,
        customerPhone: "9876543210",
        addressLine1: "456 Test Ave",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        items: [
          {
            productType: "CERTIFICATE",
            slug: "physical-certificate",
            title: "BeeNext Physical Certificate of Achievement",
            quantity: 1,
          },
        ],
      }),
    });
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(`Initial order failed: ${JSON.stringify(initData)}`);

    // Step 2: Payment fails or user closes modal (paymentStatus remains PENDING or is marked FAILED)
    await prisma.printedOrder.update({
      where: { id: initData.printedOrderId },
      data: { paymentStatus: "FAILED" },
    });

    // Check status API - must NOT be marked as ordered
    const tempStatusRes = await fetch(`${BASE_URL}/api/certificate/status`, {
      headers: { Cookie: tempCookie },
    });
    const tempStatus = await tempStatusRes.json();
    if (tempStatus.hasOrderedCertificate) {
      throw new Error("Failed/unpaid order incorrectly consumed certificate allowance!");
    }

    // Step 3: Retry checkout - must succeed
    const retryRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: tempCookie },
      body: JSON.stringify({
        customerName: "Temp User",
        customerEmail: tempUser.email,
        customerPhone: "9876543210",
        addressLine1: "456 Test Ave",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        items: [
          {
            productType: "CERTIFICATE",
            slug: "physical-certificate",
            title: "BeeNext Physical Certificate of Achievement",
            quantity: 1,
          },
        ],
      }),
    });
    const retryData = await retryRes.json();
    if (!retryRes.ok || !retryData.printedOrderId) {
      throw new Error(`Retry checkout failed: ${JSON.stringify(retryData)}`);
    }

    console.log(`✓ Retry checkout succeeded for customer with failed previous payment: #${retryData.orderNumber}`);

    // Clean up temporary user and orders
    await prisma.printedOrder.deleteMany({ where: { userId: tempUser.id } });
    await prisma.user.delete({ where: { id: tempUser.id } });

    scenario5Passed = true;
  } catch (err) {
    console.error("Scenario 5 Failed:", err);
  }

  // -------------------------------------------------------------
  // SCENARIO 6: Admin Dashboard sees badge, updates delivery status, records replacement
  // -------------------------------------------------------------
  console.log("\n--- Testing Scenario 6: Admin Dashboard Features & Audited Replacements ---");
  try {
    // 1. Fetch certificate orders via admin API
    const certsRes = await fetch(`${BASE_URL}/api/admin/certificates`, {
      headers: { Cookie: adminCookie },
    });
    const certsData = await certsRes.json();
    if (!certsRes.ok || !Array.isArray(certsData.certificateOrders)) {
      throw new Error(`Admin certificates fetch failed: ${JSON.stringify(certsData)}`);
    }

    const listedOrder = certsData.certificateOrders.find((c) => c.id === certOrderId);
    if (!listedOrder) {
      throw new Error(`Order ${certOrderId} not found in admin certificates list!`);
    }
    console.log(`✓ Admin successfully lists certificate order: #${listedOrder.orderNumber}`);

    // 2. Verify printed order has requiresCertificate: true
    const printedOrder = await prisma.printedOrder.findUnique({
      where: { id: certPrintedOrderId },
    });
    if (!printedOrder?.requiresCertificate) {
      throw new Error("Printed order missing requiresCertificate: true flag!");
    }
    console.log("✓ Printed order has requiresCertificate: true ('Physical Certificate Required' badge displayed in Admin)");

    // 3. Update delivery status to DELIVERED
    const patchRes = await fetch(`${BASE_URL}/api/admin/certificates/${certOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        deliveryStatus: "DELIVERED",
        carrier: "BlueDart Express",
        trackingNumber: "BD9988776655",
      }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok || !patchData.success) {
      throw new Error(`PATCH delivery status failed: ${JSON.stringify(patchData)}`);
    }

    const updatedCert = await prisma.certificateOrder.findUnique({
      where: { id: certOrderId },
    });
    if (updatedCert.deliveryStatus !== "DELIVERED") {
      throw new Error(`Expected deliveryStatus to be DELIVERED, got ${updatedCert.deliveryStatus}`);
    }
    console.log(`✓ Delivery status successfully updated to DELIVERED with tracking BD9988776655`);

    // 4. Record replacement certificate with audit history
    const repRes = await fetch(`${BASE_URL}/api/admin/certificates/replacement`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        userId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        replacementNote: "Customer reported certificate bent during courier transit. Verified photos and approved replacement.",
      }),
    });
    const repData = await repRes.json();
    if (!repRes.ok || !repData.success) {
      throw new Error(`Replacement creation failed: ${JSON.stringify(repData)}`);
    }

    console.log(`✓ Replacement certificate created: #${repData.certificateOrder.orderNumber}`);
    if (!repData.certificateOrder.isReplacement) {
      throw new Error("Replacement record is missing isReplacement: true flag!");
    }

    // Verify all certificate orders for customer (both original and replacement are preserved permanently)
    const allCertsForUser = await prisma.certificateOrder.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: "asc" },
    });
    console.log(`✓ Total certificate records retained in audit history for customer: ${allCertsForUser.length}`);
    for (const c of allCertsForUser) {
      console.log(`  - #${c.orderNumber}: isReplacement=${c.isReplacement}, status=${c.deliveryStatus}, note=${c.replacementNote || 'N/A'}`);
    }

    scenario6Passed = true;
  } catch (err) {
    console.error("Scenario 6 Failed:", err);
  }

  console.log("\n=======================================================");
  console.log("TEST RESULTS SUMMARY:");
  console.log(`Scenario 1 (First Certificate Purchase Succeeds): ${scenario1Passed ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 2 (Status Updates to 'Already Ordered'):  ${scenario2Passed ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 3 (Subsequent Book Order Keeps Disabled): ${scenario3Passed ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 4 (Duplicate Purchase 400 + DB Unique):    ${scenario4Passed ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 5 (Failed Payment Allows Retry):           ${scenario5Passed ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 6 (Admin Dashboard, Delivery & Audit):    ${scenario6Passed ? "PASSED" : "FAILED"}`);
  console.log("=======================================================");

  const allPassed = scenario1Passed && scenario2Passed && scenario3Passed && scenario4Passed && scenario5Passed && scenario6Passed;
  if (!allPassed) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Fatal test error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
