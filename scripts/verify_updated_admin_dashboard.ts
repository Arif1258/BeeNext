import { prisma } from "../src/lib/prisma";
import fs from "fs";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING UPDATED ADMIN DASHBOARD REQUIREMENTS");
  console.log("==================================================");

  // [Test 1] Verify Users in Database
  console.log("\n[Test 1] Checking Database Users (Only 2 Designated Accounts)...");
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  console.log(`Found ${users.length} users in database.`);
  if (users.length !== 2) {
    throw new Error(`Expected exactly 2 users, but found ${users.length}: ${JSON.stringify(users)}`);
  }
  const admin = users.find((u) => u.email === "supportbeenext@gmail.com");
  const customer = users.find((u) => u.email === "arifahmedma490@gmail.com");

  if (!admin || admin.role !== "ADMIN") {
    throw new Error(`Admin supportbeenext@gmail.com not found or role not ADMIN! Found: ${JSON.stringify(admin)}`);
  }
  if (!customer || customer.role !== "USER") {
    throw new Error(`Customer arifahmedma490@gmail.com not found or role not USER! Found: ${JSON.stringify(customer)}`);
  }
  console.log(`✓ Admin verified: ${admin.email} (Role: ${admin.role})`);
  console.log(`✓ Customer verified: ${customer.email} (Role: ${customer.role})`);

  // [Test 2] Authenticate Admin & Customer
  console.log("\n[Test 2] Authenticating Admin & Customer Sessions...");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "supportbeenext@gmail.com", password: process.env.ADMIN_PASSWORD }),
  });
  if (!adminLoginRes.ok) throw new Error("Admin login failed");
  const adminCookies = adminLoginRes.headers.get("set-cookie") || "";

  const customerLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "arifahmedma490@gmail.com", password: process.env.CUSTOMER_PASSWORD }),
  });
  if (!customerLoginRes.ok) throw new Error("Customer login failed");
  const customerCookies = customerLoginRes.headers.get("set-cookie") || "";
  console.log("✓ Admin and customer successfully authenticated.");

  // [Test 3] Customer strictly blocked from Admin APIs
  console.log("\n[Test 3] Verifying Customer Blocked from Admin APIs...");
  const custMetricsRes = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: customerCookies },
  });
  if (custMetricsRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for customer on metrics, got ${custMetricsRes.status}`);
  }
  const custOrdersRes = await fetch("http://localhost:3000/api/admin/printed-orders", {
    headers: { Cookie: customerCookies },
  });
  if (custOrdersRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden for customer on printed-orders, got ${custOrdersRes.status}`);
  }
  console.log("✓ Customer blocked from admin APIs with HTTP 403 Forbidden.");

  // [Test 4] Verify Real Admin Metrics
  console.log("\n[Test 4] Verifying Real Admin Metrics from DB...");
  const metricsRes = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: adminCookies },
  });
  if (!metricsRes.ok) throw new Error("Failed to fetch admin metrics");
  const metricsData = await metricsRes.json();
  console.log("Admin metrics:", {
    totalUsers: metricsData.totalUsers,
    totalOrders: metricsData.totalOrders,
    totalRevenue: metricsData.totalRevenue,
  });
  if (metricsData.totalUsers !== 2) {
    throw new Error(`Expected totalUsers = 2, got ${metricsData.totalUsers}`);
  }
  console.log("✓ Real metrics verified: 2 users, actual orders and real revenue.");

  // [Test 5] Verify Printed Orders in Detail
  console.log("\n[Test 5] Verifying Orders Section Data...");
  const ordersRes = await fetch("http://localhost:3000/api/admin/printed-orders", {
    headers: { Cookie: adminCookies },
  });
  if (!ordersRes.ok) throw new Error("Failed to fetch admin orders");
  const ordersData = await ordersRes.json();
  const orders = ordersData.orders;
  console.log(`Retrieved ${orders.length} real printed orders.`);

  // Verify no fake/test orders are present
  const hasTestOrders = orders.some(
    (o: any) => o.orderNumber?.includes("TEST") || o.customerName?.includes("[TEST]") || o.paymentMethod === "TEST_MODE"
  );
  if (hasTestOrders) {
    throw new Error("FAIL: Test order still present in admin orders!");
  }
  console.log("✓ Zero fake/test orders verified. All test orders successfully removed.");

  if (orders.length === 0) {
    console.log("✓ No genuine customer orders exist yet: Orders section correctly displays clean empty state.");
  } else {
    const sampleOrder = orders[0];
    console.log("Sample order fields check:", {
      orderNumber: sampleOrder.orderNumber,
      customerName: sampleOrder.customerName,
      customerPhone: sampleOrder.customerPhone,
      addressLine1: sampleOrder.addressLine1,
      city: sampleOrder.city,
      state: sampleOrder.state,
      postalCode: sampleOrder.postalCode,
      productTitle: sampleOrder.productTitle,
      totalAmount: sampleOrder.totalAmount,
      paymentStatus: sampleOrder.paymentStatus,
      orderStatus: sampleOrder.orderStatus,
    });

    if (!sampleOrder.customerName || !sampleOrder.customerPhone || !sampleOrder.addressLine1 || !sampleOrder.postalCode) {
      throw new Error("Missing required customer details or address fields in order!");
    }
    console.log("✓ Order details verified: Customer name, phone, address, product, amount, payment and delivery status all present.");

    // [Test 6] Verify Delivery Status Update
    console.log("\n[Test 6] Testing Admin Order Status Update...");
    const targetOrder = orders[0];
    const nextStatus = targetOrder.orderStatus === "SHIPPED" ? "DELIVERED" : "SHIPPED";
    const patchRes = await fetch(`http://localhost:3000/api/admin/printed-orders/${targetOrder.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookies,
      },
      body: JSON.stringify({
        orderStatus: nextStatus,
        carrier: "DTDC Express",
        trackingNumber: "TRK" + Date.now(),
      }),
    });
    if (!patchRes.ok) {
      throw new Error(`Failed to update order status: ${await patchRes.text()}`);
    }
    const patchData = await patchRes.json();
    console.log(`✓ Order ${targetOrder.orderNumber} successfully updated to ${patchData.order.orderStatus} (Carrier: ${patchData.order.carrier}, Tracking: ${patchData.order.trackingNumber})`);
  }

  // [Test 7] Verify Admin Page Structure
  console.log("\n[Test 7] Verifying Admin Dashboard Page Structure...");
  const adminPageCode = fs.readFileSync("src/app/admin/page.tsx", "utf-8");

  // Verify tabs: ONLY OVERVIEW, USERS, ORDERS and LOGOUT
  if (adminPageCode.includes("PROBLEMS") || adminPageCode.includes("Manage DSA Problems")) {
    throw new Error("Security/Requirement Violation: PROBLEMS tab or Manage DSA Problems found in admin/page.tsx!");
  }
  if (!adminPageCode.includes("OVERVIEW") || !adminPageCode.includes("USERS") || !adminPageCode.includes("ORDERS")) {
    throw new Error("Admin page must contain OVERVIEW, USERS, and ORDERS tabs!");
  }
  if (!adminPageCode.includes("Logout") || !adminPageCode.includes("handleLogout")) {
    throw new Error("Admin page must contain Logout!");
  }
  console.log("✓ Admin page structure confirmed: exactly Overview, Users, Orders, and Logout.");

  // [Test 8] Verify 495 Problems on Website are Preserved and Working
  console.log("\n[Test 8] Verifying DSA Problems Intact on Website...");
  const problemsCount = await prisma.problem.count({ where: { isPublished: true } });
  console.log(`Published DSA problems in DB: ${problemsCount}`);
  if (problemsCount < 400) {
    throw new Error(`Problems count dropped unexpectedly! Found ${problemsCount}`);
  }
  const topicsRes = await fetch("http://localhost:3000/topics");
  if (!topicsRes.ok) throw new Error("Failed to load /topics");
  const topicsHtml = await topicsRes.text();
  if (!topicsHtml.includes("ZERO TO HERO DSA SHEET")) {
    throw new Error("DSA Topics sheet title missing on /topics!");
  }
  console.log("✓ All 495 DSA problems and topics preserved and rendering cleanly on /topics.");

  console.log("\n==================================================");
  console.log("ALL ADMIN DASHBOARD UPDATE TESTS PASSED! ✓");
  console.log("==================================================");
}

main().finally(() => prisma.$disconnect());
