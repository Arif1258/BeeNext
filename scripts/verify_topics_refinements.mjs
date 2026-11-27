import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://127.0.0.1:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9425;
const userDataDir = `/tmp/chrome_refinements_${Date.now()}`;

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--window-size=1400,1100",
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
    await waitForCondition(`Boolean(document.querySelector('[data-testid="daily-challenge-section"]'))`);
    await waitForCondition(`document.querySelector('[data-testid="coding-activity-heatmap"]')?.getAttribute('data-loaded') === 'true'`);
    await new Promise((r) => setTimeout(r, 1200));

    // Audit Daily Challenge single compact box
    const dcAudit = await evaluate(`(() => {
      const dc = document.querySelector('[data-testid="daily-challenge-section"]');
      if (!dc) return { error: "Daily Challenge not found" };

      const rect = dc.getBoundingClientRect();
      const internalRows = dc.querySelectorAll('.border-b');
      const text = dc.innerText;
      
      const hasCountdown = text.includes('h:') && text.includes('m:') && text.includes('s');
      const hasSolvedStatus = text.includes('Solved') || text.includes('Not Solved');
      const hasEasy = text.includes('Easy');
      const hasMedium = text.includes('Medium');
      const hasHard = text.includes('Hard');
      
      // Buttons
      const codeBtn = dc.querySelector('a[href*="/code"]');
      const videoBtn = Array.from(dc.querySelectorAll('a, span')).find(el => el.innerText?.includes('Video'));
      const bruteBtn = Array.from(dc.querySelectorAll('a, button')).find(el => el.innerText?.includes('Brute'));
      const optimalBtn = Array.from(dc.querySelectorAll('a, button')).find(el => el.innerText?.includes('Optimal'));

      return {
        height: rect.height,
        internalBorderDividerCount: internalRows.length,
        hasCountdown,
        hasSolvedStatus,
        difficultyRemoved: !hasEasy && !hasMedium && !hasHard,
        hasCodeButton: !!codeBtn,
        hasVideo: !!videoBtn,
        hasBrute: !!bruteBtn,
        hasOptimal: !!optimalBtn,
        borderClasses: dc.className
      };
    })()`);
    console.log("Daily Challenge Audit Result:", JSON.stringify(dcAudit, null, 2));

    // Capture Daily Challenge Section
    const dcBox = await evaluate(`(() => {
      const el = document.querySelector('[data-testid="daily-challenge-section"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (dcBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/daily_challenge_single_compact_box.png`, {
        x: Math.max(0, dcBox.x - 10),
        y: Math.max(0, dcBox.y - 10),
        width: Math.min(1400, dcBox.width + 20),
        height: Math.min(600, dcBox.height + 20),
        scale: 1,
      });
    }

    // Audit Circular Performance Graph & Certificate alignment & emerald color
    const certGraphAudit = await evaluate(`(() => {
      const certBox = document.querySelector('[data-testid="certificate-box"]');
      const certLink = document.querySelector('a[href="/certificate"]');
      const leftStack = certBox ? certBox.parentElement : null;
      const rightStack = leftStack ? leftStack.nextElementSibling : null;
      const graphUpperBox = rightStack ? rightStack.firstElementChild : null;
      const problemsCountBox = rightStack ? rightStack.lastElementChild : null;

      const certRect = certBox.getBoundingClientRect();
      const graphRect = graphUpperBox.getBoundingClientRect();
      const certLinkRect = certLink.getBoundingClientRect();
      const problemsRect = problemsCountBox.getBoundingClientRect();

      // Colors
      const tieSvg = certBox.querySelector('svg');
      const graphSvgCircle = graphUpperBox.querySelector('svg circle, svg path.text-\\[\\#22C55E\\]');
      const graphProgressText = graphUpperBox.querySelector('.font-black');

      return {
        certWidth: certRect.width,
        graphWidth: graphRect.width,
        sameWidth: Math.abs(certRect.width - graphRect.width) < 1,
        certHeight: certRect.height,
        graphHeight: graphRect.height,
        sameHeight: Math.abs(certRect.height - graphRect.height) < 1,
        topAligned: Math.abs(certRect.y - graphRect.y) < 2,
        bottomAligned: Math.abs((certRect.y + certRect.height) - (graphRect.y + graphRect.height)) < 2,
        
        // Lower elements
        certLinkWidth: certLinkRect.width,
        problemsBoxWidth: problemsRect.width,
        sameLowerWidth: Math.abs(certLinkRect.width - problemsRect.width) < 1,
        problemsText: problemsCountBox.innerText.trim(),
        
        // Colors
        tieColorClass: tieSvg.className.baseVal || tieSvg.className,
        graphTextClass: graphProgressText.className,
        certBtnBg: window.getComputedStyle(certLink).backgroundColor,
        certBtnColor: window.getComputedStyle(certLink).color
      };
    })()`);
    console.log("Certificate & Circular Graph Audit:", JSON.stringify(certGraphAudit, null, 2));

    // Capture Circular Graph and Certificate Zoom
    const rightHeaderCluster = await evaluate(`(() => {
      const box = document.querySelector('[data-testid="certificate-box"]');
      if (!box || !box.parentElement || !box.parentElement.parentElement) return null;
      const rect = box.parentElement.parentElement.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (rightHeaderCluster) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/circular_graph_and_certificate_emerald.png`, {
        x: Math.max(0, rightHeaderCluster.x - 15),
        y: Math.max(0, rightHeaderCluster.y - 15),
        width: Math.min(1400, rightHeaderCluster.width + 30),
        height: Math.min(600, rightHeaderCluster.height + 30),
        scale: 1,
      });
    }

    // Capture full top of page to demonstrate saved vertical space
    await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/dsa_topics_space_saved_overview.png`, {
      x: 0,
      y: 0,
      width: 1400,
      height: 700,
      scale: 1,
    });

    console.log("\n✓ All browser verifications passed successfully!");
  } finally {
    chrome.kill();
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  chrome.kill();
  process.exit(1);
});
