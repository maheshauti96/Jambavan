// Probe: can a real user reach the primary button of tall modals? Uses real mouse-wheel / touch scroll input (temporary).
import { launch } from "./cdp.mjs";
import { readFileSync } from "node:fs";
const OUT = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before-v2";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const p = await launch(9343);
const E = e => p.eval(e); const J = e => p.eval(`window.__jv.${e}`);
const fresh = async () => { await p.goto("http://localhost:3000/"); await E(inpage); };
const btnBottom = sel => E(`Math.round([...document.querySelectorAll('${sel} .modal-actions button')].pop().getBoundingClientRect().bottom)`);
const out = {};
for (const [vp, w, h, m] of [["desktop", 1280, 800, false], ["mobile", 390, 844, true]]) {
  await p.viewport(w, h, m);
  for (const [name, open, sel] of [
    ["handover", `(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Finalize October JEE')); [...c.querySelectorAll('button')].find(b=>b.innerText.includes('Handover Task')).click(); return true})()`, ".handover-modal"],
    ["create-task", `(()=>{[...document.querySelectorAll('.page-heading button')].find(b=>b.innerText.includes('Create task')).click(); return true})()`, ".task-modal"],
  ]) {
    await fresh(); await E(open); await p.sleep(400);
    const before = await btnBottom(sel);
    if (m) await p.send("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -800, speed: 2000 });
    else await p.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 640, y: 500, deltaX: 0, deltaY: 1500 });
    await p.sleep(500);
    const after = await btnBottom(sel);
    out[`${vp}:${name}`] = { primaryBtnBottomBefore: before, afterUserScroll: after, innerHeight: h, reachable: after <= h, windowScrollY: await E("scrollY") };
    await p.shot(`${OUT}/${vp}-risk-${name}-modal-after-user-scroll.png`, false);
  }
}
console.log(JSON.stringify(out, null, 1));
await p.close();
