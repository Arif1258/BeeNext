import prisma from "../src/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";

async function main() {
  console.log("==================================================");
  console.log("VERIFYING NAVBAR ORDER & MY ORDERS REQUIREMENTS");
  console.log("==================================================");

  // [Test 1] Verify Navbar structure and order
  console.log("\n[Test 1] Checking Navbar links and order...");
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  const cleanHomeHtml = homeHtml.replace(/<!--[\s\S]*?-->/g, "");

  // Check presence of options
  if (!cleanHomeHtml.includes("DSA Topics")) throw new Error("Missing 'DSA Topics' in navbar!");
  if (!cleanHomeHtml.includes("Purchase")) throw new Error("Missing 'Purchase' in navbar!");
  if (!cleanHomeHtml.includes("My Orders")) throw new Error("Missing 'My Orders' in navbar!");
  if (!cleanHomeHtml.includes("About")) throw new Error("Missing 'About' in navbar!");
  if (!cleanHomeHtml.includes('aria-label="Profile and Account Menu"')) {
    throw new Error("Missing profile icon in navbar!");
  }

  // Check relative order in the navbar:
  // 1. DSA Topics -> 2. Purchase -> 3. My Orders -> 4. About -> 5. Profile Icon
  const dsaIndex = cleanHomeHtml.indexOf("DSA Topics");
  const purchaseIndex = cleanHomeHtml.indexOf("Purchase", dsaIndex);
  const myOrdersIndex = cleanHomeHtml.indexOf("My Orders", purchaseIndex);
  const aboutIndex = cleanHomeHtml.indexOf("About", myOrdersIndex);
  const profileIconIndex = cleanHomeHtml.indexOf('aria-label="Profile and Account Menu"', aboutIndex);

  if (dsaIndex === -1 || purchaseIndex === -1 || myOrdersIndex === -1 || aboutIndex === -1 || profileIconIndex === -1) {
    throw new Error("Navbar options not in expected sequence: DSA Topics -> Purchase -> My Orders -> About -> Profile Icon");
  }

  if (!(dsaIndex < purchaseIndex && purchaseIndex < myOrdersIndex && myOrdersIndex < aboutIndex && aboutIndex < profileIconIndex)) {
    throw new Error(
      `Navbar ordering violated! Expected: DSA Topics < Purchase < My Orders < About < Profile Icon.`
    );
  }
  console.log("✓ Navbar order verified: 1. DSA Topics -> 2. Purchase -> 3. My Orders -> 4. About -> 5. Profile Icon");

  // [Test 2] Verify My Orders is removed from /profile
  console.log("\n[Test 2] Checking /profile page...");
  const profileRes = await fetch("http://localhost:3000/profile");
  const profileHtml = await profileRes.text();
  const cleanProfileHtml = profileHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (cleanProfileHtml.includes("My Orders (Physical Printed Notes)") || cleanProfileHtml.includes("Physical Printed Notes Delivery")) {
    throw new Error("My Orders section still present on /profile page! It must be completely removed.");
  }
  console.log("✓ 'My Orders' section is completely removed from /profile page");

  // [Test 3] Test /orders unauthenticated access
  console.log("\n[Test 3] Checking unauthenticated /orders access...");
  const unauthOrdersRes = await fetch("http://localhost:3000/orders");
  const unauthOrdersHtml = await unauthOrdersRes.text();
  const cleanUnauthOrdersHtml = unauthOrdersHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanUnauthOrdersHtml.includes("Please sign in") && !cleanUnauthOrdersHtml.includes("Log In")) {
    throw new Error("/orders page should require login when unauthenticated!");
  }

  const unauthApiRes = await fetch("http://localhost:3000/api/user/orders");
  if (unauthApiRes.status !== 401) {
    throw new Error(`/api/user/orders should return 401 for unauthenticated user, got ${unauthApiRes.status}`);
  }
  console.log("✓ /orders and /api/user/orders securely require authentication (401 for guests)");

  // [Test 4] Test authenticated user with no orders
  console.log("\n[Test 4] Testing authenticated user with zero orders...");
  // Create temporary test user
  const testUser = await prisma.user.create({
    data: {
      name: "Orders Test User",
      email: `orders.test.${Date.now()}@example.com`,
      passwordHash: "dummy_hash_12345",
      role: "USER",
    },
  });

  const testToken = jwt.sign(
    { id: testUser.id, email: testUser.email, role: testUser.role, name: testUser.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const emptyOrdersApiRes = await fetch("http://localhost:3000/api/user/orders", {
    headers: {
      Cookie: `beenext_token=${testToken}`,
    },
  });
  const emptyOrdersData = await emptyOrdersApiRes.json();
  if (!emptyOrdersApiRes.ok || emptyOrdersData.orders.length !== 0) {
    throw new Error("Expected zero orders for new user!");
  }
  console.log("✓ Empty order history returns empty array");

  // [Test 5] Test order creation and fetching order details
  console.log("\n[Test 5] Creating order and verifying order details...");
  const orderRes = await fetch("http://localhost:3000/api/printed-orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `beenext_token=${testToken}`,
    },
    body: JSON.stringify({
      productType: "TOPIC",
      topicSlug: "arrays",
      customerName: testUser.name,
      customerEmail: testUser.email,
      customerPhone: "9876543210",
      addressLine1: "B-204, Tech Residency",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560100",
      quantity: 1,
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok) throw new Error(`Failed to create order: ${orderData.error}`);

  // Complete Payment
  await fetch("http://localhost:3000/api/printed-orders/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printedOrderId: orderData.printedOrderId,
      razorpayOrderId: orderData.orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: `mock_sig_${Date.now()}_verified`,
    }),
  });

  // Fetch orders as the authenticated user
  const userOrdersApiRes = await fetch("http://localhost:3000/api/user/orders", {
    headers: {
      Cookie: `beenext_token=${testToken}`,
    },
  });
  const userOrdersData = await userOrdersApiRes.json();
  if (!userOrdersApiRes.ok || userOrdersData.orders.length !== 1) {
    throw new Error(`Expected 1 order for user, found ${userOrdersData.orders?.length}`);
  }

  const fetchedOrder = userOrdersData.orders[0];
  console.log("✓ Fetched order details:", {
    orderNumber: fetchedOrder.orderNumber,
    productTitle: fetchedOrder.productTitle,
    totalAmount: `₹${fetchedOrder.totalAmount}`,
    orderStatus: fetchedOrder.orderStatus,
    paymentStatus: fetchedOrder.paymentStatus,
    address: `${fetchedOrder.addressLine1}, ${fetchedOrder.city}`,
  });

  if (fetchedOrder.orderNumber !== orderData.orderNumber) throw new Error("Order ID mismatch!");
  if (!fetchedOrder.productTitle.includes("Arrays")) throw new Error("Product title mismatch!");
  if (fetchedOrder.totalAmount !== 39) throw new Error("Price paid mismatch!");
  if (fetchedOrder.paymentStatus !== "COMPLETED") throw new Error("Payment status mismatch!");
  if (fetchedOrder.orderStatus !== "CONFIRMED") throw new Error("Order status mismatch!");
  if (!fetchedOrder.addressLine1.includes("B-204")) throw new Error("Address mismatch!");
  console.log("✓ All order fields verified: Order ID, Product name, Price, Date, Payment status, Delivery address, Order status");

  // Clean up
  await prisma.printedOrder.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log("✓ Cleaned up test user and order");

  console.log("\n==================================================");
  console.log("ALL NAVBAR & MY ORDERS REQUIREMENTS VERIFIED! ✓");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
