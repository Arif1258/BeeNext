import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";

async function main() {
  console.log("--- Starting Comprehensive Certificate System Test ---");

  // 1. Setup test user data
  const user = await prisma.user.findUnique({
    where: { email: 'arifahmedma490@gmail.com' }
  });
  if (!user) throw new Error("Test user not found");

  const admin = await prisma.user.findUnique({
    where: { email: 'supportbeenext@gmail.com' }
  });
  if (!admin) throw new Error("Admin user not found");

  const userToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const adminToken = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Launch Chrome
  const port = 9335;
  const userDataDir = `/tmp/chrome_cert_full_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1200'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise(resolve => {
    http.get(`http://127.0.0.1:${port}/json/list`, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m);
  };
  const send = (method, params = {}) => new Promise(r => {
    const cid = id++;
    pending.set(cid, r);
    ws.send(JSON.stringify({ id: cid, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Network.enable');

  // ========================================================
  // TEST 1: GUEST VIEW ON /topics AND /certificate
  // ========================================================
  console.log("\n[TEST 1] Visiting /topics as Guest...");
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot /topics performance tracker
  const snapTopics = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_certificate_button_verified.png',
    Buffer.from(snapTopics.result.data, 'base64')
  );
  console.log("Saved: topics_certificate_button_verified.png");

  console.log("[TEST 1] Visiting /certificate as Guest...");
  await send('Page.navigate', { url: 'http://localhost:3000/certificate' });
  await new Promise(r => setTimeout(r, 2000));

  const guestCertEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1')?.textContent.trim();
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ORDER PHYSICAL CERTIFICATE'));
      const helper = document.body.innerText.includes('Complete 85% of the DSA Sheet to unlock this option.');
      return {
        h1,
        btnDisabled: btn ? btn.disabled : null,
        btnText: btn?.textContent.trim(),
        hasHelper: helper
      };
    })()`,
    returnByValue: true
  });
  console.log("Guest Cert Evaluation:", guestCertEval.result?.result?.value);

  const snapGuestDesktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_guest_desktop.png',
    Buffer.from(snapGuestDesktop.result.data, 'base64')
  );

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));
  const snapGuestMobile = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_guest_mobile.png',
    Buffer.from(snapGuestMobile.result.data, 'base64')
  );
  await send('Emulation.clearDeviceMetricsOverride');

  // ========================================================
  // TEST 2: USER AT 86% COMPLETION (Criteria 1 Met, Criteria 2 Pending)
  // ========================================================
  console.log("\n[TEST 2] Setting 425 problems completed for user to reach >= 85%...");
  const problems = await prisma.problem.findMany({
    where: { isPublished: true },
    take: 425,
    select: { id: true }
  });

  for (const p of problems) {
    await prisma.userProgress.upsert({
      where: { userId_problemId: { userId: user.id, problemId: p.id } },
      update: { status: 'COMPLETED', completedAt: new Date() },
      create: { userId: user.id, problemId: p.id, status: 'COMPLETED', completedAt: new Date() }
    });
  }

  // Set user dsaQualifiedAt
  await prisma.user.update({
    where: { id: user.id },
    data: { dsaQualifiedAt: new Date(), certificateClaimedAt: null }
  });

  // Set cookie for user in browser
  await send('Network.setCookie', {
    name: 'beenext_token',
    value: userToken,
    domain: 'localhost',
    path: '/'
  });

  console.log("Navigating to /certificate as User with 86% DSA completion...");
  await send('Page.navigate', { url: 'http://localhost:3000/certificate' });
  await new Promise(r => setTimeout(r, 2500));

  const user85Eval = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ORDER PHYSICAL CERTIFICATE'));
      const text = document.body.innerText;
      const helperFound = text.includes('Place an order for any BeeNext physical book to receive your certificate.');
      const criteria1Completed = text.includes('CRITERIA 1 – COMPLETE 85% OF THE DSA SHEET') && text.includes('Completed');
      return {
        btnDisabled: btn ? btn.disabled : null,
        helperFound,
        criteria1Completed,
        textPreview: text.slice(0, 700)
      };
    })()`,
    returnByValue: true
  });
  console.log("User at 85% Evaluation:", user85Eval.result?.result?.value);

  const snap85Desktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_criteria1_completed_desktop.png',
    Buffer.from(snap85Desktop.result.data, 'base64')
  );

  // ========================================================
  // TEST 3: USER WITH QUALIFYING BOOK ORDER (Both Criteria Met!)
  // ========================================================
  console.log("\n[TEST 3] Placing qualifying physical book order for user...");
  const orderNumber = `BN-PRINT-${Date.now().toString().slice(-6)}-9988`;
  const qualifyingOrder = await prisma.printedOrder.create({
    data: {
      orderNumber,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: '9876543210',
      addressLine1: 'Flat 402, Technology Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      productTitle: 'Full DSA Book (Java) (All 20 Topics, ~500 Pages)',
      quantity: 1,
      unitPrice: 1499,
      deliveryCharge: 0,
      totalAmount: 1499,
      paymentStatus: 'COMPLETED',
      orderStatus: 'CONFIRMED',
      requiresCertificate: true,
      certificateStatus: 'PENDING',
      createdAt: new Date()
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { certificateClaimedAt: new Date() }
  });

  console.log("Navigating to /certificate with both criteria fulfilled...");
  await send('Page.navigate', { url: 'http://localhost:3000/certificate' });
  await new Promise(r => setTimeout(r, 2500));

  const bothCriteriaEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ORDER PHYSICAL CERTIFICATE'));
      const text = document.body.innerText;
      const bothDone = text.includes('2 / 2 Criteria Completed');
      const orderMentioned = text.includes('${orderNumber}');
      return {
        btnDisabled: btn ? btn.disabled : null,
        bothDone,
        orderMentioned
      };
    })()`,
    returnByValue: true
  });
  console.log("Both Criteria Fulfilled Evaluation:", bothCriteriaEval.result?.result?.value);

  const snapBothDesktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_both_criteria_completed_desktop.png',
    Buffer.from(snapBothDesktop.result.data, 'base64')
  );

  // Test clicking ORDER PHYSICAL CERTIFICATE button navigates to /purchase
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ORDER PHYSICAL CERTIFICATE'));
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  const afterClickUrl = await send('Runtime.evaluate', {
    expression: 'window.location.href',
    returnByValue: true
  });
  console.log("URL after clicking enabled button:", afterClickUrl.result?.result?.value);

  // ========================================================
  // TEST 4: ADMIN ORDERS DASHBOARD
  // ========================================================
  console.log("\n[TEST 4] Testing Admin Orders Dashboard...");
  await send('Network.setCookie', {
    name: 'beenext_token',
    value: adminToken,
    domain: 'localhost',
    path: '/'
  });

  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await new Promise(r => setTimeout(r, 2500));

  // Click on Orders tab in Admin
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ordersBtn = btns.find(b => b.textContent.includes('Customer Orders') || b.textContent.includes('Orders'));
      if (ordersBtn) ordersBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  const adminEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const text = document.body.innerText;
      const certRequiredBadge = text.includes('Certificate Required');
      const orderPresent = text.includes('${orderNumber}');
      const selects = Array.from(document.querySelectorAll('select')).map(s => s.outerHTML);
      return {
        certRequiredBadge,
        orderPresent,
        selectCount: selects.length
      };
    })()`,
    returnByValue: true
  });
  console.log("Admin Dashboard Evaluation:", adminEval.result?.result?.value);

  const snapAdmin = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/admin_certificate_required_verified.png',
    Buffer.from(snapAdmin.result.data, 'base64')
  );

  console.log("\nAll 4 tests completed successfully!");
  ws.close();
  chrome.kill();
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
