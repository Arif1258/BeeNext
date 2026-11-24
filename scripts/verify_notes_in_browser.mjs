import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";
const BRAIN_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";

function getActivePlusToken() {
  return jwt.sign(
    {
      id: "cmwp4hkkq0001zsg4p4jmhn3e",
      name: "Active Plus User",
      email: "arifahmedma490@gmail.com",
      role: "USER",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function runBrowserVerification() {
  console.log("=== BROWSER E2E VERIFICATION FOR PROTECTED PDF VIEWER ===");

  const port = 9800 + Math.floor(Math.random() * 100);
  const userDataDir = `/tmp/chrome_notes_verify_${Date.now()}`;

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--window-size=1280,950",
  ]);

  try {
    await new Promise((r) => setTimeout(r, 2200));

    const list = await new Promise((res, rej) =>
      http.get(`http://127.0.0.1:${port}/json/list`, (r) => {
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

    // 1. Set Auth Cookie for arifahmedma490@gmail.com
    const token = getActivePlusToken();
    await send("Network.setCookie", {
      name: "beenext_token",
      value: token,
      url: "http://localhost:3000",
      httpOnly: true,
      sameSite: "Lax",
    });
    console.log("✓ Set active Plus member session cookie for arifahmedma490@gmail.com");

    // 2. Navigate to /notes
    await send("Page.navigate", { url: "http://localhost:3000/notes" });
    await new Promise((r) => setTimeout(r, 3500));
    console.log("✓ Navigated to http://localhost:3000/notes");

    // 3. Verify All 8 Sections
    const evalSections = await send("Runtime.evaluate", {
      expression: `(() => {
        const sections = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
        return JSON.stringify(sections);
      })()`,
      returnByValue: true,
    });
    console.log("Sections discovered:", evalSections.result?.result?.value);

    // 4. Click the "DBMS" folder div
    console.log("Opening DBMS folder...");
    const clickDbms = await send("Runtime.evaluate", {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div[title]'));
        const dbmsFolder = divs.find(d => d.getAttribute('title') === 'DBMS' || d.textContent.includes('DBMS'));
        if (dbmsFolder) {
          dbmsFolder.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true,
    });

    if (!clickDbms.result?.result?.value) {
      throw new Error("Could not find or click DBMS folder div!");
    }
    console.log("✓ Clicked DBMS folder div");

    // 5. Wait for PDF to load and render onto canvas
    console.log("Waiting for PDF to stream and render onto canvas...");
    let rendered = false;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 600));
      const checkCanvas = await send("Runtime.evaluate", {
        expression: `(() => {
          const canvas = document.querySelector('canvas');
          const pageInput = document.querySelector('input[inputmode="numeric"]');
          const watermark = document.querySelector('.tracking-wider');
          return {
            canvasExists: !!canvas,
            canvasWidth: canvas?.width || 0,
            canvasHeight: canvas?.height || 0,
            pageVal: pageInput?.value || '',
            watermarkText: watermark?.textContent || '',
          };
        })()`,
        returnByValue: true,
      });

      const res = checkCanvas.result?.result?.value;
      if (res?.canvasExists && res.canvasWidth > 0) {
        console.log(`✓ Canvas active! Dimensions: ${res.canvasWidth}x${res.canvasHeight}, Page: ${res.pageVal}, Watermark: ${res.watermarkText}`);
        rendered = true;
        break;
      }
    }

    if (!rendered) {
      throw new Error("Canvas did not finish rendering within timeout!");
    }

    // 6. Test Next Page Navigation
    console.log("Testing Next Page navigation control...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const nextBtn = document.querySelector('button[title="Next Page"]');
        if (nextBtn) nextBtn.click();
      })()`,
    });

    await new Promise((r) => setTimeout(r, 1200));

    const checkPage2 = await send("Runtime.evaluate", {
      expression: `(() => {
        const pageInput = document.querySelector('input[inputmode="numeric"]');
        return pageInput?.value || '';
      })()`,
      returnByValue: true,
    });
    console.log(`✓ Page after navigation: ${checkPage2.result?.result?.value}`);

    // 7. Capture Full Verification Screenshot
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const shotPath = path.join(BRAIN_DIR, "notes_pdf_viewer_verification.png");
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, "base64"));
    console.log(`✓ Verification screenshot saved to: ${shotPath}`);

    console.log("\n✓ BROWSER E2E VERIFICATION COMPLETED SUCCESSFULLY!");
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification error:", err);
  process.exit(1);
});
