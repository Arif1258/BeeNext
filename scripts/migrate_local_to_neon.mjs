import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load local .env
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const localUrl = process.env.DATABASE_URL;
const neonUrl = "postgresql://neondb_owner:npg_HLw30PRysMpk@ep-calm-bread-bevh8a8f-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";

const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
const neon = new PrismaClient({ datasources: { db: { url: neonUrl } } });

async function chunkAndInsert(modelName, data, chunkSize = 100) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await neon[modelName].createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
}

async function runMigration() {
  console.log("=================================================");
  console.log("STARTING SAFE DATA MIGRATION: LOCAL -> NEON");
  console.log("=================================================");

  // 1. BundleConfig
  console.log("1. Migrating BundleConfig...");
  const bundleConfigs = await local.bundleConfig.findMany();
  if (bundleConfigs.length > 0) {
    await chunkAndInsert('bundleConfig', bundleConfigs);
  }
  console.log(`   Migrated ${bundleConfigs.length} bundleConfigs.`);

  // 2. PrintedProductConfig
  console.log("2. Migrating PrintedProductConfig...");
  const printedConfigs = await local.printedProductConfig.findMany();
  if (printedConfigs.length > 0) {
    await chunkAndInsert('printedProductConfig', printedConfigs);
  }
  console.log(`   Migrated ${printedConfigs.length} printedProductConfigs.`);

  // 3. HomepageSampleImage
  console.log("3. Migrating HomepageSampleImage...");
  const sampleImages = await local.homepageSampleImage.findMany();
  if (sampleImages.length > 0) {
    await chunkAndInsert('homepageSampleImage', sampleImages);
  }
  console.log(`   Migrated ${sampleImages.length} sample images.`);

  // 4. Users (includes Admin and Arif Ahmed)
  console.log("4. Migrating Users...");
  const users = await local.user.findMany();
  await chunkAndInsert('user', users);
  console.log(`   Migrated ${users.length} users.`);

  // 5. Categories
  console.log("5. Migrating Categories...");
  const categories = await local.category.findMany();
  await chunkAndInsert('category', categories);
  console.log(`   Migrated ${categories.length} categories.`);

  // 6. Problems
  console.log("6. Migrating Problems...");
  const problems = await local.problem.findMany();
  await chunkAndInsert('problem', problems, 100);
  console.log(`   Migrated ${problems.length} problems.`);

  // 7. ProblemCode
  console.log("7. Migrating ProblemCode...");
  const problemCodes = await local.problemCode.findMany();
  await chunkAndInsert('problemCode', problemCodes, 100);
  console.log(`   Migrated ${problemCodes.length} problem solutions.`);

  // 8. HandwrittenNotes
  console.log("8. Migrating HandwrittenNotes...");
  const handwrittenNotes = await local.handwrittenNote.findMany();
  if (handwrittenNotes.length > 0) {
    await chunkAndInsert('handwrittenNote', handwrittenNotes, 50);
  }
  console.log(`   Migrated ${handwrittenNotes.length} handwritten notes.`);

  // 9. UserProgress
  console.log("9. Migrating UserProgress...");
  const userProgresses = await local.userProgress.findMany();
  if (userProgresses.length > 0) {
    await chunkAndInsert('userProgress', userProgresses, 100);
  }
  console.log(`   Migrated ${userProgresses.length} user progress records.`);

  // 10. PrintedOrder (Arif Ahmed's order: BN-ORD-043683-2126)
  console.log("10. Migrating PrintedOrders (Preserving Arif Ahmed order)...");
  const printedOrders = await local.printedOrder.findMany();
  for (const ord of printedOrders) {
    await neon.printedOrder.upsert({
      where: { id: ord.id },
      create: ord,
      update: ord,
    });
  }
  console.log(`   Migrated ${printedOrders.length} printed orders.`);

  // 11. PaymentTransactions (pay_U3H7x5UKq9YNzY)
  console.log("11. Migrating PaymentTransactions...");
  const transactions = await local.paymentTransaction.findMany();
  for (const tx of transactions) {
    await neon.paymentTransaction.upsert({
      where: { id: tx.id },
      create: tx,
      update: tx,
    });
  }
  console.log(`   Migrated ${transactions.length} payment transactions.`);

  // VERIFICATION
  console.log("\n=================================================");
  console.log("VERIFYING NEON PRODUCTION DATABASE RECORDS");
  console.log("=================================================");
  const neonCounts = {
    users: await neon.user.count(),
    categories: await neon.category.count(),
    problems: await neon.problem.count(),
    problemCodes: await neon.problemCode.count(),
    handwrittenNotes: await neon.handwrittenNote.count(),
    userProgresses: await neon.userProgress.count(),
    printedOrders: await neon.printedOrder.count(),
    paymentTransactions: await neon.paymentTransaction.count(),
    bundleConfigs: await neon.bundleConfig.count(),
    printedProductConfigs: await neon.printedProductConfig.count(),
    homepageSampleImages: await neon.homepageSampleImage.count(),
  };

  console.log("Neon Production Record Counts:", JSON.stringify(neonCounts, null, 2));

  // Verify Arif Ahmed's order specifically
  const arifOrder = await neon.printedOrder.findUnique({
    where: { orderNumber: "BN-ORD-043683-2126" },
    include: { transactions: true }
  });

  if (!arifOrder) {
    throw new Error("CRITICAL: Arif Ahmed order was not found in Neon database!");
  }

  console.log("\n--- ARIF AHMED PRESERVED ORDER VERIFIED ON NEON ---");
  console.log("Order ID:", arifOrder.id);
  console.log("Order Number:", arifOrder.orderNumber);
  console.log("Customer:", arifOrder.customerName, `(${arifOrder.customerEmail})`);
  console.log("Amount:", `₹${arifOrder.totalAmount}`);
  console.log("Product:", arifOrder.productTitle);
  console.log("Payment Status:", arifOrder.paymentStatus);
  console.log("Razorpay Order ID:", arifOrder.razorpayOrderId);
  console.log("Razorpay Payment ID:", arifOrder.razorpayPaymentId);
  console.log("Transactions Count:", arifOrder.transactions.length);
  arifOrder.transactions.forEach(t => {
    console.log(`  - Tx ID: ${t.id}, Payment ID: ${t.razorpayPaymentId}, Status: ${t.status}, Amount: ₹${t.amount}`);
  });

  console.log("\n=== NEON MIGRATION AND VERIFICATION COMPLETED SUCCESSFULLY ===");
}

runMigration()
  .catch(err => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await neon.$disconnect();
  });
