import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9414;
const userDataDir = `/tmp/chrome_cert_${Date.now()}`;

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--window-size=1400,1050",
]);

async function main() {
  try {
    await new Promise((r) => setTimeout(r, 2000));
    const list = await new Promise((res, rej) =>
      http.get(`http://127.0.0.1:${PORT}/json/list`, (r) => {
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
    await send("DOM.enable");
    await send("Network.enable");
    await send("Runtime.enable");

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    async function waitForCondition(expr, timeoutMs = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const result = await evaluate(expr);
        if (result) return result;
        await new Promise((r) => setTimeout(r, 400));
      }
      return null;
    }

    async function captureScreenshot(path, clip = null) {
      const params = { format: "png" };
      if (clip) params.clip = clip;
      const res = await send("Page.captureScreenshot", params);
      const data = res.result?.data;
      if (!data) throw new Error("No screenshot data: " + JSON.stringify(res));
      fs.writeFileSync(path, Buffer.from(data, "base64"));
      console.log(`Saved screenshot: ${path}`);
    }

    console.log("--- 1. Logging in as Plus User ---");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "arifahmedma490@gmail.com", password: "Arif@12588" }),
    });
    const setCookie = loginRes.headers.get("set-cookie");
    const tokenMatch = setCookie ? setCookie.match(/beenext_token=([^;]+)/) : null;
    if (tokenMatch) {
      await send("Network.setCookie", {
        name: "beenext_token",
        value: tokenMatch[1],
        url: "http://localhost:3000",
      });
      console.log("✓ Session cookie set.");
    }

    console.log("\n--- 2. Navigating to /topics ---");
    await send("Page.navigate", { url: `${BASE_URL}/topics` });

    await waitForCondition(`Boolean(document.querySelector('[data-testid="certificate-box"]'))`);
    await waitForCondition(`document.querySelector('[data-testid="coding-activity-heatmap"]')?.getAttribute('data-loaded') === 'true'`);
    await new Promise((r) => setTimeout(r, 1000));

    // Audit Certificate Box
    const certBoxAudit = await evaluate(`(() => {
      const certBox = document.querySelector('[data-testid="certificate-box"]');
      if (!certBox) return { error: "not found" };
      const svg = certBox.querySelector('svg');
      const link = certBox.querySelector('a[href="/certificate"]');
      const rect = certBox.getBoundingClientRect();
      const svgRect = svg ? svg.getBoundingClientRect() : null;
      const linkRect = link ? link.getBoundingClientRect() : null;

      // Adjacent circular progress graph
      const group = certBox.parentElement;
      const graphBox = certBox.nextElementSibling;
      const graphRect = graphBox ? graphBox.getBoundingClientRect() : null;

      return {
        box: {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          classes: certBox.className
        },
        svg: {
          exists: !!svg,
          width: svgRect ? svgRect.width : 0,
          height: svgRect ? svgRect.height : 0,
          y: svgRect ? svgRect.y : 0
        },
        link: {
          exists: !!link,
          text: link ? link.innerText.trim() : "",
          width: linkRect ? linkRect.width : 0,
          height: linkRect ? linkRect.height : 0,
          y: linkRect ? linkRect.y : 0
        },
        graph: {
          exists: !!graphBox,
          width: graphRect ? graphRect.width : 0,
          height: graphRect ? graphRect.height : 0,
          gap: graphRect && rect ? (graphRect.x - (rect.x + rect.width)) : null
        },
        isIconAboveLink: svgRect && linkRect ? svgRect.y < linkRect.y : false,
        isCentered: Math.abs((svgRect.x + svgRect.width/2) - (linkRect.x + linkRect.width/2)) < 5
      };
    })()`);
    console.log("Certificate Box Audit Result:", JSON.stringify(certBoxAudit, null, 2));

    // Detailed screenshot of the Certificate Box and Circular Graph
    const rightGroup = await evaluate(`(() => {
      const box = document.querySelector('[data-testid="certificate-box"]');
      if (!box || !box.parentElement) return null;
      const rect = box.parentElement.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (rightGroup) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/certificate_redesign_detail.png`, {
        x: Math.max(0, rightGroup.x - 15),
        y: Math.max(0, rightGroup.y - 15),
        width: Math.min(1400, rightGroup.width + 30),
        height: Math.min(600, rightGroup.height + 30),
        scale: 1,
      });
    }

    // Header overview screenshot
    const headerBox = await evaluate(`(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const container = h1.closest('.border-b');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (headerBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/certificate_redesign_overview.png`, {
        x: Math.max(0, headerBox.x - 10),
        y: Math.max(0, headerBox.y - 10),
        width: Math.min(1400, headerBox.width + 20),
        height: Math.min(600, headerBox.height + 20),
        scale: 1,
      });
    }

    // Also test responsive mobile viewport (375x812)
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 600));

    const mobileCertAudit = await evaluate(`(() => {
      const box = document.querySelector('[data-testid="certificate-box"]');
      if (!box) return null;
      const rect = box.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        visible: rect.width > 0 && rect.height > 0
      };
    })()`);
    console.log("Mobile Cert Audit:", mobileCertAudit);

    await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/certificate_redesign_mobile.png`, {
      x: 0,
      y: 0,
      width: 375,
      height: 600,
      scale: 2,
    });

    console.log("\n✓ All browser verifications completed successfully!");
  } finally {
    chrome.kill();
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  chrome.kill();
  process.exit(1);
});
