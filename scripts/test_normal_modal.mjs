import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const PORT = 9391;
const userDataDir = `/tmp/chrome_normal_modal_${Date.now()}`;
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
    await send("Network.enable");

    // Navigate to homepage first to establish origin
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise((r) => setTimeout(r, 2000));

    // Log in as normal user (skasif@test.com)
    console.log("Logging in as normal user (skasif@test.com)...");
    const loginRes = await send("Runtime.evaluate", {
      expression: `
        (async () => {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "skasif@test.com", password: "Arif@12588" })
          });
          const data = await res.json();
          return { status: res.status, user: data.user ? data.user.email : null };
        })()
      `,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log("Normal user login result:", loginRes.result?.value || loginRes.result);

    // Navigate to problem code playground
    console.log("Navigating to /problem/two-sum/code...");
    await send("Page.navigate", { url: "http://localhost:3000/problem/two-sum/code" });
    await new Promise((r) => setTimeout(r, 3000));

    // Wait for React to finish hydrating and useAuth to settle
    console.log("Waiting for React and Auth to hydrate in page...");
    for (let i = 0; i < 20; i++) {
      const checkHydrated = await send("Runtime.evaluate", {
        expression: `
          (() => {
            const hasRunBtn = !!Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Run'));
            const isLoggedOut = !!Array.from(document.querySelectorAll('a, button')).find(b => b.textContent && b.textContent.includes('Login'));
            return { hasRunBtn, isLoggedOut };
          })()
        `,
        returnByValue: true,
      });
      const val = checkHydrated.result?.value;
      if (val && val.hasRunBtn && !val.isLoggedOut) {
        console.log("Page hydrated and authenticated user session active!");
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    // Click Run button
    console.log("Clicking 'Run' button as normal user...");
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const runBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Run'));
          if (runBtn) runBtn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Check if Upgrade Modal is visible
    const modalCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const modalHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent && h.textContent.includes('BeeNext Plus'));
          const upgradeBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent && b.textContent.includes('Upgrade to Plus'));
          const hasModal = !!modalHeading;
          return {
            currentUrl: window.location.href,
            hasModal,
            modalHeadingText: modalHeading ? modalHeading.textContent : null,
            hasUpgradeBtn: !!upgradeBtn,
            upgradeBtnHref: upgradeBtn ? upgradeBtn.getAttribute('href') : null
          };
        })()
      `,
      returnByValue: true,
    });

    const modalData = modalCheck.result?.value || modalCheck.result?.result?.value;
    console.log("Modal display verification result:", modalData);

    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb/playground_normal_user_modal.png",
      Buffer.from(shot.result.data, "base64")
    );
    console.log("Screenshot saved to playground_normal_user_modal.png");

    if (modalData && modalData.hasModal && modalData.hasUpgradeBtn) {
      console.log("✓ Normal user upgrade modal correctly displayed upon clicking Run!");
    } else {
      throw new Error(`Modal check failed: ${JSON.stringify(modalData)}`);
    }

    ws.close();
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
