// Ad-hoc probe: node probe-ba.mjs <width> <height> <mobile 0|1> '<js step>' ['<js step>' ...]
// Each step is evaluated in the page after a fresh load; results are printed as JSON. Temporary audit tooling.
import { launch } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const [w, h, mob, ...steps] = process.argv.slice(2);
const p = await launch(9381);
const logs = [];
p.on(m => { if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) logs.push(m.params.args.map(a => a.value ?? a.description).join(" ").slice(0, 300)); if (m.method === "Runtime.exceptionThrown") logs.push(m.params.exceptionDetails.exception?.description?.slice(0, 300)); });
await p.viewport(Number(w), Number(h), mob === "1");
await p.goto("http://localhost:3000/");
await p.eval(readFileSync(new URL("./inpage.js", import.meta.url), "utf8"));
for (const s of steps) {
  if (s.startsWith("KEY:")) { const [k, code, kc, mod] = s.slice(4).split(","); await p.send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: Number(kc), modifiers: Number(mod || 0) }); await p.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: Number(kc), modifiers: Number(mod || 0) }); await p.sleep(200); continue; }
  if (s.startsWith("SHOT:")) { await p.shot(s.slice(5), false); continue; }
  try { console.log(JSON.stringify(await p.eval(s))); } catch (e) { console.log("ERR", e.message); }
  await p.sleep(350);
}
if (logs.length) console.log("console:", JSON.stringify(logs));
await p.close();
