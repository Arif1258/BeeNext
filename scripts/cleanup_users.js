const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRESERVED_EMAILS = [
  'supportbeenext@gmail.com',
  'razorpay@gmail.com',
  'arifahmedma490@gmail.com'
];

async function main() {
  console.log("=== STARTING USER CLEANUP ===");
  console.log("Preserved Emails:", PRESERVED_EMAILS);

  // 1. Identify preserved accounts
  const preservedUsers = await prisma.user.findMany({
    where: { email: { in: PRESERVED_EMAILS } },
    select: { id: true, name: true, email: true, role: true }
  });

  console.log(`Found ${preservedUsers.length} preserved users:`);
  preservedUsers.forEach(u => {
    console.log(`- [${u.role}] ${u.name} (${u.email}) [ID: ${u.id}]`);
  });

  if (preservedUsers.length !== 3) {
    throw new Error(`Expected 3 preserved accounts, but found ${preservedUsers.length}! Aborting deletion.`);
  }

  // 2. Identify users to delete
  const usersToDelete = await prisma.user.findMany({
    where: { email: { notIn: PRESERVED_EMAILS } },
    select: { id: true, name: true, email: true, role: true }
  });

  console.log(`Found ${usersToDelete.length} accounts to delete:`);
  usersToDelete.forEach(u => {
    console.log(`- [DELETE] ${u.name} (${u.email}) [ID: ${u.id}]`);
  });

  if (usersToDelete.length === 0) {
    console.log("No accounts to delete. Database is already clean!");
    return;
  }

  const deleteIds = usersToDelete.map(u => u.id);

  // 3. Delete related records safely
  const deletedProgress = await prisma.userProgress.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`Deleted ${deletedProgress.count} user progress records.`);

  const deletedBookmarks = await prisma.bookmark.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`Deleted ${deletedBookmarks.count} bookmark records.`);

  const deletedRatings = await prisma.bookRating.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`Deleted ${deletedRatings.count} book ratings.`);

  const deletedCertOrders = await prisma.certificateOrder.deleteMany({
    where: { userId: { in: deleteIds } }
  });
  console.log(`Deleted ${deletedCertOrders.count} certificate orders.`);

  // 4. Delete the users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: deleteIds } }
  });
  console.log(`Successfully deleted ${deletedUsers.count} user accounts.`);

  // 5. Verification
  const remainingUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  console.log(`\n=== REMAINING USERS IN DATABASE (${remainingUsers.length}) ===`);
  remainingUsers.forEach(u => {
    console.log(`- [${u.role}] ${u.name} (${u.email}) [ID: ${u.id}]`);
  });

  if (remainingUsers.length !== 3) {
    throw new Error(`Integrity check failed: Expected exactly 3 users, but found ${remainingUsers.length}`);
  }

  // 6. Verify ₹10 order remains intact
  const remainingOrders = await prisma.printedOrder.findMany({
    include: { transactions: true }
  });
  console.log(`\n=== PRINTED ORDERS CHECK (${remainingOrders.length}) ===`);
  remainingOrders.forEach(o => {
    console.log(`- Order: ${o.orderNumber} | Total: ₹${o.totalAmount} | Customer: ${o.customerName} (${o.customerEmail}) | Tx count: ${o.transactions.length}`);
  });

  console.log("\n=== USER CLEANUP COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(err => {
    console.error("Cleanup error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
