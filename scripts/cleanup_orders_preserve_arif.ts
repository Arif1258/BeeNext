import prisma from "../src/lib/prisma";

async function main() {
  console.log("==================================================================");
  console.log("  SAFE DATABASE CLEANUP: PRESERVE ARIF AHMED RAZORPAY TEST ORDER  ");
  console.log("==================================================================\n");

  const TARGET_ORDER_NUMBER = "BN-ORD-043683-2126";
  const TARGET_PAYMENT_ID = "pay_U3H7x5UKq9YNzY";
  const TARGET_ORDER_ID = "order_U3H2ouoAkqFXbQ";

  // Step 1: Strictly identify and verify the target order
  console.log(`Verifying target order '${TARGET_ORDER_NUMBER}'...`);
  const preservedOrder = await prisma.printedOrder.findUnique({
    where: { orderNumber: TARGET_ORDER_NUMBER },
    include: { transactions: true },
  });

  if (!preservedOrder) {
    console.error(`❌ CRITICAL: Target order ${TARGET_ORDER_NUMBER} not found in database! Aborting.`);
    process.exit(1);
  }

  console.log("Found order record:");
  console.log({
    id: preservedOrder.id,
    orderNumber: preservedOrder.orderNumber,
    customerName: preservedOrder.customerName,
    customerEmail: preservedOrder.customerEmail,
    productTitle: preservedOrder.productTitle,
    totalAmount: preservedOrder.totalAmount,
    paymentStatus: preservedOrder.paymentStatus,
    orderStatus: preservedOrder.orderStatus,
    razorpayOrderId: preservedOrder.razorpayOrderId,
    razorpayPaymentId: preservedOrder.razorpayPaymentId,
  });

  // Strict verification checks
  if (preservedOrder.razorpayPaymentId !== TARGET_PAYMENT_ID) {
    console.error(`❌ CRITICAL: Payment ID mismatch! Expected '${TARGET_PAYMENT_ID}', got '${preservedOrder.razorpayPaymentId}'. Aborting.`);
    process.exit(1);
  }
  if (preservedOrder.razorpayOrderId !== TARGET_ORDER_ID) {
    console.error(`❌ CRITICAL: Razorpay Order ID mismatch! Expected '${TARGET_ORDER_ID}', got '${preservedOrder.razorpayOrderId}'. Aborting.`);
    process.exit(1);
  }
  if (!preservedOrder.customerName.toLowerCase().includes("arif ahmed")) {
    console.error(`❌ CRITICAL: Customer name mismatch! Expected Arif Ahmed, got '${preservedOrder.customerName}'. Aborting.`);
    process.exit(1);
  }

  console.log("✅ Target order verified with 100% exact match!\n");

  // Step 2: Identify all OTHER orders to delete
  const otherOrders = await prisma.printedOrder.findMany({
    where: { id: { not: preservedOrder.id } },
    select: { id: true, orderNumber: true, customerName: true, totalAmount: true },
  });

  console.log(`Found ${otherOrders.length} test/development orders to delete:`);
  for (const o of otherOrders) {
    console.log(` - [${o.orderNumber}] ${o.customerName} (₹${o.totalAmount}) [ID: ${o.id}]`);
  }

  const otherOrderIds = otherOrders.map((o) => o.id);

  // Step 3: Delete payment transactions belonging to the deleted orders only
  const deletedTxOrders = await prisma.paymentTransaction.deleteMany({
    where: {
      printedOrderId: { in: otherOrderIds },
    },
  });
  console.log(`\nDeleted ${deletedTxOrders.count} payment transactions linked to the test orders.`);

  // Delete any unlinked test payment transactions (not belonging to preserved order)
  const deletedUnlinkedTx = await prisma.paymentTransaction.deleteMany({
    where: {
      printedOrderId: null,
      purchaseId: null,
      razorpayPaymentId: { not: TARGET_PAYMENT_ID },
    },
  });
  console.log(`Deleted ${deletedUnlinkedTx.count} unlinked test payment transactions.`);

  // Step 4: Delete the other printed orders
  const deletedOrders = await prisma.printedOrder.deleteMany({
    where: {
      id: { in: otherOrderIds },
    },
  });
  console.log(`Deleted ${deletedOrders.count} test/development printed orders.`);

  // Step 5: Verification after deletion
  console.log("\n==================================================================");
  console.log("  POST-CLEANUP VERIFICATION CHECKS                                ");
  console.log("==================================================================");

  const remainingOrders = await prisma.printedOrder.findMany({
    include: { transactions: true },
  });
  console.log(`Total Printed Orders Remaining: ${remainingOrders.length}`);

  if (remainingOrders.length !== 1) {
    console.error(`❌ Expected exactly 1 order, found ${remainingOrders.length}`);
    process.exit(1);
  }

  const singleOrder = remainingOrders[0];
  console.log("Remaining order details:");
  console.log({
    id: singleOrder.id,
    orderNumber: singleOrder.orderNumber,
    customerName: singleOrder.customerName,
    customerEmail: singleOrder.customerEmail,
    productTitle: singleOrder.productTitle,
    totalAmount: singleOrder.totalAmount,
    paymentStatus: singleOrder.paymentStatus,
    orderStatus: singleOrder.orderStatus,
    razorpayOrderId: singleOrder.razorpayOrderId,
    razorpayPaymentId: singleOrder.razorpayPaymentId,
    transactionsCount: singleOrder.transactions.length,
  });

  if (
    singleOrder.orderNumber === TARGET_ORDER_NUMBER &&
    singleOrder.razorpayPaymentId === TARGET_PAYMENT_ID &&
    singleOrder.razorpayOrderId === TARGET_ORDER_ID &&
    singleOrder.paymentStatus === "COMPLETED" &&
    singleOrder.orderStatus === "CONFIRMED"
  ) {
    console.log("\n✅ VERIFICATION PASSED: The Arif Ahmed Razorpay test order is perfectly preserved!");
  } else {
    console.error("❌ Verification failed! Preserved order properties do not match expected values.");
    process.exit(1);
  }

  // Verify non-order tables remain intact
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const problemCount = await prisma.problem.count();
  const codesCount = await prisma.problemCode.count();
  console.log(`\nIntact Database Records Check:`);
  console.log(` - Users: ${userCount}`);
  console.log(` - Categories/Topics: ${categoryCount}`);
  console.log(` - Problems: ${problemCount}`);
  console.log(` - Problem Codes: ${codesCount}`);
  console.log("==================================================================\n");
}

main()
  .catch((e) => {
    console.error("Cleanup script error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
