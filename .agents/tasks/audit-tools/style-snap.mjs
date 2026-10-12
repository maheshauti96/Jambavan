// Computed-style fingerprint (IR1-1). For every view and modal, records the computed style of every element,
// plus the outline and box-shadow of every focusable element while it has focus, so a CSS-cascade change can be
// diffed against the previous state. Temporary audit tooling.
// Usage: node style-snap.mjs <label>   → style-<label>.json
//        node style-snap.mjs --diff <a> <b>
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

if (process.argv[2] === "--diff") {
  const load = l => JSON.parse(readFileSync(new URL(`./style-${l}.json`, import.meta.url), "utf8"));
  const [a, b] = [load(process.argv[3]), load(process.argv[4])];
  let diffs = 0; const byKind = {};
  for (const surface of new Set([...Object.keys(a.surfaces), ...Object.keys(b.surfaces)])) {
    const x = a.surfaces[surface], y = b.surfaces[surface];
    if (!x || !y) { diffs++; console.log(`MISSING ${surface}`); continue; }
    for (const kind of ["styles", "focus"]) {
      const xs = x[kind], ys = y[kind];
      if (xs.length !== ys.length) { diffs++; console.log(`COUNT ${surface}.${kind}: ${xs.length} vs ${ys.length}`); continue; }
      for (let i = 0; i < xs.length; i++) {
        const [selA, sA] = xs[i], [selB, sB] = ys[i];
        const styleA = a.dict[sA], styleB = b.dict[sB];
        if (selA !== selB || styleA !== styleB) {
          diffs++;
          const pa = styleA.split("|"), pb = styleB.split("|");
          const changed = pa.map((v, j) => (v !== pb[j] ? `${a.props[kind][j]}: ${v} → ${pb[j]}` : null)).filter(Boolean);
          const key = `${kind} ${selA} :: ${changed.join("; ")}`;
          (byKind[key] ||= []).push(surface);
        }
      }
    }
  }
  for (const [k, v] of Object.entries(byKind)) console.log(`DIFF ×${v.length} ${k}\n   on ${[...new Set(v)].slice(0, 6).join(", ")}${v.length > 6 ? " …" : ""}`);
  console.log(diffs ? `${diffs} element difference(s)` : "IDENTICAL");
  process.exit(diffs ? 1 : 0);
}

const URL_ = process.env.URL_ || "http://localhost:3000/";
const LABEL = process.argv[2] || "run";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const STYLE_PROPS = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "backgroundImage",
  "borderTopWidth", "borderTopStyle", "borderTopColor", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderRadius",
  "outlineStyle", "outlineWidth", "boxShadow", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "marginTop", "marginBottom", "display", "width", "height", "cursor", "opacity"];
const FOCUS_PROPS = ["outlineStyle", "outlineWidth", "outlineColor", "outlineOffset", "boxShadow"];
const snap = `(()=>{
  const S=${JSON.stringify(STYLE_PROPS)}, F=${JSON.stringify(FOCUS_PROPS)};
  const root=document.body; const all=[...root.querySelectorAll('*')].filter(e=>!['SCRIPT','STYLE','LINK','META'].includes(e.tagName));
  const id=e=>e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\\s+/).slice(0,3).join('.'):'');
  const styles=all.map(e=>{const cs=getComputedStyle(e); return [id(e), S.map(p=>cs[p]).join('|')]});
  const foc=[...root.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')].filter(e=>e.getClientRects().length);
  const sx=scrollX, sy=scrollY;
  const focus=foc.map(e=>{e.focus({preventScroll:true}); const cs=getComputedStyle(e); const v=F.map(p=>cs[p]).join('|'); e.blur(); return [id(e)+(e.matches(':focus-visible')?'':'(no-fv)'), v]});
  scrollTo(sx,sy);
  return {styles, focus};
})()`;

const R = { label: LABEL, props: { styles: STYLE_PROPS, focus: FOCUS_PROPS }, dict: [], surfaces: {}, console: [] };
const dictIndex = new Map();
const intern = s => { if (!dictIndex.has(s)) { dictIndex.set(s, R.dict.length); R.dict.push(s); } return dictIndex.get(s); };
let label = "init";
const p = await launch(9371);
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "warn", "assert"].includes(m.params.type)) R.console.push({ label, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 200) });
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, text: m.params.exceptionDetails.exception?.description?.slice(0, 200) });
});
const J = e => p.eval(`window.__jv.${e}`);
const E = e => p.eval(e);
async function fresh() { await p.goto(URL_); await E(inpage); }
async function record(name) {
  label = name;
  const r = await E(snap);
  R.surfaces[name] = { styles: r.styles.map(([s, v]) => [s, intern(v)]), focus: r.focus.map(([s, v]) => [s, intern(v)]) };
}
const views = ["feed", "myDay", "department", "dashboard", "momDirectory", "eventPlanner", "projects", "calendar", "guide", "people", "myProfile", "roleMatrix", "auditLog"];
const card = t => `[...document.querySelectorAll('.task-card')].find(c => c.querySelector('h3')?.innerText.includes(${JSON.stringify(t)}))`;
const clickIn = (root, text) => `(()=>{const r=${root}; const b=[...r.querySelectorAll('button')].find(e=>window.__jv.norm(e.textContent).includes(${JSON.stringify(text)})); b.click(); return true})()`;
const modalDefs = [
  ["create-task", null, () => J(`clickText('Create task', '.page-heading button')`)],
  ["edit-task-hanuman", null, () => E(`(()=>{${card("Coaching Excellence Gurukul")}.querySelector('[aria-label="Edit task"]').click(); return true})()`)],
  ["handover", null, () => E(clickIn(card("Finalize October JEE"), "Handover Task"))],
  ["mom", "momDirectory", () => J(`clickText('Write new MOM')`)],
  ["event", "eventPlanner", () => J(`clickText('Plan an event')`)],
  ["calendar", "calendar", () => J(`clickText('Add calendar event')`)],
  ["notice", null, () => J(`clickText('Send notice')`)],
  ["feedback", null, () => J(`clickText('Request feedback')`)],
  ["attachment", null, () => J(`clickText('Add completion evidence')`)],
  ["profile", "people", () => J(`clickText('Manage my profile')`)],
  ["access", "people", () => J(`clickText('Manage access')`)],
  ["notifications", null, () => E(`(()=>{document.querySelector('[aria-label="Deadline reminders"]').click(); return true})()`)],
];
try {
  for (const [vp, w, h, mobile] of [["desktop", 1280, 800, false], ["mobile", 390, 844, true]]) {
    await p.viewport(w, h, mobile);
    label = `${vp}:load`; await fresh(); await E("document.fonts.ready.then(()=>true)");
    for (const v of views) { await J(`setView(${JSON.stringify(v)})`); await p.sleep(250); await record(`${vp}:view:${v}`); }
    for (const [name, setup, open] of modalDefs) {
      label = `${vp}:modal:${name}`; await fresh();
      if (setup) { await J(`setView(${JSON.stringify(setup)})`); await p.sleep(250); }
      await open(); await p.sleep(300);
      await record(`${vp}:modal:${name}`);
    }
  }
} catch (e) { R.fatal = `${label}: ${e.stack || e}`; }
writeFileSync(new URL(`./style-${LABEL}.json`, import.meta.url), JSON.stringify(R));
await p.close();
console.log(R.fatal || `done; surfaces: ${Object.keys(R.surfaces).length}; distinct styles: ${R.dict.length}; console entries: ${R.console.length}`);
