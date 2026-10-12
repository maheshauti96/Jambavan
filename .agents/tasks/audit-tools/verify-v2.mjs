// Phase 1 browser verification of the updated JAMBAVAN app (checkpoint 5f248af). Temporary audit tooling.
// Captures before-v2 baseline screenshots and exercises the new features in headless Chrome via CDP.
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const URL_ = "http://localhost:3000/";
const OUT = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before-v2";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
// Extra helpers: set a React-controlled field, find a task card by title, read card state.
const helpers = `
window.__v = {
  setVal(el, v) {
    const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true }));
    return el.value;
  },
  card(t) { return [...document.querySelectorAll(".task-card")].find(c => c.querySelector("h3")?.innerText.includes(t)); },
  cardInfo(t) {
    const c = this.card(t); if (!c) return null; const n = window.__jv.norm;
    return { owner: n(c.querySelector(".owner-name")?.innerText), blockedBy: n(c.querySelector(".dependency-blocked")?.innerText), downstream: n(c.querySelector(".dependency-downstream")?.innerText),
      blocker: n(c.querySelector(".blocker-current")?.innerText), handover: n(c.querySelector(".handover-summary")?.innerText), hasHandoverBtn: !!c.querySelector(".handover-button"),
      hasMyDayBtn: !!c.querySelector(".my-day-link"), status: n(c.querySelector(".status-pill, .task-status")?.innerText) };
  },
  clickIn(root, text, sel = "button") { const b = [...root.querySelectorAll(sel)].find(e => window.__jv.norm(e.innerText).includes(text)); if (!b) return false; b.scrollIntoView({ block: "center" }); b.click(); return window.__jv.norm(b.innerText); },
  scrollTo(sel) { const e = document.querySelector(sel); if (!e) return false; e.scrollIntoView({ block: "start" }); return true; },
  heading() { return window.__jv.text(".page-heading h1"); },
  toast() { return window.__jv.text(".toast span"); },
};
true;`;

const R = { console: [], views: {}, modals: {}, features: {} };
let label = "init";
const p = await launch(9341);
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled") {
    const t = m.params.type; if (["error", "warning", "warn", "assert"].includes(t)) R.console.push({ label, type: t, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300) });
  }
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 300) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) R.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 300) });
});
const J = e => p.eval(`window.__jv.${e}`);
const V = e => p.eval(`window.__v.${e}`);
const E = e => p.eval(e);
const sleep = p.sleep;
async function fresh() { await p.goto(URL_); await E(inpage); await E(helpers); }
const vps = { desktop: [1280, 800, false], mobile: [390, 844, true] };
const setVp = vp => p.viewport(...vps[vp]);
const views = ["feed", "myDay", "department", "momDirectory", "dashboard", "calendar", "eventPlanner", "guide", "projects", "people", "myProfile", "roleMatrix", "auditLog"];

async function viewPass(vp) {
  await setVp(vp); label = `${vp}:load`; await fresh();
  R.views[`${vp}:navButtons`] = await J("navButtons()");
  await p.shot(`${OUT}/${vp}-00-feed-above-fold.png`, false);
  for (const [i, v] of views.entries()) {
    label = `${vp}:${v}`;
    await J(`setView(${JSON.stringify(v)})`); await sleep(400); await E("scrollTo(0,0)");
    const file = `${vp}-${String(i + 1).padStart(2, "0")}-${v}.png`;
    await p.shot(`${OUT}/${file}`, true);
    R.views[`${vp}:${v}`] = { file, heading: await V("heading()"), overflow: await J("overflow()") };
  }
}

const openEdit = t => E(`(()=>{const c=window.__v.card(${JSON.stringify(t)}); const b=c.querySelector('[aria-label="Edit task"]'); b.scrollIntoView({block:'center'}); b.click(); return true})()`);
const modalDefs = [
  ["create-task", null, () => J(`clickText('Create task', '.page-heading button')`)],
  ["edit-task-dependency", null, () => openEdit("Approve parent")],
  ["handover", null, () => E(`window.__v.clickIn(window.__v.card('Finalize October JEE'), 'Handover Task')`)],
  ["mom", () => J(`setView('momDirectory')`), () => J(`clickText('Write new MOM')`)],
  ["mom-assign-task", () => J(`setView('momDirectory')`), () => J(`clickText('Assign / add task')`)],
  ["event", () => J(`setView('eventPlanner')`), () => J(`clickText('Plan an event')`)],
  ["calendar", () => J(`setView('calendar')`), () => J(`clickText('Add calendar event')`)],
  ["notice", null, () => J(`clickText('Send notice')`)],
  ["feedback", null, () => J(`clickText('Request feedback')`)],
  ["attachment", null, () => J(`clickText('Add completion evidence')`)],
  ["profile", () => J(`setView('people')`), () => J(`clickText('Manage my profile')`)],
  ["access", () => J(`setView('people')`), () => J(`clickText('Manage access')`)],
  ["notifications", null, () => E(`(()=>{document.querySelector('[aria-label="Deadline reminders"]').click(); return true})()`)],
];
async function modalPass(vp) {
  await setVp(vp);
  for (const [name, setup, open] of modalDefs) {
    label = `${vp}:modal:${name}`; await fresh();
    if (setup) { await setup(); await sleep(250); }
    const clicked = await open(); await sleep(450);
    const info = await J("modalInfo()");
    const file = `${vp}-modal-${name}.png`;
    await p.shot(`${OUT}/${file}`, false);
    R.modals[`${vp}:${name}`] = { clicked, file, heading: info?.heading, clippedBottom: info?.clippedBottom, scrollable: info?.scrollable, overflow: await J("overflow()") };
  }
}

// ---------- feature flows ----------
async function myDayFlow(vp) {
  const F = {}; label = `${vp}:feature:myDay`; await setVp(vp); await fresh();
  // Add an assigned academy task to My Day from the feed
  F.addToMyDayBtnOnArjunTask = await V(`cardInfo('Finalize October JEE').hasMyDayBtn`);
  F.addToMyDayClick = await E(`window.__v.clickIn(window.__v.card('Finalize October JEE'), 'Add to My Day')`); await sleep(300);
  F.addToMyDayToast = await V("toast()");
  // Navigate via the sidebar (desktop) or setView (mobile drawer is closed)
  if (vp === "desktop") F.navClick = await J(`clickText('My Day', '.sidebar button')`); else await J(`setView('myDay')`);
  await sleep(400); F.heading = await V("heading()");
  F.initial = await E(`({top3: window.__jv.texts('.top3-card .my-day-check-row'), schedule: window.__jv.texts('.schedule-row strong'), actionables: window.__jv.texts('.actionable-row strong'), linked: window.__jv.texts('.linked-task-row strong')})`);
  // Top 3: add a priority, tick the first one
  await E(`window.__v.setVal(document.querySelector('.top3-card .my-day-quick-add input'), 'QA priority: verify handover')`); await sleep(100);
  await E(`window.__v.clickIn(document.querySelector('.top3-card'), 'Add')`); await sleep(200);
  await E(`document.querySelector('.top3-card .my-day-check-row input').click()`); await sleep(200);
  F.top3After = await E(`({rows: window.__jv.texts('.top3-card .my-day-check-row'), doneCount: document.querySelectorAll('.top3-card .my-day-check-row.done').length, count: window.__jv.text('.top3-card .my-day-count')})`);
  // Schedule: add a block, set first block In Progress
  const sched = await E(`(()=>{const g=document.querySelector('.schedule-add-grid'); const ins=[...g.querySelectorAll('input')]; const s=window.__v; s.setVal(ins[0],'14:00'); s.setVal(ins[1],'15:00'); const t=ins.find(i=>i.placeholder==='Activity or time block'); s.setVal(t,'QA time block'); const c=ins.find(i=>i.placeholder==='Category'); if(c) s.setVal(c,'Testing'); return ins.map(i=>i.type+':'+(i.placeholder||i.value))})()`);
  F.scheduleInputs = sched; await sleep(100);
  await E(`window.__v.clickIn(document.querySelector('.schedule-card'), 'Add block')`); await sleep(250);
  await E(`window.__v.setVal(document.querySelector('.schedule-row select'), 'In Progress')`); await sleep(200);
  F.scheduleAfter = await E(`window.__jv.texts('.schedule-row').map(t=>t.slice(0,90))`);
  // Personal actionables
  F.actionableInputs = await E(`[...document.querySelectorAll('.actionable-add-grid input, .actionable-add-grid select')].map(i=>i.tagName+':'+(i.placeholder||i.type))`);
  await E(`window.__v.setVal(document.querySelector('.actionable-add-grid input'), 'QA actionable: call vendor')`); await sleep(100);
  F.actionableAddClick = await E(`window.__v.clickIn(document.querySelector('.actionable-card'), 'Add')`); await sleep(250);
  await E(`document.querySelector('.actionable-row input[type=checkbox]').click()`); await sleep(150);
  F.actionablesAfter = await E(`({rows: window.__jv.texts('.actionable-row strong'), done: document.querySelectorAll('.actionable-row.done').length, count: window.__jv.text('.actionable-card .my-day-count')})`);
  // Linked academy tasks
  F.linkedAfter = await E(`window.__jv.texts('.linked-task-row').map(t=>t.slice(0,120))`);
  // End-of-day review
  await E(`(()=>{const t=[...document.querySelectorAll('.end-day-card textarea')]; window.__v.setVal(t[0],'Verified My Day'); window.__v.setVal(t[1],'Mobile pass'); window.__v.setVal(t[2],'Ship handover'); return t.length})()`); await sleep(100);
  await E(`window.__v.clickIn(document.querySelector('.end-day-card'), 'Save review')`); await sleep(300);
  F.reviewToast = await V("toast()");
  F.reviewValues = await E(`[...document.querySelectorAll('.end-day-card textarea')].map(t=>t.value)`);
  await E("scrollTo(0,0)"); await p.shot(`${OUT}/${vp}-flow-myday-after-actions.png`, true);
  F.overflow = await J("overflow()");
  // Linked task stays unchanged in feed
  await J(`setView('feed')`); await sleep(300);
  F.feedTaskAfter = await V(`cardInfo('Finalize October JEE')`);
  R.features[`${vp}:myDay`] = F;
}

async function blockerFlow(vp) {
  const F = {}; label = `${vp}:feature:blocker`; await setVp(vp); await fresh();
  await J(`setView('dashboard')`); await sleep(300);
  F.dashBefore = await E(`({bars: window.__jv.texts('.blocker-bar-row'), foot: window.__jv.text('.blocker-dashboard-foot'), highlight: window.__jv.text('.blocker-highlight')})`);
  await J(`setView('feed')`); await sleep(300);
  // Choose an open task that has no blocker yet
  const target = await E(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.querySelector('.blocker-checkin') && !c.querySelector('.blocker-current')); return c ? window.__jv.norm(c.querySelector('h3').innerText) : null})()`);
  F.target = target;
  await E(`(()=>{const c=window.__v.card(${JSON.stringify(target)}); const d=c.querySelector('.blocker-checkin'); d.open=true; d.scrollIntoView({block:'center'}); return true})()`); await sleep(200);
  await E(`window.__v.setVal(window.__v.card(${JSON.stringify(target)}).querySelector('.blocker-checkin input'), 'QA: waiting for principal sign-off')`); await sleep(100);
  F.click = await E(`window.__v.clickIn(window.__v.card(${JSON.stringify(target)}).querySelector('.blocker-options'), 'Too much other work')`); await sleep(300);
  F.toast = await V("toast()");
  F.cardAfter = await V(`cardInfo(${JSON.stringify(target)}).blocker`);
  F.selectedButton = await E(`window.__jv.norm(window.__v.card(${JSON.stringify(target)}).querySelector('.blocker-options button.selected')?.innerText)`);
  await E(`window.__v.card(${JSON.stringify(target)}).querySelector('.blocker-checkin').scrollIntoView({block:'center'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-blocker-checkin-recorded.png`, false);
  await J(`setView('dashboard')`); await sleep(300);
  F.dashAfter = await E(`({bars: window.__jv.texts('.blocker-bar-row'), foot: window.__jv.text('.blocker-dashboard-foot'), highlight: window.__jv.text('.blocker-highlight')})`);
  await V(`scrollTo('.blocker-dashboard')`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-blocker-leadership-aggregation.png`, false);
  await J(`setView('auditLog')`); await sleep(300);
  F.auditHasBlocker = await E(`document.querySelector('.jambavan-app').innerText.includes('Task blocker reported')`);
  R.features[`${vp}:blocker`] = F;
}

async function dependencyFlow(vp) {
  const F = {}; label = `${vp}:feature:dependency`; await setVp(vp); await fresh();
  F.seeded = { approve: await V(`cardInfo('Approve parent')`) };
  F.seededChain = await E(`['Prepare admission campaign poster','Send approved poster','Make school follow-up'].map(t=>({t, info: window.__v.cardInfo(t)}))`);
  // Cycle prevention: edit the head of the chain (task 8) -> its downstream tasks (9,10,11) must not be offered
  await openEdit("Prepare admission campaign poster"); await sleep(400);
  F.editHeading = await J(`text('.task-modal h2')`);
  F.optionsWhenEditingHead = await E(`[...document.querySelector('.dependency-field select').options].map(o=>o.text)`);
  F.cycleCandidatesOffered = F.optionsWhenEditingHead.filter(t => /Approve parent|Send approved poster|Make school follow-up/.test(t));
  await E(`document.querySelector('.dependency-field').scrollIntoView({block:'center'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-dependency-cycle-options.png`, false);
  await J(`clickText('Cancel', '.task-modal button', true)`); await sleep(250);
  // Editing the middle (task 10) must not offer task 11 (its downstream), but should offer task 8
  await openEdit("Send approved poster"); await sleep(400);
  const midOpts = await E(`[...document.querySelector('.dependency-field select').options].map(o=>o.text)`);
  F.midChain = { offersDownstream11: midOpts.some(t => t.includes("Make school follow-up")), offersUpstream8: midOpts.some(t => t.includes("Prepare admission campaign poster")), selected: await E(`document.querySelector('.dependency-field select').selectedOptions[0].text`) };
  await J(`clickText('Cancel', '.task-modal button', true)`); await sleep(250);
  // Pre-existing bug B1 check: after cancelling an edit, does Create task open the edit form?
  await J(`clickText('Create task', '.page-heading button')`); await sleep(350);
  F.createAfterCancelHeading = await J(`text('.task-modal h2')`);
  // Add a dependency: new task depending on an open task (fresh load so the B1 leak cannot interfere)
  await fresh();
  await J(`clickText('Create task', '.page-heading button')`); await sleep(350);
  F.createHeading = await J(`text('.task-modal h2')`);
  await E(`window.__v.setVal(document.querySelector('.task-modal input'), 'QA dependent task')`);
  const upstream = await E(`(()=>{const s=document.querySelector('.dependency-field select'); const o=[...s.options].find(o=>o.text.includes('Finalize October JEE')); window.__v.setVal(s, o.value); return s.selectedOptions[0].text})()`);
  F.chosenUpstream = upstream; await sleep(150);
  F.reach = await E(`(()=>{const r=e=>Math.round(e.getBoundingClientRect().bottom); const btn=[...document.querySelectorAll('.task-modal .modal-actions button')].pop(); return {dependencySelectBottom: r(document.querySelector('.dependency-field select')), createBtnBottom: r(btn), innerHeight, backdropOverflowY: getComputedStyle(document.querySelector('.modal-backdrop')).overflowY}})()`);
  await E(`document.querySelector('.dependency-field').scrollIntoView({block:'center'})`); await sleep(100);
  await p.shot(`${OUT}/${vp}-flow-dependency-create-select.png`, false);
  F.createClick = await E(`window.__v.clickIn(document.querySelector('.task-modal .modal-actions'), 'Create task')`); await sleep(400);
  F.modalClosed = !(await J("modalInfo()"));
  F.newCard = await V(`cardInfo('QA dependent task')`);
  F.upstreamCard = await V(`cardInfo('Finalize October JEE')`);
  await E(`window.__v.card('QA dependent task')?.scrollIntoView({block:'start'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-dependency-blocked-by.png`, false);
  await E(`window.__v.card('Finalize October JEE')?.querySelector('.dependency-downstream')?.scrollIntoView({block:'center'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-dependency-downstream-impact.png`, false);
  await J(`setView('dashboard')`); await sleep(300);
  F.leadershipPanel = await E(`({head: window.__jv.text('.dependency-dashboard-head strong'), rows: window.__jv.texts('.dependency-alert-row').map(t=>t.slice(0,140))})`);
  await V(`scrollTo('.dependency-dashboard')`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-dependency-leadership-panel.png`, false);
  R.features[`${vp}:dependency`] = F;
}

async function handoverFlow(vp) {
  const F = {}; label = `${vp}:feature:handover`; await setVp(vp); await fresh();
  F.seeded = await V(`cardInfo('scholarship')`) ?? await E(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.querySelector('.handover-summary')); return c ? {title: window.__jv.norm(c.querySelector('h3').innerText), handover: window.__jv.norm(c.querySelector('.handover-summary').innerText), owner: window.__jv.norm(c.querySelector('.owner-name')?.innerText)} : null})()`);
  F.seededAny = await E(`[...document.querySelectorAll('.task-card')].filter(c=>c.querySelector('.handover-summary')).map(c=>({title: window.__jv.norm(c.querySelector('h3').innerText), owner: window.__jv.norm(c.querySelector('.owner-name')?.innerText), handover: window.__jv.norm(c.querySelector('.handover-summary').innerText).slice(0,300)}))`);
  await E(`[...document.querySelectorAll('.task-card')].find(c=>c.querySelector('.handover-summary'))?.querySelector('.handover-summary').scrollIntoView({block:'center'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-handover-seeded-example.png`, false);
  F.openTasksWithButton = await E(`(()=>{const cs=[...document.querySelectorAll('.task-card')]; return {cards: cs.length, withButton: cs.filter(c=>c.querySelector('.handover-button')).length}})()`);
  const T = "Finalize October JEE";
  F.before = await V(`cardInfo(${JSON.stringify(T)})`);
  const notifBefore = await E(`(()=>{document.querySelector('[aria-label="Deadline reminders"]').click(); const t=window.__jv.text('.notification-panel'); document.querySelector('[aria-label="Deadline reminders"]').click(); return t.includes('Task handover received')})()`);
  F.notificationPresentBefore = notifBefore;
  F.openClick = await E(`window.__v.clickIn(window.__v.card(${JSON.stringify(T)}), 'Handover Task')`); await sleep(400);
  F.modal = await J("modalInfo()");
  F.prefill = await E(`(()=>{const m=document.querySelector('.handover-modal'); return {preview: window.__jv.text('.handover-preview'), to: m.querySelector('select').value, options: [...m.querySelector('select').options].map(o=>o.text), fields: [...m.querySelectorAll('input, textarea')].map(f=>f.value), createDisabled: [...m.querySelectorAll('.modal-actions button')].pop().disabled}})()`);
  await E(`(()=>{const m=document.querySelector('.handover-modal'); const s=window.__v; s.setVal(m.querySelector('select'), 'Neha Kapoor'); const t=[...m.querySelectorAll('textarea')]; s.setVal(t[0],'QA: timetable draft shared with faculty'); s.setVal(t[1],'QA: final batch count'); s.setVal(t[2],'QA: publish timetable by 07 Oct'); s.setVal(t[3],'QA: check lab slots'); return true})()`); await sleep(200);
  F.reach = await E(`(()=>{const btn=[...document.querySelectorAll('.handover-modal .modal-actions button')].pop(); return {createBtnBottom: Math.round(btn.getBoundingClientRect().bottom), innerHeight, modalOverflowY: getComputedStyle(document.querySelector('.handover-modal')).overflowY, backdropOverflowY: getComputedStyle(document.querySelector('.modal-backdrop')).overflowY}})()`);
  F.createEnabled = await E(`![...document.querySelectorAll('.handover-modal .modal-actions button')].pop().disabled`);
  await p.shot(`${OUT}/${vp}-flow-handover-modal-filled.png`, false);
  F.createClick = await E(`window.__v.clickIn(document.querySelector('.handover-modal .modal-actions'), 'Create handover package')`); await sleep(400);
  F.modalClosed = !(await E(`!!document.querySelector('.handover-modal')`));
  F.toast = await V("toast()");
  F.after = await V(`cardInfo(${JSON.stringify(T)})`);
  await E(`window.__v.card(${JSON.stringify(T)}).querySelector('.handover-summary')?.scrollIntoView({block:'center'})`); await sleep(150);
  await p.shot(`${OUT}/${vp}-flow-handover-package-on-card.png`, false);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(300);
  F.notification = await E(`(()=>{const t=window.__jv.text('.notification-panel'); const i=t.indexOf('Task handover received'); return i<0?null:t.slice(i,i+120)})()`);
  F.notificationPanelHas = await E(`window.__jv.text('.notification-panel').includes('Task handover received')`);
  await p.shot(`${OUT}/${vp}-flow-handover-notification.png`, false);
  await E(`document.querySelector('[aria-label="Deadline reminders"]').click()`); await sleep(200);
  await J(`setView('auditLog')`); await sleep(300); await E("scrollTo(0,0)");
  F.auditEntry = await E(`(()=>{const t=document.querySelector('.jambavan-app').innerText; const i=t.indexOf('Task handed over'); return i<0 ? null : t.slice(i, i+200).replace(/\\s+/g,' ')})()`);
  await p.shot(`${OUT}/${vp}-flow-handover-audit-entry.png`, true);
  R.features[`${vp}:handover`] = F;
}

async function oldFeatures(vp) {
  const F = {}; label = `${vp}:feature:old`; await setVp(vp); await fresh();
  // create
  const n0 = await E(`document.querySelectorAll('.task-card').length`);
  await J(`clickText('Create task', '.page-heading button')`); await sleep(300);
  await E(`window.__v.setVal(document.querySelector('.task-modal input'), 'QA regression task')`);
  await E(`window.__v.clickIn(document.querySelector('.task-modal .modal-actions'), 'Create task')`); await sleep(400);
  F.create = { before: n0, after: await E(`document.querySelectorAll('.task-card').length`), card: await E(`!!window.__v.card('QA regression task')`), toast: await V("toast()") };
  // edit
  await openEdit("QA regression task"); await sleep(350);
  F.editHeading = await J(`text('.task-modal h2')`);
  await E(`window.__v.setVal(document.querySelector('.task-modal input'), 'QA regression task edited')`);
  F.saveClick = await E(`window.__v.clickIn(document.querySelector('.task-modal .modal-actions'), 'Save')`); await sleep(400);
  F.edit = { edited: await E(`!!window.__v.card('QA regression task edited')`), cards: await E(`document.querySelectorAll('.task-card').length`) };
  // complete (task owned by You/Arjun)
  const completeTarget = await E(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>[...c.querySelectorAll('button')].some(b=>window.__jv.norm(b.innerText)==='Complete task')); return c ? window.__jv.norm(c.querySelector('h3').innerText) : null})()`);
  F.completeTarget = completeTarget;
  if (completeTarget) {
    await E(`window.__v.clickIn(window.__v.card(${JSON.stringify(completeTarget)}), 'Complete task')`); await sleep(400);
    F.complete = { toast: await V("toast()"), card: await E(`window.__jv.norm(window.__v.card(${JSON.stringify(completeTarget)})?.innerText).slice(0,260)`) };
    await E(`window.__v.card(${JSON.stringify(completeTarget)})?.scrollIntoView({block:'center'})`); await sleep(150);
    await p.shot(`${OUT}/${vp}-flow-old-complete-task.png`, false);
  }
  // MOM
  const byPh = (ph, v) => `window.__v.setVal([...document.querySelectorAll('.task-modal input, .task-modal textarea')].find(f=>f.placeholder===${JSON.stringify(ph)}), ${JSON.stringify(v)})`;
  const submit = `(()=>{const b=[...document.querySelectorAll('.task-modal .modal-actions button')].pop(); const t=window.__jv.norm(b.innerText); b.click(); return t})()`;
  await fresh(); await J(`setView('momDirectory')`); await sleep(300);
  await J(`clickText('Write new MOM')`); await sleep(350);
  F.momModal = await J(`text('.task-modal h2')`);
  await E(byPh("e.g. Faculty review", "QA MOM title")); await E(byPh("Write discussions, decisions, and context here...", "QA MOM body")); await sleep(100);
  F.momSubmit = await E(submit); await sleep(400);
  F.mom = { modalClosed: !(await J("modalInfo()")), toast: await V("toast()"), listed: await E(`document.querySelector('.jambavan-app').innerText.includes('QA MOM title')`) };
  await p.shot(`${OUT}/${vp}-flow-old-mom-saved.png`, false);
  // Event planner
  await fresh(); await J(`setView('eventPlanner')`); await sleep(300);
  const e0 = await E(`document.querySelectorAll('.event-plan-card').length`);
  await J(`clickText('Plan an event')`); await sleep(350);
  F.eventModal = await J(`text('.task-modal h2')`);
  await E(byPh("e.g. Parent orientation", "QA event")); await E(byPh("What needs to happen?", "QA brief")); await sleep(100);
  F.eventSubmit = await E(submit); await sleep(400);
  F.event = { modalClosed: !(await J("modalInfo()")), before: e0, after: await E(`document.querySelectorAll('.event-plan-card').length`), toast: await V("toast()"), listed: await E(`document.querySelector('.jambavan-app').innerText.includes('QA event')`) };
  await E("scrollTo(0,0)"); await p.shot(`${OUT}/${vp}-flow-old-event-created.png`, false);
  // Notices
  await fresh();
  await J(`clickText('Send notice')`); await sleep(350);
  F.noticeModal = await J(`text('.task-modal h2')`);
  await E(byPh("e.g. Sunday mock-test schedule", "QA notice")); await E(byPh("Write the schedule, instruction, or announcement...", "QA notice body")); await sleep(100);
  F.noticeSubmit = await E(submit); await sleep(400);
  F.notice = { modalClosed: !(await J("modalInfo()")), toast: await V("toast()"), listed: await E(`document.querySelector('.jambavan-app').innerText.includes('QA notice')`) };
  await p.shot(`${OUT}/${vp}-flow-old-notice-sent.png`, false);
  R.features[`${vp}:old`] = F;
}

const only = process.argv[2];
try {
  for (const vp of ["desktop", "mobile"]) {
    if (!only || only === "views") await viewPass(vp);
    if (!only || only === "modals") await modalPass(vp);
    if (!only || only === "flows") { await myDayFlow(vp); await blockerFlow(vp); await dependencyFlow(vp); await handoverFlow(vp); await oldFeatures(vp); }
  }
} catch (e) { R.fatal = `${label}: ${e.stack || e}`; }
writeFileSync(new URL(`./verify-v2-${only || "all"}.json`, import.meta.url), JSON.stringify(R, null, 1));
await p.close();
console.log(R.fatal || `done; console entries: ${R.console.length}`);
