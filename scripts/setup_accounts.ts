import prisma from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";
import { Role } from "@prisma/client";

async function main() {
  console.log("==================================================");
  console.log("CONFIGURING BEENEXT AUTHENTICATION ACCOUNTS");
  console.log("==================================================");

  const adminEmail = (process.env.ADMIN_EMAIL || "supportbeenext@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "BeeNext Administrator";

  const customerEmail = (process.env.CUSTOMER_EMAIL || "arifahmedma490@gmail.com").toLowerCase().trim();
  const customerPassword = process.env.CUSTOMER_PASSWORD;
  const customerName = process.env.CUSTOMER_NAME || "Arif Ahmed";

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD must be provided via environment configuration (.env)");
  }
  if (!customerPassword) {
    throw new Error("CUSTOMER_PASSWORD must be provided via environment configuration (.env)");
  }

  console.log(`Setting up Admin: ${adminEmail}`);
  console.log(`Setting up Customer: ${customerEmail}`);

  const adminHash = await hashPassword(adminPassword);
  const customerHash = await hashPassword(customerPassword);

  // 1. Upsert Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: adminHash,
      role: Role.ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`✓ Admin account configured: ${adminUser.email} (Role: ${adminUser.role})`);

  // 2. Upsert Customer Account (Strictly Role.USER / non-admin)
  const customerUser = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      name: customerName,
      passwordHash: customerHash,
      role: Role.USER,
    },
    create: {
      email: customerEmail,
      name: customerName,
      passwordHash: customerHash,
      role: Role.USER,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`✓ Customer account configured: ${customerUser.email} (Role: ${customerUser.role})`);

  // 3. Revoke ADMIN privileges from all other accounts
  const revoked = await prisma.user.updateMany({
    where: {
      email: { not: adminEmail },
      role: Role.ADMIN,
    },
    data: {
      role: Role.USER,
    },
  });
  console.log(`✓ Revoked ADMIN role from ${revoked.count} other account(s).`);

  // 4. Verify all admin accounts in DB
  const currentAdmins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log("Current verified ADMIN accounts in DB:", currentAdmins);

  if (currentAdmins.length !== 1 || currentAdmins[0].email !== adminEmail) {
    throw new Error(`Expected exactly 1 admin account (${adminEmail}), but found: ${JSON.stringify(currentAdmins)}`);
  }
  console.log(`✓ ONLY ${adminEmail} retains ADMIN privileges.`);

  console.log("\n==================================================");
  console.log("ACCOUNT CONFIGURATION COMPLETE! ✓");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Account setup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
