import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9400;
const userDataDir = `/tmp/chrome_topics_confetti_audit_${Date.now()}`;

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
    await send("Network.enable");

    async function loginAs(email, password) {
      await send("Network.clearBrowserCookies");
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await loginRes.json();
      const cookieHeader = loginRes.headers.get("set-cookie") || "";
      const match = cookieHeader.match(/beenext_token=([^;]+)/);
      const token = match ? match[1] : null;
      if (token) {
        await send("Network.setCookie", {
          name: "beenext_token",
          value: token,
          url: "http://localhost:3000",
        });
      }
      return { status: loginRes.status, user: data.user, hasToken: !!token };
    }

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", { expression, returnByValue: true });
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    async function saveScreenshot(filename) {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const buf = Buffer.from(shot.result.data, "base64");
      fs.writeFileSync(`${BRAIN_ARTIFACT_DIR}/${filename}`, buf);
      console.log(`Saved screenshot: ${filename}`);
    }

    console.log("=== TEST 1: NORMAL USER TICKING A PROBLEM IN DSA TOPICS ===");
    await loginAs("skasif@test.com", "Arif@12588");
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 2000));

    // Ensure topic 1 is expanded
    const expandResult = await evaluate(`(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const beginnerH3 = h3s.find(h => h.textContent.includes('Beginner Problems'));
      if (beginnerH3) {
        const headerBtn = beginnerH3.closest('[role="button"]') || beginnerH3.parentElement;
        if (headerBtn) {
          const isAlreadyExpanded = headerBtn.querySelector('.rotate-180') !== null;
          if (!isAlreadyExpanded) {
            headerBtn.click();
            return { clicked: true, title: beginnerH3.textContent, wasExpanded: false };
          }
          return { clicked: false, title: beginnerH3.textContent, wasExpanded: true };
        }
      }
      return { clicked: false, h3s: h3s.map(h => h.textContent) };
    })()`);
    console.log("Expand topic result:", expandResult);
    await new Promise((r) => setTimeout(r, 800));

    // Check that before clicking, there is no confetti canvas
    const initialCheck = await evaluate(`(() => {
      const canvases = document.querySelectorAll('canvas');
      return { canvasCount: canvases.length };
    })()`);
    console.log("Initial canvas count before ticking:", initialCheck);

    // Instrument window to detect confetti calls
    await evaluate(`(() => {
      window.__confettiFired = false;
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.tagName === 'CANVAS') {
              window.__confettiFired = true;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true });
    })()`);

    // Find first problem checkbox in the list and click it
    const clickResult = await evaluate(`(() => {
      const checkboxes = Array.from(document.querySelectorAll('button[title*="completed"], button[title*="Mark as completed"]'));
      if (checkboxes.length > 0) {
        const btn = checkboxes[0];
        const isInitiallyCompleted = btn.classList.contains('bg-emerald-500');
        if (isInitiallyCompleted) {
          btn.click();
        }
        return { found: true, wasInitiallyCompleted: isInitiallyCompleted };
      }
      return { found: false };
    })()`);
    console.log("Checkbox prepare result:", clickResult);
    await new Promise((r) => setTimeout(r, 500));

    // Reset detector
    await evaluate(`(() => { window.__confettiFired = false; })()`);

    // Now click the checkbox to MARK AS COMPLETED
    const markResult = await evaluate(`(() => {
      const checkboxes = Array.from(document.querySelectorAll('button[title*="completed"], button[title*="Mark as completed"]'));
      if (checkboxes.length > 0) {
        checkboxes[0].click();
        return { clicked: true };
      }
      return { clicked: false };
    })()`);
    console.log("Mark as completed click result:", markResult);

    // Wait a brief moment for canvas animation to spawn
    await new Promise((r) => setTimeout(r, 100));

    // Capture screenshot of the bomb blast animation in action
    await saveScreenshot("dsa_topics_bomb_blast_animation.png");

    const confettiCheck = await evaluate(`(() => {
      const canvases = document.querySelectorAll('canvas');
      return {
        confettiFired: Boolean(window.__confettiFired || canvases.length > 0),
        canvasCount: canvases.length
      };
    })()`);
    console.log("Confetti animation detection result:", confettiCheck);

    if (!confettiCheck?.confettiFired) {
      throw new Error("Confetti bomb blast animation was not fired when ticking problem!");
    }
    console.log("✓ Bomb blast animation successfully fired on newly marked problem!");

    // Wait for animation to finish
    await new Promise((r) => setTimeout(r, 1500));

    // Now test UNMARKING (clicking again) - should NOT fire confetti
    await evaluate(`(() => { window.__confettiFired = false; })()`);

    await evaluate(`(() => {
      const checkboxes = Array.from(document.querySelectorAll('button[title*="completed"], button[title*="Mark as completed"]'));
      if (checkboxes.length > 0) {
        checkboxes[0].click(); // unmark
      }
    })()`);

    await new Promise((r) => setTimeout(r, 200));
    const unmarkCheck = await evaluate(`(() => {
      return { confettiFired: Boolean(window.__confettiFired) };
    })()`);
    console.log("Unmark check (should be false):", unmarkCheck);
    if (unmarkCheck?.confettiFired) {
      throw new Error("Confetti should NOT fire when unmarking a problem!");
    }
    console.log("✓ Confetti did NOT fire when unmarking problem.");

    console.log("=== TEST 2: PLUS USER TICKING A PROBLEM ===");
    await loginAs("arifahmedma490@gmail.com", "Arif@12588");
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 2000));

    // Expand first topic if not already expanded
    const plusExpandResult = await evaluate(`(() => {
      const h3s = Array.from(document.querySelectorAll('h3'));
      const beginnerH3 = h3s.find(h => h.textContent.includes('Beginner Problems'));
      if (beginnerH3) {
        const headerBtn = beginnerH3.closest('[role="button"]') || beginnerH3.parentElement;
        if (headerBtn) {
          const isAlreadyExpanded = headerBtn.querySelector('.rotate-180') !== null;
          if (!isAlreadyExpanded) {
            headerBtn.click();
            return { clicked: true, wasExpanded: false };
          }
          return { clicked: false, wasExpanded: true };
        }
      }
      return { clicked: false };
    })()`);
    console.log("Plus expand result:", plusExpandResult);
    await new Promise((r) => setTimeout(r, 800));

    // Reset detector
    await evaluate(`(() => {
      window.__confettiFired = false;
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.tagName === 'CANVAS') {
              window.__confettiFired = true;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true });
    })()`);

    // Find an uncompleted checkbox or unmark one
    const prepPlus = await evaluate(`(() => {
      const checkboxes = Array.from(document.querySelectorAll('button[title*="completed"], button[title*="Mark as completed"]'));
      let uncompleted = checkboxes.find(b => !b.classList.contains('bg-emerald-500'));
      if (!uncompleted && checkboxes.length > 0) {
        checkboxes[0].click(); // unmark
        return { total: checkboxes.length, unmarkingNeeded: true };
      }
      return { total: checkboxes.length, unmarkingNeeded: false };
    })()`);
    console.log("Plus user prep checkbox:", prepPlus);

    if (prepPlus?.unmarkingNeeded) {
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Reset detector before newly marking
    await evaluate(`(() => { window.__confettiFired = false; })()`);

    // Click to mark as completed
    const markPlusResult = await evaluate(`(() => {
      const checkboxes = Array.from(document.querySelectorAll('button[title*="completed"], button[title*="Mark as completed"]'));
      const target = checkboxes.find(b => !b.classList.contains('bg-emerald-500')) || checkboxes[0];
      if (target) {
        target.click();
        return { clicked: true, wasCompleted: target.classList.contains('bg-emerald-500') };
      }
      return { clicked: false };
    })()`);
    console.log("Plus user mark result:", markPlusResult);

    await new Promise((r) => setTimeout(r, 150));

    const plusConfettiCheck = await evaluate(`(() => {
      const canvases = document.querySelectorAll('canvas');
      return {
        confettiFired: Boolean(window.__confettiFired || canvases.length > 0),
        canvasCount: canvases.length
      };
    })()`);
    console.log("Plus User Confetti check:", plusConfettiCheck);
    if (!plusConfettiCheck?.confettiFired) {
      throw new Error("Confetti should fire for Plus user when marking problem!");
    }
    console.log("✓ Bomb blast animation successfully fired for Plus user!");

    console.log("ALL ANIMATION TESTS PASSED SUCCESSFULLY!");
    try { ws.close(); } catch(e) {}
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    try { chrome.kill("SIGKILL"); } catch(e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch(e) {}
  }
}

main();
