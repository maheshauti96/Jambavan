import { launch } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const p = await launch(9334);
await p.viewport(390, 844, true);
const out = {};
for (const v of ["dashboard", "roleMatrix", "auditLog", "people"]) {
  await p.goto("http://localhost:3000/"); await p.eval(readFileSync(new URL("./inpage.js", import.meta.url), "utf8"));
  await p.eval(`__jv.setView('${v}')`); await p.sleep(300);
  out[v] = await p.eval(`(()=>{const vw=390;return {scrollWidth:document.documentElement.scrollWidth, culprits:[...document.querySelectorAll('.content-wrap *')].filter(e=>e.getBoundingClientRect().right>vw+2 && !e.closest('[style*=overflow]')).map(e=>({c:(e.className||e.tagName).toString().slice(0,40), right:Math.round(e.getBoundingClientRect().right)})).filter((x,i,a)=>a.findIndex(y=>y.c===x.c)===i).slice(0,6)}})()`);
}
console.log(JSON.stringify(out, null, 1));
await p.close();
