import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function main() {
  const port = 9355;
  const userDataDir = `/tmp/chrome_wide_box_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1000'
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

  const desktopEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetText = "Complete 85% of the DSA Sheet, and the next time you order a BeeNext book, your physical certificate will be delivered along with it.";
      const ps = Array.from(document.querySelectorAll('p'));
      const targetP = ps.find(p => p.textContent.trim() === targetText);
      const box = targetP?.parentElement;
      const pRect = targetP?.getBoundingClientRect();
      const boxRect = box?.getBoundingClientRect();
      return {
        foundExactText: Boolean(targetP),
        pText: targetP?.textContent.trim(),
        pHeight: pRect?.height,
        boxWidth: boxRect?.width,
        boxHeight: boxRect?.height,
        isSingleLine: pRect ? pRect.height < 30 : false
      };
    })()`,
    returnByValue: true
  });
  console.log("Desktop Evaluation:", desktopEval.result?.result?.value);

  const snapDesktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_wide_info_box_desktop.png',
    Buffer.from(snapDesktop.result.data, 'base64')
  );
  console.log("Saved: certificate_wide_info_box_desktop.png");

  // Mobile check (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));

  const mobileEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetText = "Complete 85% of the DSA Sheet, and the next time you order a BeeNext book, your physical certificate will be delivered along with it.";
      const targetP = Array.from(document.querySelectorAll('p')).find(p => p.textContent.trim() === targetText);
      const pRect = targetP?.getBoundingClientRect();
      const bodyWidth = document.body.scrollWidth;
      return {
        foundExactText: Boolean(targetP),
        pHeight: pRect?.height,
        hasHorizontalOverflow: bodyWidth > 390
      };
    })()`,
    returnByValue: true
  });
  console.log("Mobile Evaluation:", mobileEval.result?.result?.value);

  const snapMobile = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_wide_info_box_mobile.png',
    Buffer.from(snapMobile.result.data, 'base64')
  );
  console.log("Saved: certificate_wide_info_box_mobile.png");

  ws.close();
  chrome.kill();
}

main().catch(console.error);
