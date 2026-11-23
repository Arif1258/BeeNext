import { PrismaClient, ProgressStatus } from "@prisma/client";
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

async function getOrCreateUser(email, name) {
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: "dummy_hashed_pw_for_tests",
        role: "USER",
      },
    });
  }
  return user;
}

async function setExactUserProgress(userId, targetRatio, allProblemIds) {
  // Clear existing progress, certificate orders, and reset claimed status
  await prisma.userProgress.deleteMany({ where: { userId } });
  await prisma.certificateOrder.deleteMany({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { certificateClaimedAt: null, dsaQualifiedAt: null },
  });

  const total = allProblemIds.length;
  const countToComplete = targetRatio >= 0.85 ? Math.ceil(total * targetRatio) : Math.floor(total * targetRatio);

  if (countToComplete > 0) {
    const toInsert = allProblemIds.slice(0, countToComplete).map((problemId) => ({
      userId,
      problemId,
      status: ProgressStatus.COMPLETED,
    }));
    await prisma.userProgress.createMany({ data: toInsert });
  }

  const verifiedCount = await prisma.userProgress.count({
    where: { userId, status: ProgressStatus.COMPLETED },
  });
  const verifiedPercentage = Math.round((verifiedCount / total) * 100);
  console.log(`Set user progress: ${verifiedCount}/${total} problems (${verifiedPercentage}%)`);
  return { verifiedCount, total, verifiedPercentage };
}

async function runTests() {
  console.log("==================================================================");
  console.log("STARTING TEST SUITE: FREE PHYSICAL CERTIFICATE WITH BOOK ORDER");
  console.log("==================================================================");

  await connectWithRetry();

  const allProblems = await prisma.problem.findMany({
    where: { isPublished: true },
    select: { id: true },
  });
  const allProblemIds = allProblems.map((p) => p.id);
  const totalProblems = allProblemIds.length;
  console.log(`Total Published Problems in Database: ${totalProblems}`);

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("Admin account missing in DB.");
  const adminCookie = createAuthCookie(admin);

  let s1 = false, s2 = false, s3 = false, s4 = false, s5 = false, s6 = false;

  // ------------------------------------------------------------------------
  // SCENARIO 1: Customer with 85% completion orders a book -> free certificate included
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 1: Customer with 85% completion orders a book ---");
  const user85 = await getOrCreateUser("test_85pct_user@beenext.local", "Test 85% User");
  await setExactUserProgress(user85.id, 0.85, allProblemIds);
  const user85Cookie = createAuthCookie(user85);

  let user85PrintedOrderId = null;
  try {
    const res1 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        customerName: "Test 85 User",
        customerEmail: user85.email,
        customerPhone: "9876543210",
        addressLine1: "123 Tech Park",
        city: "Bangalore",
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
    const data1 = await res1.json();
    if (!res1.ok || !data1.printedOrderId) throw new Error(`Create order failed: ${JSON.stringify(data1)}`);

    console.log(`✓ Order initiated: #${data1.orderNumber}, Amount: ₹${data1.totalAmount} (Free certificate included at ₹0 extra)`);
    if (data1.totalAmount !== 119) {
      throw new Error(`Expected book price ₹119 without certificate surcharge, received ₹${data1.totalAmount}`);
    }

    user85PrintedOrderId = data1.printedOrderId;
    const po1 = await prisma.printedOrder.findUnique({ where: { id: data1.printedOrderId } });
    if (!po1?.requiresCertificate) {
      throw new Error("Expected requiresCertificate to be TRUE for customer with 85% completion!");
    }
    console.log("✓ Printed order has requiresCertificate: true");

    // Complete payment
    const paymentId1 = `pay_mock_${Date.now()}`;
    const sig1 = generateSignature(data1.razorpayOrderId, paymentId1);
    const verRes1 = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        printedOrderId: data1.printedOrderId,
        razorpayOrderId: data1.razorpayOrderId,
        razorpayPaymentId: paymentId1,
        razorpaySignature: sig1,
      }),
    });
    const verData1 = await verRes1.json();
    if (!verRes1.ok || !verData1.success) throw new Error(`Verify failed: ${JSON.stringify(verData1)}`);

    // Verify DB
    const u85Updated = await prisma.user.findUnique({ where: { id: user85.id } });
    const certOrder1 = await prisma.certificateOrder.findFirst({
      where: { userId: user85.id, status: "CONFIRMED" },
    });

    if (!u85Updated?.certificateClaimedAt) throw new Error("user.certificateClaimedAt was not set!");
    if (!certOrder1 || certOrder1.deliveryStatus !== "PENDING") {
      throw new Error("CertificateOrder was not created with status PENDING!");
    }
    console.log(`✓ Payment verified! Free CertificateOrder created: #${certOrder1.orderNumber}, Delivery: ${certOrder1.deliveryStatus}`);
    s1 = true;
  } catch (err) {
    console.error("Scenario 1 Failed:", err);
  }

  // ------------------------------------------------------------------------
  // SCENARIO 2: Customer with 100% completion orders a book -> free certificate included
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 2: Customer with 100% completion orders a book ---");
  const user100 = await getOrCreateUser("test_100pct_user@beenext.local", "Test 100% User");
  await setExactUserProgress(user100.id, 1.0, allProblemIds);
  const user100Cookie = createAuthCookie(user100);

  try {
    const res2 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user100Cookie },
      body: JSON.stringify({
        customerName: "Test 100 User",
        customerEmail: user100.email,
        customerPhone: "9876543210",
        addressLine1: "456 Silicon Rd",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500081",
        items: [
          {
            slug: "full-dsa-book",
            productType: "COMPLETE_BOOK",
            title: "Full DSA Book",
            quantity: 1,
          },
        ],
      }),
    });
    const data2 = await res2.json();
    if (!res2.ok || !data2.printedOrderId) throw new Error(`Create order failed: ${JSON.stringify(data2)}`);

    console.log(`✓ Order initiated: #${data2.orderNumber}, Amount: ₹${data2.totalAmount} (Free certificate included at ₹0 extra)`);
    if (data2.totalAmount !== 1499) {
      throw new Error(`Expected book price ₹1499 without certificate surcharge, received ₹${data2.totalAmount}`);
    }

    const po2 = await prisma.printedOrder.findUnique({ where: { id: data2.printedOrderId } });
    if (!po2?.requiresCertificate) {
      throw new Error("Expected requiresCertificate to be TRUE for customer with 100% completion!");
    }
    console.log("✓ Printed order has requiresCertificate: true");

    // Complete payment
    const paymentId2 = `pay_mock_${Date.now()}`;
    const sig2 = generateSignature(data2.razorpayOrderId, paymentId2);
    const verRes2 = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user100Cookie },
      body: JSON.stringify({
        printedOrderId: data2.printedOrderId,
        razorpayOrderId: data2.razorpayOrderId,
        razorpayPaymentId: paymentId2,
        razorpaySignature: sig2,
      }),
    });
    const verData2 = await verRes2.json();
    if (!verRes2.ok || !verData2.success) throw new Error(`Verify failed: ${JSON.stringify(verData2)}`);

    const u100Updated = await prisma.user.findUnique({ where: { id: user100.id } });
    const certOrder2 = await prisma.certificateOrder.findFirst({
      where: { userId: user100.id, status: "CONFIRMED" },
    });
    if (!u100Updated?.certificateClaimedAt || !certOrder2) {
      throw new Error("CertificateOrder was not created for 100% user!");
    }
    console.log(`✓ Payment verified! Free CertificateOrder created: #${certOrder2.orderNumber}`);
    s2 = true;
  } catch (err) {
    console.error("Scenario 2 Failed:", err);
  }

  // ------------------------------------------------------------------------
  // SCENARIO 3: Customer with 84% completion orders a book -> no certificate
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 3: Customer with 84% completion orders a book ---");
  const user84 = await getOrCreateUser("test_84pct_user@beenext.local", "Test 84% User");
  await setExactUserProgress(user84.id, 0.84, allProblemIds);
  const user84Cookie = createAuthCookie(user84);

  try {
    const res3 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user84Cookie },
      body: JSON.stringify({
        customerName: "Test 84 User",
        customerEmail: user84.email,
        customerPhone: "9876543210",
        addressLine1: "789 College St",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
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
    const data3 = await res3.json();
    if (!res3.ok || !data3.printedOrderId) throw new Error(`Create order failed: ${JSON.stringify(data3)}`);

    const po3 = await prisma.printedOrder.findUnique({ where: { id: data3.printedOrderId } });
    console.log(`✓ Order created: #${data3.orderNumber}, requiresCertificate: ${po3.requiresCertificate}`);
    if (po3.requiresCertificate === true) {
      throw new Error("Order incorrectly granted requiresCertificate: true to user with only 84% completion!");
    }

    // Complete payment
    const paymentId3 = `pay_mock_${Date.now()}`;
    const sig3 = generateSignature(data3.razorpayOrderId, paymentId3);
    await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user84Cookie },
      body: JSON.stringify({
        printedOrderId: data3.printedOrderId,
        razorpayOrderId: data3.razorpayOrderId,
        razorpayPaymentId: paymentId3,
        razorpaySignature: sig3,
      }),
    });

    const u84Updated = await prisma.user.findUnique({ where: { id: user84.id } });
    const certOrder3 = await prisma.certificateOrder.findFirst({
      where: { userId: user84.id, status: "CONFIRMED" },
    });
    if (u84Updated?.certificateClaimedAt || certOrder3) {
      throw new Error("User with 84% completion was incorrectly granted a certificate!");
    }
    console.log("✓ Customer with 84% completion received book with NO certificate, allowance remains unclaimed.");
    s3 = true;
  } catch (err) {
    console.error("Scenario 3 Failed:", err);
  }

  // ------------------------------------------------------------------------
  // SCENARIO 4: Customer who already received a certificate orders another book -> no second certificate
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 4: Customer who already received a certificate orders another book ---");
  try {
    const res4 = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        customerName: "Test 85 User",
        customerEmail: user85.email,
        customerPhone: "9876543210",
        addressLine1: "123 Tech Park",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        items: [
          {
            slug: "oops",
            productType: "CS_FUNDAMENTAL",
            title: "Object-Oriented Programming (OOPs) Book",
            quantity: 1,
          },
        ],
      }),
    });
    const data4 = await res4.json();
    if (!res4.ok || !data4.printedOrderId) throw new Error(`Subsequent order failed: ${JSON.stringify(data4)}`);

    const po4 = await prisma.printedOrder.findUnique({ where: { id: data4.printedOrderId } });
    console.log(`✓ Subsequent book order created: #${data4.orderNumber}, requiresCertificate: ${po4.requiresCertificate}`);
    if (po4.requiresCertificate === true) {
      throw new Error("Subsequent book order incorrectly set requiresCertificate: true!");
    }

    // Complete payment
    const paymentId4 = `pay_mock_${Date.now()}`;
    const sig4 = generateSignature(data4.razorpayOrderId, paymentId4);
    await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        printedOrderId: data4.printedOrderId,
        razorpayOrderId: data4.razorpayOrderId,
        razorpayPaymentId: paymentId4,
        razorpaySignature: sig4,
      }),
    });

    const certCountForUser85 = await prisma.certificateOrder.count({
      where: { userId: user85.id, isReplacement: false },
    });
    if (certCountForUser85 !== 1) {
      throw new Error(`Expected exactly 1 certificate order for customer, found ${certCountForUser85}`);
    }
    console.log(`✓ Subsequent book order completed with NO second certificate (Total certs: ${certCountForUser85})`);
    s4 = true;
  } catch (err) {
    console.error("Scenario 4 Failed:", err);
  }

  // ------------------------------------------------------------------------
  // SCENARIO 5: Failed or cancelled payment -> certificate remains unclaimed
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 5: Failed or cancelled payment -> certificate remains unclaimed ---");
  const userCancel = await getOrCreateUser("test_cancel_flow@beenext.local", "Test Cancel User");
  await setExactUserProgress(userCancel.id, 0.90, allProblemIds);
  const userCancelCookie = createAuthCookie(userCancel);

  try {
    // 1. Order created with requiresCertificate: true
    const initRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCancelCookie },
      body: JSON.stringify({
        customerName: "Cancel User",
        customerEmail: userCancel.email,
        customerPhone: "9876543210",
        addressLine1: "111 Cancel Way",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
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
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(`Initial order failed: ${JSON.stringify(initData)}`);

    // 2. Mark order payment as FAILED
    await prisma.printedOrder.update({
      where: { id: initData.printedOrderId },
      data: { paymentStatus: "FAILED" },
    });

    // Check certificate status: MUST NOT be claimed
    const statRes = await fetch(`${BASE_URL}/api/certificate/status`, {
      headers: { Cookie: userCancelCookie },
    });
    const statData = await statRes.json();
    if (statData.hasOrderedCertificate || statData.certificateClaimedAt) {
      throw new Error("Failed/cancelled payment marked certificate as claimed!");
    }
    console.log("✓ Failed payment did NOT claim certificate. hasOrderedCertificate is false.");

    // 3. Customer retries order -> MUST include free certificate again
    const retryRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCancelCookie },
      body: JSON.stringify({
        customerName: "Cancel User",
        customerEmail: userCancel.email,
        customerPhone: "9876543210",
        addressLine1: "111 Cancel Way",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
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
    const retryData = await retryRes.json();
    if (!retryRes.ok) throw new Error(`Retry order failed: ${JSON.stringify(retryData)}`);

    const poRetry = await prisma.printedOrder.findUnique({ where: { id: retryData.printedOrderId } });
    if (!poRetry?.requiresCertificate) {
      throw new Error("Retry order missing requiresCertificate: true!");
    }
    console.log(`✓ Retry book order successfully includes free certificate again: #${retryData.orderNumber}`);
    s5 = true;
  } catch (err) {
    console.error("Scenario 5 Failed:", err);
  }

  // ------------------------------------------------------------------------
  // SCENARIO 6: Direct API attempt to claim a second certificate -> rejected
  // ------------------------------------------------------------------------
  console.log("\n--- Scenario 6: Direct API attempt to claim a second certificate -> rejected ---");
  try {
    // Attempt direct API request by customer who already claimed (user85)
    const bypassRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        customerName: "Test 85 User",
        customerEmail: user85.email,
        customerPhone: "9876543210",
        addressLine1: "123 Tech Park",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        requiresCertificate: true,
        items: [
          {
            slug: "physical-certificate",
            productType: "CERTIFICATE",
            title: "BeeNext Physical Certificate of Achievement",
            quantity: 1,
          },
        ],
      }),
    });
    const bypassData = await bypassRes.json();
    console.log(`Bypass attempt status: ${bypassRes.status}, message: "${bypassData.error}"`);

    if (bypassRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for duplicate certificate attempt, got ${bypassRes.status}`);
    }
    console.log("✓ Direct API standalone certificate request successfully rejected with HTTP 400.");

    // Also test direct API request with requiresCertificate: true on a book order
    const bypassBookRes = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: user85Cookie },
      body: JSON.stringify({
        customerName: "Test 85 User",
        customerEmail: user85.email,
        customerPhone: "9876543210",
        addressLine1: "123 Tech Park",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        requiresCertificate: true,
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
    const bypassBookData = await bypassBookRes.json();
    console.log(`Bypass book order status: ${bypassBookRes.status}, message: "${bypassBookData.error}"`);
    if (bypassBookRes.status !== 400) {
      throw new Error(`Expected HTTP 400 for duplicate certificate attempt on book, got ${bypassBookRes.status}`);
    }
    console.log("✓ Direct API duplicate certificate request on book order successfully rejected with HTTP 400.");

    // Direct DB unique constraint verification
    let dbBlocked = false;
    try {
      await prisma.certificateOrder.create({
        data: {
          userId: user85.id,
          certificateUserKey: user85.id, // Duplicate key!
          orderNumber: "BN-DUP-FAIL-KEY",
          customerName: user85.name,
          customerEmail: user85.email,
          status: "CONFIRMED",
        },
      });
    } catch (dbErr) {
      if (dbErr.code === "P2002" || String(dbErr).includes("Unique constraint")) {
        dbBlocked = true;
        console.log("✓ Database uniqueness constraint strictly blocked concurrent/duplicate insertion (code: P2002).");
      } else {
        throw dbErr;
      }
    }
    if (!dbBlocked) throw new Error("Database unique constraint failed to block duplicate insert!");

    s6 = true;
  } catch (err) {
    console.error("Scenario 6 Failed:", err);
  }

  // Admin Dashboard Verification
  console.log("\n--- Admin Dashboard Verification ---");
  const adminCertsRes = await fetch(`${BASE_URL}/api/admin/certificates`, {
    headers: { Cookie: adminCookie },
  });
  const adminCerts = await adminCertsRes.json();
  console.log(`✓ Admin lists ${adminCerts.certificateOrders?.length} certificate orders`);

  // Verify delivery status update on user85 certificate order
  const user85Cert = await prisma.certificateOrder.findFirst({
    where: { userId: user85.id },
  });
  if (user85Cert) {
    const patchRes = await fetch(`${BASE_URL}/api/admin/certificates/${user85Cert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        deliveryStatus: "SHIPPED",
        carrier: "Delhivery",
        trackingNumber: "DLV12345678",
      }),
    });
    const patchJson = await patchRes.json();
    console.log(`✓ Admin updated delivery status: ${patchJson.certificateOrder?.deliveryStatus}, tracking: ${patchJson.certificateOrder?.trackingNumber}`);
  }

  console.log("\n==================================================================");
  console.log("TEST RESULTS SUMMARY:");
  console.log(`Scenario 1 (85% completion -> free certificate included):    ${s1 ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 2 (100% completion -> free certificate included):   ${s2 ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 3 (84% completion -> no certificate):               ${s3 ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 4 (Second book order -> no second certificate):     ${s4 ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 5 (Failed payment -> certificate remains unclaimed): ${s5 ? "PASSED" : "FAILED"}`);
  console.log(`Scenario 6 (Direct API attempt to duplicate -> rejected):    ${s6 ? "PASSED" : "FAILED"}`);
  console.log("==================================================================");

  if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
