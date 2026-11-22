import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function run() {
  const port = 9395;
  const userDataDir = `/tmp/chrome_apna_shots_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1200'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const list = await new Promise(res => {
    http.get(`http://127.0.0.1:${port}/json/list`, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    });
  });

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
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise(r => setTimeout(r, 2000));

  // Expand Arrays topic
  await send('Runtime.evaluate', {
    expression: `(() => {
      const headers = Array.from(document.querySelectorAll('div[role="button"]'));
      const arrHeader = headers.find(h => h.textContent.includes('Arrays'));
      if (arrHeader) {
        arrHeader.click();
        arrHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll a bit down to show problems 12 to 26 in Arrays (Majority Element, 3 Sum, Kadane, Next Permutation)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const problemLinks = Array.from(document.querySelectorAll('a[href*="/problem/"]'));
      const kadane = problemLinks.find(a => a.textContent.includes("Kadane"));
      if (kadane) {
        kadane.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 1. Desktop Screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 400));
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/dsa_topics_apna_striver_desktop.png';
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.result.data, 'base64'));
  console.log(`Saved desktop screenshot to ${desktopPath}`);

  // 2. Mobile Screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/dsa_topics_apna_striver_mobile.png';
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.result.data, 'base64'));
  console.log(`Saved mobile screenshot to ${mobilePath}`);

  chrome.kill();
  process.exit(0);
}
run();
