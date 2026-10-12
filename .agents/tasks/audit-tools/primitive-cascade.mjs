// IR1-1 browser check: renders the real primitives (imported from the Vite dev server, same React instance as the
// app) into a host that sets an 11px / 400 parent font, then asserts their computed styles in the live cascade.
// renderToString tests cannot see cascade-layer problems, so this runs in the browser. Temporary audit tooling;
// promoted to scripts/ui-audit/ with the rest in increment 2.
// Usage: node primitive-cascade.mjs   → primitive-cascade.json, exit 1 on any failed assertion
import { launch } from "./cdp.mjs";
import { writeFileSync } from "node:fs";

const URL_ = process.env.URL_ || "http://localhost:3000/";
const probe = `(async () => {
  const depUrl = async (src, name) => {
    const text = await (await fetch(src)).text();
    const m = text.match(new RegExp('"(/[^"]*?/node_modules/\\\\.vite/deps/' + name + '\\\\.js\\\\?v=[^"]+)"'));
    if (!m) throw new Error('dep url not found: ' + name);
    return m[1];
  };
  const reactMod = await import(await depUrl('/src/components/jambavan/primitives/Button.tsx', 'react'));
  const domMod = await import(await depUrl('/src/main.tsx', 'react-dom_client'));
  const React = reactMod.default ?? reactMod; const { createRoot } = domMod.default ?? domMod;
  const { Button, IconButton } = await import('/src/components/jambavan/primitives/Button.tsx');
  const { Input, Select, Textarea, ToggleButton } = await import('/src/components/jambavan/primitives/Field.tsx');
  const h = React.createElement;
  const host = document.createElement('div');
  host.id = 'jb-cascade-host';
  host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;font-size:11px;font-weight:400;line-height:1.2;background:#fff;padding:8px';
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(h('div', null,
    h(Button, { id: 'p-btn-secondary', variant: 'secondary' }, 'Secondary'),
    h(Button, { id: 'p-btn-primary' }, 'Primary'),
    h(Button, { id: 'p-btn-sm', variant: 'secondary', size: 'sm' }, 'Small'),
    h(IconButton, { id: 'p-icon', variant: 'secondary', 'aria-label': 'Icon', icon: h('svg', { viewBox: '0 0 24 24' }) }),
    h(ToggleButton, { id: 'p-toggle', pressed: false }, 'Toggle'),
    h(Input, { id: 'p-input', 'aria-label': 'Input' }),
    h(Select, { id: 'p-select', 'aria-label': 'Select' }, h('option', null, 'One')),
    h(Textarea, { id: 'p-textarea', 'aria-label': 'Textarea' }),
  ));
  await new Promise(r => setTimeout(r, 300));
  const toRgb = v => { const d = document.createElement('i'); d.style.color = v; host.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const stone500 = toRgb(getComputedStyle(document.documentElement).getPropertyValue('--jb-stone-500').trim());
  const cs = id => getComputedStyle(document.getElementById(id));
  const pick = (id, props) => { const s = cs(id); return Object.fromEntries(props.map(p => [p, s[p]])); };
  const P = ['fontSize', 'fontWeight', 'lineHeight', 'fontFamily', 'borderTopWidth', 'borderTopStyle', 'borderTopColor', 'height', 'minHeight', 'outlineStyle', 'boxShadow'];
  const got = Object.fromEntries(['p-btn-secondary', 'p-btn-primary', 'p-btn-sm', 'p-icon', 'p-toggle', 'p-input', 'p-select', 'p-textarea'].map(id => [id, pick(id, P)]));
  document.getElementById('p-input').focus();
  await new Promise(r => setTimeout(r, 400)); // let the border-color / box-shadow transition finish
  got['p-input:focus'] = { ...pick('p-input', ['outlineStyle', 'borderTopColor', 'boxShadow']), focusVisible: document.getElementById('p-input').matches(':focus-visible') };
  document.getElementById('p-btn-secondary').focus();
  got['p-btn-secondary:focus'] = { ...pick('p-btn-secondary', ['outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset']), focusVisible: document.getElementById('p-btn-secondary').matches(':focus-visible') };
  const blue700 = toRgb(getComputedStyle(document.documentElement).getPropertyValue('--jb-blue-700').trim());
  root.unmount(); host.remove();
  return { stone500, blue700, got };
})()`;

const p = await launch(9381);
await p.send("Emulation.setFocusEmulationEnabled", { enabled: true }); // headless pages are unfocused otherwise
const out = { viewports: {}, failures: [] };
for (const [vp, w, hgt, mobile] of [["desktop", 1280, 800, false], ["mobile", 390, 844, true]]) {
  await p.viewport(w, hgt, mobile);
  await p.goto(URL_);
  const r = await p.eval(probe);
  out.viewports[vp] = r;
  const g = r.got;
  const expect = (cond, msg) => { if (!cond) out.failures.push(`${vp}: ${msg}`); };
  const border1 = (id, color = r.stone500) => { expect(g[id].borderTopWidth === "1px" && g[id].borderTopStyle === "solid", `${id} border ${g[id].borderTopWidth} ${g[id].borderTopStyle}`); expect(g[id].borderTopColor === color, `${id} border colour ${g[id].borderTopColor} ≠ ${color}`); };
  expect(g["p-btn-secondary"].fontSize === "15px", `Button secondary font-size ${g["p-btn-secondary"].fontSize}`);
  expect(g["p-btn-secondary"].fontWeight === "600", `Button secondary weight ${g["p-btn-secondary"].fontWeight}`);
  expect(g["p-btn-secondary"].lineHeight === "15px", `Button leading-none ${g["p-btn-secondary"].lineHeight}`);
  expect(/Mukta/.test(g["p-btn-secondary"].fontFamily), `Button font ${g["p-btn-secondary"].fontFamily}`);
  border1("p-btn-secondary");
  expect(g["p-btn-primary"].fontSize === "15px" && g["p-btn-primary"].fontWeight === "600", `Button primary ${g["p-btn-primary"].fontSize}/${g["p-btn-primary"].fontWeight}`);
  expect(g["p-btn-primary"].minHeight === "44px", `Button md min-height ${g["p-btn-primary"].minHeight}`);
  expect(g["p-btn-sm"].fontSize === "14px", `Button sm font-size ${g["p-btn-sm"].fontSize}`);
  expect(g["p-btn-sm"].minHeight === (w < 1024 ? "44px" : "36px"), `Button sm min-height ${g["p-btn-sm"].minHeight} at ${w}`);
  border1("p-icon");
  expect(g["p-icon"].height === "44px", `IconButton height ${g["p-icon"].height}`);
  expect(g["p-toggle"].fontSize === "15px" && g["p-toggle"].fontWeight === "500", `ToggleButton ${g["p-toggle"].fontSize}/${g["p-toggle"].fontWeight}`);
  border1("p-toggle");
  for (const id of ["p-input", "p-select", "p-textarea"]) { expect(g[id].fontSize === "16px", `${id} font-size ${g[id].fontSize} (16px avoids iOS zoom)`); border1(id); }
  expect(g["p-input"].height === "44px", `Input height ${g["p-input"].height}`);
  expect(g["p-textarea"].lineHeight === "24px", `Textarea line-height ${g["p-textarea"].lineHeight}`);
  const fi = g["p-input:focus"];
  expect(fi.focusVisible && fi.outlineStyle === "none", `Input focus outline ${fi.outlineStyle} (ring only, no double outline)`);
  expect(fi.borderTopColor === r.blue700 && /3px/.test(fi.boxShadow), `Input focus border ${fi.borderTopColor} / ring ${fi.boxShadow}`);
  const fb = g["p-btn-secondary:focus"];
  expect(!fb.focusVisible || (fb.outlineStyle === "solid" && fb.outlineWidth === "2px" && fb.outlineColor === r.blue700), `Button focus ring ${fb.outlineStyle} ${fb.outlineWidth} ${fb.outlineColor}`);
}
writeFileSync(new URL("./primitive-cascade.json", import.meta.url), JSON.stringify(out, null, 1));
await p.close();
console.log(out.failures.length ? `FAIL\n${out.failures.join("\n")}` : "PASS: Button 15px/600 + 1px stone-500 border, sm 14px (36/44 px), IconButton 44px + border, ToggleButton 15px/500 + border, Input/Select/Textarea 16px + border, Textarea 24px leading, Input focus = ring with no outline, Button focus = 2px blue-700 outline (1280 and 390)");
process.exit(out.failures.length ? 1 : 0);
