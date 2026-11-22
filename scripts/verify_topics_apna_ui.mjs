import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function main() {
  const port = 9370;
  const userDataDir = `/tmp/chrome_apna_verify_${Date.now()}`;
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

  console.log("Navigating to /topics...");
  await send('Page.navigate', { url: 'http://localhost:3000/topics' });
  await new Promise(r => setTimeout(r, 2500));

  // Expand the "Arrays" and "Sorting" topics by clicking them
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all category accordion header buttons and click them to expand
      const buttons = Array.from(document.querySelectorAll('button'));
      const arrayBtn = buttons.find(b => b.textContent.includes('Arrays'));
      const sortingBtn = buttons.find(b => b.textContent.includes('Sorting'));
      if (arrayBtn) arrayBtn.click();
      if (sortingBtn) sortingBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Inspect the problem rows in DOM
  const checkResult = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('.flex.flex-wrap.items-center.space-x-2, .space-x-2'));
      
      // Let's find specific problem rows: e.g. Kadane's Algorithm, Merge Sort, 3 Sum
      const allText = document.body.innerText;
      
      // Find Kadane's Algorithm row
      const problemLinks = Array.from(document.querySelectorAll('a[href*="/problem/"]'));
      
      const inspectProblem = (problemTitle) => {
        const titleLink = problemLinks.find(a => a.textContent.includes(problemTitle));
        if (!titleLink) return { found: false, title: problemTitle };
        
        // Find parent row container
        const row = titleLink.closest('.group') || titleLink.parentElement.parentElement;
        const links = Array.from(row.querySelectorAll('a'));
        const spans = Array.from(row.querySelectorAll('span'));
        
        // Find Striver element
        const striverA = links.find(a => a.textContent.trim() === 'Striver');
        const striverSpan = spans.find(s => s.textContent.trim() === 'Striver');
        
        // Find Apna element
        const apnaA = links.find(a => a.textContent.trim() === 'Apna');
        const apnaSpan = spans.find(s => s.textContent.trim() === 'Apna');
        
        // Check order in row text
        const rowHtml = row.innerHTML;
        const striverIdx = rowHtml.indexOf('Striver');
        const apnaIdx = rowHtml.indexOf('Apna');
        const orderCorrect = striverIdx !== -1 && apnaIdx !== -1 && striverIdx < apnaIdx;
        
        return {
          found: true,
          title: problemTitle,
          striver: {
            isLink: !!striverA,
            href: striverA ? striverA.href : null,
            target: striverA ? striverA.target : null,
            isDisabled: !!striverSpan
          },
          apna: {
            isLink: !!apnaA,
            href: apnaA ? apnaA.href : null,
            target: apnaA ? apnaA.target : null,
            isDisabled: !!apnaSpan,
            titleAttr: (apnaA || apnaSpan)?.getAttribute('title')
          },
          orderCorrect,
          rowText: row.innerText.replace(/\\n/g, ' ')
        };
      };

      return {
        kadane: inspectProblem("Kadane's Algorithm"),
        mergeSort: inspectProblem("Merge Sort"),
        threeSum: inspectProblem("3 Sum"),
        cows: inspectProblem("Aggressive Cows"),
        // A problem without Apna video
        pattern1: inspectProblem("Pattern 1")
      };
    })()`
  });

  console.log("Check Result:", JSON.stringify(checkResult.result.value, null, 2));

  // Capture Desktop Screenshot of /topics with expanded Arrays
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1000,
    deviceScaleFactor: 2,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 500));
  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  const desktopPath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_apna_striver_desktop.png';
  fs.writeFileSync(desktopPath, Buffer.from(desktopShot.result.data, 'base64'));
  console.log(`Saved desktop screenshot to ${desktopPath}`);

  // Capture Mobile Screenshot (375x812)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 500));
  const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_apna_striver_mobile.png';
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.result.data, 'base64'));
  console.log(`Saved mobile screenshot to ${mobilePath}`);

  // Also verify /topics/sorting single category page
  console.log("Navigating to /topics/sorting...");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:3000/topics/sorting' });
  await new Promise(r => setTimeout(r, 2000));
  const sortingShot = await send('Page.captureScreenshot', { format: 'png' });
  const sortingPath = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/topics_sorting_category_desktop.png';
  fs.writeFileSync(sortingPath, Buffer.from(sortingShot.result.data, 'base64'));
  console.log(`Saved sorting category screenshot to ${sortingPath}`);

  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
