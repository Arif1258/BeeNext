import prisma from '../src/lib/prisma';
import { signToken } from '../src/lib/auth';
import { GET as activityRoute } from '../src/app/api/user/activity/route';

async function testActivityEndpoint() {
  console.log('=== TESTING USER ACTIVITY HEATMAP API ===\n');

  // 1. Unauthenticated test
  console.log('--- 1. Testing Unauthenticated Request ---');
  const unauthReq = new Request('http://localhost:3000/api/user/activity');
  const unauthRes = await activityRoute(unauthReq);
  const unauthData = await unauthRes.json();
  console.log('Unauthenticated response:', unauthData);
  if (unauthData.isAuthenticated !== false || unauthData.totalActiveDays !== 0) {
    throw new Error('Unauthenticated check failed!');
  }
  console.log('✓ Unauthenticated request gracefully returns empty activity.\n');

  // 2. Authenticated test with Arif Ahmed (5 active days in DB)
  console.log('--- 2. Testing Authenticated User: Arif Ahmed ---');
  const arifUser = await prisma.user.findFirst({
    where: { email: 'arifahmedma490@gmail.com' },
  });
  if (!arifUser) throw new Error('Arif Ahmed not found!');

  const arifToken = signToken({
    id: arifUser.id,
    name: arifUser.name,
    email: arifUser.email,
    role: arifUser.role,
  });

  const arifReq = new Request('http://localhost:3000/api/user/activity', {
    headers: { cookie: `beenext_token=${arifToken}` },
  });
  const arifRes = await activityRoute(arifReq);
  const arifData = await arifRes.json();

  console.log(`- isAuthenticated: ${arifData.isAuthenticated}`);
  console.log(`- totalActiveDays: ${arifData.totalActiveDays}`);
  console.log(`- maxStreak: ${arifData.maxStreak}`);
  console.log(`- totalSolved: ${arifData.totalSolved}`);
  console.log(`- Sample activity days:`, Object.entries(arifData.activity).slice(0, 5));
  console.log(`- Difficulty breakdown:`, arifData.difficulty);

  if (!arifData.isAuthenticated || arifData.totalActiveDays !== 5 || arifData.maxStreak !== 4) {
    throw new Error(`Activity calculation failed: expected 5 active days and 4 max streak, got ${arifData.totalActiveDays} and ${arifData.maxStreak}`);
  }
  if (!arifData.difficulty || arifData.difficulty.easy.solved !== 93 || arifData.difficulty.medium.solved !== 248 || arifData.difficulty.hard.solved !== 81) {
    throw new Error(`Difficulty calculation failed: ${JSON.stringify(arifData.difficulty)}`);
  }
  console.log('✓ Authenticated user activity matches exact database history!\n');

  // 3. Authenticated test with BeeNext Administrator (5 active days in DB)
  console.log('--- 3. Testing Authenticated User: BeeNext Administrator ---');
  const adminUser = await prisma.user.findFirst({
    where: { email: 'supportbeenext@gmail.com' },
  });
  if (!adminUser) throw new Error('Admin user not found!');

  const adminToken = signToken({
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
  });

  const adminReq = new Request('http://localhost:3000/api/user/activity', {
    headers: { cookie: `beenext_token=${adminToken}` },
  });
  const adminRes = await activityRoute(adminReq);
  const adminData = await adminRes.json();

  console.log(`- isAuthenticated: ${adminData.isAuthenticated}`);
  console.log(`- totalActiveDays: ${adminData.totalActiveDays}`);
  console.log(`- maxStreak: ${adminData.maxStreak}`);
  console.log(`- totalSolved: ${adminData.totalSolved}`);
  console.log(`- Activity days:`, adminData.activity);

  if (!adminData.isAuthenticated || adminData.totalActiveDays !== 5 || adminData.maxStreak !== 4) {
    throw new Error(`Admin activity calculation failed!`);
  }
  console.log('✓ Admin user activity verified!\n');

  console.log('=== ALL ACTIVITY API TESTS PASSED 100%! ===\n');
  await prisma.$disconnect();
}

testActivityEndpoint().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
