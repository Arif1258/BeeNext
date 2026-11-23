import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9700 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_language_${Date.now()}`;
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

  // Scroll to Language section
  await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const languageHeader = headers.find(h => h.textContent && h.textContent.trim() === 'Language');
      if (languageHeader) {
        languageHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 800));

  // Capture screenshot of Language section
  const shot = await send('Page.captureScreenshot');
  const base64 = shot?.result?.data || shot?.data;
  if (base64) {
    fs.writeFileSync(`${ARTIFACT_DIR}/language_books_plain_black_rectangles.png`, Buffer.from(base64, 'base64'));
    console.log('✓ Screenshot saved: language_books_plain_black_rectangles.png');
  }

  // Inspect the 4 Language Books image areas
  const inspection = await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const langHeader = headers.find(h => h.textContent && h.textContent.trim() === 'Language');
      if (!langHeader) return { error: 'Language header not found' };

      const langSection = langHeader.closest('.space-y-4');
      if (!langSection) return { error: 'Language section container not found' };

      const cards = Array.from(langSection.querySelectorAll('.grid > div'));
      return {
        cardCount: cards.length,
        cards: cards.map(c => {
          const title = c.querySelector('h4')?.textContent?.trim() || '';
          const imgBox = c.querySelector('.aspect-\\\\[16\\\\/11\\\\]');
          const style = imgBox ? window.getComputedStyle(imgBox) : null;
          return {
            title,
            hasImgBox: !!imgBox,
            imgBoxClass: imgBox?.className || '',
            imgBoxChildCount: imgBox?.children?.length ?? null,
            imgBoxText: imgBox?.textContent?.trim() ?? null,
            bgColor: style ? style.backgroundColor : null,
          };
        })
      };
    })()
  `);

  console.log('Language Cards Inspection:', JSON.stringify(inspection, null, 2));

  // Also check Upcoming Books to confirm they still have plain black rectangles
  const upcomingCheck = await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const upcomingHeader = headers.find(h => h.textContent && h.textContent.includes('Upcoming Books'));
      if (!upcomingHeader) return { error: 'Upcoming Books header not found' };
      const upcomingSection = upcomingHeader.closest('.space-y-4');
      const cards = Array.from(upcomingSection.querySelectorAll('.grid > div'));
      return cards.map(c => {
        const title = c.querySelector('h4')?.textContent?.trim() || '';
        const imgBox = c.querySelector('.aspect-\\\\[16\\\\/11\\\\]');
        return {
          title,
          childCount: imgBox?.children?.length ?? null,
          text: imgBox?.textContent?.trim() ?? null
        };
      });
    })()
  `);
  console.log('Upcoming Books Check:', JSON.stringify(upcomingCheck, null, 2));

  // Also check CS Fundamentals (should NOT be plain black, should have cover images/preview)
  const csCheck = await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3'));
      const csHeader = headers.find(h => h.textContent && h.textContent.includes('CS Fundamentals'));
      if (!csHeader) return { error: 'CS Fundamentals header not found' };
      const csSection = csHeader.closest('.space-y-4');
      const cards = Array.from(csSection.querySelectorAll('.grid > div'));
      return cards.map(c => {
        const title = c.querySelector('h4')?.textContent?.trim() || '';
        const img = c.querySelector('img');
        return {
          title,
          hasImg: !!img,
          imgSrc: img?.src || null
        };
      });
    })()
  `);
  console.log('CS Fundamentals Check:', JSON.stringify(csCheck, null, 2));

  ws.close();
  chrome.kill();
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
