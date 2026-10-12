import { launch } from "./cdp.mjs";
const p = await launch(9335);
const out = {};
for (const [w, h, m] of [[1280, 800, false], [390, 844, true]]) {
  await p.viewport(w, h, m); await p.goto("http://localhost:3000/");
  out[w] = await p.eval(`(()=>{const first=document.querySelector('.task-card');const blocked=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Resolve projector'));const cards=[...document.querySelectorAll('.task-card')].map(c=>Math.round(c.getBoundingClientRect().height));
  return {firstTaskCardTop: Math.round(first.getBoundingClientRect().top+scrollY), pageHeight: document.documentElement.scrollHeight, viewportsBeforeFirstTask: +( (first.getBoundingClientRect().top+scrollY)/innerHeight).toFixed(1), blockedCardShowsStatusText: /blocked/i.test(blocked.innerText), taskCardHeights: cards, sidebarOverflow: (()=>{const s=document.querySelector('.sidebar');return {clientHeight:s.clientHeight, scrollHeight:s.scrollHeight, overflowY:getComputedStyle(s).overflowY}})()}})()`);
}
console.log(JSON.stringify(out, null, 1));
await p.close();
