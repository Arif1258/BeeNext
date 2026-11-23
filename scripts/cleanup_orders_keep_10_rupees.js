const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING ORDERS BEFORE CLEANUP ===");

  const allPrintedOrders = await prisma.printedOrder.findMany({
    select: { id: true, orderNumber: true, totalAmount: true, customerEmail: true, productTitle: true }
  });
  console.log(`Found ${allPrintedOrders.length} total printed orders.`);

  const tenRupeeOrders = allPrintedOrders.filter(o => o.totalAmount === 10);
  console.log(`Found ${tenRupeeOrders.length} order(s) worth ₹10:`, tenRupeeOrders);

  if (tenRupeeOrders.length === 0) {
    throw new Error("ABORTING: No ₹10 order found to retain!");
  }

  const orderToRetain = tenRupeeOrders[0];
  console.log("\nRetaining this exact order:", orderToRetain);

  const ordersToDelete = allPrintedOrders.filter(o => o.id !== orderToRetain.id);
  console.log(`Number of orders to delete: ${ordersToDelete.length}`);

  const certOrders = await prisma.certificateOrder.findMany({
    select: { id: true, orderNumber: true, printedOrderId: true, customerEmail: true }
  });
  console.log(`Found ${certOrders.length} certificate orders.`);

  // Perform deletion safely in a transaction
  console.log("\nExecuting deletion...");
  await prisma.$transaction(async (tx) => {
    // 1. Delete certificate orders
    const deletedCerts = await tx.certificateOrder.deleteMany({
      where: {
        printedOrderId: {
          not: orderToRetain.id,
        }
      }
    });
    console.log(`Deleted ${deletedCerts.count} certificate orders.`);

    // 2. Delete payment transactions for other orders
    const deletedTx = await tx.paymentTransaction.deleteMany({
      where: {
        printedOrderId: {
          not: orderToRetain.id,
        }
      }
    });
    console.log(`Deleted ${deletedTx.count} payment transactions.`);

    // 3. Delete all other printed orders
    const deletedOrders = await tx.printedOrder.deleteMany({
      where: {
        id: {
          not: orderToRetain.id,
        }
      }
    });
    console.log(`Deleted ${deletedOrders.count} printed orders.`);
  });

  // Verify post-deletion state
  console.log("\n=== POST-CLEANUP VERIFICATION ===");
  const remainingOrders = await prisma.printedOrder.findMany({
    include: {
      transactions: true,
      user: { select: { id: true, name: true, email: true } },
    }
  });

  console.log(`Remaining printed orders count: ${remainingOrders.length}`);
  if (remainingOrders.length !== 1) {
    throw new Error(`VERIFICATION FAILED: Expected exactly 1 order, found ${remainingOrders.length}`);
  }

  const remaining = remainingOrders[0];
  console.log("Remaining order details:", {
    id: remaining.id,
    orderNumber: remaining.orderNumber,
    totalAmount: remaining.totalAmount,
    productTitle: remaining.productTitle,
    customerName: remaining.customerName,
    customerEmail: remaining.customerEmail,
    paymentStatus: remaining.paymentStatus,
    orderStatus: remaining.orderStatus,
    transactionsCount: remaining.transactions.length,
    userEmail: remaining.user?.email,
  });

  if (remaining.totalAmount !== 10) {
    throw new Error(`VERIFICATION FAILED: Expected total amount to be ₹10, found ₹${remaining.totalAmount}`);
  }

  console.log("✓ VERIFICATION SUCCESSFUL: Exactly one ₹10 order remains in the database!");
}

main().catch((err) => {
  console.error("Error during order cleanup:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
