import { launch } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const DIR = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/mocks";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const p = await launch(9336);
const res = {};
const base = [[1280, 800, false, "desktop-1280", true], [390, 844, true, "mobile-390", true]];
// round 2 (review M13): laptop and landscape-phone checks for the hero, viewport-only captures
const extra = { "mock-1-home-feed": [[1024, 768, false, "laptop-1024", false], [844, 390, true, "landscape-844x390", false]] };
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
for (const name of ["mock-1-home-feed", "mock-2-taskcard-create-mission", "mock-3-projects-dashboard-setu", "mock-4-my-day-handover"].filter(n => !only || only.includes(n))) {
  for (const [w, h, m, tag, full] of [...base, ...(extra[name] || [])]) {
    await p.viewport(w, h, m);
    await p.goto("file://" + encodeURI(`${DIR}/${name}.html`));
    await p.eval("document.fonts.ready.then(()=>true)"); await p.sleep(600);
    await p.eval(inpage);
    res[`${name}@${tag}`] = {
      overflow: await p.eval("__jv.overflow()"),
      contrast: await p.eval("(()=>{const c=__jv.contrast('body');return {checked:c.checked, failing:c.failingElements, fails:c.fails.slice(0,6), under12:c.sizes&&c.sizes.under12}})()"),
      fonts: await p.eval("[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).filter((x,i,a)=>a.indexOf(x)===i)"),
      firstTaskTop: await p.eval("(()=>{const t=document.querySelector('.task');return t?Math.round(t.getBoundingClientRect().top+scrollY):null})()"),
      heroHeight: await p.eval("(()=>{const t=document.querySelector('.hero');return t?Math.round(t.getBoundingClientRect().height):null})()"),
      taskHeights: await p.eval("[...document.querySelectorAll('.task')].map(t=>Math.round(t.getBoundingClientRect().height))"),
      under12: await p.eval("[...document.querySelectorAll('body *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&__jv.visible(e)&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.trim().slice(0,30))"),
      taps: await p.eval("(()=>{const t=__jv.tapTargets();return {total:t.total,under44:t.under44,under24:t.under24}})()"),
    };
    await p.shot(`${DIR}/${name}@${tag}.png`, full);
  }
}
console.log(JSON.stringify(res, null, 1));
await p.close();
