import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function main() {
  const port = 9365;
  const userDataDir = `/tmp/chrome_red_box_${Date.now()}`;
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

  // Inspect the box on Desktop (1280px)
  const desktopEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetText = "Complete 85% of the DSA Sheet, and the next time you order a BeeNext book, your physical certificate will be delivered along with it.";
      const targetP = Array.from(document.querySelectorAll('p')).find(p => p.textContent.trim() === targetText);
      const box = targetP?.parentElement;
      const pRect = targetP?.getBoundingClientRect();
      const boxRect = box?.getBoundingClientRect();
      const boxStyle = box ? window.getComputedStyle(box) : null;
      return {
        foundExactText: Boolean(targetP),
        pText: targetP?.textContent.trim(),
        borderColor: boxStyle?.borderColor,
        borderWidth: boxStyle?.borderWidth,
        pLeft: pRect?.left,
        pRight: pRect?.right,
        boxLeft: boxRect?.left,
        boxRight: boxRect?.right,
        pWidth: pRect?.width,
        boxWidth: boxRect?.width,
        pHeight: pRect?.height,
        boxHeight: boxRect?.height,
        isContainedHorizontally: pRect && boxRect ? pRect.left >= boxRect.left && pRect.right <= boxRect.right : false,
        isContainedVertically: pRect && boxRect ? pRect.top >= boxRect.top && pRect.bottom <= boxRect.bottom : false
      };
    })()`,
    returnByValue: true
  });
  console.log("Desktop 1280px Evaluation:", desktopEval.result?.result?.value);

  const snapDesktop = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_red_border_box_desktop.png',
    Buffer.from(snapDesktop.result.data, 'base64')
  );
  console.log("Saved: certificate_red_border_box_desktop.png");

  // Laptop view (1024px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 500));
  const laptopEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const targetText = "Complete 85% of the DSA Sheet, and the next time you order a BeeNext book, your physical certificate will be delivered along with it.";
      const targetP = Array.from(document.querySelectorAll('p')).find(p => p.textContent.trim() === targetText);
      const box = targetP?.parentElement;
      const pRect = targetP?.getBoundingClientRect();
      const boxRect = box?.getBoundingClientRect();
      return {
        isContainedHorizontally: pRect && boxRect ? pRect.left >= boxRect.left && pRect.right <= boxRect.right : false,
        isContainedVertically: pRect && boxRect ? pRect.top >= boxRect.top && pRect.bottom <= boxRect.bottom : false,
        pHeight: pRect?.height,
        boxHeight: boxRect?.height
      };
    })()`,
    returnByValue: true
  });
  console.log("Laptop 1024px Evaluation:", laptopEval.result?.result?.value);

  // Mobile view (390px)
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
      const box = targetP?.parentElement;
      const pRect = targetP?.getBoundingClientRect();
      const boxRect = box?.getBoundingClientRect();
      const bodyWidth = document.body.scrollWidth;
      return {
        isContainedHorizontally: pRect && boxRect ? pRect.left >= boxRect.left && pRect.right <= boxRect.right : false,
        isContainedVertically: pRect && boxRect ? pRect.top >= boxRect.top && pRect.bottom <= boxRect.bottom : false,
        hasHorizontalOverflow: bodyWidth > 390,
        pHeight: pRect?.height,
        boxHeight: boxRect?.height
      };
    })()`,
    returnByValue: true
  });
  console.log("Mobile 390px Evaluation:", mobileEval.result?.result?.value);

  const snapMobile = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_red_border_box_mobile.png',
    Buffer.from(snapMobile.result.data, 'base64')
  );
  console.log("Saved: certificate_red_border_box_mobile.png");

  ws.close();
  chrome.kill();
}

main().catch(console.error);
