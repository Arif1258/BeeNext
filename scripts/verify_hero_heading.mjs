import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function run() {
  const port = 9405;
  const userDataDir = `/tmp/chrome_hero_heading_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,900'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      list = await new Promise((res, rej) => {
        const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => res(JSON.parse(d)));
        });
        req.on('error', rej);
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
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise(r => setTimeout(r, 2000));

  // Desktop evaluation
  const desktopEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1');
      const rect = h1?.getBoundingClientRect();
      const style = window.getComputedStyle(h1);
      
      return JSON.stringify({
        text: h1?.innerText,
        width: rect?.width,
        height: rect?.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        isSingleLine: rect ? rect.height < 60 : false,
        overflowX: document.documentElement.scrollWidth > window.innerWidth
      });
    })()`,
    returnByValue: true
  });
  console.log('Desktop Eval:', JSON.parse(desktopEval.result.result.value));

  // Capture Desktop Screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 300));
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_hero_to_infinity_desktop.png';
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.result.data, 'base64'));
  console.log(`Saved desktop screenshot to ${desktopPath}`);

  // Mobile evaluation
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 400));
  const mobileEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1');
      const rect = h1?.getBoundingClientRect();
      const bodyWidth = document.body.clientWidth;
      const docScrollWidth = document.documentElement.scrollWidth;

      return JSON.stringify({
        text: h1?.innerText,
        width: rect?.width,
        height: rect?.height,
        hasHorizontalOverflow: docScrollWidth > window.innerWidth,
        windowWidth: window.innerWidth,
        docScrollWidth
      });
    })()`,
    returnByValue: true
  });
  console.log('Mobile Eval:', JSON.parse(mobileEval.result.result.value));

  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_hero_to_infinity_mobile.png';
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.result.data, 'base64'));
  console.log(`Saved mobile screenshot to ${mobilePath}`);

  chrome.kill();
  process.exit(0);
}
run();
