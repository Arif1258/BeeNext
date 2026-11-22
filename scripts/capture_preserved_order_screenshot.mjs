import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';
const JWT_SECRET = process.env.JWT_SECRET || 'beenext_super_secure_jwt_secret_production_ready_2026_xyz';

async function run() {
  const port = 9398;
  const userDataDir = `/tmp/chrome_admin_preserved_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      list = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
      });
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  if (!list || list.length === 0) {
    throw new Error("Could not connect to Chrome debugging port");
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
  await send('Network.enable');

  const { default: prisma } = await import('../src/lib/prisma');
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN', name: admin.name },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Set auth cookie
  await send('Network.setCookie', {
    name: 'beenext_token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  console.log("Navigating to /admin...");
  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await new Promise(r => setTimeout(r, 2000));

  // Click on Orders tab
  await send('Runtime.evaluate', {
    expression: `
      const ordersTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Orders'));
      if (ordersTab) ordersTab.click();
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot');
  fs.writeFileSync(`${ARTIFACT_DIR}/admin_dashboard_preserved_order.png`, Buffer.from(shot.result.data, 'base64'));
  console.log(`Captured ${ARTIFACT_DIR}/admin_dashboard_preserved_order.png`);

  ws.close();
  chrome.kill();
}

run().catch(console.error);
