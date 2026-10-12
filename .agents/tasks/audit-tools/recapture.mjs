// Recapture viewport screenshots that were blank in the first pass (scrolled pages + clip at y=0).
import { launch } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const OUT = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const p = await launch(9337);
const J = e => p.eval(`window.__jv.${e}`);
const fresh = async () => { await p.goto("http://localhost:3000/"); await p.eval(inpage); };
const res = {};
const openEdit = () => p.eval(`(()=>{const b=document.querySelector('[aria-label="Edit task"]'); b.scrollIntoView({block:'center'}); b.click(); return true})()`);
for (const [w, h, m, vp] of [[1280, 800, false, "desktop"], [390, 844, true, "mobile"]]) {
  await p.viewport(w, h, m);
  const cases = [["edit-task-modal", null, openEdit], ["attachment-modal", null, () => J(`clickText('Add completion evidence')`)]];
  if (vp === "mobile") cases.push(["feedback-modal", null, () => J(`clickText('Request feedback')`)], ["mom-assign-task-modal", () => J(`setView('momDirectory')`), () => J(`clickText('Assign / add task')`)]);
  for (const [name, setup, open] of cases) {
    await fresh(); if (setup) { await setup(); await p.sleep(200); }
    await open(); await p.sleep(400);
    res[`${vp}-${name}`] = { modal: await J("modalInfo()"), scrollY: await p.eval("scrollY") };
    await p.shot(`${OUT}/${vp}-modal-${name}.png`, false);
  }
}
// bug-02: HANUMAN card after edit+save
await p.viewport(1280, 800, false); await fresh();
await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));c.querySelector('[aria-label="Edit task"]').click()})()`); await p.sleep(300);
await J(`clickText('Save changes', '.task-modal button')`); await p.sleep(400);
await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));c.scrollIntoView({block:'start'})})()`); await p.sleep(200);
res.bug02 = await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));return window.__jv.norm(c.querySelector('.hanuman-journal-head')?.innerText)})()`);
await p.shot(`${OUT}/bug-02-hanuman-after-edit-save.png`, false);
// bug-07: completion feedback on the "You" task
await fresh();
await J(`clickText('Complete task', '.task-card button')`); await p.sleep(300);
await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Approve parent'));c.scrollIntoView({block:'center'})})()`); await p.sleep(200);
res.bug07 = await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Approve parent'));return window.__jv.norm(c.querySelector('.done-stamp, .completion-audit')?.innerText)})()`);
await p.shot(`${OUT}/bug-07-completion-feedback.png`, false);
console.log(JSON.stringify(res, null, 1));
await p.close();
