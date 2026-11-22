import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9396;
  const userDataDir = `/tmp/chrome_checkout_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      list = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
      });
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = e => {
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });

  // 1. Capture Purchase Page with Cart Icon
  console.log("Navigating to /purchase...");
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  // Add an item to cart via localStorage & trigger render
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('beenext_cart_v1', JSON.stringify([
        {
          id: 'COMPLETE_BOOK_full-dsa-book_Java',
          slug: 'full-dsa-book',
          productType: 'COMPLETE_BOOK',
          title: 'Full DSA Book – Java (All 20 Sections, ~500 Pages)',
          language: 'Java',
          price: 1499,
          quantity: 1,
          pages: 500,
          sections: 20
        },
        {
          id: 'TOPIC_arrays_Java',
          slug: 'arrays',
          productType: 'TOPIC',
          title: 'Arrays (Java) – Book',
          language: 'Java',
          price: 139,
          quantity: 2
        }
      ]));
      window.location.reload();
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  let shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/cart_navbar_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured cart_navbar_desktop.png");

  // 2. Open Cart Drawer
  await send('Runtime.evaluate', {
    expression: `
      const cartBtn = document.querySelector('button[title="Shopping Cart"]');
      if (cartBtn) cartBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/cart_drawer_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured cart_drawer_desktop.png");

  // 3. Open Checkout Modal
  await send('Runtime.evaluate', {
    expression: `
      const proceedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Proceed to Checkout'));
      if (proceedBtn) proceedBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/checkout_modal_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured checkout_modal_desktop.png");

  // 4. Capture Mobile Checkout Modal
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/checkout_modal_mobile.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured checkout_modal_mobile.png");

  // Reset viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });

  // 5. Capture Payment Success Page
  // Get an existing order number from DB
  const res = await fetch('http://localhost:3000/api/admin/printed-orders');
  const ordData = await res.json();
  const sampleOrder = ordData?.orders?.[0]?.orderNumber || 'BN-ORD-TEST';

  console.log(`Navigating to /checkout/success?orderNumber=${sampleOrder}...`);
  await send('Page.navigate', { url: `http://localhost:3000/checkout/success?orderNumber=${sampleOrder}` });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/checkout_success_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured checkout_success_desktop.png");

  // 6. Capture Payment Failed Page
  await send('Page.navigate', { url: `http://localhost:3000/checkout/failed?orderNumber=${sampleOrder}&error=Payment%20declined%20by%20bank` });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/checkout_failed_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured checkout_failed_desktop.png");

  // 7. Capture Payment Cancelled Page
  await send('Page.navigate', { url: `http://localhost:3000/checkout/cancelled?orderNumber=${sampleOrder}` });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/checkout_cancelled_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured checkout_cancelled_desktop.png");

  // 8. Capture Admin Dashboard Orders Section
  // Login as admin first
  console.log("Logging into admin...");
  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await new Promise(r => setTimeout(r, 1500));
  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        if (emailInput && passInput) {
          emailInput.value = 'supportbeenext@gmail.com';
          passInput.value = 'your_secure_admin_password';
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          passInput.dispatchEvent(new Event('input', { bubbles: true }));
          const submitBtn = document.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.click();
        }
      })();
    `
  });
  await new Promise(r => setTimeout(r, 2000));

  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await new Promise(r => setTimeout(r, 2000));
  // Switch to ORDERS tab
  await send('Runtime.evaluate', {
    expression: `
      const ordersTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Orders'));
      if (ordersTab) ordersTab.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/admin_orders_desktop.png`, Buffer.from(shot.result.data, 'base64'));
  console.log("Captured admin_orders_desktop.png");

  ws.close();
  chrome.kill();
  console.log("All screenshots captured successfully!");
}

run().catch(console.error);
