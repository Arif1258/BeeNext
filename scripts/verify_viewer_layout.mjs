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

async function runViewerLayoutVerification() {
  console.log("=== BROWSER DESKTOP RESOLUTION VERIFICATION ===");

  const port = 9850 + Math.floor(Math.random() * 100);
  const userDataDir = `/tmp/chrome_layout_verify_${Date.now()}`;

  // Standard Desktop Resolution: 1440x900
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--window-size=1440,900",
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
    console.log("✓ Authenticated as active Plus member");

    // 2. Navigate to /notes
    await send("Page.navigate", { url: "http://localhost:3000/notes" });
    await new Promise((r) => setTimeout(r, 3000));
    console.log("✓ Navigated to http://localhost:3000/notes");

    // 3. Click the "DBMS" folder
    const clickResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const divs = Array.from(document.querySelectorAll('div[title]'));
        const dbmsFolder = divs.find(d => d.getAttribute('title') === 'DBMS');
        if (dbmsFolder) {
          dbmsFolder.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true,
    });
    console.log("✓ Clicked DBMS folder, result:", clickResult.result?.result?.value);

    // 4. Wait for Canvas rendering (until PDF is fully rendered with dimensions > 500px)
    let rendered = false;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 600));
      const check = await send("Runtime.evaluate", {
        expression: `(() => {
          const canvas = document.querySelector('canvas');
          const error = document.querySelector('.text-neutral-300');
          const isLoading = document.body.innerText.includes('Loading Protected Note Document');
          return {
            canvasExists: !!canvas,
            canvasWidth: canvas?.width || 0,
            canvasHeight: canvas?.height || 0,
            isLoading,
            errorText: error?.textContent || ''
          };
        })()`,
        returnByValue: true,
      });
      const val = check.result?.result?.value;
      if (val && val.canvasExists && val.canvasWidth > 500 && !val.isLoading) {
        rendered = true;
        console.log(`✓ Canvas fully rendered: ${val.canvasWidth}x${val.canvasHeight}`);
        break;
      }
      if (val?.errorText && val.errorText.includes("failed")) {
        console.error("UI error reported:", val.errorText);
      }
    }

    if (!rendered) {
      const pageDump = await send("Runtime.evaluate", {
        expression: "document.body.innerText",
        returnByValue: true,
      });
      console.error("Page text on render timeout:\n", pageDump.result?.result?.value);
      throw new Error("PDF did not render onto canvas!");
    }
    console.log("✓ PDF page 1 rendered cleanly onto canvas");

    // 5. Inspect Controls & Geometry in Normal Mode
    const normalState = await send("Runtime.evaluate", {
      expression: `(() => {
        const fullscreenButtons = Array.from(document.querySelectorAll('button')).filter(b => 
          b.getAttribute('title')?.toLowerCase().includes('fullscreen') || 
          b.textContent?.toLowerCase().includes('fullscreen')
        );
        const header = document.querySelector('.border-brand-border');
        const toolbar = document.querySelector('.bg-neutral-900.border-b');
        const viewport = document.querySelector('.flex-1.relative.overflow-auto');
        const canvas = document.querySelector('canvas');
        return {
          fullscreenButtonsCount: fullscreenButtons.length,
          buttonLabels: fullscreenButtons.map(b => b.textContent.trim()),
          headerHeight: header?.clientHeight || 0,
          toolbarHeight: toolbar?.clientHeight || 0,
          viewportHeight: viewport?.clientHeight || 0,
          canvasHeight: canvas?.clientHeight || 0,
        };
      })()`,
      returnByValue: true,
    });

    const ns = normalState.result?.result?.value;
    console.log("\n--- NORMAL MODE METRICS ---");
    console.log(`Fullscreen buttons found: ${ns.fullscreenButtonsCount} (Labels: ${JSON.stringify(ns.buttonLabels)})`);
    console.log(`Header height: ${ns.headerHeight}px`);
    console.log(`Toolbar height: ${ns.toolbarHeight}px`);
    console.log(`PDF viewport height: ${ns.viewportHeight}px`);
    console.log(`Rendered canvas height: ${ns.canvasHeight}px`);

    if (ns.fullscreenButtonsCount !== 1) {
      throw new Error(`Expected exactly 1 fullscreen button, found ${ns.fullscreenButtonsCount}!`);
    }

    // Capture screenshot in Normal Mode
    const shotNormal = await send("Page.captureScreenshot", { format: "png" });
    const normalPath = path.join(BRAIN_DIR, "notes_pdf_viewer_normal_mode.png");
    fs.writeFileSync(normalPath, Buffer.from(shotNormal.result.data, "base64"));
    console.log(`✓ Saved Normal Mode screenshot to: ${normalPath}`);

    // 6. Test Fullscreen Mode
    console.log("\n--- TESTING FULLSCREEN MODE ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const fsBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.getAttribute('title')?.toLowerCase().includes('fullscreen') ||
          b.textContent?.toLowerCase().includes('fullscreen')
        );
        if (fsBtn) fsBtn.click();
      })()`,
    });

    await new Promise((r) => setTimeout(r, 1200));

    const fullscreenState = await send("Runtime.evaluate", {
      expression: `(() => {
        const exitButtons = Array.from(document.querySelectorAll('button')).filter(b => 
          b.getAttribute('title')?.toLowerCase().includes('fullscreen') || 
          b.textContent?.toLowerCase().includes('fullscreen')
        );
        const modal = document.querySelector('.fixed.inset-0');
        const viewport = document.querySelector('.flex-1.relative.overflow-auto');
        return {
          exitButtonsCount: exitButtons.length,
          buttonLabels: exitButtons.map(b => b.textContent.trim()),
          isWindowFull: modal ? (modal.clientWidth === window.innerWidth && modal.clientHeight === window.innerHeight) : false,
          viewportHeight: viewport?.clientHeight || 0,
        };
      })()`,
      returnByValue: true,
    });

    const fsState = fullscreenState.result?.result?.value;
    console.log(`Fullscreen buttons in Fullscreen mode: ${fsState.exitButtonsCount} (Labels: ${JSON.stringify(fsState.buttonLabels)})`);
    console.log(`Is modal 100% viewport: ${fsState.isWindowFull}`);
    console.log(`Fullscreen PDF viewport height: ${fsState.viewportHeight}px`);

    if (fsState.exitButtonsCount !== 1) {
      throw new Error(`Expected exactly 1 exit fullscreen button, found ${fsState.exitButtonsCount}!`);
    }
    if (!fsState.buttonLabels[0].toLowerCase().includes("exit")) {
      throw new Error(`Expected button label to say 'Exit Fullscreen', got '${fsState.buttonLabels[0]}'`);
    }

    // Capture screenshot in Fullscreen Mode
    const shotFs = await send("Page.captureScreenshot", { format: "png" });
    const fsPath = path.join(BRAIN_DIR, "notes_pdf_viewer_fullscreen_mode.png");
    fs.writeFileSync(fsPath, Buffer.from(shotFs.result.data, "base64"));
    console.log(`✓ Saved Fullscreen Mode screenshot to: ${fsPath}`);

    console.log("\n✓ ALL VIEWER LAYOUT & FULLSCREEN CHECKS PASSED PERFECTLY!");
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runViewerLayoutVerification().catch((err) => {
  console.error("Layout verification error:", err);
  process.exit(1);
});
