// Minimal Chrome DevTools Protocol driver (Node 22 global WebSocket). Temporary audit tooling.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch(port = 9333) {
  const proc = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${port}`, "--user-data-dir=/tmp/jv-audit-chrome-profile",
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--force-color-profile=srgb", "about:blank",
  ], { stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) break; } catch {}
    await sleep(200);
  }
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = [];
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method) listeners.forEach(l => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const page = {
    proc, send, on: fn => listeners.push(fn), sleep,
    width: 1280, height: 800,
    async viewport(width, height, mobile = false) {
      this.width = width; this.height = height;
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
      await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    },
    async goto(url) {
      const loaded = new Promise(r => { const l = m => { if (m.method === "Page.loadEventFired") r(); }; listeners.push(l); });
      await send("Page.navigate", { url }); await loaded; await sleep(1200);
    },
    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async shot(path, full = true) {
      let height = this.height, y = 0;
      if (full) { const m = await send("Page.getLayoutMetrics"); height = Math.min(Math.ceil(m.cssContentSize.height), 9000); }
      else { y = await this.eval("Math.round(window.scrollY)"); } // viewport shots: clip is in document coords, so offset by scroll
      const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full, clip: { x: 0, y, width: this.width, height, scale: 1 } });
      mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
      writeFileSync(path, Buffer.from(r.data, "base64"));
      return path;
    },
    async key(key, code = key, keyCode = 0) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
      await sleep(120);
    },
    async close() { try { ws.close(); } catch {} proc.kill(); },
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  return page;
}
