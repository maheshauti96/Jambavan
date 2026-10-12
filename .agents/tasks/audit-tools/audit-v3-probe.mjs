// Follow-up probes for audit-v3 (exact-title card lookup). Temporary tooling.
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const p = await launch(9352);
const E = e => p.eval(e);
const helpers = `window.__c = t => [...document.querySelectorAll('.task-card')].find(c => window.__jv.norm(c.querySelector('h3')?.innerText) === t);
window.__b = (el, t) => [...el.querySelectorAll('button')].find(b => window.__jv.norm(b.innerText).includes(t));
window.__set = (el, v) => { const pr = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(pr, 'value').set.call(el, v); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); }; true;`;
const fresh = async () => { await p.goto("http://localhost:3000/"); await E(inpage); await E(helpers); };
const out = {};
await p.viewport(1280, 800, false);
// 1. Edit task 10 and save unchanged: dependency kept?
await fresh();
out.task10Before = await E(`window.__jv.norm(__c('Send approved poster to schools').querySelector('.dependency-blocked')?.innerText)`);
await E(`__c('Send approved poster to schools').querySelector('[aria-label="Edit task"]').click()`); await p.sleep(300);
out.task10DependsOnInDialog = await E(`(()=>{const s=document.querySelector('.dependency-field select'); return s.options[s.selectedIndex].text})()`);
await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await p.sleep(300);
out.task10After = await E(`window.__jv.norm(__c('Send approved poster to schools').querySelector('.dependency-blocked')?.innerText)`);
// 2. Complete a task whose upstream is pending: upstream state afterwards
await fresh();
await E(`[...document.querySelectorAll('.page-heading button')].find(b=>b.innerText.includes('Create task')).click()`); await p.sleep(300);
await E(`(()=>{const m=document.querySelector('.task-modal'); __set(m.querySelector('input'),'QA dependent own task'); const s=m.querySelector('.dependency-field select'); __set(s,[...s.options].find(o=>o.text.includes('Call pending scholarship')).value); return true})()`); await p.sleep(100);
await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await p.sleep(300);
await E(`__b(__c('QA dependent own task'),'Complete task').click()`); await p.sleep(300);
out.completeWithPendingUpstream = await E(`({ dependentDone: __c('QA dependent own task').classList.contains('is-done'), upstreamDone: __c('Call pending scholarship applicants').classList.contains('is-done'), auditTop: null })`);
await p.shot("/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before-v3/desktop-dependency-completed-while-upstream-pending.png", false);
// 3. Keyboard: Enter / Space on the blocker summary (with text so the key activates)
await fresh();
await E(`(()=>{const d=__c('Approve parent orientation deck').querySelector('.blocker-checkin'); d.querySelector('summary').focus(); return d.open})()`);
await p.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
await p.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await p.sleep(200);
out.summaryOpensWithEnter = await E(`__c('Approve parent orientation deck').querySelector('.blocker-checkin').open`);
// 4. Blocker stays after completion + reopen (own task 4 is "You")
await E(`__b(__c('Approve parent orientation deck'),'Too much other work').click()`); await p.sleep(200);
await E(`__b(__c('Approve parent orientation deck'),'Complete task').click()`); await p.sleep(200);
await E(`__b(__c('Approve parent orientation deck'),'Reopen').click()`); await p.sleep(200);
out.blockerAfterCompleteReopen = await E(`window.__jv.norm(__c('Approve parent orientation deck').querySelector('.blocker-current')?.innerText)||null`);
// 5. Toast persistence after the blocker toast; toast vs open handover dialog
await E(`__b(__c('Finalize October JEE batch timetable'),'Handover Task').click()`); await p.sleep(300);
out.toastVisibleWhileHandoverOpen = await E(`(()=>{const t=document.querySelector('.toast'); if(!t) return null; const r=t.getBoundingClientRect(); const m=document.querySelector('.handover-modal').getBoundingClientRect(); return { text: window.__jv.norm(t.innerText).slice(0,60), z: getComputedStyle(t).zIndex, overlapsDialog: !(r.right<m.left||r.left>m.right||r.bottom<m.top||r.top>m.bottom) }})()`);
// 6. My Day privacy: does the planner content show up in Dashboard/Audit log after adding items?
await fresh();
await E(`[...document.querySelectorAll('.sidebar button')].find(b=>b.innerText.startsWith('My Day')).click()`); await p.sleep(300);
await E(`(()=>{const i=[...document.querySelectorAll('.my-day-view input')].find(i=>i.placeholder==='Add a priority...'); __set(i,'PRIVATE-ARROW-XYZ'); __b(i.parentElement,'Add').click(); return true})()`); await p.sleep(200);
const leaks = {};
for (const v of ["dashboard", "auditLog", "feed", "department"]) { await E(`window.__jv.setView('${v}')`); await p.sleep(250); leaks[v] = await E(`document.body.innerText.includes('PRIVATE-ARROW-XYZ')`); }
out.myDayTextLeaksTo = leaks;
// 7. Header date vs My Day date
out.headerDate = await E(`window.__jv.norm(document.querySelector('.page-heading')?.innerText).slice(0,80)`);
// 8. Mobile: My Day hero render + nav item icons duplicate
out.navIcons = await E(`[...document.querySelectorAll('.sidebar button')].filter(b=>/My Day|Event Planner/.test(b.innerText)).map(b=>b.innerText.trim()+': '+(b.querySelector('svg')?.getAttribute('class')||''))`);
writeFileSync(new URL("./audit-v3-probe.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await p.close();
