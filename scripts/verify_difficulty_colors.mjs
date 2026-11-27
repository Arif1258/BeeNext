import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9418;
const userDataDir = `/tmp/chrome_colors_${Date.now()}`;

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

    await waitForCondition(`Boolean(document.querySelector('[data-testid="coding-activity-heatmap"]'))`);
    await waitForCondition(`document.querySelector('[data-testid="coding-activity-heatmap"]')?.getAttribute('data-loaded') === 'true'`);
    await new Promise((r) => setTimeout(r, 1200));

    // Audit Colors in Circular Graph, Difficulty Labels, and Progress Bars
    const colorAudit = await evaluate(`(() => {
      const heatmap = document.querySelector('[data-testid="coding-activity-heatmap"]');
      if (!heatmap) return { error: "Heatmap not found" };

      const graph = heatmap.querySelector('[data-testid="difficulty-performance-graph"]');
      if (!graph) return { error: "Graph not found" };

      // SVG Arcs
      const circles = Array.from(graph.querySelectorAll('svg circle'));
      const arcStrokes = circles.map(c => c.getAttribute('stroke'));

      // Labels
      const labels = Array.from(graph.querySelectorAll('.space-y-1 span.font-semibold')).map(el => {
        return {
          text: el.innerText.trim(),
          computedColor: window.getComputedStyle(el).color,
          className: el.className
        };
      });

      // Progress bars
      const bars = Array.from(graph.querySelectorAll('.space-y-1 .h-full')).map(el => {
        return {
          computedBg: window.getComputedStyle(el).backgroundColor,
          className: el.className
        };
      });

      return {
        arcStrokes,
        labels,
        bars
      };
    })()`);

    console.log("Color Audit Result:\n", JSON.stringify(colorAudit, null, 2));

    // Capture screenshot of the full Coding Activity Box
    const activityBox = await evaluate(`(() => {
      const el = document.querySelector('[data-testid="coding-activity-heatmap"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (activityBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/activity_difficulty_colors_detail.png`, {
        x: Math.max(0, activityBox.x - 10),
        y: Math.max(0, activityBox.y - 10),
        width: Math.min(1400, activityBox.width + 20),
        height: Math.min(600, activityBox.height + 20),
        scale: 1,
      });
    }

    // Capture focused screenshot of the Difficulty Performance Graph (circular gauge + labels + bars)
    const diffGraphBox = await evaluate(`(() => {
      const el = document.querySelector('[data-testid="difficulty-performance-graph"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (diffGraphBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/difficulty_graph_colors_zoom.png`, {
        x: Math.max(0, diffGraphBox.x - 10),
        y: Math.max(0, diffGraphBox.y - 10),
        width: Math.min(1400, diffGraphBox.width + 20),
        height: Math.min(600, diffGraphBox.height + 20),
        scale: 1,
      });
    }

    console.log("\n✓ Verification finished successfully!");
  } finally {
    chrome.kill();
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  chrome.kill();
  process.exit(1);
});
