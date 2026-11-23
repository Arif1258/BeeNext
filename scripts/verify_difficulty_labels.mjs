import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9750 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_diff_no_headings_${Date.now()}`;
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

  // ==========================================
  // TEST 1: /topics (Desktop)
  // ==========================================
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('1. Navigating to http://localhost:3000/topics...');
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise((r) => setTimeout(r, 2500));

  // Inspect topic headers - CONFIRM NO DIFFICULTY BADGES
  const topicHeadersCheck = await evaluate(`
    (() => {
      const topicHeaders = Array.from(document.querySelectorAll('.rounded-xl.border h3'));
      return topicHeaders.map(h => {
        const title = h.textContent?.trim() || '';
        const badge = h.parentElement?.querySelector('span.font-mono.rounded.border');
        return {
          title,
          hasBadge: !!badge,
          badgeText: badge?.textContent?.trim() || null,
        };
      });
    })()
  `);

  const anyTopicHasBadge = topicHeadersCheck.some(t => t.hasBadge);
  console.log(`Topic Headers Check (Total ${topicHeadersCheck.length} topics): anyTopicHasBadge = ${anyTopicHasBadge}`);
  if (anyTopicHasBadge) {
    console.error('FAIL: Found topic heading with difficulty badge:', topicHeadersCheck.filter(t => t.hasBadge));
  } else {
    console.log('✓ PASS: All category/topic headings have NO difficulty labels.');
  }

  // Expand "Sorting" topic to check problem badges
  await evaluate(`
    (() => {
      const topicHeaders = Array.from(document.querySelectorAll('.rounded-xl.border h3'));
      const sortingHeader = topicHeaders.find(h => h.textContent?.includes('Sorting'));
      if (sortingHeader) {
        sortingHeader.closest('[role="button"]')?.click();
      }
    })()
  `);
  await new Promise((r) => setTimeout(r, 1000));

  // Inspect Sorting problems - CONFIRM THEY STILL HAVE DIFFICULTY BADGES
  const sortingProblems = await evaluate(`
    (() => {
      const topicHeaders = Array.from(document.querySelectorAll('.rounded-xl.border h3'));
      const sortingHeader = topicHeaders.find(h => h.textContent?.includes('Sorting'));
      const topicCard = sortingHeader?.closest('.rounded-xl.border');
      if (!topicCard) return { error: 'Sorting card not found' };

      const probRows = Array.from(topicCard.querySelectorAll('.divide-y > div'));
      return probRows.map(row => {
        const link = row.querySelector('a[href^="/problem/"]');
        const titleSpan = link?.querySelector('span:last-child');
        const badge = row.querySelector('div:first-child > span.font-mono.rounded.border');
        return {
          title: titleSpan?.textContent?.trim() || link?.textContent?.trim(),
          badgeText: badge?.textContent?.trim() || null,
        };
      });
    })()
  `);
  console.log('Sorting Problems & Badges:', JSON.stringify(sortingProblems, null, 2));

  // Capture screenshot of /topics with Sorting expanded
  const shot1 = await send('Page.captureScreenshot');
  const b64_1 = shot1?.result?.data || shot1?.data;
  if (b64_1) {
    fs.writeFileSync(`${ARTIFACT_DIR}/topics_accordion_problems_only_difficulty_labels.png`, Buffer.from(b64_1, 'base64'));
    console.log('✓ Saved artifact: topics_accordion_problems_only_difficulty_labels.png');
  }

  // ==========================================
  // TEST 2: /topics/sorting (Category Detail)
  // ==========================================
  console.log('2. Navigating to http://localhost:3000/topics/sorting...');
  await send('Page.navigate', { url: 'http://localhost:3000/topics/sorting' });
  await new Promise((r) => setTimeout(r, 2000));

  const categoryDetailCheck = await evaluate(`
    (() => {
      const h1 = document.querySelector('h1');
      const headerBadge = h1?.parentElement?.querySelector('span.font-mono.rounded.border');

      const probRows = Array.from(document.querySelectorAll('.divide-y > div'));
      const sampleProbs = probRows.map(row => {
        const link = row.querySelector('a[href*="/problem/"]');
        const badge = row.querySelector('div:first-child > span.font-mono.rounded.border');
        return {
          title: link?.textContent?.trim() || '',
          badgeText: badge?.textContent?.trim() || null,
        };
      });

      return {
        categoryTitle: h1?.textContent?.trim(),
        hasCategoryBadge: !!headerBadge,
        categoryBadge: headerBadge?.textContent?.trim() || null,
        sampleProbs: sampleProbs.slice(0, 5),
      };
    })()
  `);
  console.log('Category Detail Page Check:', JSON.stringify(categoryDetailCheck, null, 2));

  const shot2 = await send('Page.captureScreenshot');
  const b64_2 = shot2?.result?.data || shot2?.data;
  if (b64_2) {
    fs.writeFileSync(`${ARTIFACT_DIR}/category_detail_problems_only_difficulty_labels.png`, Buffer.from(b64_2, 'base64'));
    console.log('✓ Saved artifact: category_detail_problems_only_difficulty_labels.png');
  }

  ws.close();
  chrome.kill();
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
