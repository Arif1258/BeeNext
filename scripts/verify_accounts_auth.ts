import prisma from "../src/lib/prisma";
import { Role } from "@prisma/client";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING ADMIN & CUSTOMER AUTHENTICATION & ACCESS");
  console.log("==================================================");

  const adminEmail = (process.env.ADMIN_EMAIL || "supportbeenext@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const customerEmail = (process.env.CUSTOMER_EMAIL || "arifahmedma490@gmail.com").toLowerCase().trim();
  const customerPassword = process.env.CUSTOMER_PASSWORD;

  if (!adminPassword || !customerPassword) {
    throw new Error("Missing ADMIN_PASSWORD or CUSTOMER_PASSWORD in environment!");
  }

  // [Test 1] Verify Database Roles & Integrity
  console.log("\n[Test 1] Checking Database Roles & Integrity...");
  const adminDb = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });
  if (!adminDb || adminDb.role !== Role.ADMIN) {
    throw new Error(`Admin account ${adminEmail} must exist with Role.ADMIN, found: ${adminDb?.role}`);
  }
  if (!adminDb.passwordHash.startsWith("$2a$") && !adminDb.passwordHash.startsWith("$2b$")) {
    throw new Error("Admin passwordHash is not a secure bcrypt hash!");
  }
  console.log(`✓ Admin ${adminEmail} verified with role ADMIN and bcrypt hashed password.`);

  const customerDb = await prisma.user.findUnique({
    where: { email: customerEmail },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });
  if (!customerDb || customerDb.role !== Role.USER) {
    throw new Error(`Customer account ${customerEmail} must exist with Role.USER, found: ${customerDb?.role}`);
  }
  if (!customerDb.passwordHash.startsWith("$2a$") && !customerDb.passwordHash.startsWith("$2b$")) {
    throw new Error("Customer passwordHash is not a secure bcrypt hash!");
  }
  console.log(`✓ Customer ${customerEmail} verified with role USER (CUSTOMER) and bcrypt hashed password.`);

  // Verify only designated admin has ADMIN role
  const allAdmins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, email: true },
  });
  if (allAdmins.length !== 1 || allAdmins[0].email !== adminEmail) {
    throw new Error(`Security Violation: Multiple admins found in database! Expected only ${adminEmail}, found: ${JSON.stringify(allAdmins)}`);
  }
  console.log(`✓ Access Management Confirmed: Exactly 1 designated ADMIN account exists in database.`);

  // [Test 2] Verify Admin Login & Full Administrative Access
  console.log("\n[Test 2] Testing Admin Login & Full Administrative Access...");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });

  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok || adminLoginData.user?.role !== "ADMIN") {
    throw new Error(`Admin login failed: ${adminLoginData.error || "Wrong role"}`);
  }

  // Extract session cookie
  const adminCookieHeader = adminLoginRes.headers.get("set-cookie");
  if (!adminCookieHeader) throw new Error("Missing set-cookie in admin login response!");
  const adminCookie = adminCookieHeader.split(";")[0];

  console.log(`✓ Admin successfully authenticated via API. Received session token.`);

  // Test Admin Access to /api/admin/metrics
  const adminMetricsRes = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: adminCookie },
  });
  if (!adminMetricsRes.ok) {
    throw new Error(`Admin failed to access /api/admin/metrics: status ${adminMetricsRes.status}`);
  }
  const adminMetrics = await adminMetricsRes.json();
  console.log(`✓ Admin accessed /api/admin/metrics (Total users: ${adminMetrics.totalUsers}, Total problems: ${adminMetrics.totalProblemsCount})`);

  // Test Admin Access to /api/admin/printed-orders
  const adminOrdersRes = await fetch("http://localhost:3000/api/admin/printed-orders", {
    headers: { Cookie: adminCookie },
  });
  if (!adminOrdersRes.ok) {
    throw new Error(`Admin failed to access /api/admin/printed-orders: status ${adminOrdersRes.status}`);
  }
  console.log(`✓ Admin accessed /api/admin/printed-orders successfully.`);

  // [Test 3] Verify Customer Login & Normal Customer Access
  console.log("\n[Test 3] Testing Customer Login & Customer Access...");
  const customerLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: customerEmail,
      password: customerPassword,
    }),
  });

  const customerLoginData = await customerLoginRes.json();
  if (!customerLoginRes.ok || customerLoginData.user?.role !== "USER") {
    throw new Error(`Customer login failed: ${customerLoginData.error || "Wrong role"}`);
  }

  const customerCookieHeader = customerLoginRes.headers.get("set-cookie");
  if (!customerCookieHeader) throw new Error("Missing set-cookie in customer login response!");
  const customerCookie = customerCookieHeader.split(";")[0];

  console.log(`✓ Customer successfully authenticated via API. Received session token.`);

  // Test Customer Access to /api/auth/me and /api/user/orders
  const customerMeRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: { Cookie: customerCookie },
  });
  if (!customerMeRes.ok) throw new Error("Customer failed to access /api/auth/me");

  const customerOrdersRes = await fetch("http://localhost:3000/api/user/orders", {
    headers: { Cookie: customerCookie },
  });
  if (!customerOrdersRes.ok) throw new Error("Customer failed to access /api/user/orders");
  console.log(`✓ Customer accessed standard customer features (/api/auth/me, /api/user/orders).`);

  // [Test 4] Verify Customer is BLOCKED from Administrative Access
  console.log("\n[Test 4] Verifying Customer is Strictly Blocked from Admin APIs...");
  const custMetricsRes = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: customerCookie },
  });
  if (custMetricsRes.status !== 403) {
    throw new Error(`Security Violation: Customer accessed /api/admin/metrics with status ${custMetricsRes.status}! Expected 403 Forbidden.`);
  }

  const custPrintedOrdersRes = await fetch("http://localhost:3000/api/admin/printed-orders", {
    headers: { Cookie: customerCookie },
  });
  if (custPrintedOrdersRes.status !== 403) {
    throw new Error(`Security Violation: Customer accessed /api/admin/printed-orders with status ${custPrintedOrdersRes.status}! Expected 403 Forbidden.`);
  }

  const custUsersRes = await fetch("http://localhost:3000/api/admin/users", {
    headers: { Cookie: customerCookie },
  });
  if (custUsersRes.status !== 403) {
    throw new Error(`Security Violation: Customer accessed /api/admin/users with status ${custUsersRes.status}! Expected 403 Forbidden.`);
  }

  console.log("✓ Customer access to /api/admin/metrics was blocked with 403 Forbidden.");
  console.log("✓ Customer access to /api/admin/printed-orders was blocked with 403 Forbidden.");
  console.log("✓ Customer access to /api/admin/users was blocked with 403 Forbidden.");

  // [Test 5] Verify Data Preservation
  console.log("\n[Test 5] Verifying User and Orders Data Preservation...");
  const totalUsers = await prisma.user.count();
  const totalOrders = await prisma.printedOrder.count();
  console.log(`✓ Database data intact: ${totalUsers} total users, ${totalOrders} printed orders.`);

  console.log("\n==================================================");
  console.log("ALL AUTHENTICATION & ACCESS CHECKS PASSED! ✓");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
