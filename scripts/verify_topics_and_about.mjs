import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9420;
const userDataDir = `/tmp/chrome_topics_about_${Date.now()}`;

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--window-size=1400,1200",
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

    console.log("\n--- 2. Verifying Certificate Section on /topics ---");
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await waitForCondition(`Boolean(document.querySelector('[data-testid="certificate-box"]'))`);
    await waitForCondition(`document.querySelector('[data-testid="coding-activity-heatmap"]')?.getAttribute('data-loaded') === 'true'`);
    await new Promise((r) => setTimeout(r, 1000));

    // Audit Certificate Box and Circular Performance Graph
    const certAudit = await evaluate(`(() => {
      const certBox = document.querySelector('[data-testid="certificate-box"]');
      const certLink = document.querySelector('a[href="/certificate"]');
      const leftStack = certBox ? certBox.parentElement : null;
      const rightStack = leftStack ? leftStack.nextElementSibling : null;
      const graphUpperBox = rightStack ? rightStack.firstElementChild : null;
      const completedPill = rightStack ? rightStack.lastElementChild : null;

      const certBoxRect = certBox ? certBox.getBoundingClientRect() : null;
      const certLinkRect = certLink ? certLink.getBoundingClientRect() : null;
      const graphUpperRect = graphUpperBox ? graphUpperBox.getBoundingClientRect() : null;
      const completedPillRect = completedPill ? completedPill.getBoundingClientRect() : null;
      const svg = certBox ? certBox.querySelector('svg') : null;
      const svgRect = svg ? svg.getBoundingClientRect() : null;

      return {
        certBox: {
          width: certBoxRect.width,
          height: certBoxRect.height,
          x: certBoxRect.x,
          y: certBoxRect.y,
        },
        graphUpperBox: {
          width: graphUpperRect.width,
          height: graphUpperRect.height,
          x: graphUpperRect.x,
          y: graphUpperRect.y,
        },
        topAligned: Math.abs(certBoxRect.y - graphUpperRect.y) < 2,
        heightMatched: Math.abs(certBoxRect.height - graphUpperRect.height) < 2,
        bottomAligned: Math.abs((certBoxRect.y + certBoxRect.height) - (graphUpperRect.y + graphUpperRect.height)) < 2,
        certLinkBelowBox: certLinkRect.y > certBoxRect.y + certBoxRect.height,
        certLinkCenteredWithBox: Math.abs((certLinkRect.x + certLinkRect.width/2) - (certBoxRect.x + certBoxRect.width/2)) < 2,
        certLinkBottomAlignedWithPill: Math.abs((certLinkRect.y + certLinkRect.height) - (completedPillRect.y + completedPillRect.height)) < 4,
        svgSize: {
          width: svgRect ? svgRect.width : 0,
          height: svgRect ? svgRect.height : 0,
        },
        svgMaxAreaRatio: svgRect && certBoxRect ? (svgRect.height / certBoxRect.height) : 0
      };
    })()`);
    console.log("Certificate Section Audit:", JSON.stringify(certAudit, null, 2));

    // Capture screenshot of Certificate Section + Circular Gauge Stack
    const rightGroup = await evaluate(`(() => {
      const box = document.querySelector('[data-testid="certificate-box"]');
      if (!box || !box.parentElement || !box.parentElement.parentElement) return null;
      const rect = box.parentElement.parentElement.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (rightGroup) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/certificate_section_updated_detail.png`, {
        x: Math.max(0, rightGroup.x - 15),
        y: Math.max(0, rightGroup.y - 15),
        width: Math.min(1400, rightGroup.width + 30),
        height: Math.min(600, rightGroup.height + 30),
        scale: 1,
      });
    }

    // Capture overall hero header
    const headerBox = await evaluate(`(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const container = h1.closest('.border-b');
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);

    if (headerBox) {
      await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/certificate_section_updated_overview.png`, {
        x: Math.max(0, headerBox.x - 10),
        y: Math.max(0, headerBox.y - 10),
        width: Math.min(1400, headerBox.width + 20),
        height: Math.min(600, headerBox.height + 20),
        scale: 1,
      });
    }

    console.log("\n--- 3. Verifying Website Guide on /about ---");
    await send("Page.navigate", { url: `${BASE_URL}/about` });
    await waitForCondition(`document.body.innerText.includes('Website Guide')`);
    await new Promise((r) => setTimeout(r, 1000));

    // Audit About Page and Website Guide
    const aboutAudit = await evaluate(`(() => {
      const headings = Array.from(document.querySelectorAll('h2, h3, h4')).map(h => h.textContent.trim());
      const hasAboutBeenext = headings.some(h => h.toLowerCase().includes('about beenext'));
      const hasWebsiteGuide = headings.some(h => h.toLowerCase().includes('website guide'));
      
      const features = [
        "DSA Sheet & Topic Problems",
        "Brute Force & Optimal Solutions",
        "YouTube Video Explanations",
        "Daily Challenge & Streak System",
        "Coding Playground & Languages",
        "Run & Submit Functionality",
        "Free Daily Coding Attempts",
        "Activity Heatmap & Difficulty Graph",
        "Notes Library & Available Subjects",
        "Company Placement Preparation",
        "Normal & Plus Memberships",
        "Certificate Eligibility & Download"
      ];

      const foundFeatures = features.filter(f => document.body.innerText.includes(f));

      return {
        hasAboutBeenext,
        hasWebsiteGuide,
        totalRequiredFeatures: features.length,
        foundFeaturesCount: foundFeatures.length,
        allFeaturesFound: foundFeatures.length === features.length,
        missing: features.filter(f => !foundFeatures.includes(f))
      };
    })()`);
    console.log("About Page Website Guide Audit:", JSON.stringify(aboutAudit, null, 2));

    // Capture screenshot of the Website Guide on /about
    // Scroll to the guide section so it is in view
    await evaluate(`(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(el => el.textContent.toLowerCase().includes('website guide'));
      if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await new Promise((r) => setTimeout(r, 600));

    await captureScreenshot(`${BRAIN_ARTIFACT_DIR}/about_website_guide_overview.png`);

    console.log("\n✓ All verifications completed successfully!");
  } finally {
    chrome.kill();
  }
}

main().catch((e) => {
  console.error("Verification failed:", e);
  chrome.kill();
  process.exit(1);
});
