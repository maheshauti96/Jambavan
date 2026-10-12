// Re-audit of the UPDATED app (checkpoint 5f248af): the 4 new features (My Day, blocker check-in,
// dependencies, Task Handover) plus a re-check of the round 1 findings A1–A9, B1–B11, C1–C12.
// Real browser (headless Chrome over CDP), desktop 1280×800 and mobile 390×844. Temporary tooling.
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const URL_ = "http://localhost:3000/";
const OUT = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before-v3";
mkdirSync(OUT, { recursive: true });
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const R = { console: [], desktop: {}, mobile: {}, recheck: {} };
let label = "init";
const p = await launch(9351);
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "warn", "assert"].includes(m.params.type))
    R.console.push({ label, type: m.params.type, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 200) });
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 200) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level) && !/manus-storage/.test(m.params.entry.url || ""))
    R.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 200) });
});
const E = e => p.eval(e);
const J = e => p.eval(`window.__jv.${e}`);
const sleep = p.sleep;
// Extra in-page helpers: multi-scope contrast, min font size, React-safe value setter, card lookup.
const extra = `window.__jv3 = (() => {
  const jv = window.__jv;
  function contrastAll(sel) {
    const els = [...document.querySelectorAll(sel)].filter(jv.visible); let checked = 0, failing = 0; const fails = [];
    const sizes = { lt10: 0, lt12: 0, total: 0 }; let minFont = 99;
    els.forEach((el, i) => { el.setAttribute("data-jv3", i); const c = jv.contrast('[data-jv3="' + i + '"]'); el.removeAttribute("data-jv3");
      checked += c.checked; failing += c.failingElements; fails.push(...c.fails); sizes.lt10 += c.sizes.lt10; sizes.lt12 += c.sizes.lt12; sizes.total += c.sizes.total; });
    for (const el of els) for (const n of el.querySelectorAll("*")) { if ([...n.childNodes].some(t => t.nodeType === 3 && t.textContent.trim()) && jv.visible(n)) minFont = Math.min(minFont, parseFloat(getComputedStyle(n).fontSize)); }
    const uniq = {}; for (const f of fails) if (!uniq[f.sel] || uniq[f.sel].minRatio > f.minRatio) uniq[f.sel] = f;
    return { scopes: els.length, checked, failing, sizes, minFont: minFont === 99 ? null : minFont, worst: Object.values(uniq).sort((a, b) => a.minRatio - b.minRatio).slice(0, 8).map(f => ({ sel: f.sel, ratio: f.minRatio, sample: f.sample, fg: f.fg, bg: f.bg, px: f.fontSize })) };
  }
  function taps(sel) { const els = [...document.querySelectorAll(sel)].filter(jv.visible).map(e => { const r = e.getBoundingClientRect(); return { t: jv.norm(e.innerText || e.getAttribute("aria-label") || e.placeholder || e.type).slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) }; });
    return { total: els.length, under44: els.filter(x => x.h < 44).length, under24: els.filter(x => x.h < 24 || x.w < 24).length, minH: els.length ? Math.min(...els.map(x => x.h)) : null, samples: els.slice(0, 6) }; }
  function setVal(el, v) { const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; }
  const card = t => [...document.querySelectorAll(".task-card")].find(c => c.innerText.includes(t));
  function btnIn(el, t) { return [...el.querySelectorAll("button")].find(b => jv.norm(b.innerText).includes(t)); }
  function unlabeledIn(sel) { const root = document.querySelector(sel); if (!root) return null; const f = [...root.querySelectorAll("input, select, textarea")].filter(jv.visible);
    const bad = f.filter(x => !(x.labels && x.labels.length) && !x.getAttribute("aria-label") && !x.getAttribute("aria-labelledby"));
    const iconBtns = [...root.querySelectorAll("button")].filter(jv.visible).filter(b => !jv.norm(b.innerText) && !b.getAttribute("aria-label"));
    return { fields: f.length, withoutAccessibleName: bad.map(x => x.placeholder || x.type), iconButtonsWithoutName: iconBtns.length }; }
  function overflowCulprits() { const vw = innerWidth; return { scrollWidth: document.documentElement.scrollWidth, innerWidth: vw,
    culprits: [...document.querySelectorAll(".content-wrap *, main *")].filter(e => jv.visible(e) && e.getBoundingClientRect().right > vw + 2).map(e => ({ c: (typeof e.className === "string" && e.className ? e.className : e.tagName).slice(0, 40), right: Math.round(e.getBoundingClientRect().right) })).filter((x, i, a) => a.findIndex(y => y.c === x.c) === i).slice(0, 8) }; }
  function dialogInfo(sel) { const m = document.querySelector(sel); if (!m) return null; const r = m.getBoundingClientRect(); const cs = getComputedStyle(m);
    const bd = m.closest(".modal-backdrop"); const bcs = bd ? getComputedStyle(bd) : null;
    const primary = [...m.querySelectorAll(".modal-actions button")].pop(); const pr = primary?.getBoundingClientRect();
    const closeBtn = m.querySelector(".modal-head button");
    return { height: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom), innerHeight, maxHeight: cs.maxHeight, overflowY: cs.overflowY, backdropOverflowY: bcs?.overflowY,
      role: m.getAttribute("role") || bd?.getAttribute("role"), ariaModal: m.getAttribute("aria-modal") || bd?.getAttribute("aria-modal"),
      primaryText: jv.norm(primary?.innerText), primaryBottom: pr ? Math.round(pr.bottom) : null, primaryReachableWithoutScroll: pr ? pr.bottom <= innerHeight : null,
      closeButtonName: closeBtn ? (closeBtn.getAttribute("aria-label") || jv.norm(closeBtn.innerText) || "(none)") : null }; }
  return { contrastAll, taps, setVal, card, btnIn, unlabeledIn, overflowCulprits, dialogInfo };
})(); true;`;
const K = e => p.eval(`window.__jv3.${e}`);
async function fresh() { await p.goto(URL_); await E(inpage); await E(extra); }
async function openNav(text, vp) {
  if (vp === "mobile") { await E(`document.querySelector('[aria-label="Open menu"]').click()`); await sleep(250); }
  const ok = await E(`(()=>{const b=[...document.querySelectorAll('.sidebar button')].find(b=>window.__jv.norm(b.innerText).startsWith(${JSON.stringify(text)})); if(!b) return false; b.click(); return true})()`);
  await sleep(350); await E("scrollTo(0,0)"); return ok;
}
async function tabTrap(insideSel, n = 25) {
  for (let i = 0; i < n; i++) { await p.key("Tab", "Tab", 9); const inside = await E(`!!document.activeElement?.closest(${JSON.stringify(insideSel)})`); if (!inside) return { escapedAfterTabs: i + 1, to: await J("focusInfo()") }; }
  return { escapedAfterTabs: null };
}

for (const [vp, w, h, mob] of [["desktop", 1280, 800, false], ["mobile", 390, 844, true]]) {
  await p.viewport(w, h, mob);
  const V = R[vp];
  // ---------- Feed: new TaskCard elements ----------
  label = `${vp}:feed`; await fresh();
  V.feed = {
    overflow: await K("overflowCulprits()"),
    contrastWhole: await J("contrast('.jambavan-app')").then(c => ({ checked: c.checked, failing: c.failingElements, sizes: c.sizes })),
    blockerCheckin: await K("contrastAll('.blocker-checkin')"),
    blockerTaps: await K("taps('.blocker-checkin summary, .blocker-options button, .blocker-checkin input')"),
    dependencyBlocked: await K("contrastAll('.dependency-blocked')"),
    dependencyDownstream: await K("contrastAll('.dependency-downstream')"),
    handoverSummary: await K("contrastAll('.handover-summary')"),
    ackRow: await K("contrastAll('.ack-row')"),
    ackRowTaps: await K("taps('.ack-row button')"),
    blockerInputsUnlabeled: await E(`[...document.querySelectorAll('.blocker-checkin input')].filter(i=>!(i.labels&&i.labels.length)&&!i.getAttribute('aria-label')).length`),
    blockerSelectedState: await E(`(()=>{const s=document.querySelector('.blocker-options button.selected'); const u=s&&[...s.parentElement.querySelectorAll('button')].find(b=>!b.classList.contains('selected')); if(!s||!u) return null; const a=getComputedStyle(s), b=getComputedStyle(u);
      return { selected: {color:a.color,bg:a.backgroundColor,border:a.borderColor,weight:a.fontWeight}, unselected: {color:b.color,bg:b.backgroundColor,border:b.borderColor,weight:b.fontWeight}, ariaPressed: s.getAttribute('aria-pressed'), hasIconOrText: /✓|selected/i.test(s.innerText) }})()`),
    detailsOpenByDefault: await E(`[...document.querySelectorAll('.blocker-checkin')].filter(d=>d.open).length + ' of ' + document.querySelectorAll('.blocker-checkin').length`),
    taskCardHeights: await E(`[...document.querySelectorAll('.task-card')].map(c=>Math.round(c.getBoundingClientRect().height))`),
    firstTaskCardTop: await E(`Math.round(document.querySelector('.task-card').getBoundingClientRect().top+scrollY)`),
    cardCount: await E(`document.querySelectorAll('.task-card').length`),
    campaignCategories: await E(`["Prepare admission campaign poster","Approve admission campaign poster","Send approved poster to schools","Make school follow-up calls","Update admission data"].map(t=>{const c=window.__jv3.card(t); return t.slice(0,22)+': '+(c?window.__jv.norm(c.querySelector('.category-pill')?.innerText):'(not rendered)')})`),
    handoverButtonCount: await E(`[...document.querySelectorAll('.handover-button')].length`),
    myDayButtonCount: await E(`[...document.querySelectorAll('.my-day-link')].length`),
  };
  await p.shot(`${OUT}/${vp}-feed-full.png`, true);
  // focus visibility on the new controls
  V.focus = {};
  for (const [k, sel] of [["blockerSummary", ".blocker-checkin summary"], ["blockerOption", ".blocker-options button"], ["handoverButton", ".handover-button"], ["myDayButton", ".my-day-link"]]) {
    await E(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); e.scrollIntoView({block:'center'}); document.body.focus(); return true})()`);
    // reach it by keyboard: focus previous element then Tab once
    await E(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); const all=[...document.querySelectorAll('button, summary, input, select, textarea, a[href]')].filter(window.__jv.visible); const i=all.indexOf(e); (all[i-1]||document.body).focus(); return i})()`);
    await p.key("Tab", "Tab", 9);
    V.focus[k] = { ...(await J("focusInfo()")), reachedTarget: await E(`document.activeElement === document.querySelector(${JSON.stringify(sel)})`) };
  }
  // Space on the summary toggles the details (keyboard)
  V.focus.summaryToggleByKey = await E(`(()=>{const d=[...document.querySelectorAll('.blocker-checkin')].find(d=>!d.open); if(!d) return 'none closed'; d.querySelector('summary').focus(); return d.open})()`);
  await p.key("Enter", "Enter", 13);
  V.focus.summaryOpenAfterEnter = await E(`document.activeElement?.parentElement?.open ?? null`);

  // ---------- Blocker check-in flow + toast ----------
  label = `${vp}:blocker`; await fresh();
  V.blocker = await E(`(()=>{const c=window.__jv3.card('Approve parent orientation deck'); const d=c.querySelector('.blocker-checkin'); d.open=true; window.__jv3.setVal(d.querySelector('input'),'QA note'); return {before: window.__jv.norm(d.querySelector('.blocker-current')?.innerText)||null}})()`);
  await E(`window.__jv3.btnIn(window.__jv3.card('Approve parent orientation deck'),'Too much other work').click()`); await sleep(300);
  Object.assign(V.blocker, await E(`(()=>{const c=window.__jv3.card('Approve parent orientation deck'); return { after: window.__jv.norm(c.querySelector('.blocker-current')?.innerText), toast: window.__jv.norm(document.querySelector('.toast')?.innerText)||null, toastRole: document.querySelector('.toast')?.getAttribute('role')||null, clearBlockerControl: !!window.__jv3.btnIn(c,'Clear') || !!window.__jv3.btnIn(c,'Resolved') }})()`));
  // Blocker kept after completion and reopen? Use task 1 (Arjun's) → cannot complete (A4). Use a new "You" task instead.
  // ---------- My Day ----------
  label = `${vp}:myDay`; await fresh();
  V.myDay = { navClicked: await openNav("My Day", vp) };
  Object.assign(V.myDay, {
    heading: await J("text('.page-heading h1')"),
    pageSubtitleOrDate: await E(`window.__jv.norm(document.querySelector('.page-heading p, .page-heading small, .topbar')?.innerText).slice(0,120)`),
    dateInput: await E(`document.querySelector('.my-day-view input[type=date]')?.value`),
    dateLabel: await E(`window.__jv.norm(document.querySelector('.my-day-heading .eyebrow')?.innerText)`),
    overflow: await K("overflowCulprits()"),
    contrast: await K("contrastAll('.my-day-view')"),
    taps: await K("taps('.my-day-view button, .my-day-view input, .my-day-view select, .my-day-view textarea')"),
    unlabeled: await K("unlabeledIn('.my-day-view')"),
    headings: await E(`[...document.querySelectorAll('.my-day-view h2, .my-day-view h3')].map(h=>h.tagName+':'+window.__jv.norm(h.innerText))`),
  });
  await p.shot(`${OUT}/${vp}-myDay-full.png`, true);
  // Bug probe 1: Edit on a schedule block removes it before the edit is saved
  V.myDay.scheduleEdit = { before: await E(`document.querySelectorAll('.schedule-row').length`) };
  await E(`window.__jv3.btnIn(document.querySelector('.schedule-row'),'Edit').click()`); await sleep(200);
  V.myDay.scheduleEdit.afterEditClick = await E(`document.querySelectorAll('.schedule-row').length`);
  V.myDay.scheduleEdit.draftTitle = await E(`[...document.querySelectorAll('.my-day-view input')].find(i=>i.placeholder==='Activity or time block')?.value`);
  // switching the date (or leaving the view) now loses the block
  await E(`window.__jv3.setVal(document.querySelector('.my-day-view input[type=date]'),'2026-10-20')`); await sleep(150);
  await E(`window.__jv3.btnIn(document.querySelector('.my-day-heading'),'Today').click()`); await sleep(200);
  V.myDay.scheduleEdit.afterDateSwitchAndBack = await E(`document.querySelectorAll('.schedule-row').length`);
  // Bug probe 2: a saved review field cannot be cleared
  await E(`(()=>{const t=document.querySelector('.end-day-card textarea'); window.__jv3.setVal(t,'Finished the timetable'); return true})()`); await sleep(100);
  await E(`window.__jv3.btnIn(document.querySelector('.end-day-card'),'Save review').click()`); await sleep(200);
  V.myDay.reviewToast = await E(`window.__jv.norm(document.querySelector('.toast')?.innerText)||null`);
  await E(`window.__jv3.setVal(document.querySelector('.end-day-card textarea'),'')`); await sleep(150);
  V.myDay.reviewValueAfterClearing = await E(`document.querySelector('.end-day-card textarea').value`);
  // Top 3 cap and keyboard Enter
  await E(`(()=>{const i=[...document.querySelectorAll('.my-day-view input')].find(i=>i.placeholder==='Add a priority...'); i.focus(); window.__jv3.setVal(i,'Second arrow'); return true})()`);
  await p.key("Enter", "Enter", 13);
  await E(`(()=>{const i=[...document.querySelectorAll('.my-day-view input')].find(i=>i.placeholder==='Add a priority...'); i.focus(); window.__jv3.setVal(i,'Third arrow'); return true})()`);
  await p.key("Enter", "Enter", 13);
  V.myDay.top3 = { count: await E(`window.__jv.norm(document.querySelector('.top3-card .my-day-count')?.innerText)`), addInputStillShown: await E(`!![...document.querySelectorAll('.my-day-view input')].find(i=>i.placeholder==='Add a priority...')`) };
  // Linked task after handover: add task 1 to My Day, hand it over, check My Day still lists it
  label = `${vp}:myDay-link-handover`; await fresh();
  await E(`(()=>{const c=window.__jv3.card('Finalize October JEE'); c.querySelector('.my-day-link').click(); return true})()`); await sleep(200);
  V.myDay.addToMyDayToast = await E(`window.__jv.norm(document.querySelector('.toast')?.innerText)||null`);
  await E(`(()=>{const c=window.__jv3.card('Finalize October JEE'); window.__jv3.btnIn(c,'Handover Task').click(); return true})()`); await sleep(250);
  await E(`(()=>{const s=document.querySelector('.handover-modal select'); window.__jv3.setVal(s,'Neha Kapoor'); return true})()`); await sleep(100);
  await E(`window.__jv3.btnIn(document.querySelector('.handover-modal'),'Create handover package').click()`); await sleep(250);
  await openNav("My Day", vp);
  V.myDay.linkedAfterHandover = await E(`window.__jv.norm(document.querySelector('.academy-day-card')?.innerText).slice(0,220)`);
  await p.shot(`${OUT}/${vp}-myDay-linked-task-after-handover.png`, true);

  // ---------- Task Handover dialog ----------
  label = `${vp}:handover`; await fresh();
  await E(`(()=>{const c=window.__jv3.card('Finalize October JEE'); const b=window.__jv3.btnIn(c,'Handover Task'); b.scrollIntoView({block:'center'}); b.focus(); b.click(); return true})()`); await sleep(400);
  V.handover = {
    dialog: await K("dialogInfo('.handover-modal')"),
    contrast: await K("contrastAll('.handover-modal')"),
    taps: await K("taps('.handover-modal button, .handover-modal input, .handover-modal select, .handover-modal textarea')"),
    unlabeled: await K("unlabeledIn('.handover-modal')"),
    defaults: await E(`(()=>{const m=document.querySelector('.handover-modal'); return {to: m.querySelector('select').value, statusField: m.querySelector('input[readonly]')?.value, textareas: [...m.querySelectorAll('textarea')].map(t=>t.value)}})()`),
    focusOnOpen: await J("focusInfo()"),
  };
  await p.shot(`${OUT}/${vp}-handover-dialog.png`, false);
  V.handover.tab = await tabTrap(".handover-modal");
  await p.key("Escape", "Escape", 27); await sleep(200);
  V.handover.closesOnEscape = !(await E(`!!document.querySelector('.handover-modal')`));
  // Wrong default recipient on task 4 (owner "You", contributor "You")
  label = `${vp}:handover-task4`; await fresh();
  await E(`(()=>{const c=window.__jv3.card('Approve parent orientation deck'); window.__jv3.btnIn(c,'Handover Task').click(); return true})()`); await sleep(300);
  V.handover.task4 = await E(`(()=>{const m=document.querySelector('.handover-modal'); const s=m.querySelector('select'); const b=window.__jv3.btnIn(m,'Create handover package'); return { domSelectValue: s.value, shownOption: s.options[s.selectedIndex]?.text, optionCount: s.options.length, youIsAnOption: [...s.options].some(o=>o.value==='You'), createEnabled: !b.disabled }})()`);
  if (V.handover.task4.createEnabled) {
    await E(`window.__jv3.btnIn(document.querySelector('.handover-modal'),'Create handover package').click()`); await sleep(300);
    V.handover.task4.afterCreate = await E(`(()=>{const c=window.__jv3.card('Approve parent orientation deck'); return { owner: window.__jv.norm(c.querySelector('.owner-name')?.innerText), pkg: window.__jv.norm(c.querySelector('.handover-summary-head')?.innerText), toast: window.__jv.norm(document.querySelector('.toast')?.innerText) }})()`);
  }
  // Handover of somebody else's task: "Created by" is always Arjun Mehta; a second handover replaces the first package
  label = `${vp}:handover-task2`; await fresh();
  V.handover.seedTask2 = await E(`(()=>{const c=window.__jv3.card('Call pending scholarship'); return { owner: window.__jv.norm(c.querySelector('.owner-name')?.innerText), pkg: window.__jv.norm(c.querySelector('.handover-summary-head')?.innerText) }})()`);
  await E(`(()=>{const c=window.__jv3.card('Call pending scholarship'); window.__jv3.btnIn(c,'Handover Task').click(); return true})()`); await sleep(300);
  await E(`window.__jv3.setVal(document.querySelector('.handover-modal select'),'Manav Shah')`); await sleep(80);
  await E(`window.__jv3.btnIn(document.querySelector('.handover-modal'),'Create handover package').click()`); await sleep(300);
  V.handover.task2After = await E(`(()=>{const c=window.__jv3.card('Call pending scholarship'); return { owner: window.__jv.norm(c.querySelector('.owner-name')?.innerText), packages: c.querySelectorAll('.handover-summary').length, pkg: window.__jv.norm(c.querySelector('.handover-summary-head')?.innerText) }})()`);
  V.handover.auditTop = await E(`(()=>{return true})()`);
  // ---------- Create task dialog with "Depends on" ----------
  label = `${vp}:create-task`; await fresh();
  await E(`[...document.querySelectorAll('.page-heading button')].find(b=>b.innerText.includes('Create task')).click()`); await sleep(400);
  V.createTask = {
    dialog: await K("dialogInfo('.task-modal')"),
    dependsOn: await E(`(()=>{const s=document.querySelector('.dependency-field select'); const r=s.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), accessibleNameSource: s.labels?.length ? window.__jv.norm(s.labels[0].innerText) : null, options: s.options.length, hintFontPx: parseFloat(getComputedStyle(document.querySelector('.dependency-field small')).fontSize) }})()`),
    dependsOnContrast: await K("contrastAll('.dependency-field')"),
  };
  await p.shot(`${OUT}/${vp}-create-task-dialog-depends-on.png`, false);
  // dependency not enforced on completion: create a "You" task depending on task 2 (not started), then complete it
  await E(`(()=>{const m=document.querySelector('.task-modal'); window.__jv3.setVal(m.querySelector('input'),'QA dependent own task'); const s=m.querySelector('.dependency-field select'); const o=[...s.options].find(o=>o.text.includes('Call pending scholarship')); window.__jv3.setVal(s,o.value); return true})()`); await sleep(100);
  await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await sleep(300);
  const depCard = `window.__jv3.card('QA dependent own task')`;
  V.createTask.dependentCard = await E(`(()=>{const c=${depCard}; return { blockedBy: window.__jv.norm(c.querySelector('.dependency-blocked')?.innerText), completeButton: !!window.__jv3.btnIn(c,'Complete task') }})()`);
  if (V.createTask.dependentCard.completeButton) {
    await E(`window.__jv3.btnIn(${depCard},'Complete task').click()`); await sleep(300);
    V.createTask.dependentCard.afterComplete = await E(`(()=>{const c=${depCard}; return { done: c.classList.contains('is-done'), stamp: window.__jv.norm(c.querySelector('.done-stamp')?.innerText), upstreamStillOpen: !window.__jv3.card('Call pending scholarship').classList.contains('is-done') }})()`);
  }
  // ---------- Dashboard panels ----------
  label = `${vp}:dashboard`; await fresh();
  await openNav("Dashboard", vp);
  V.dashboard = {
    overflow: await K("overflowCulprits()"),
    blockerPanel: await K("contrastAll('.blocker-dashboard')"),
    dependencyPanel: await K("contrastAll('.dependency-dashboard')"),
    blockerHeadline: await E(`window.__jv.norm(document.querySelector('.blocker-dashboard-head')?.innerText).slice(-90)`),
    blockerBars: await E(`window.__jv.norm(document.querySelector('.blocker-dashboard')?.innerText).slice(0,600)`),
    dependencyRows: await E(`[...document.querySelectorAll('.dependency-dashboard [class*=row], .dependency-dashboard [class*=item]')].map(r=>window.__jv.norm(r.innerText)).filter(Boolean).slice(0,6)`),
    dependencyCount: await E(`window.__jv.norm(document.querySelector('.dependency-dashboard-head > strong')?.innerText)`),
  };
  await p.shot(`${OUT}/${vp}-dashboard-full.png`, true);
}

// ---------- Re-check of round 1 findings (desktop unless noted) ----------
await p.viewport(1280, 800, false);
const RC = R.recheck;
label = "recheck:load"; await fresh();
RC.nav = await J("navButtons()");
RC.viewportMeta = await E(`document.querySelector('meta[name=viewport]')?.content`);
RC.fonts = await E(`({ size: document.fonts.size, bodyFont: getComputedStyle(document.body).fontFamily })`);
RC.images = await J("images()");
RC.staticMetrics = await E(`[...document.querySelectorAll('.metric-card')].map(c=>window.__jv.norm(c.innerText))`);
RC.navBadge = await E(`window.__jv.norm(document.querySelector('.sidebar button em')?.innerText)`);
RC.toastAtLoad = await E(`window.__jv.norm(document.querySelector('.toast')?.innerText)||null`);
await sleep(8000);
RC.toastAfter8s = await E(`window.__jv.norm(document.querySelector('.toast')?.innerText)||null`);
RC.sidebar = await E(`(()=>{const s=document.querySelector('.sidebar');return {clientHeight:s.clientHeight, scrollHeight:s.scrollHeight, overflowY:getComputedStyle(s).overflowY}})()`);
RC.task1 = await E(`(()=>{const c=window.__jv3.card('Finalize October JEE'); return { completeButton: !!window.__jv3.btnIn(c,'Complete task'), ownerNote: window.__jv.norm(c.querySelector('.owner-only')?.innerText) }})()`);
RC.blockedCardShowsStatus = await E(`(()=>{const c=window.__jv3.card('Resolve projector'); return /\\bblocked\\b/i.test(c.querySelector('.task-card-topline')?.innerText + ' ' + (c.querySelector('.task-meta-row')?.innerText||''))})()`);
RC.task9StatusVisible = await E(`(()=>{const c=window.__jv3.card('Approve admission campaign poster'); return { topline: window.__jv.norm(c.querySelector('.task-card-topline')?.innerText), meta: window.__jv.norm(c.querySelector('.task-meta-row')?.innerText) }})()`);
RC.grammar = await E(`({ peopleSeen: [...new Set([...document.querySelectorAll('.ack-row > span')].map(s=>window.__jv.norm(s.innerText)))].slice(0,3), updates: window.__jv.norm(document.querySelector('.hanuman-journal-head > span')?.innerText) })`);
// A1 HANUMAN edit data loss
label = "recheck:A1"; await fresh();
const hn = `window.__jv3.card('Build the 2027')`;
RC.A1 = { before: await E(`(()=>{const c=${hn}; return { updates: window.__jv.norm(c.querySelector('.hanuman-journal-head > span')?.innerText), progress: window.__jv.norm(c.querySelector('.task-progress > span')?.innerText), team: window.__jv.norm(c.querySelector('.owner-team')?.innerText) }})()`) };
await E(`${hn}.querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await sleep(300);
RC.A1.after = await E(`(()=>{const c=${hn}; return { updates: window.__jv.norm(c.querySelector('.hanuman-journal-head > span')?.innerText), progress: window.__jv.norm(c.querySelector('.task-progress > span')?.innerText)||'(no bar)', team: window.__jv.norm(c.querySelector('.owner-team')?.innerText) }})()`);
// edit keeps blocker / handover / dependency?
label = "recheck:edit-new-fields"; await fresh();
const t2 = `window.__jv3.card('Call pending scholarship')`, t10 = `window.__jv3.card('Send approved poster')`;
await E(`${t2}.querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await sleep(300);
RC.editKeepsNewFields = { task2: await E(`(()=>{const c=${t2}; return { blocker: !!c.querySelector('.blocker-current'), handover: !!c.querySelector('.handover-summary') }})()`) };
await E(`${t10}.querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
await E(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await sleep(300);
RC.editKeepsNewFields.task10 = await E(`(()=>{const c=${t10}; return { blockedBy: window.__jv.norm(c.querySelector('.dependency-blocked')?.innerText) }})()`);
// A2 cancel-edit leak
label = "recheck:A2"; await fresh();
await E(`document.querySelector('[aria-label="Edit task"]').click()`); await sleep(250);
await E(`[...document.querySelectorAll('.task-modal button')].find(b=>window.__jv.norm(b.innerText)==='Cancel').click()`); await sleep(250);
await E(`[...document.querySelectorAll('.page-heading button')].find(b=>b.innerText.includes('Create task')).click()`); await sleep(300);
RC.A2 = { heading: await J("text('.task-modal h2')"), hasDelete: await E(`!!document.querySelector('.task-modal .danger-button')`) };
// A3 / A8 modal metrics for the legacy create dialog are in V.createTask; A7 delete without confirm
label = "recheck:A7"; await fresh();
const nCards = await E(`document.querySelectorAll('.task-card').length`);
await E(`document.querySelector('[aria-label="Edit task"]').click()`); await sleep(250);
await E(`document.querySelector('.task-modal .danger-button')?.click()`); await sleep(300);
RC.A7 = { cardsBefore: nCards, cardsAfterDelete: await E(`document.querySelectorAll('.task-card').length`), confirmShown: await E(`!!document.querySelector('[role=alertdialog]')`) };
// A6 event edit duplicates
label = "recheck:A6"; await fresh();
await J(`setView('eventPlanner')`); await sleep(300);
const evBefore = await E(`[...document.querySelectorAll('h3, strong')].filter(e=>window.__jv.norm(e.innerText)==='Annual Parent Orientation').length`);
const clicked = await J(`clickText('Edit plan')`); await sleep(300);
if (clicked) { await E(`[...document.querySelectorAll('.event-modal .modal-actions button')].pop()?.click()`); await sleep(300); }
RC.A6 = { editPlanButton: !!clicked, before: evBefore, after: await E(`[...document.querySelectorAll('h3, strong')].filter(e=>window.__jv.norm(e.innerText)==='Annual Parent Orientation').length`) };
// B5 overflow culprits (mobile) on Dashboard, Role matrix, My Day
await p.viewport(390, 844, true);
RC.B5 = {};
for (const v of ["dashboard", "roleMatrix", "myDay", "feed"]) { label = `recheck:B5:${v}`; await fresh(); await J(`setView('${v}')`); await sleep(300); RC.B5[v] = await K("overflowCulprits()"); }
// C1 first card offset mobile
label = "recheck:C1-mobile"; await fresh();
RC.C1mobile = await E(`Math.round(document.querySelector('.task-card').getBoundingClientRect().top+scrollY)`);
RC.mobileTapsFeed = await J("tapTargets()").then(t => ({ total: t.total, under44: t.under44, under24: t.under24 }));
R.consoleSummary = R.console.reduce((a, c) => { const k = c.label.split(":").slice(0, 2).join(":") + " " + c.type + " " + c.text.slice(0, 60); a[k] = (a[k] || 0) + 1; return a; }, {});
writeFileSync(new URL("./audit-v3-report.json", import.meta.url), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1).slice(0, 200) + "\n…written audit-v3-report.json");
await p.close();
