import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function main() {
  const port = 9345;
  const userDataDir = `/tmp/chrome_compact_cert_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,900'
  ]);

  await new Promise(r => setTimeout(r, 2000));
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

  console.log("Navigating to /certificate...");
  await send('Page.navigate', { url: 'http://localhost:3000/certificate' });
  await new Promise(r => setTimeout(r, 2000));

  // Check heading on desktop
  const headingEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1');
      const rect = h1 ? h1.getBoundingClientRect() : null;
      const computed = h1 ? window.getComputedStyle(h1) : null;
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
      const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim());
      return {
        h1Text: h1?.textContent.trim(),
        h1Height: rect?.height,
        h1Width: rect?.width,
        h2s,
        paragraphs
      };
    })()`,
    returnByValue: true
  });
  console.log("Heading & content evaluation:", headingEval.result?.result?.value);

  // Capture desktop screenshot
  const snapDesktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_compact_desktop.png',
    Buffer.from(snapDesktop.result.data, 'base64')
  );
  console.log("Saved: certificate_compact_desktop.png");

  // Capture mobile screenshot (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));

  const mobileEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('h1');
      const rect = h1 ? h1.getBoundingClientRect() : null;
      const bodyWidth = document.body.scrollWidth;
      return {
        h1Height: rect?.height,
        h1Width: rect?.width,
        bodyWidth,
        hasHorizontalOverflow: bodyWidth > 390
      };
    })()`,
    returnByValue: true
  });
  console.log("Mobile evaluation:", mobileEval.result?.result?.value);

  const snapMobile = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_compact_mobile.png',
    Buffer.from(snapMobile.result.data, 'base64')
  );
  console.log("Saved: certificate_compact_mobile.png");

  ws.close();
  chrome.kill();
}

main().catch(console.error);
