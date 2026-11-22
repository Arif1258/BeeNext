import { spawn } from 'child_process';
import http from 'http';

async function run() {
  const port = 9385;
  const userDataDir = `/tmp/chrome_test_dom_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1000'
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

  // Click on the Arrays header
  await send('Runtime.evaluate', {
    expression: `(() => {
      const headers = Array.from(document.querySelectorAll('div[role="button"]'));
      const arrHeader = headers.find(h => h.textContent.includes('Arrays'));
      if (arrHeader) arrHeader.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      // Find all problem links
      const problemLinks = Array.from(document.querySelectorAll('a[href*="/problem/"]'));
      
      const inspect = (title) => {
        const link = problemLinks.find(a => a.textContent.includes(title));
        if (!link) return { title, error: "not found" };
        const row = link.closest('.group') || link.parentElement?.parentElement;
        if (!row) return { title, error: "no row" };

        const striverA = Array.from(row.querySelectorAll('a')).find(a => a.textContent.trim() === 'Striver');
        const striverSpan = Array.from(row.querySelectorAll('span')).find(s => s.textContent.trim() === 'Striver');
        
        const apnaA = Array.from(row.querySelectorAll('a')).find(a => a.textContent.trim() === 'Apna');
        const apnaSpan = Array.from(row.querySelectorAll('span')).find(s => s.textContent.trim() === 'Apna');

        const html = row.innerHTML;
        const striverIdx = html.indexOf('Striver');
        const apnaIdx = html.indexOf('Apna');

        return {
          title,
          striver: striverA ? { type: 'link', href: striverA.href, target: striverA.target } : { type: 'disabled', title: striverSpan?.getAttribute('title') },
          apna: apnaA ? { type: 'link', href: apnaA.href, target: apnaA.target } : { type: 'disabled', title: apnaSpan?.getAttribute('title') },
          orderCorrect: striverIdx !== -1 && apnaIdx !== -1 && striverIdx < apnaIdx,
          rowText: row.innerText.replace(/\\n/g, ' ')
        };
      };

      return JSON.stringify({
        kadane: inspect("Kadane's Algorithm"),
        threeSum: inspect("3 Sum"),
        nextPerm: inspect("Next Permutation"),
        majorityElem: inspect("Majority Element-I"),
        pascal: inspect("Pascal's Triangle"),
        leader: inspect("Leader in an Array"),
        zeros: inspect("Set Matrix Zeros")
      });
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.parse(res.result.result.value));
  chrome.kill();
  process.exit(0);
}
run();
