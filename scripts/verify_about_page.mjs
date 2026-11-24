import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9398;
const userDataDir = `/tmp/chrome_about_audit_${Date.now()}`;

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--window-size=1366,768",
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

    // Navigate to /about
    await send("Page.navigate", { url: `${BASE_URL}/about` });
    await new Promise((r) => setTimeout(r, 2500));

    // Evaluate DOM contents
    const evalRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const aboutContainer = document.querySelector('.max-w-4xl');
        const text = aboutContainer ? aboutContainer.innerText : '';
        const headings = Array.from(document.querySelectorAll('h2, h3')).map(h => h.textContent.trim());
        const hasInteractivePlayground = text.toUpperCase().includes('INTERACTIVE CODING PLAYGROUND');
        const hasPremiumNotes = text.toUpperCase().includes('PREMIUM NOTES LIBRARY');
        
        const hasAbout = headings.some(h => h.includes('ABOUT BEENEXT'));
        const hasCurriculum = headings.some(h => h.includes('THE CURRICULUM'));
        const hasMembership = headings.some(h => h.includes('MEMBERSHIP TIERS'));
        const hasCertificate = headings.some(h => h.includes('COMPLETION CERTIFICATE'));
        const hasSupport = headings.some(h => h.includes('CUSTOMER SUPPORT'));

        return {
          headings,
          hasInteractivePlayground,
          hasPremiumNotes,
          hasAbout,
          hasCurriculum,
          hasMembership,
          hasCertificate,
          hasSupport,
          aboutTextLength: text.length
        };
      })()`,
      returnByValue: true,
    });

    const result = evalRes.result?.result?.value || evalRes.result?.value;
    console.log("Evaluation result:", JSON.stringify(result, null, 2));

    // Capture desktop screenshot
    const screenshotDesktop = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${ARTIFACT_DIR}/about_page_desktop.png`, Buffer.from(screenshotDesktop.result.data, "base64"));
    console.log("Saved desktop screenshot to artifact directory");

    // Capture mobile screenshot
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 500));

    const screenshotMobile = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${ARTIFACT_DIR}/about_page_mobile.png`, Buffer.from(screenshotMobile.result.data, "base64"));
    console.log("Saved mobile screenshot to artifact directory");

    if (result.hasInteractivePlayground) {
      console.error("FAIL: 'INTERACTIVE CODING PLAYGROUND' is still present on /about");
      process.exit(1);
    }
    if (result.hasPremiumNotes) {
      console.error("FAIL: 'PREMIUM NOTES LIBRARY' is still present on /about");
      process.exit(1);
    }
    if (!result.hasAbout || !result.hasCurriculum || !result.hasMembership || !result.hasCertificate || !result.hasSupport) {
      console.error("FAIL: Missing one of the required sections");
      process.exit(1);
    }

    console.log("SUCCESS: All assertions passed for /about page.");
    try { ws.close(); } catch(e) {}
    process.exit(0);
  } catch (err) {
    console.error("Error running audit:", err);
    process.exit(1);
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch (e) {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

main();
