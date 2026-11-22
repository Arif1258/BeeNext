import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'arifahmedma490@gmail.com' } });
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const port = 9348;
  const userDataDir = `/tmp/chrome_compact_user_${Date.now()}`;
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
  await send('Network.enable');
  await send('Network.setCookie', { name: 'beenext_token', value: token, domain: 'localhost', path: '/' });

  console.log("Navigating to /certificate as authenticated user (both criteria completed)...");
  await send('Page.navigate', { url: 'http://localhost:3000/certificate' });
  await new Promise(r => setTimeout(r, 2000));

  const userEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const completedSpans = Array.from(document.querySelectorAll("span"))
        .filter(s => s.textContent.includes("Completed"))
        .map(s => s.textContent.trim());
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent.includes("ORDER PHYSICAL CERTIFICATE"));
      return {
        completedSpans,
        btnDisabled: btn ? btn.disabled : null
      };
    })()`,
    returnByValue: true
  });
  console.log("User completed view evaluation:", userEval.result?.result?.value);

  const snap = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/certificate_compact_user_completed.png',
    Buffer.from(snap.result.data, 'base64')
  );
  console.log("Saved: certificate_compact_user_completed.png");

  ws.close();
  chrome.kill();
  await prisma.$disconnect();
}

main().catch(console.error);
