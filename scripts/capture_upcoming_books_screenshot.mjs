import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9650 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_upcoming_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1200',
  ]);

  let list = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      list = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json/list`, (r) => {
          let d = '';
          r.on('data', (c) => (d += c));
          r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
      });
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  if (!list || !list[0]) {
    chrome.kill();
    throw new Error('Chrome CDP connection failed.');
  }

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m);
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      const cid = id++;
      pending.set(cid, r);
      ws.send(JSON.stringify({ id: cid, method, params }));
    });

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.result?.value;
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Page.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('Navigating to http://localhost:3000/purchase...');
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise((r) => setTimeout(r, 2500));

  // Scroll to Upcoming Books section
  await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const upcoming = headers.find(h => h.textContent && h.textContent.includes('Upcoming Books'));
      if (upcoming) {
        upcoming.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));

  // Capture screenshot of Upcoming Books section
  const shot = await send('Page.captureScreenshot');
  const base64 = shot?.result?.data || shot?.data;
  if (base64) {
    fs.writeFileSync(`${ARTIFACT_DIR}/upcoming_books_plain_black_rectangles.png`, Buffer.from(base64, 'base64'));
    console.log('✓ Screenshot saved: upcoming_books_plain_black_rectangles.png');
  }

  // Inspect the 4 Upcoming Books image areas
  const inspection = await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const upcomingHeader = headers.find(h => h.textContent && h.textContent.includes('Upcoming Books'));
      if (!upcomingHeader) return { error: 'Upcoming Books section not found' };

      const section = upcomingHeader.closest('.space-y-4');
      const cards = Array.from(section.querySelectorAll('.rounded-2xl'));

      return cards.map(c => {
        const titleEl = c.querySelector('h4');
        const title = titleEl ? titleEl.textContent.trim() : '';
        // Find aspect-[16/11] div
        const imgBox = c.querySelector('[class*="aspect-[16/11]"]');
        return {
          title,
          hasImgBox: Boolean(imgBox),
          imgBoxClass: imgBox ? imgBox.className : '',
          imgBoxChildCount: imgBox ? imgBox.children.length : -1,
          imgBoxText: imgBox ? imgBox.textContent.trim() : ''
        };
      });
    })()
  `);

  console.log('Inspection result:', JSON.stringify(inspection, null, 2));

  ws.close();
  chrome.kill();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
