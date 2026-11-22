import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function run() {
  const port = 9398;
  const userDataDir = `/tmp/chrome_intro_verify_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,900'
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

  const textCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1')?.innerText;
      const h2 = document.querySelector('h2')?.innerText;
      const introDiv = document.querySelector('h1')?.parentElement;
      const paragraphs = Array.from(introDiv?.querySelectorAll('p') || []).map(p => p.innerText.trim());
      const strongs = Array.from(introDiv?.querySelectorAll('strong') || []).map(s => s.innerText.trim());

      return JSON.stringify({
        h1,
        h2,
        paragraphs,
        strongs
      });
    })()`,
    returnByValue: true
  });

  console.log('Intro Text Evaluation:', JSON.parse(textCheck.result.result.value));

  // Desktop screenshot of header
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 300));
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/dsa_topics_intro_desktop.png';
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.result.data, 'base64'));
  console.log(`Saved desktop screenshot to ${desktopPath}`);

  // Mobile screenshot of header
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 300));
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/dsa_topics_intro_mobile.png';
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.result.data, 'base64'));
  console.log(`Saved mobile screenshot to ${mobilePath}`);

  chrome.kill();
  process.exit(0);
}
run();
