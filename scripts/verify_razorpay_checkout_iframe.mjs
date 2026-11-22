import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9397;
  const userDataDir = `/tmp/chrome_rzp_live_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
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

  if (!list || list.length === 0) {
    throw new Error("Could not connect to Chrome debugging port");
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
  await send('Runtime.enable');

  console.log("Navigating to /purchase...");
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Full DSA Book with Java and trigger checkout
  console.log("Triggering Checkout for Full DSA Book (Java)...");
  await send('Runtime.evaluate', {
    expression: `
      // Open Full Book Option
      const buttons = Array.from(document.querySelectorAll('button'));
      const orderNowBtn = buttons.find(b => b.textContent.includes('Order Now'));
      if (orderNowBtn) orderNowBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Select language Java and open checkout
  await send('Runtime.evaluate', {
    expression: `
      const javaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Java'));
      if (javaBtn) javaBtn.click();
      const orderJava = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Order Java Book') || b.textContent.includes('Order Now'));
      if (orderJava) orderJava.click();
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Fill in delivery form
  console.log("Filling in customer shipping address...");
  await send('Runtime.evaluate', {
    expression: `
      const setVal = (name, val) => {
        const el = document.querySelector(\`input[name="\${name}"]\`);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      setVal('customerName', 'Arif Ahmed (Test)');
      setVal('customerEmail', 'arifahmedma490@gmail.com');
      setVal('customerPhone', '9876543210');
      setVal('addressLine1', '402 BeeNext Tech Tower, Salt Lake Sector V');
      setVal('city', 'Kolkata');
      setVal('state', 'West Bengal');
      setVal('postalCode', '700091');
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Pay via Razorpay
  console.log("Submitting order to initiate Razorpay Standard Checkout...");
  await send('Runtime.evaluate', {
    expression: `
      const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pay') && b.textContent.includes('Razorpay'));
      if (payBtn) payBtn.click();
    `
  });

  // Wait for Razorpay checkout iframe to load from https://api.razorpay.com
  console.log("Waiting for Razorpay Standard Checkout iframe to load...");
  let hasRzpFrame = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const check = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('iframe.razorpay-checkout-frame') || document.querySelector('iframe[src*="razorpay.com"]'))`
    });
    if (check.result?.value) {
      hasRzpFrame = true;
      console.log("✅ Razorpay Checkout iframe successfully injected into page!");
      break;
    }
  }

  // Allow iframe contents to render
  await new Promise(r => setTimeout(r, 2000));

  // Capture screenshot of Razorpay checkout popup
  const shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/razorpay_standard_checkout_live_test.png`, Buffer.from(shot.result.data, 'base64'));
  console.log(`Captured ${ARTIFACT_DIR}/razorpay_standard_checkout_live_test.png`);

  ws.close();
  chrome.kill();
}

run().catch(console.error);
