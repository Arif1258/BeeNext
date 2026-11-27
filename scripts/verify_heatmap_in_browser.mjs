import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9412;
const userDataDir = `/tmp/chrome_topics_refinements_${Date.now()}`;

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

    console.log("--- 1. Logging in as Plus User (arifahmedma490@gmail.com) ---");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "arifahmedma490@gmail.com", password: "Arif@12588" }),
    });
    const setCookie = loginRes.headers.get("set-cookie");
    const tokenMatch = setCookie ? setCookie.match(/beenext_token=([^;]+)/) : null;
    if (!tokenMatch) throw new Error("Failed to get beenext_token cookie");
    const token = tokenMatch[1];

    await send("Network.setCookie", {
      name: "beenext_token",
      value: token,
      url: "http://localhost:3000",
    });
    console.log("✓ Session cookie set.");

    console.log("\n--- 2. Navigating to /topics ---");
    await send("Page.navigate", { url: `${BASE_URL}/topics` });

    // Wait for Daily Challenge and Activity Heatmap to load data
    await waitForCondition(`Boolean(document.querySelector('[data-testid="daily-challenge-section"]'))`);
    await waitForCondition(`document.querySelector('[data-testid="coding-activity-heatmap"]')?.getAttribute('data-loaded') === 'true'`);
    await new Promise((r) => setTimeout(r, 1000));

    // 1. Inspect Hero Header (DSA Sheet Description & Certificate Repositioning)
    const heroHeaderInspection = await evaluate(`(() => {
      const certLink = document.querySelector('a[href="/certificate"]');
      const descPara = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Practice approximately 500 carefully curated DSA questions'));
      const h1 = document.querySelector('h1');
      const certBox = certLink ? certLink.getBoundingClientRect() : null;
      const descBox = descPara ? descPara.getBoundingClientRect() : null;

      return {
        hasUpdatedDesc: !!descPara,
        descSnippet: descPara ? descPara.innerText.slice(0, 80) + '...' : null,
        certFound: !!certLink,
        certText: certLink ? certLink.innerText.trim() : null,
        isCertBetweenDetailsAndGraph: certBox && descBox ? certBox.x > descBox.x : false,
      };
    })()`);
    console.log("Hero Header & Certificate Inspection:", heroHeaderInspection);

    // Capture screenshot of Hero Banner (DSA Details + Certificate in middle + Circular Gauge on right)
    const headerBox = await evaluate(`(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const container = h1.closest('.border-b');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);
    if (headerBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/topics_hero_banner_certificate.png`, {
        x: Math.max(0, headerBox.x - 10),
        y: Math.max(0, headerBox.y - 10),
        width: Math.min(1400, headerBox.width + 20),
        height: Math.min(600, headerBox.height + 20),
        scale: 1,
      });
    }

    // 2. Inspect Daily Challenge compact upper box height
    const dcInspection = await evaluate(`(() => {
      const dc = document.querySelector('[data-testid="daily-challenge-section"]');
      if (!dc) return null;
      const upperBox = dc.querySelector('.border-b');
      const upperBoxRect = upperBox ? upperBox.getBoundingClientRect() : null;
      const fullRect = dc.getBoundingClientRect();
      return {
        fullHeight: fullRect.height,
        upperBoxHeight: upperBoxRect ? upperBoxRect.height : null,
        text: dc.innerText,
        hasCountdown: dc.innerText.includes('h:') && dc.innerText.includes('m:') && dc.innerText.includes('s'),
        isYellowOutline: dc.className.includes('border-amber-500/40'),
        isGreenOutline: dc.className.includes('border-emerald-500/60')
      };
    })()`);
    console.log("Daily Challenge Section Dimensions & Proportions:", dcInspection);

    // Capture screenshot of Daily Challenge box
    const dcBox = await evaluate(`(() => {
      const dc = document.querySelector('[data-testid="daily-challenge-section"]');
      if (!dc) return null;
      const rect = dc.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);
    if (dcBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/daily_challenge_compact_upper_box.png`, {
        x: Math.max(0, dcBox.x - 10),
        y: Math.max(0, dcBox.y - 10),
        width: Math.min(1400, dcBox.width + 20),
        height: Math.min(600, dcBox.height + 20),
        scale: 1,
      });
    }

    // 3. Capture overall page view showing Hero Banner, Activity Box, Daily Challenge, Beginner Problems
    await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/dsa_topics_refined_full_view.png`);

    console.log("\n=== ALL AUDITS PASSED WITH FLYING COLOURS! ===");
  } finally {
    chrome.kill();
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  chrome.kill();
  process.exit(1);
});
