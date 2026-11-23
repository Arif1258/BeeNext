import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

const EXPECTED = {
  'Selection Sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'Bubble Sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'Insertion Sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'Quick Sort': 'https://youtu.be/8MNB0Mba_Dc?si=1TtJjOZvVj-3w4pI',
};

async function run() {
  const port = 9600 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_apna_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100',
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
    throw new Error('Failed to connect to Chrome CDP.');
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

  const takeScreenshot = async (filename) => {
    const shot = await send('Page.captureScreenshot');
    const base64 = shot?.result?.data || shot?.data;
    if (base64) {
      fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(base64, 'base64'));
      console.log(`✓ Screenshot saved: ${filename}`);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Page.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('\n--- Test 1: Inspecting /topics/sorting Category Detail Page ---');
  await send('Page.navigate', { url: 'http://localhost:3000/topics/sorting' });
  await new Promise((r) => setTimeout(r, 2500));

  const categoryProblems = await evaluate(`
    (() => {
      const rows = Array.from(document.querySelectorAll('.divide-y > div'));
      return rows.map(r => {
        const titleEl = r.querySelector('a[href*="/problem/"]');
        const title = titleEl ? titleEl.textContent.trim().replace(/^\\d+\\.\\s*/, '') : '';
        const apnaLink = r.querySelector('a[title*="Apna"]');
        const apnaSpan = r.querySelector('span[title*="Apna"]');
        return {
          title,
          hasLink: Boolean(apnaLink),
          href: apnaLink ? apnaLink.getAttribute('href') : null,
          target: apnaLink ? apnaLink.getAttribute('target') : null,
          rel: apnaLink ? apnaLink.getAttribute('rel') : null,
          disabledText: apnaSpan ? apnaSpan.textContent.trim() : null
        };
      }).filter(p => p.title);
    })()
  `);

  console.log('Category Problems inspected:', JSON.stringify(categoryProblems, null, 2));

  for (const [title, expectedUrl] of Object.entries(EXPECTED)) {
    const match = categoryProblems.find((p) => p.title.toLowerCase().includes(title.toLowerCase()));
    if (!match) {
      throw new Error(`Problem "${title}" not found on /topics/sorting`);
    }
    if (!match.hasLink || match.href !== expectedUrl) {
      throw new Error(`Problem "${title}" expected link ${expectedUrl}, but got ${match.href}`);
    }
    if (match.target !== '_blank' || !match.rel.includes('noopener')) {
      throw new Error(`Problem "${title}" link does not have target="_blank" rel="noopener noreferrer"`);
    }
    console.log(`✓ [Category Page] "${title}" has enabled Apna button pointing to: ${match.href} (target="_blank", rel="${match.rel}")`);
  }

  await takeScreenshot('live_sorting_topics_apna_buttons.png');

  console.log('\n--- Test 2: Inspecting /topics Accordion Page ---');
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise((r) => setTimeout(r, 2500));

  // Expand the Sorting accordion if collapsed
  await evaluate(`
    (() => {
      const headers = Array.from(document.querySelectorAll('h3, .font-bold'));
      const sortingHeader = headers.find(h => h.textContent && h.textContent.trim().toLowerCase().includes('sorting'));
      if (sortingHeader) {
        const clickTarget = sortingHeader.closest('div[class*="cursor-pointer"]') || sortingHeader.closest('div');
        if (clickTarget) clickTarget.click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 1000));

  const accordionProblems = await evaluate(`
    (() => {
      const rows = Array.from(document.querySelectorAll('.divide-y > div'));
      return rows.map(r => {
        const titleEl = r.querySelector('a[href*="/problem/"]');
        const title = titleEl ? titleEl.textContent.trim().replace(/^\\d+\\.\\s*/, '') : '';
        const apnaLink = r.querySelector('a[title*="Apna"]');
        const apnaSpan = r.querySelector('span[title*="Apna"]');
        return {
          title,
          hasLink: Boolean(apnaLink),
          href: apnaLink ? apnaLink.getAttribute('href') : null,
          target: apnaLink ? apnaLink.getAttribute('target') : null,
          rel: apnaLink ? apnaLink.getAttribute('rel') : null,
          disabledText: apnaSpan ? apnaSpan.textContent.trim() : null
        };
      }).filter(p => p.title);
    })()
  `);

  console.log('Accordion Problems count:', accordionProblems.length);

  for (const [title, expectedUrl] of Object.entries(EXPECTED)) {
    const match = accordionProblems.find((p) => p.title.toLowerCase().includes(title.toLowerCase()));
    if (!match) {
      console.warn(`Problem "${title}" not found in accordion snapshot, checking category page result.`);
      continue;
    }
    if (!match.hasLink || match.href !== expectedUrl) {
      throw new Error(`Accordion problem "${title}" expected link ${expectedUrl}, but got ${match.href}`);
    }
    if (match.target !== '_blank' || !match.rel.includes('noopener')) {
      throw new Error(`Accordion problem "${title}" missing target="_blank" rel="noopener noreferrer"`);
    }
    console.log(`✓ [Accordion Page] "${title}" has enabled Apna button pointing to: ${match.href} (target="_blank", rel="${match.rel}")`);
  }

  await takeScreenshot('live_accordion_sorting_apna_buttons.png');

  ws.close();
  chrome.kill();
  console.log('\n======================================================');
  console.log('ALL FRONTEND BROWSER CHECKS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

run().catch((e) => {
  console.error('Browser check failed:', e);
  process.exit(1);
});
