import { spawn } from 'child_process';
import http from 'http';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'supportbeenext@gmail.com' } });
  const adminToken = jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const port = 9338;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/chrome_adm2_${Date.now()}`,
    '--disable-gpu',
    '--window-size=1280,1200'
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
  await send('Network.setCookie', { name: 'beenext_token', value: adminToken, domain: 'localhost', path: '/' });

  await send('Page.navigate', { url: 'http://localhost:3000/admin' });
  await new Promise(r => setTimeout(r, 2000));

  // Click on Orders tab
  await send('Runtime.evaluate', {
    expression: 'Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Orders ("))?.click()'
  });
  await new Promise(r => setTimeout(r, 1500));

  // Select PRINTED in Physical Certificate Status and click Save Order Status
  const selectResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      const certSelect = selects.find(s => s.options && Array.from(s.options).some(o => o.value === "PRINTED"));
      if (certSelect) {
        certSelect.value = "PRINTED";
        certSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const saveBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Save Order Status"));
      if (saveBtn) saveBtn.click();
      return { foundCertSelect: Boolean(certSelect), foundSaveBtn: Boolean(saveBtn) };
    })()`,
    returnByValue: true
  });
  console.log('Action result:', selectResult.result?.result?.value);
  await new Promise(r => setTimeout(r, 2500));

  // Verify in DB
  const updatedOrder = await prisma.printedOrder.findFirst({
    where: { requiresCertificate: true }
  });
  console.log('Database certificateStatus after save:', updatedOrder?.certificateStatus);

  const snap = await send('Page.captureScreenshot');
  fs.writeFileSync(
    '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/admin_certificate_status_printed_verified.png',
    Buffer.from(snap.result.data, 'base64')
  );
  console.log('Saved admin_certificate_status_printed_verified.png');

  ws.close();
  chrome.kill();
  await prisma.$disconnect();
}

main().catch(console.error);
