// Per-increment smoke check: every view at 1280×800, 390×844, 768×1024 and 1536×900, screenshots, console errors,
// broken images, failed requests, horizontal overflow against the emulated width, the font faces in use and the
// reduced-motion kill switch. Temporary audit tooling.
// Usage: node inc-check.mjs <label>   → screenshots/<label>/ and inc-check-<label>.json
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const URL_ = process.env.URL_ || "http://localhost:3000/";
const LABEL = process.argv[2] || "inc";
const OUT = decodeURIComponent(new URL(`../screenshots/${LABEL}/`, import.meta.url).pathname);
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const R = { label: LABEL, console: [], failedRequests: [], views: {} };
let label = "init";
const p = await launch(9361);
await p.send("Network.enable");
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "warn", "assert"].includes(m.params.type)) R.console.push({ label, type: m.params.type, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300) });
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 300) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) R.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 300) });
  if (m.method === "Network.loadingFailed") R.failedRequests.push({ label, error: m.params.errorText });
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) R.failedRequests.push({ label, status: m.params.response.status, url: m.params.response.url });
});
const views = ["feed", "myDay", "department", "dashboard", "momDirectory", "eventPlanner", "projects", "calendar", "guide", "people", "myProfile", "roleMatrix", "auditLog"];
try {
  // IR1-2: four widths (768 and 1536 added); overflow is measured against the emulated width, not innerWidth.
  for (const [vp, w, h, mobile] of [["desktop", 1280, 800, false], ["mobile", 390, 844, true], ["tablet", 768, 1024, true], ["wide", 1536, 900, false]]) {
    await p.viewport(w, h, mobile);
    label = `${vp}:load`;
    await p.goto(URL_); await p.eval(inpage);
    await p.sleep(600);
    R[`${vp}:fonts`] = await p.eval(`(async()=>{await document.fonts.ready; return { mukta: document.fonts.check('16px Mukta'), cormorant: document.fonts.check('600 30px "Cormorant Garamond"'), tiro: document.fonts.check('16px "Tiro Devanagari Hindi"', 'श्री'), bodyFamily: getComputedStyle(document.body).fontFamily, loaded: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight) }})()`);
    for (const [i, v] of views.entries()) {
      label = `${vp}:${v}`;
      await p.eval(`window.__jv.setView(${JSON.stringify(v)})`); await p.sleep(300); await p.eval("scrollTo(0,0)");
      const file = `${vp}-${String(i + 1).padStart(2, "0")}-${v}.png`;
      await p.shot(`${OUT}${file}`, false);
      R.views[`${vp}:${v}`] = { file, heading: await p.eval(`window.__jv.text('.page-heading h1')`), images: await p.eval("window.__jv.images()"), overflow: await p.eval(`window.__jv.overflow(${w})`) };
    }
  }
  // The reduced-motion kill switch now sits in layer(base) (IR1-1); its !important rules must still win.
  label = "reducedMotion";
  await p.viewport(1280, 800, false);
  await p.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await p.goto(URL_); await p.eval(inpage);
  R.reducedMotion = await p.eval(`(()=>{ const ms = v => Math.max(...v.split(',').map(s => parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))); const els=[...document.querySelectorAll('*')]; const moving=els.filter(e=>{const cs=getComputedStyle(e); return ms(cs.transitionDuration)>0.01||ms(cs.animationDuration)>0.01;}); return { elements: els.length, withMotionOver0_01ms: moving.length, sample: moving.slice(0,5).map(e=>e.className.toString().slice(0,40)) }; })()`);
  await p.send("Emulation.setEmulatedMedia", { features: [] });
} catch (e) { R.fatal = `${label}: ${e.stack || e}`; }
writeFileSync(new URL(`./inc-check-${LABEL}.json`, import.meta.url), JSON.stringify(R, null, 1));
await p.close();
const broken = Object.values(R.views).reduce((s, v) => s + (v.images?.broken || 0), 0);
const over = Object.entries(R.views).filter(([, v]) => v.overflow?.overflowX).map(([k, v]) => `${k} ${v.overflow.scrollWidth}px > ${v.overflow.deviceWidth}px (${v.overflow.culprits.map(c => `${c.el}→${c.right}`).join(", ")})`);
console.log(R.fatal || `done; console entries: ${R.console.length}; failed requests: ${R.failedRequests.length}; broken images: ${broken}; reduced-motion elements still moving: ${R.reducedMotion?.withMotionOver0_01ms}\nhorizontal overflow (${over.length} view/width pairs):\n  ${over.join("\n  ") || "none"}`);
