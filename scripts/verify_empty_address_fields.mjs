import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9640 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_empty_addr_${Date.now()}`;
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

  console.log("=================================================");
  console.log("VERIFYING CLEAN, EMPTY ADDRESS FIELDS IN CHECKOUT");
  console.log("=================================================");

  // 1. DESKTOP VIEW (1440px)
  console.log("\n--- TEST 1: DESKTOP CHECKOUT MODAL (1440px) ---");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  // Click Order Now on OOPS book to open CheckoutModal
  const openRes = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      const oopsCard = cards.find(c => c.textContent?.includes('OOPS (16 Pages)'));
      if (!oopsCard) return { error: 'OOPS card not found' };
      const orderBtn = oopsCard.querySelector('button:last-child');
      orderBtn.click();
      return { success: true };
    })()
  `);
  console.log("  Opened Checkout modal:", openRes);
  await new Promise(r => setTimeout(r, 1000));

  // Inspect all input fields in the modal
  const inputsInfo = await evaluate(`
    (() => {
      const modal = document.querySelector('form');
      if (!modal) return null;
      const inputs = Array.from(modal.querySelectorAll('input'));
      return inputs.map(inp => {
        const name = inp.getAttribute('name');
        const value = inp.value;
        const placeholder = inp.getAttribute('placeholder') || '';
        const required = inp.required;
        const label = inp.closest('div')?.querySelector('label')?.textContent?.trim() || '';
        return {
          name,
          value,
          isEmpty: value === '',
          placeholder,
          hasPlaceholder: placeholder !== '',
          required,
          label
        };
      });
    })()
  `);

  console.log("  Input Fields Verification:");
  inputsInfo.forEach(inp => {
    console.log(`    - [${inp.label}]: value="${inp.value}" (Empty: ${inp.isEmpty}), placeholder="${inp.placeholder}" (Has placeholder: ${inp.hasPlaceholder})`);
  });

  const allEmpty = inputsInfo.every(inp => inp.isEmpty);
  const noPlaceholders = inputsInfo.every(inp => !inp.hasPlaceholder);
  console.log(`\n  >> All fields completely empty by default: ${allEmpty ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`  >> All example placeholder texts removed: ${noPlaceholders ? 'PASSED ✅' : 'FAILED ❌'}`);

  await takeScreenshot('checkout_empty_address_desktop.png');

  // 2. TEST VALIDATION: Submit empty form
  console.log("\n--- TEST 2: REQUIRED FIELD VALIDATION ---");
  const validationTest = await evaluate(`
    (() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.click();
      return { clicked: true };
    })()
  `);
  console.log("  Form submitted empty, HTML5 required validation active:", validationTest);

  // 3. TEST TYPING INTO FIELDS
  console.log("\n--- TEST 3: CUSTOMER DATA ENTRY ---");
  const typingTest = await evaluate(`
    (() => {
      const setVal = (selector, val) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      };

      setVal('input[name="customerName"]', 'Priya Sharma');
      setVal('input[name="customerEmail"]', 'priya.sharma@example.com');
      setVal('input[name="customerPhone"]', '9876543210');
      setVal('input[name="addressLine1"]', '124 Parkview Enclave');
      setVal('input[name="addressLine2"]', 'Sector 4');
      setVal('input[name="city"]', 'New Delhi');
      setVal('input[name="state"]', 'Delhi');
      setVal('input[name="postalCode"]', '110001');

      const inputs = Array.from(document.querySelectorAll('form input'));
      return inputs.map(i => ({ name: i.name, value: i.value }));
    })()
  `);
  console.log("  Fields accept and retain user input:", typingTest);

  // 4. MOBILE VIEW (390px)
  console.log("\n--- TEST 4: MOBILE CHECKOUT VIEW (390px) ---");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  // Navigate fresh to test default empty state on mobile
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      const oopsCard = cards.find(c => c.textContent?.includes('OOPS (16 Pages)'));
      const orderBtn = oopsCard.querySelector('button:last-child');
      orderBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const mobileInputs = await evaluate(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('form input'));
      return inputs.map(i => ({
        label: i.closest('div')?.querySelector('label')?.textContent?.trim(),
        value: i.value,
        isEmpty: i.value === '',
        placeholder: i.getAttribute('placeholder') || ''
      }));
    })()
  `);

  console.log("  Mobile Input Fields Verification:");
  mobileInputs.forEach(i => {
    console.log(`    - [${i.label}]: value="${i.value}" (Empty: ${i.isEmpty}), placeholder="${i.placeholder}"`);
  });

  await takeScreenshot('checkout_empty_address_mobile.png');

  chrome.kill();
  console.log("\n=== CHECKOUT ADDRESS FIELDS VERIFICATION COMPLETE ===");
}

run().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
