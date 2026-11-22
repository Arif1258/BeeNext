import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9520 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_compact_${Date.now()}`;
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

  // 1. Desktop Test (1440px)
  console.log("1. Desktop View (1440px)...");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  // Check overflow on CS, DB, HR boxes
  const overflowCheckDesktop = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      return cards.map(c => {
        const title = c.querySelector('h2, h4')?.textContent?.trim();
        const clientWidth = c.clientWidth;
        const scrollWidth = c.scrollWidth;
        const isOverflowing = scrollWidth > clientWidth + 1;
        return { title, clientWidth, scrollWidth, isOverflowing };
      });
    })()
  `);
  console.log("   Desktop Overflow check results:");
  overflowCheckDesktop.forEach(c => {
    if (c.title) {
      console.log(`     - [${c.title}]: clientWidth=${c.clientWidth}px, scrollWidth=${c.scrollWidth}px, overflowing=${c.isOverflowing}`);
    }
  });

  await takeScreenshot('purchase_boxes_desktop_layout.png');

  // 2. Test clicking the cart icon on OOPS
  console.log("2. Testing cart icon click on OOPS...");
  const clickRes = await evaluate(`
    (() => {
      const btn = document.querySelector('button[aria-label="Add OOPS (16 Pages) to Cart"]');
      if (btn) {
        btn.click();
        return { clicked: true, title: btn.getAttribute('title'), ariaLabel: btn.getAttribute('aria-label') };
      }
      return { clicked: false };
    })()
  `);
  console.log("   Click result:", JSON.stringify(clickRes));
  await new Promise(r => setTimeout(r, 600));

  await takeScreenshot('purchase_cart_icon_clicked.png');

  // Verify cart item in localStorage
  const cartData = await evaluate(`JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]')`);
  console.log("   Cart item stored:", cartData[0]?.title, "Quantity:", cartData[0]?.quantity);

  // 3. Mobile Test (390px - iPhone 12/13/14)
  console.log("3. Mobile View (390px)...");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1000));

  const overflowCheckMobile = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      return cards.map(c => {
        const title = c.querySelector('h2, h4')?.textContent?.trim();
        const clientWidth = c.clientWidth;
        const scrollWidth = c.scrollWidth;
        const isOverflowing = scrollWidth > clientWidth + 1;
        return { title, clientWidth, scrollWidth, isOverflowing };
      });
    })()
  `);
  console.log("   Mobile Overflow check results:");
  overflowCheckMobile.forEach(c => {
    if (c.title) {
      console.log(`     - [${c.title}]: clientWidth=${c.clientWidth}px, scrollWidth=${c.scrollWidth}px, overflowing=${c.isOverflowing}`);
    }
  });

  await takeScreenshot('purchase_boxes_mobile_layout.png');

  chrome.kill();
  console.log("=== COMPACT CART ICON & OVERFLOW VERIFICATION COMPLETE ===");
}

run().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
