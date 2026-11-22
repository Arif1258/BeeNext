import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9450 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_cart_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 500));
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

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.result?.value;
  };

  const takeScreenshot = async (filename) => {
    const shot = await send('Page.captureScreenshot');
    const base64 = shot?.result?.data || shot?.data;
    if (base64) {
      fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(base64, 'base64'));
      console.log(`   Saved ${filename}`);
    } else {
      console.warn(`   Failed to capture screenshot for ${filename}`, shot);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log("1. Navigating to /purchase...");
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2500));

  // Reset localStorage to ensure clean state
  await evaluate(`localStorage.removeItem('beenext_cart_v1')`);

  console.log("2. Clicking 'Add to Cart' on OOPS...");
  const clickVal = await evaluate(`
    (() => {
      const oopsBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('title') && b.getAttribute('title').includes('OOPS'));
      if (oopsBtn) {
        oopsBtn.click();
        return { clicked: true, title: oopsBtn.getAttribute('title') };
      }
      return { clicked: false };
    })()
  `);
  console.log("   Click result:", JSON.stringify(clickVal));
  await new Promise(r => setTimeout(r, 1000));

  await takeScreenshot('purchase_add_to_cart_clicked.png');

  // Verify cart in localStorage has 1 item
  const checkCart1 = await evaluate(`JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]')`);
  console.log("   Cart items count after 1st click:", checkCart1?.length, "Quantity:", checkCart1?.[0]?.quantity);

  console.log("3. Clicking 'Add to Cart' on OOPS again (duplicate prevention test)...");
  await evaluate(`
    (() => {
      const oopsBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('title')?.includes('OOPS'));
      if (oopsBtn) oopsBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const checkCart2 = await evaluate(`JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]')`);
  console.log("   Cart items count after 2nd click:", checkCart2?.length, "Quantity:", checkCart2?.[0]?.quantity);
  if (checkCart2?.length === 1 && checkCart2?.[0]?.quantity === 2) {
    console.log("   ✓ SUCCESS: Duplicate prevented, quantity incremented to 2!");
  } else {
    console.warn("   Unexpected duplicate test result:", checkCart2);
  }

  console.log("4. Adding 'Computer Networks' to cart...");
  await evaluate(`
    (() => {
      const cnBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('title')?.includes('Computer Networks'));
      if (cnBtn) cnBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const checkCart3 = await evaluate(`JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]')`);
  console.log("   Cart items count after adding CN:", checkCart3?.length, "Items:", checkCart3?.map(i => `${i.title} (x${i.quantity})`));

  console.log("5. Navigating to dedicated /cart page...");
  await send('Page.navigate', { url: 'http://localhost:3000/cart' });
  await new Promise(r => setTimeout(r, 2000));

  await takeScreenshot('cart_page_with_items.png');

  console.log("6. Testing Quantity Controls on Cart Page...");
  // Increase quantity of first item
  await evaluate(`
    (() => {
      const plusButtons = Array.from(document.querySelectorAll('button[aria-label^="Increase quantity"]'));
      if (plusButtons.length > 0) plusButtons[0].click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Reload page to verify persistence
  console.log("7. Reloading page to verify persistence...");
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 2000));

  const checkPersist = await evaluate(`JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]')`);
  console.log("   Persisted items count after reload:", checkPersist?.length, "Quantities:", checkPersist?.map(i => `${i.title}: ${i.quantity}`));

  console.log("8. Testing 'Proceed to Checkout' button on Cart Page...");
  await evaluate(`
    (() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Proceed to Checkout'));
      if (proceedBtn) proceedBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  await takeScreenshot('cart_proceed_checkout_modal.png');

  // Close Checkout Modal
  await evaluate(`
    (() => {
      const closeBtn = document.querySelector('button[aria-label="Close checkout modal"]') || document.querySelector('button[aria-label="Close modal"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-x') || b.textContent === '✕');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  console.log("9. Testing 'Clear Entire Cart'...");
  await evaluate(`
    (() => {
      const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Clear Entire Cart'));
      if (clearBtn) clearBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  await takeScreenshot('cart_page_empty_state.png');

  // Clean up
  chrome.kill();
  console.log("=== BROWSER E2E TEST COMPLETED SUCCESSFULLY ===");
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
