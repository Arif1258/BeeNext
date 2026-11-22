import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9580 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_clean_checkout_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 400));
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

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res?.result?.result?.value;
  };

  const takeScreenshot = async (filename) => {
    const shot = await send('Page.captureScreenshot');
    const base64 = shot?.result?.data || shot?.data;
    if (base64) {
      fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(base64, 'base64'));
      console.log(`   Saved ${filename}`);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');

  // 1. Desktop view: open Checkout modal
  console.log("1. Opening Checkout Modal on Desktop (1440px)...");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  // Click Order Now on OOPS
  await evaluate(`
    (() => {
      const oopsCard = Array.from(document.querySelectorAll('.shadow-card')).find(c => c.textContent && c.textContent.includes('OOPS (16 Pages)'));
      if (oopsCard) {
        const orderBtn = Array.from(oopsCard.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Order Now'));
        if (orderBtn) orderBtn.click();
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  // Inspect form labels and placeholders
  const formFields = await evaluate(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input[name]'));
      return inputs.map(i => {
        const labelEl = i.closest('div')?.querySelector('label');
        return {
          name: i.name,
          label: labelEl ? labelEl.textContent.trim() : '',
          placeholder: i.placeholder
        };
      });
    })()
  `);
  console.log("   Form fields inspected:", JSON.stringify(formFields, null, 2));

  await takeScreenshot('clean_checkout_modal_desktop.png');

  // 2. Mobile view (390px)
  console.log("2. Mobile View (390px)...");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));

  await takeScreenshot('clean_checkout_modal_mobile.png');

  chrome.kill();
  console.log("=== CLEAN CHECKOUT MODAL SCREENSHOTS CAPTURED ===");
}

run().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});
