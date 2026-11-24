import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function main() {
  const port = 9386;
  const userDataDir = `/tmp/chrome_layout_verify_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1366,768'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const list = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/json/list`, r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
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

    console.log("Navigating to http://localhost:3000/problem/selection-sort/code at 1366x768...");
    await send('Page.navigate', { url: 'http://localhost:3000/problem/selection-sort/code' });
    await new Promise(r => setTimeout(r, 5000));

    // Check dimensions and element coordinates
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const runBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Run'));
          const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Submit'));
          const footer = document.querySelector('footer');
          const h1 = document.querySelector('h1');
          
          const runRect = runBtn ? runBtn.getBoundingClientRect() : null;
          const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;

          // Check left panel headings
          const headings = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
          const examples = Array.from(document.querySelectorAll('.font-bold')).filter(e => e.textContent.includes('Example')).map(e => e.textContent.trim());
          const constraints = Array.from(document.querySelectorAll('ul li')).map(li => li.textContent.trim());

          return {
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            windowScrollY: window.scrollY,
            documentScrollHeight: document.documentElement.scrollHeight,
            footerPresent: !!footer,
            title: h1 ? h1.textContent.trim() : null,
            headings: headings,
            examplesCount: examples.length,
            constraintsCount: constraints.length,
            runBtn: runRect ? {
              top: Math.round(runRect.top),
              bottom: Math.round(runRect.bottom),
              left: Math.round(runRect.left),
              right: Math.round(runRect.right),
              visibleInViewport: runRect.bottom <= window.innerHeight && runRect.top >= 0
            } : null,
            submitBtn: submitRect ? {
              top: Math.round(submitRect.top),
              bottom: Math.round(submitRect.bottom),
              left: Math.round(submitRect.left),
              right: Math.round(submitRect.right),
              visibleInViewport: submitRect.bottom <= window.innerHeight && submitRect.top >= 0
            } : null
          };
        })()
      `,
      returnByValue: true
    });

    const data = evalRes.result?.result?.value || evalRes.result?.value;
    console.log("Inspection Results:", JSON.stringify(data, null, 2));

    // Capture initial screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = `${ARTIFACT_DIR}/coding_playground_1366x768.png`;
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.result.data, 'base64'));
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Verify conditions
    let errors = [];
    if (!data) {
      console.error("No eval data returned:", evalRes);
      process.exit(1);
    }
    if (data.windowScrollY !== 0) errors.push(`Window is scrolled by ${data.windowScrollY}px (should be 0)`);
    if (data.footerPresent) errors.push("Footer is unexpectedly present on coding playground page!");
    if (!data.runBtn) errors.push("Run button not found!");
    else if (!data.runBtn.visibleInViewport) errors.push(`Run button bottom (${data.runBtn.bottom}px) is beyond viewport height (${data.windowInnerHeight}px)`);
    if (!data.submitBtn) errors.push("Submit button not found!");
    else if (!data.submitBtn.visibleInViewport) errors.push(`Submit button bottom (${data.submitBtn.bottom}px) is beyond viewport height (${data.windowInnerHeight}px)`);
    if (data.examplesCount < 2) errors.push(`Expected >= 2 examples, got ${data.examplesCount}`);
    if (data.constraintsCount === 0) errors.push("No constraints rendered");

    if (errors.length > 0) {
      console.error("FAILURES DETECTED:", errors);
      process.exit(1);
    } else {
      console.log("ALL VIEWPORT AND CONTENT TESTS PASSED AT 1366x768!");
    }

  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error("Error running test:", err);
  process.exit(1);
});
