import fs from "fs";
import http from "http";
import { spawn } from "child_process";

const PORT = 9415;
const userDataDir = `/tmp/chrome_tie_${Date.now()}`;

const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0a0a0a; color: white; display: flex; gap: 24px; padding: 40px; font-family: monospace; }
    .box { width: 112px; height: 112px; background: #171717; border: 1px solid #262626; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
    .btn { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: white; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 6px; width: 78px; text-align: center; }
    .label { font-size: 10px; color: #888; text-align: center; margin-top: 4px; }
  </style>
</head>
<body>
  <!-- Variant 1: Current -->
  <div>
    <div class="box">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
        <path d="M6.5 3.5l3 3.5" />
        <path d="M17.5 3.5l-3 3.5" />
        <polygon points="9.5,3 14.5,3 13.5,7 10.5,7" fill="#ef4444" fill-opacity="0.25" />
        <polygon points="10.5,7 13.5,7 15.5,16.5 12,21.5 8.5,16.5" fill="#ef4444" fill-opacity="0.15" />
      </svg>
      <div class="btn">Certificate</div>
    </div>
    <div class="label">Variant 1 (Current)</div>
  </div>

  <!-- Variant 2: Clean downward dress shirt collar + bold crisp tie -->
  <div>
    <div class="box">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
        <!-- Left Collar Lapel pointing down -->
        <path d="M6 3.5 L7.5 7.5 L9.5 6" />
        <path d="M6 3.5 H9.5" />
        <!-- Right Collar Lapel pointing down -->
        <path d="M18 3.5 L16.5 7.5 L14.5 6" />
        <path d="M18 3.5 H14.5" />
        <!-- Knot -->
        <polygon points="9.5,3.5 14.5,3.5 13.5,7.5 10.5,7.5" fill="#ef4444" fill-opacity="0.3" />
        <!-- Blade with center crease -->
        <polygon points="10.5,7.5 13.5,7.5 16,16.5 12,21.5 8,16.5" fill="#ef4444" fill-opacity="0.18" />
        <line x1="12" y1="9.5" x2="12" y2="18" stroke="#ef4444" stroke-width="1.2" stroke-opacity="0.6" />
      </svg>
      <div class="btn">Certificate</div>
    </div>
    <div class="label">Variant 2 (Dress Collar)</div>
  </div>

  <!-- Variant 3: Sleek Modern Pure Tie -->
  <div>
    <div class="box">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
        <!-- Collar band at neck -->
        <path d="M7 4h10" stroke-opacity="0.5" />
        <!-- Knot -->
        <polygon points="9.5,4 14.5,4 13.5,8 10.5,8" fill="#ef4444" fill-opacity="0.35" />
        <!-- Tie Blade -->
        <polygon points="10.5,8 13.5,8 16.5,17 12,21.5 7.5,17" fill="#ef4444" fill-opacity="0.2" />
        <!-- Tie crease / pattern -->
        <line x1="12" y1="10" x2="12" y2="18.5" stroke="#ef4444" stroke-width="1.2" stroke-opacity="0.7" />
      </svg>
      <div class="btn">Certificate</div>
    </div>
    <div class="label">Variant 3 (Modern Pure Tie)</div>
  </div>

  <!-- Variant 4: Classic Necktie with Lapels & Tie -->
  <div>
    <div class="box">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
        <!-- Suit Collar / Lapels -->
        <path d="M4.5 4h4.5l-2 5z" fill="#ef4444" fill-opacity="0.1" />
        <path d="M19.5 4h-4.5l2 5z" fill="#ef4444" fill-opacity="0.1" />
        <!-- Knot -->
        <polygon points="9.5,3.5 14.5,3.5 13.5,7 10.5,7" fill="#ef4444" fill-opacity="0.4" />
        <!-- Tie Body -->
        <polygon points="10.5,7 13.5,7 15.5,16 12,21 8.5,16" fill="#ef4444" fill-opacity="0.25" />
      </svg>
      <div class="btn">Certificate</div>
    </div>
    <div class="label">Variant 4 (Suit Collar)</div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(PORT, async () => {
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new",
    `--remote-debugging-port=9416`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--window-size=800,400",
  ]);

  try {
    await new Promise((r) => setTimeout(r, 1500));
    const list = await new Promise((res, rej) =>
      http.get(`http://127.0.0.1:9416/json/list`, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(JSON.parse(d)));
      }).on("error", rej)
    );

    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) pending.get(m.id)(m);
    };
    const send = (method, params = {}) =>
      new Promise((r) => {
        const cid = id++;
        pending.set(cid, r);
        ws.send(JSON.stringify({ id: cid, method, params }));
      });

    await new Promise((r) => (ws.onopen = r));
    await send("Page.enable");
    await send("Page.navigate", { url: `http://localhost:${PORT}` });
    await new Promise((r) => setTimeout(r, 1000));

    const res = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/necktie_variants_comparison.png", Buffer.from(res.result.data, "base64"));
    console.log("Comparison saved!");
  } finally {
    chrome.kill();
    server.close();
  }
});
