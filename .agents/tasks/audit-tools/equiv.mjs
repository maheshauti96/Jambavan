// Increment 0 equivalence check (§13.3). Captures a DOM fingerprint of every view, every modal and a scripted
// action sequence, so a refactored build can be diffed against the baseline. Temporary audit tooling.
// Usage: node equiv.mjs <label>   → writes equiv-<label>.json next to this file.
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const URL_ = process.env.URL_ || "http://localhost:3000/";
const LABEL = process.argv[2] || "run";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const helpers = `
window.__v = {
  setVal(el, v) {
    const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
    return el.value;
  },
  card(t) { return [...document.querySelectorAll(".task-card")].find(c => c.querySelector("h3")?.innerText.includes(t)); },
  clickIn(root, text, sel = "button") { const b = [...root.querySelectorAll(sel)].find(e => window.__jv.norm(e.textContent).includes(text)); if (!b) return false; b.click(); return window.__jv.norm(b.textContent); },
  html(sel) { const e = document.querySelector(sel); return e ? e.outerHTML.replace(/blob:[^"]+/g, "blob:").replace(/\\s+/g, " ") : null; },
  appText() { return window.__jv.norm(document.querySelector(".audit-log-view")?.innerText); },
};
true;`;

const R = { label: LABEL, console: [], views: {}, modals: {}, sequence: {}, myDay: {} };
let label = "init";
const p = await launch(9351);
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled") {
    const t = m.params.type; if (["error", "warning", "warn", "assert"].includes(t)) R.console.push({ label, type: t, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300) });
  }
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 300) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) R.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 300) });
});
const J = e => p.eval(`window.__jv.${e}`);
const E = e => p.eval(e);
const sleep = p.sleep;
async function fresh() { await p.goto(URL_); await E(inpage); await E(helpers); }
const nav = text => J(`clickText(${JSON.stringify(text)}, '.sidebar button', true)`);
const views = [["feed", "My feed"], ["myDay", "My Day"], ["department", "Department"], ["dashboard", "Dashboard"], ["momDirectory", "MOM Directory"], ["eventPlanner", "Event Planner"], ["projects", null], ["calendar", "Yearly Calendar"], ["guide", null], ["people", "People"], ["myProfile", "My profile"], ["roleMatrix", "Access matrix"], ["auditLog", "Audit log"]];
const goView = async (key, text) => { if (text) await nav(text); else await J(`setView(${JSON.stringify(key)})`); await sleep(250); };

try {
  await p.viewport(1280, 800, false);
  label = "views"; await fresh();
  R.sidebar = await J("navButtons()");
  for (const [key, text] of views) {
    label = `view:${key}`;
    await goView(key, text);
    R.views[key] = { heading: await J(`text('.page-heading h1')`), cards: await E(`document.querySelectorAll('.task-card').length`), html: await E(`window.__v.html('.jambavan-app')`) };
  }

  const openEdit = t => E(`(()=>{const c=window.__v.card(${JSON.stringify(t)}); c.querySelector('[aria-label="Edit task"]').click(); return true})()`);
  const modalDefs = [
    ["create-task", null, () => J(`clickText('Create task', '.page-heading button')`)],
    ["edit-task-hanuman", null, () => openEdit("Coaching Excellence Gurukul")],
    ["edit-task-dependency", null, () => openEdit("Send approved poster")],
    ["handover", null, () => E(`window.__v.clickIn(window.__v.card('Finalize October JEE'), 'Handover Task')`)],
    ["mom", ["momDirectory", "MOM Directory"], () => J(`clickText('Write new MOM')`)],
    ["mom-assign-task", ["momDirectory", "MOM Directory"], () => J(`clickText('Assign / add task')`)],
    ["event", ["eventPlanner", "Event Planner"], () => J(`clickText('Plan an event')`)],
    ["calendar", ["calendar", "Yearly Calendar"], () => J(`clickText('Add calendar event')`)],
    ["notice", null, () => J(`clickText('Send notice')`)],
    ["feedback", null, () => J(`clickText('Request feedback')`)],
    ["attachment", null, () => J(`clickText('Add completion evidence')`)],
    ["profile", ["people", "People"], () => J(`clickText('Manage my profile')`)],
    ["access", ["people", "People"], () => J(`clickText('Manage access')`)],
    ["notifications", null, () => E(`(()=>{document.querySelector('[aria-label="Deadline reminders"]').click(); return true})()`)],
  ];
  for (const [name, setup, open] of modalDefs) {
    label = `modal:${name}`; await fresh();
    if (setup) await goView(...setup);
    const clicked = await open(); await sleep(300);
    R.modals[name] = { clicked, html: await E(`window.__v.html('.modal-backdrop') || window.__v.html('.notification-panel')`) };
  }

  // Scripted action sequence (§13.3)
  label = "sequence"; await fresh();
  const S = R.sequence;
  S.complete = await E(`window.__v.clickIn(window.__v.card('Approve parent orientation deck'), 'Complete task')`); await sleep(200);
  S.toastComplete = await J(`text('.toast span')`);
  await E(`(()=>{const c=window.__v.card('Finalize October JEE'); window.__v.setVal(c.querySelector('.inline-subtask-add input'), 'EQ subtask'); return true})()`); await sleep(100);
  S.addSubtask = await E(`window.__v.clickIn(window.__v.card('Finalize October JEE').querySelector('.inline-subtask-add'), 'Add subtask')`); await sleep(200);
  S.archive = await E(`(()=>{window.__v.card('Upload student success stories').querySelector('.archive-control').click(); return true})()`); await sleep(200);
  await E(`window.__v.setVal(window.__v.card('Coaching Excellence Gurukul').querySelector('.journal-compose input'), 'EQ journal update')`); await sleep(100);
  S.postUpdate = await E(`window.__v.clickIn(window.__v.card('Coaching Excellence Gurukul').querySelector('.journal-compose'), 'Post update')`); await sleep(200);
  S.blocker = await E(`window.__v.clickIn(window.__v.card('Send approved poster').querySelector('.blocker-options'), 'Too much other work')`); await sleep(200);
  const byPh = (ph, v) => `window.__v.setVal([...document.querySelectorAll('.task-modal input, .task-modal textarea')].find(f=>f.placeholder===${JSON.stringify(ph)}), ${JSON.stringify(v)})`;
  const submit = `(()=>{const b=[...document.querySelectorAll('.task-modal .modal-actions button')].pop(); const t=window.__jv.norm(b.innerText); b.click(); return t})()`;
  await J(`clickText('Send notice')`); await sleep(250);
  await E(byPh("e.g. Sunday mock-test schedule", "EQ notice")); await E(byPh("Write the schedule, instruction, or announcement...", "EQ notice body")); await sleep(100);
  S.noticeSubmit = await E(submit); await sleep(250);
  S.handoverOpen = await E(`window.__v.clickIn(window.__v.card('Call pending scholarship'), 'Handover Task')`); await sleep(250);
  await E(`window.__v.setVal(document.querySelector('.handover-modal select'), 'Manav Shah')`); await sleep(100);
  S.handoverSubmit = await E(`window.__v.clickIn(document.querySelector('.handover-modal .modal-actions'), 'Create handover package')`); await sleep(250);
  await J(`clickText('Create task', '.page-heading button')`); await sleep(250);
  await E(`window.__v.setVal(document.querySelector('.task-modal input'), 'EQ dependent task')`);
  S.upstream = await E(`(()=>{const s=document.querySelector('.dependency-field select'); const o=[...s.options].find(o=>o.text.includes('Call pending scholarship')); window.__v.setVal(s, o.value); return s.selectedOptions[0].text})()`); await sleep(100);
  S.createSubmit = await E(`window.__v.clickIn(document.querySelector('.task-modal .modal-actions'), 'Create task')`); await sleep(250);
  S.feedHtml = await E(`window.__v.html('.jambavan-app')`);
  await goView("momDirectory", "MOM Directory");
  await J(`clickText('Write new MOM')`); await sleep(250);
  await E(byPh("e.g. Faculty review", "EQ MOM title")); await E(byPh("Write discussions, decisions, and context here...", "EQ MOM body")); await sleep(100);
  S.momSubmit = await E(submit); await sleep(250);
  S.momHtml = await E(`window.__v.html('.jambavan-app')`);
  await goView("dashboard", "Dashboard");
  S.dashboardHtml = await E(`window.__v.html('.jambavan-app')`);
  await goView("auditLog", "Audit log");
  S.auditText = await E(`window.__v.appText()`);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(200);
  S.notificationsHtml = await E(`window.__v.html('.notification-panel')`);

  // My Day sequence: must add no audit entry and no notification
  label = "myDay"; await fresh();
  const M = R.myDay;
  await goView("auditLog", "Audit log");
  M.auditBefore = await E(`window.__v.appText()`);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(200);
  M.notificationsBefore = await E(`window.__v.html('.notification-panel')`);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(100);
  await goView("myDay", "My Day");
  await E(`window.__v.setVal(document.querySelector('.top3-card .my-day-quick-add input'), 'EQ arrow')`); await sleep(100);
  M.addTop3 = await E(`window.__v.clickIn(document.querySelector('.top3-card'), 'Add')`); await sleep(150);
  await E(`(()=>{const g=document.querySelector('.schedule-add-grid'); const t=[...g.querySelectorAll('input')].find(i=>i.placeholder==='Activity or time block'); window.__v.setVal(t,'EQ block'); return true})()`); await sleep(100);
  M.addBlock = await E(`window.__v.clickIn(document.querySelector('.schedule-card'), 'Add block')`); await sleep(150);
  await E(`window.__v.setVal(document.querySelector('.end-day-card textarea'), 'EQ review')`); await sleep(100);
  M.saveReview = await E(`window.__v.clickIn(document.querySelector('.end-day-card'), 'Save review')`); await sleep(150);
  M.myDayHtml = await E(`window.__v.html('.jambavan-app')`);
  await goView("auditLog", "Audit log");
  M.auditAfter = await E(`window.__v.appText()`);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(200);
  M.notificationsAfter = await E(`window.__v.html('.notification-panel')`);
  M.noAuditChange = M.auditBefore === M.auditAfter;
  M.noNotificationChange = M.notificationsBefore === M.notificationsAfter;
} catch (e) { R.fatal = `${label}: ${e.stack || e}`; }
writeFileSync(new URL(`./equiv-${LABEL}.json`, import.meta.url), JSON.stringify(R, null, 1));
await p.close();
console.log(R.fatal || `done; console entries: ${R.console.length}`);
