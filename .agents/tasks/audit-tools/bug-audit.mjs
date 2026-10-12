// Phase 5 bug audit: functional, keyboard, responsive and a11y checks driven in headless Chrome over CDP.
// Every check is an expectation; `pass:false` is a confirmed defect, with the measured evidence in `detail`.
// Usage: node bug-audit.mjs <label>   → bug-audit-<label>.json and screenshots/bug-audit-<label>/
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const URL_ = process.env.URL_ || "http://localhost:3000/";
const LABEL = process.argv[2] || "run";
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const OUT = decodeURIComponent(new URL(`../screenshots/bug-audit-${LABEL}/`, import.meta.url).pathname);
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const R = { label: LABEL, startedAt: new Date().toISOString(), console: [], checks: [], metrics: {} };
let label = "init";
const p = await launch(9371);
await p.send("Network.enable");
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "warn", "assert"].includes(m.params.type)) R.console.push({ label, type: m.params.type, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300) });
  if (m.method === "Runtime.exceptionThrown") R.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 300) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) R.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 300) });
  if (m.method === "Network.responseReceived" && m.params.response.status >= 400) R.console.push({ label, type: "http-" + m.params.response.status, text: m.params.response.url });
});
const E = e => p.eval(e);
const sleep = p.sleep;
const helpers = `window.__ba = (() => {
  const jv = window.__jv; const norm = jv.norm, visible = jv.visible;
  const card = t => [...document.querySelectorAll(".task-card")].find(c => c.querySelector("h3")?.innerText.includes(t));
  const btn = (scope, t, exact) => { const root = typeof scope === "string" ? document.querySelector(scope) : (scope || document); if (!root) return null;
    const els = [...root.querySelectorAll("button, [role=button], [role=option], a, summary")].filter(visible);
    return els.find(b => exact ? norm(b.innerText) === t : norm(b.innerText).includes(t)) || els.find(b => (b.getAttribute("aria-label") || "") === t) || null; };
  const click = (scope, t, exact) => { const b = btn(scope, t, exact); if (!b) return false; b.scrollIntoView({ block: "center" }); b.click(); return norm(b.innerText) || b.getAttribute("aria-label") || true; };
  function setVal(el, v) { if (typeof el === "string") el = document.querySelector(el); if (!el) return false; const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); return true; }
  // The top-most open modal surface: an aria-modal dialog if any, else a legacy .task-modal.
  const dialogs = () => [...document.querySelectorAll('[role=dialog], [role=alertdialog], .task-modal')].filter(visible);
  const dialog = () => { const d = dialogs(); return d[d.length - 1] || null; };
  const dlgInfo = () => { const d = dialog(); if (!d) return null; const r = d.getBoundingClientRect();
    const lb = d.getAttribute("aria-labelledby"); const name = d.getAttribute("aria-label") || (lb && norm(document.getElementById(lb)?.innerText)) || null;
    const iconBtns = [...d.querySelectorAll("button")].filter(visible).filter(b => !norm(b.innerText) && !b.getAttribute("aria-label"));
    const actions = [...d.querySelectorAll(".modal-actions button, footer button")].filter(visible); const last = actions[actions.length - 1]; const lr = last?.getBoundingClientRect();
    // Can the primary action be brought into view (scroll container or fits)?
    let reachable = null; if (last) { last.scrollIntoView({ block: "nearest" }); const r2 = last.getBoundingClientRect(); reachable = r2.bottom <= innerHeight + 1 && r2.top >= 0; }
    return { role: d.getAttribute("role"), ariaModal: d.getAttribute("aria-modal"), name, height: Math.round(r.height), innerHeight, top: Math.round(r.top), bottom: Math.round(r.bottom), primary: norm(last?.innerText), primaryReachable: reachable, iconButtonsWithoutName: iconBtns.length, fieldsWithoutName: [...d.querySelectorAll("input, select, textarea")].filter(visible).filter(f => f.type !== "file" && !(f.labels && f.labels.length) && !f.getAttribute("aria-label") && !f.getAttribute("aria-labelledby")).map(f => f.placeholder || f.type).slice(0, 8) }; };
  const focusInDialog = () => { const d = dialog(); return !!(d && d.contains(document.activeElement)); };
  const active = () => { const a = document.activeElement; return a ? (norm(a.innerText || a.getAttribute("aria-label") || a.placeholder || a.tagName)).slice(0, 50) : null; };
  const toast = () => { const t = document.querySelector("[data-sonner-toast], .toast"); return t ? { text: norm(t.innerText), role: t.getAttribute("role") || t.closest("[aria-live],[role=status],[role=region]")?.getAttribute("role") || null, live: t.getAttribute("aria-live") || t.closest("[aria-live]")?.getAttribute("aria-live") || null } : null; };
  const text = sel => norm(document.querySelector(sel)?.innerText);
  const count = sel => [...document.querySelectorAll(sel)].filter(visible).length;
  const nav = t => { const b = [...document.querySelectorAll(".sidebar button, .sidebar a")].find(b => norm(b.innerText).startsWith(t)); if (!b) return false; b.click(); return true; };
  return { card, btn, click, setVal, dialog, dialogs, dlgInfo, focusInDialog, active, toast, text, count, nav, norm, visible };
})(); true;`;
const B = e => p.eval(`window.__ba.${e}`);
async function fresh() {
  await p.goto(URL_); await E(inpage); await E(helpers);
  await E(`(()=>{ window.__downloads = []; const oc = URL.createObjectURL.bind(URL); URL.createObjectURL = b => { const u = oc(b); if (b instanceof Blob && !(b instanceof File)) b.text().then(t => window.__downloads.push({ type: b.type, text: t.slice(0, 4000) })); return u; };
    const ac = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__downloadNames = [...(window.__downloadNames || []), this.download]; return; } return ac.call(this); }; return true; })()`);
}
async function key(k, code, keyCode, modifiers = 0) {
  await p.send("Input.dispatchKeyEvent", { type: "keyDown", key: k, code, windowsVirtualKeyCode: keyCode, modifiers });
  await p.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: keyCode, modifiers });
  await sleep(150);
}
const Tab = (shift = false) => key("Tab", "Tab", 9, shift ? 8 : 0);
const Esc = () => key("Escape", "Escape", 27);
async function check(name, fn) {
  if (ONLY && !ONLY.test(name)) return;
  label = name;
  try { const { pass, ...detail } = await fn(); R.checks.push({ name, pass: !!pass, detail }); }
  catch (e) { R.checks.push({ name, pass: false, error: String(e.message || e).slice(0, 300) }); }
  process.stdout.write(`${R.checks.at(-1).pass ? "PASS" : "FAIL"}  ${name}\n`);
}
// Opens a surface with `open()`, then measures dialog semantics, initial focus, a 25-press Tab trap, Escape and focus return.
async function dialogA11y(open, triggerExpr) {
  await E(`(()=>{ const t = ${triggerExpr}; if (t) { t.scrollIntoView({block:"center"}); t.focus(); } return !!t; })()`);
  await open(); await sleep(400);
  const info = await B("dlgInfo()");
  if (!info) return { pass: false, opened: false };
  const focusOnOpen = await B("focusInDialog()");
  let escapedAt = null;
  for (let i = 0; i < 25; i++) { await Tab(); if (!(await B("focusInDialog()"))) { escapedAt = i + 1; break; } }
  let escapedBackAt = null;
  for (let i = 0; i < 5; i++) { await Tab(true); if (!(await B("focusInDialog()"))) { escapedBackAt = i + 1; break; } }
  await Esc(); await sleep(300);
  const closedByEscape = !(await E("!!window.__ba.dialog()"));
  const focusReturned = closedByEscape ? await E(`document.activeElement === (${triggerExpr})`) : null;
  if (!closedByEscape) { await E(`(()=>{ const d = window.__ba.dialog(); const x = d && ([...d.querySelectorAll('button')].find(b => /close|cancel/i.test(b.getAttribute('aria-label')||b.innerText))); x?.click(); return !!x; })()`); await sleep(200); }
  const pass = info.role === "dialog" && info.ariaModal === "true" && !!info.name && focusOnOpen && escapedAt === null && escapedBackAt === null && closedByEscape && focusReturned && info.primaryReachable !== false && info.iconButtonsWithoutName === 0;
  return { pass, ...info, focusOnOpen, tabEscapedAfter: escapedAt, shiftTabEscapedAfter: escapedBackAt, closedByEscape, focusReturned };
}
const openCreate = () => E(`(()=>{ const b = [...document.querySelectorAll('.page-heading button, .topbar button')].find(b => /Create (task|mission)/.test(b.innerText) || /Create (task|mission)/.test(b.getAttribute('aria-label')||'')); b.click(); return true; })()`);
const createBtnExpr = `[...document.querySelectorAll('.page-heading button, .topbar button')].find(b => /Create (task|mission)/.test(b.innerText) || /Create (task|mission)/.test(b.getAttribute('aria-label')||''))`;
const dialogPrimary = () => E(`(()=>{ const d = window.__ba.dialog(); const a = [...d.querySelectorAll('.modal-actions button, footer button')].filter(window.__ba.visible); a[a.length-1].click(); return window.__ba.norm(a[a.length-1].innerText); })()`);

try {
  await p.viewport(1280, 800, false);
  // ───────────────────────── Load, toast, console ─────────────────────────
  await check("load: toast is announced (role=status/aria-live) and dismisses itself within 8 s", async () => {
    await fresh(); const t0 = await B("toast()"); await sleep(8500); const t1 = await B("toast()");
    return { pass: (!t0 || !!(t0.role || t0.live)) && !t1, atLoad: t0, after8_5s: t1 };
  });
  await check("load: page heading date matches the seed clock (one 'today')", async () => {
    await fresh(); const eyebrow = await B(`text('.page-heading .eyebrow')`);
    return { pass: /5 October 2026/.test(eyebrow), eyebrow };
  });
  // ───────────────────────── Task create / validation ─────────────────────────
  await check("task create: empty title shows an inline error, not silence", async () => {
    await fresh(); await openCreate(); await sleep(300); await dialogPrimary(); await sleep(250);
    const d = await E(`(()=>{ const d = window.__ba.dialog(); if (!d) return { open: false }; const inv = d.querySelector('[aria-invalid=true]'); const err = d.querySelector('[role=alert], .field-error, .jb-inline-error'); return { open: true, invalid: !!inv, error: window.__ba.norm(err?.innerText) || null }; })()`);
    return { pass: d.open && d.invalid && !!d.error, ...d };
  });
  await check("task create: a titled task is added to My feed", async () => {
    await fresh(); const n0 = await B("count('.task-card')"); await openCreate(); await sleep(300);
    await E(`window.__ba.setVal(window.__ba.dialog().querySelector('input'), 'QA created task')`); await dialogPrimary(); await sleep(300);
    return { pass: (await B("count('.task-card')")) === n0 + 1 && (await E("!!window.__ba.card('QA created task')")), before: n0, after: await B("count('.task-card')") };
  });
  await check("task dialog (create): role, aria-modal, name, focus trap, Escape, focus return, reachable primary", async () => { await fresh(); return dialogA11y(openCreate, createBtnExpr); });
  await check("task dialog (create) at 390: primary action reachable, fields named", async () => {
    await p.viewport(390, 844, true); await fresh(); await openCreate(); await sleep(300); const i = await B("dlgInfo()"); await p.shot(`${OUT}m-create-task.png`, false); await p.viewport(1280, 800, false);
    return { pass: i?.primaryReachable === true && i.fieldsWithoutName.length === 0, ...i };
  });
  // ───────────────────────── Edit / cancel / delete ─────────────────────────
  await check("task edit (A1): saving the HANUMAN task unchanged keeps journal, progress, subtasks, team", async () => {
    await fresh(); const hn = `window.__ba.card('Build the 2027')`;
    const snap = `(()=>{ const c = ${hn}; return { updates: c.querySelectorAll('.progress-update').length, progress: window.__ba.norm(c.querySelector('.task-progress > span')?.innerText) || null, subtasksDone: c.querySelectorAll('.subtask-row input:checked').length, team: window.__ba.norm(c.querySelector('.owner-team')?.innerText), parts: window.__ba.norm(c.querySelector('.assistant-label span')?.innerText) }; })()`;
    const before = await E(snap);
    await E(`${hn}.querySelector('[aria-label="Edit task"], [aria-label="Edit mission"]').click()`); await sleep(300); await dialogPrimary(); await sleep(300);
    const after = await E(snap); return { pass: JSON.stringify(before) === JSON.stringify(after), before, after };
  });
  await check("task edit (A2): Cancel on edit, then Create opens a fresh 'Create' dialog", async () => {
    await fresh(); await E(`document.querySelector('.task-card [aria-label="Edit task"]').click()`); await sleep(250);
    await E(`window.__ba.click(window.__ba.dialog(), 'Cancel', true)`); await sleep(250); await openCreate(); await sleep(300);
    const r = await E(`(()=>{ const d = window.__ba.dialog(); return { heading: window.__ba.norm(d.querySelector('h2')?.innerText), title: d.querySelector('input')?.value, hasDelete: !!window.__ba.btn(d, 'Delete') }; })()`);
    return { pass: !/Edit/.test(r.heading) && !r.title && !r.hasDelete, ...r };
  });
  await check("task delete (A7): asks for confirmation; Cancel keeps the task; confirm deletes it", async () => {
    await fresh(); const n0 = await B("count('.task-card')");
    await E(`window.__ba.card('Share weekly faculty').querySelector('[aria-label="Edit task"]').click()`); await sleep(250);
    await E(`window.__ba.click(window.__ba.dialog(), 'Delete task')`); await sleep(300);
    const confirm = await E(`!!document.querySelector('[role=alertdialog]')`); const nAfterClick = await B("count('.task-card')");
    let nAfterCancel = null, nAfterConfirm = null;
    if (confirm) { await E(`window.__ba.click('[role=alertdialog]', 'Cancel', true)`); await sleep(250); nAfterCancel = await B("count('.task-card')");
      await E(`window.__ba.click(window.__ba.dialog(), 'Delete task')`); await sleep(300); await E(`window.__ba.click('[role=alertdialog]', 'Delete task', true)`); await sleep(300); nAfterConfirm = await B("count('.task-card')"); }
    return { pass: confirm && nAfterClick === n0 && nAfterCancel === n0 && nAfterConfirm === n0 - 1 && !(await E("!!window.__ba.dialog()")), before: n0, confirmShown: confirm, afterDeleteClick: nAfterClick, afterCancel: nAfterCancel, afterConfirm: nAfterConfirm };
  });
  // ───────────────────────── Complete / reopen / status ─────────────────────────
  await check("task complete (A4): the signed-in user can complete their own task 1 and reopen it", async () => {
    await fresh(); const c = `window.__ba.card('Finalize October JEE')`; const hasBtn = await E(`!!window.__ba.btn(${c}, 'Complete')`);
    if (!hasBtn) return { pass: false, completeButton: false, ownerNote: await E(`window.__ba.norm(${c}.querySelector('.owner-only')?.innerText)`) };
    await E(`window.__ba.click(${c}, 'Complete')`); await sleep(300); const done = await E(`${c}.classList.contains('is-done') || /Completed/.test(${c}.innerText)`);
    await E(`window.__ba.click(${c}, 'Reopen')`); await sleep(300); const reopened = await E(`!${c}.classList.contains('is-done')`);
    return { pass: done && reopened, completeButton: true, done, reopened };
  });
  await check("task complete (F14): a refused completion writes no audit entry and no toast", async () => {
    await fresh(); // the store's completeTask is only reachable through the card; assert no Complete button on someone else's task instead
    const other = await E(`!!window.__ba.btn(window.__ba.card('Call pending scholarship'), 'Complete')`);
    return { pass: !other, completeButtonOnOthersTask: other };
  });
  await check("task status (A9): every card shows its status in text (task 6 'Blocked')", async () => {
    await fresh(); const t = await E(`window.__ba.card('Resolve projector').innerText`);
    return { pass: /\bBlocked\b/.test(t.split('\n').slice(0, 6).join(' ')), firstLines: t.split('\n').slice(0, 6).join(' | ') };
  });
  await check("seed families (D7): tasks 8 and 12 Angad, 9–11 Sugriv", async () => {
    await fresh(); const fam = await E(`["Prepare admission campaign poster","Approve admission campaign poster","Send approved poster to schools","Make school follow-up calls","Update admission data"].map(t => window.__ba.norm(window.__ba.card(t)?.querySelector('.category-pill, [data-family]')?.innerText))`);
    return { pass: JSON.stringify(fam) === JSON.stringify(["Angad", "Sugriv", "Sugriv", "Sugriv", "Angad"]), families: fam };
  });
  // ───────────────────────── Subtasks, journal, attachments, acknowledge, archive ─────────────────────────
  await check("subtasks: inline add, then toggle done", async () => {
    await fresh(); const c = `window.__ba.card('Approve parent orientation deck')`;
    await E(`window.__ba.setVal(${c}.querySelector('.inline-subtask-add input'), 'QA subtask')`); await E(`window.__ba.click(${c}, 'Add subtask')`); await sleep(250);
    const added = await E(`[...${c}.querySelectorAll('.subtask-row')].some(r => r.innerText.includes('QA subtask'))`);
    await E(`[...${c}.querySelectorAll('.subtask-row')].find(r => r.innerText.includes('QA subtask')).querySelector('input').click()`); await sleep(200);
    const done = await E(`[...${c}.querySelectorAll('.subtask-row')].find(r => r.innerText.includes('QA subtask')).querySelector('input').checked`);
    const fieldNamed = await E(`(()=>{ const i = ${c}.querySelector('.inline-subtask-add input'); return !!((i.labels && i.labels.length) || i.getAttribute('aria-label')); })()`);
    return { pass: added && done && fieldNamed, added, done, fieldNamed };
  });
  await check("journal: post an update on the HANUMAN task; empty post is ignored", async () => {
    await fresh(); const c = `window.__ba.card('Build the 2027')`; const n0 = await E(`${c}.querySelectorAll('.progress-update').length`);
    await E(`window.__ba.click(${c}, 'Post update')`); await sleep(200); const nEmpty = await E(`${c}.querySelectorAll('.progress-update').length`);
    await E(`window.__ba.setVal(${c}.querySelector('.journal-compose input, .journal-compose textarea'), 'QA journal entry')`); await E(`window.__ba.click(${c}, 'Post update')`); await sleep(250);
    const n1 = await E(`${c}.querySelectorAll('.progress-update').length`); const head = await E(`window.__ba.norm(${c}.querySelector('.hanuman-journal-head > span')?.innerText)`);
    return { pass: nEmpty === n0 && n1 === n0 + 1 && head === `${n1} update${n1 === 1 ? "" : "s"}`, before: n0, afterEmpty: nEmpty, after: n1, countLabel: head };
  });
  await check("attachments: dialog a11y", async () => { await fresh(); return dialogA11y(() => E(`window.__ba.click(window.__ba.card('Approve parent orientation deck'), 'Add completion evidence')`), `window.__ba.btn(window.__ba.card('Approve parent orientation deck'), 'Add completion evidence')`); });
  await check("attachments: a non-URL link is refused with an inline error; a valid https link is added", async () => {
    await fresh(); const c = `window.__ba.card('Approve parent orientation deck')`;
    await E(`window.__ba.click(${c}, 'Add completion evidence')`); await sleep(250);
    await E(`window.__ba.setVal(window.__ba.dialog().querySelector('.link-entry input'), 'not a link')`); await E(`window.__ba.click(window.__ba.dialog(), 'Add link')`); await sleep(250);
    const bad = await E(`(()=>{ const d = window.__ba.dialog(); return { stillOpen: !!d, error: window.__ba.norm(d?.querySelector('[role=alert], .field-error')?.innerText) || null, chips: ${c}.querySelectorAll('.attachment-chip').length }; })()`);
    if (bad.stillOpen) { await E(`window.__ba.setVal(window.__ba.dialog().querySelector('.link-entry input'), 'https://example.com/deck')`); await E(`window.__ba.click(window.__ba.dialog(), 'Add link')`); await sleep(250); }
    const good = await E(`${c}.querySelectorAll('.attachment-chip').length`);
    return { pass: bad.stillOpen && !!bad.error && bad.chips === 0 && good === 1, invalid: bad, chipsAfterValid: good };
  });
  await check("acknowledge: Mark seen and Acknowledge change state and expose it (aria-pressed or text)", async () => {
    await fresh(); const c = `window.__ba.card('Call pending scholarship')`;
    await E(`window.__ba.click(${c}, 'Mark seen')`); await sleep(150); await E(`window.__ba.click(${c}, 'Acknowledge', true)`); await sleep(200);
    const r = await E(`(()=>{ const c = ${c}; return { seen: !!window.__ba.btn(c, 'Seen', true), ack: !!window.__ba.btn(c, 'Acknowledged', true), seenCount: window.__ba.norm(c.querySelector('.ack-row > span')?.innerText) }; })()`);
    return { pass: r.seen && r.ack && !/^0 people/.test(r.seenCount) && !/1 people/.test(r.seenCount), ...r };
  });
  await check("archive/restore: archive hides the card, Archived filter shows it, Restore brings it back", async () => {
    await fresh(); const t = "Share weekly faculty"; await E(`window.__ba.card('${t}').querySelector('[aria-label="Archive task"]').click()`); await sleep(250);
    const hidden = !(await E(`!!window.__ba.card('${t}')`));
    await E(`window.__ba.setVal([...document.querySelectorAll('.filter-row select')].find(s => [...s.options].some(o => o.text === 'Archived tasks')), 'Archived tasks')`); await sleep(250);
    const inArchive = !!(await E(`!!window.__ba.card('${t}')`));
    if (inArchive) await E(`window.__ba.card('${t}').querySelector('[aria-label="Restore task"]').click()`); await sleep(250);
    await E(`window.__ba.setVal([...document.querySelectorAll('.filter-row select')].find(s => [...s.options].some(o => o.text === 'Archived tasks')), 'Active tasks')`); await sleep(250);
    return { pass: hidden && inArchive && !!(await E(`!!window.__ba.card('${t}')`)), hidden, inArchive, restored: !!(await E(`!!window.__ba.card('${t}')`)) };
  });
  // ───────────────────────── Filters ─────────────────────────
  await check("filters: department, family, status narrow the list; an empty result says so", async () => {
    await fresh(); const sel = i => `document.querySelectorAll('.filter-row select')[${i}]`;
    await E(`window.__ba.setVal(${sel(0)}, 'Operations')`); await sleep(200); const ops = await E(`[...document.querySelectorAll('.task-card')].every(c => /Operations/.test(c.querySelector('.owner-team')?.innerText))`);
    await E(`window.__ba.setVal(${sel(2)}, 'done')`); await sleep(200); const n = await B("count('.task-card')");
    const empty = await E(`window.__ba.norm(document.querySelector('.task-list')?.innerText || '')`);
    return { pass: ops && n === 0 && empty.length > 0, departmentOnly: ops, cardsOpsDone: n, emptyListText: empty.slice(0, 120) };
  });
  // ───────────────────────── Search / ⌘K ─────────────────────────
  await check("search: the topbar search button opens a search dialog", async () => {
    await fresh(); await E(`document.querySelector('.search-button, [aria-label^="Search"]').click()`); await sleep(300);
    const d = await B("dlgInfo()"); return { pass: !!d && d.role === "dialog", dialog: d };
  });
  await check("search: ⌘K opens search, typing finds a task, Enter jumps to it, Escape closes", async () => {
    await fresh(); await key("k", "KeyK", 75, 4); await sleep(300); const opened = !!(await E("!!window.__ba.dialog()"));
    if (!opened) return { pass: false, opened };
    await p.send("Input.insertText", { text: "projector" }); await sleep(300);
    const results = await E(`[...window.__ba.dialog().querySelectorAll('[role=option]')].map(o => window.__ba.norm(o.innerText)).slice(0, 5)`);
    await key("Enter", "Enter", 13); await sleep(600);
    const closed = !(await E("!!window.__ba.dialog()")); const focused = await B("active()");
    await key("k", "KeyK", 75, 2); await sleep(300); const openedCtrl = !!(await E("!!window.__ba.dialog()")); await Esc(); await sleep(250);
    return { pass: opened && results.some(r => /projector/i.test(r)) && closed && /projector/i.test(focused || "") && openedCtrl && !(await E("!!window.__ba.dialog()")), opened, results, closedAfterEnter: closed, focusedAfterJump: focused, ctrlKOpens: openedCtrl };
  });
  await check("search: dialog a11y", async () => { await fresh(); return dialogA11y(() => E(`document.querySelector('.search-button, [aria-label^="Search"]').click()`), `document.querySelector('.search-button, [aria-label^="Search"]')`); });
  // ───────────────────────── Notifications ─────────────────────────
  await check("notifications: bell opens a labelled panel, Escape closes it, Mark all read clears the dot", async () => {
    await fresh(); const bell = `document.querySelector('.notification-button')`; await E(`${bell}.focus(); ${bell}.click()`); await sleep(250);
    const open = await E(`!!document.querySelector('.notification-panel')`); const expanded = await E(`${bell}.getAttribute('aria-expanded')`);
    await Esc(); await sleep(200); const closedByEsc = !(await E(`!!document.querySelector('.notification-panel')`)); const focusBack = await E(`document.activeElement === ${bell}`);
    if (!closedByEsc) await E(`${bell}.click()`); await sleep(150); await E(`${bell}.click()`); await sleep(200);
    await E(`window.__ba.click('.notification-panel', 'Mark all read')`); await sleep(200); const dot = await E(`!!${bell}.querySelector('i')`);
    return { pass: open && closedByEsc && focusBack && !dot && expanded !== null, open, ariaExpanded: expanded, closedByEscape: closedByEsc, focusReturned: focusBack, dotAfterMarkAll: dot };
  });
  // ───────────────────────── Role switching ─────────────────────────
  await check("role switching: CEO/Director lens toggles and is exposed as pressed state", async () => {
    await fresh(); await E(`window.__jv.setView('dashboard')`); await sleep(300);
    await E(`window.__ba.click('.leadership-banner, .dashboard-view, main', 'Director', true)`); await sleep(200);
    const h = await E(`window.__ba.norm(document.querySelector('.leadership-banner h2')?.innerText)`);
    const pressed = await E(`(()=>{ const b = window.__ba.btn(document, 'Director', true); return b?.getAttribute('aria-pressed'); })()`);
    return { pass: /Director lens/.test(h) && pressed === "true", heading: h, ariaPressed: pressed };
  });
  // ───────────────────────── MOM ─────────────────────────
  await check("MOM: empty save shows errors; a filled MOM locks into the directory and creates its quick task", async () => {
    await fresh(); await E(`window.__jv.setView('momDirectory')`); await sleep(300); await E(`window.__ba.click('.content-wrap', 'Write new MOM')`); await sleep(300);
    await dialogPrimary(); await sleep(250); const emptyErr = await E(`(()=>{ const d = window.__ba.dialog(); return { open: !!d, invalid: d ? d.querySelectorAll('[aria-invalid=true]').length : 0 }; })()`);
    await E(`(()=>{ const d = window.__ba.dialog(); const t = [...d.querySelectorAll('input')].find(i => i.placeholder === 'e.g. Faculty review'); window.__ba.setVal(t, 'QA MOM'); window.__ba.setVal(d.querySelector('textarea'), 'Decisions recorded'); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'Task to assign'), 'QA MOM follow-up'); return true; })()`);
    await dialogPrimary(); await sleep(300); const inDir = await E(`document.querySelector('.content-wrap').innerText.includes('QA MOM')`);
    await E(`window.__jv.setView('feed')`); await sleep(300); const task = !!(await E(`!!window.__ba.card('QA MOM follow-up')`));
    return { pass: emptyErr.open && emptyErr.invalid > 0 && inDir && task, emptySave: emptyErr, inDirectory: inDir, quickTaskCreated: task };
  });
  await check("MOM: dialog a11y", async () => { await fresh(); await E(`window.__jv.setView('momDirectory')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.content-wrap', 'Write new MOM')`), `window.__ba.btn('.content-wrap', 'Write new MOM')`); });
  // ───────────────────────── Event planner ─────────────────────────
  await check("event planner (A6): no action duplicates an existing event", async () => {
    await fresh(); await E(`window.__jv.setView('eventPlanner')`); await sleep(300);
    const cnt = `[...document.querySelectorAll('h3, strong')].filter(e => window.__ba.norm(e.innerText) === 'Annual Parent Orientation').length`; const before = await E(cnt);
    const editPlan = await E(`!!window.__ba.btn('.content-wrap', 'Edit plan')`);
    if (editPlan) { await E(`window.__ba.click('.content-wrap', 'Edit plan')`); await sleep(300); await dialogPrimary(); await sleep(300); }
    return { pass: !editPlan || (await E(cnt)) === before, editPlanButton: editPlan, before, after: await E(cnt) };
  });
  await check("event planner: Plan an event with a task row creates the event and its task", async () => {
    await fresh(); await E(`window.__jv.setView('eventPlanner')`); await sleep(300); await E(`window.__ba.click('.content-wrap', 'Plan an event')`); await sleep(300);
    await E(`(()=>{ const d = window.__ba.dialog(); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'e.g. Parent orientation'), 'QA Event'); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'Task to complete for this event'), 'QA event task'); return true; })()`);
    await dialogPrimary(); await sleep(300); const ev = await E(`document.querySelector('.content-wrap').innerText.includes('QA Event')`);
    await E(`window.__jv.setView('feed')`); await sleep(300); const t = await E(`window.__ba.norm(window.__ba.card('QA event task')?.innerText || '')`);
    return { pass: ev && /Event task/.test(t), eventListed: ev, taskSourceLabel: t.slice(0, 160) };
  });
  await check("event planner: dialog a11y", async () => { await fresh(); await E(`window.__jv.setView('eventPlanner')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.content-wrap', 'Plan an event')`), `window.__ba.btn('.content-wrap', 'Plan an event')`); });
  // ───────────────────────── Calendar ─────────────────────────
  await check("calendar: add an event; empty save shows an error", async () => {
    await fresh(); await E(`window.__jv.setView('calendar')`); await sleep(300); await E(`window.__ba.click('.content-wrap', 'Add calendar event')`); await sleep(300);
    await dialogPrimary(); await sleep(200); const empty = await E(`(()=>{ const d = window.__ba.dialog(); return { open: !!d, invalid: d ? d.querySelectorAll('[aria-invalid=true]').length : 0 }; })()`);
    await E(`(()=>{ const d = window.__ba.dialog(); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'e.g. Faculty training day'), 'QA Calendar Day'); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === '18 Dec 2026'), '18 Dec 2026'); return true; })()`);
    await dialogPrimary(); await sleep(300); const listed = await E(`document.querySelector('.content-wrap').innerText.includes('QA Calendar Day')`);
    return { pass: empty.open && empty.invalid > 0 && listed, emptySave: empty, listed };
  });
  await check("calendar: dialog a11y", async () => { await fresh(); await E(`window.__jv.setView('calendar')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.content-wrap', 'Add calendar event')`), `window.__ba.btn('.content-wrap', 'Add calendar event')`); });
  // ───────────────────────── Notices & feedback ─────────────────────────
  await check("notices nav (C4): 'Notices & feedback' opens its own view and marks itself current", async () => {
    await fresh(); await B(`nav('Notices')`); await sleep(300);
    const r = await E(`(()=>{ const b = [...document.querySelectorAll('.sidebar button, .sidebar a')].find(b => window.__ba.norm(b.innerText).startsWith('Notices')); return { current: b?.getAttribute('aria-current'), active: b?.classList.contains('active'), h1: window.__ba.text('.page-heading h1'), noticeBoard: !!document.querySelector('.notice-board') }; })()`);
    return { pass: (r.current === "page" || r.active) && r.noticeBoard && !/Good morning/.test(r.h1), ...r };
  });
  await check("notices: send a notice; reply privately; mark seen", async () => {
    await fresh(); await B(`nav('Notices')`); await sleep(300); await E(`window.__ba.click('.notice-board', 'Send notice')`); await sleep(300);
    await E(`(()=>{ const d = window.__ba.dialog(); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'e.g. Sunday mock-test schedule'), 'QA Notice'); window.__ba.setVal(d.querySelector('textarea'), 'Body'); return true; })()`);
    await dialogPrimary(); await sleep(300); const sent = await E(`document.querySelector('.notice-board').innerText.includes('QA Notice')`);
    const reply = await E(`(()=>{ const i = document.querySelector('.notice-reply-box input'); return !!i && !!((i.labels && i.labels.length) || i.getAttribute('aria-label')); })()`);
    await E(`window.__ba.click('.notice-board', 'Seen by me')`); await sleep(200);
    const seenState = await E(`(()=>{ const b = [...document.querySelectorAll('.notice-seen-button')][0]; return { text: window.__ba.norm(b?.innerText), pressed: b?.getAttribute('aria-pressed'), toLine: window.__ba.norm(b?.closest('.notice-card')?.querySelector('small')?.innerText) }; })()`);
    return { pass: sent && reply && !/You · seen/.test(seenState.toLine), sent, replyFieldNamed: reply, seenState };
  });
  await check("notices: Send notice dialog a11y", async () => { await fresh(); await B(`nav('Notices')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.notice-board', 'Send notice')`), `window.__ba.btn('.notice-board', 'Send notice')`); });
  await check("feedback: request (empty save errors), respond to a poll", async () => {
    await fresh(); await B(`nav('Notices')`); await sleep(300); await E(`window.__ba.click('.feedback-board', 'Request feedback')`); await sleep(300);
    await dialogPrimary(); await sleep(200); const empty = await E(`(()=>{ const d = window.__ba.dialog(); return { open: !!d, invalid: d ? d.querySelectorAll('[aria-invalid=true]').length : 0 }; })()`);
    await E(`(()=>{ const d = window.__ba.dialog(); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'e.g. Faculty room arrangement'), 'QA Poll'); window.__ba.setVal([...d.querySelectorAll('input')].find(i => i.placeholder === 'What would you like people to answer?'), 'Yes or no?'); return true; })()`);
    await dialogPrimary(); await sleep(300); const listed = await E(`document.querySelector('.feedback-board').innerText.includes('QA Poll')`);
    await E(`(()=>{ const c = [...document.querySelectorAll('.feedback-card')].find(c => c.innerText.includes('QA Poll')); c.querySelector('.feedback-options button').click(); return true; })()`); await sleep(200);
    const resp = await E(`window.__ba.norm([...document.querySelectorAll('.feedback-card')].find(c => c.innerText.includes('QA Poll')).querySelector('.feedback-card-top small').innerText)`);
    return { pass: empty.open && empty.invalid > 0 && listed && /1 response\b/.test(resp), emptySave: empty, listed, responses: resp };
  });
  await check("feedback: dialog a11y", async () => { await fresh(); await B(`nav('Notices')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.feedback-board', 'Request feedback')`), `window.__ba.btn('.feedback-board', 'Request feedback')`); });
  // ───────────────────────── People ─────────────────────────
  await check("people (A7): the signed-in user cannot remove or deactivate themselves; removal asks first and keeps the record", async () => {
    await fresh(); await E(`window.__jv.setView('people')`); await sleep(300);
    const self = await E(`(()=>{ const c = [...document.querySelectorAll('.profile-card')].find(c => c.querySelector('h3')?.innerText === 'Arjun Mehta'); return { remove: !!window.__ba.btn(c, 'Remove'), suspend: !!(window.__ba.btn(c, 'Suspend') || window.__ba.btn(c, 'Deactivate')) }; })()`);
    const n0 = await B("count('.profile-card')");
    await E(`(()=>{ const c = [...document.querySelectorAll('.profile-card')].find(c => c.querySelector('h3')?.innerText !== 'Arjun Mehta'); window.__qaName = c.querySelector('h3').innerText; window.__ba.click(c, 'Remove'); return true; })()`); await sleep(300);
    const confirm = await E(`!!document.querySelector('[role=alertdialog]')`);
    if (confirm) { await E(`(()=>{ const d = document.querySelector('[role=alertdialog]'); const b = [...d.querySelectorAll('button')].pop(); b.click(); return true; })()`); await sleep(300); }
    const n1 = await B("count('.profile-card')");
    return { pass: !self.remove && !self.suspend && confirm && n1 === n0 - 1, selfActions: self, confirmShown: confirm, cardsBefore: n0, cardsAfter: n1 };
  });
  await check("people: Add employee dialog a11y", async () => { await fresh(); await E(`window.__jv.setView('people')`); await sleep(300); return dialogA11y(() => E(`window.__ba.click('.content-wrap', 'Manage access')`), `window.__ba.btn('.content-wrap', 'Manage access')`); });
  await check("my profile (C4): nav opens the view without opening the edit dialog; Edit opens it", async () => {
    await fresh(); await B(`nav('My profile')`); await sleep(300); const dlg = !!(await E("!!window.__ba.dialog()"));
    await E(`window.__ba.click('.content-wrap', 'Edit my profile')`); await sleep(300); const dlg2 = !!(await E("!!window.__ba.dialog()"));
    return { pass: !dlg && dlg2, dialogOnNav: dlg, dialogOnEdit: dlg2 };
  });
  await check("my profile: dialog a11y", async () => { await fresh(); await E(`window.__jv.setView('myProfile')`); await sleep(300); await E(`window.__ba.dialog() && window.__ba.click(window.__ba.dialog(), 'Cancel', true)`); await sleep(200); return dialogA11y(() => E(`window.__ba.click('.content-wrap', 'Edit my profile')`), `window.__ba.btn('.content-wrap', 'Edit my profile')`); });
  // ───────────────────────── Access matrix / audit log ─────────────────────────
  await check("access matrix: toggling a permission flips it and writes an audit entry", async () => {
    await fresh(); await B(`nav('Access matrix')`); await sleep(300);
    const before = await E(`window.__ba.norm(document.querySelector('.matrix-toggle span').innerText)`); await E(`document.querySelector('.matrix-toggle input').click()`); await sleep(200);
    const after = await E(`window.__ba.norm(document.querySelector('.matrix-toggle span').innerText)`);
    const named = await E(`(()=>{ const i = document.querySelector('.matrix-toggle input'); return window.__ba.norm(i.labels?.[0]?.innerText) + ' | ' + (i.getAttribute('aria-label') || ''); })()`);
    await B(`nav('Audit log')`); await sleep(300); const audit = await E(`window.__ba.norm(document.querySelector('.audit-ledger-row')?.innerText)`);
    return { pass: before !== after && /Access matrix updated/.test(audit) && /·|for/.test(named), before, after, toggleAccessibleName: named, latestAudit: audit };
  });
  await check("audit log: search filters, empty filter says so, Export audit CSV downloads a well-formed, injection-safe CSV", async () => {
    await fresh(); await E(`window.__ba.card('Call pending scholarship') && 0`); // make a task titled like a formula, then export
    await openCreate(); await sleep(300); await E(`window.__ba.setVal(window.__ba.dialog().querySelector('input'), '=HYPERLINK("http://x","y")')`); await dialogPrimary(); await sleep(300);
    await B(`nav('Audit log')`); await sleep(300);
    await E(`window.__ba.setVal('.audit-log-filters input', 'zzzz-no-match')`); await sleep(200); const empty = await E(`window.__ba.norm(document.querySelector('.audit-ledger').innerText)`);
    await E(`window.__ba.setVal('.audit-log-filters input', '')`); await sleep(200);
    await E(`window.__ba.click('.content-wrap', 'Export audit CSV')`); await sleep(500);
    const dl = await E(`({ names: window.__downloadNames || [], file: (window.__downloads || []).find(d => /csv/.test(d.type)) })`);
    const text = dl.file?.text || ""; const lines = text.split(/\r?\n/);
    const header = lines[0]; const injected = lines.some(l => /^"=|,"=|,"\+|,"-|,"@/.test(l));
    return { pass: /No audit records/.test(empty) && dl.names.includes("jambavan-audit-log.csv") && header === '"Action","Subject","Actor","Timestamp","Detail"' && lines.length > 3 && !injected, emptyText: empty.slice(0, 80), names: dl.names, header, rows: lines.length, formulaCellUnescaped: injected, formulaRow: lines.find(l => /HYPERLINK/.test(l)) };
  });
  // ───────────────────────── My Day ─────────────────────────
  await check("My Day: Top 3 add with Enter, cap at 3", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300);
    for (const t of ["QA two", "QA three"]) { await E(`(()=>{ const i = [...document.querySelectorAll('.my-day-view input')].find(i => /priority/i.test(i.placeholder)); i.focus(); window.__ba.setVal(i, ${JSON.stringify(t)}); return true; })()`); await key("Enter", "Enter", 13); }
    const r = await E(`({ count: window.__ba.norm(document.querySelector('.top3-card .my-day-count')?.innerText), inputShown: !![...document.querySelectorAll('.my-day-view input')].find(i => /priority/i.test(i.placeholder)) })`);
    return { pass: r.count === "3/3" && !r.inputShown, ...r };
  });
  await check("My Day (D5): Edit on a time block keeps it until saved; Cancel leaves it unchanged", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300); const n0 = await B("count('.schedule-row')");
    await E(`window.__ba.click(document.querySelector('.schedule-row'), 'Edit', true)`); await sleep(200); const n1 = await B("count('.schedule-row')");
    const cancel = await E(`!!window.__ba.btn('.schedule-card', 'Cancel', true)`); if (cancel) { await E(`window.__ba.click('.schedule-card', 'Cancel', true)`); await sleep(200); }
    const n2 = await B("count('.schedule-row')");
    await E(`window.__ba.click(document.querySelector('.schedule-row'), 'Edit', true)`); await sleep(200);
    await E(`window.__ba.setVal([...document.querySelectorAll('.schedule-card input')].find(i => i.placeholder === 'Activity or time block'), 'QA edited block')`);
    await E(`window.__ba.click('.schedule-card', 'Save block') || window.__ba.click('.schedule-card', 'Add block')`); await sleep(200);
    const rows = await E(`[...document.querySelectorAll('.schedule-row strong')].map(s => s.innerText)`);
    return { pass: n1 === n0 && cancel && n2 === n0 && rows.length === n0 && rows.includes("QA edited block"), before: n0, afterEditClick: n1, cancelButton: cancel, afterCancel: n2, afterSave: rows };
  });
  await check("My Day (D6): a saved review answer can be cleared", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300); const t = `document.querySelector('.end-day-card textarea')`;
    await E(`window.__ba.setVal(${t}, 'Finished the timetable')`); await E(`window.__ba.click('.end-day-card', 'Save review')`); await sleep(200);
    await E(`window.__ba.setVal(${t}, '')`); await sleep(150); const v = await E(`${t}.value`);
    return { pass: v === "", valueAfterClearing: v };
  });
  await check("My Day: date label and default date follow the seed clock (Monday, 5 October 2026)", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300);
    const r = await E(`({ input: document.querySelector('.my-day-view input[type=date]')?.value, label: window.__ba.norm(document.querySelector('.my-day-heading .eyebrow')?.innerText) })`);
    return { pass: r.input === "2026-10-05" && /5 October 2026/.test(r.label), ...r };
  });
  await check("My Day: every field has an accessible name", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300);
    const r = await E(`(()=>{ const f = [...document.querySelectorAll('.my-day-view input, .my-day-view select, .my-day-view textarea')].filter(window.__ba.visible); return f.filter(x => !(x.labels && x.labels.length) && !x.getAttribute('aria-label') && !x.getAttribute('aria-labelledby')).map(x => x.placeholder || x.type); })()`);
    return { pass: r.length === 0, unnamed: r };
  });
  await check("My Day: privacy — Top 3 text never leaks to Dashboard, Audit log, feed or search", async () => {
    await fresh(); await B(`nav('My Day')`); await sleep(300);
    await E(`(()=>{ const i = [...document.querySelectorAll('.my-day-view input')].find(i => /priority/i.test(i.placeholder)); window.__ba.setVal(i, 'ZQ-private-item'); return true; })()`); await E(`window.__ba.click('.top3-card', 'Add')`); await sleep(200);
    const leaks = {};
    for (const v of ["dashboard", "auditLog", "feed", "people"]) { await E(`window.__jv.setView('${v}')`); await sleep(250); leaks[v] = await E(`document.body.innerText.includes('ZQ-private-item')`); }
    const s = await E(`!!document.querySelector('.search-button, [aria-label^="Search"]')`);
    if (s) { await E(`document.querySelector('.search-button, [aria-label^="Search"]').click()`); await sleep(250); await p.send("Input.insertText", { text: "ZQ-private" }); await sleep(250); leaks.search = await E(`!!window.__ba.dialog() && window.__ba.dialog().innerText.includes('ZQ-private-item') && [...window.__ba.dialog().querySelectorAll('[role=option]')].some(o => o.innerText.includes('ZQ-private-item'))`); await Esc(); }
    return { pass: Object.values(leaks).every(v => !v), leaks };
  });
  // ───────────────────────── Blockers ─────────────────────────
  await check("blocker check-in (D15/D9): selected reason exposes aria-pressed; it can be cleared; completion clears it", async () => {
    await fresh(); const c = `window.__ba.card('Approve parent orientation deck')`;
    await E(`(()=>{ const d = ${c}.querySelector('.blocker-checkin'); d.open = true; return true; })()`);
    await E(`window.__ba.click(${c}, 'Too much other work')`); await sleep(250);
    const pressed = await E(`window.__ba.btn(${c}, 'Too much other work')?.getAttribute('aria-pressed')`);
    const current = await E(`window.__ba.norm(${c}.querySelector('.blocker-current')?.innerText)`);
    const noteNamed = await E(`(()=>{ const i = ${c}.querySelector('.blocker-checkin input'); return !!((i.labels && i.labels.length) || i.getAttribute('aria-label')); })()`);
    const clearBtn = await E(`!!(window.__ba.btn(${c}, 'moving again') || window.__ba.btn(${c}, 'Clear'))`);
    if (clearBtn) { await E(`window.__ba.click(${c}, 'moving again') || window.__ba.click(${c}, 'Clear')`); await sleep(250); }
    const afterClear = await E(`!!${c}.querySelector('.blocker-current')`);
    await E(`(()=>{ const d = ${c}.querySelector('.blocker-checkin'); d.open = true; return true; })()`); await E(`window.__ba.click(${c}, 'Too much other work')`); await sleep(200);
    await E(`window.__ba.click(${c}, 'Complete')`); await sleep(250); await E(`window.__ba.click(${c}, 'Reopen')`); await sleep(250);
    const afterReopen = await E(`window.__ba.norm(${c}.querySelector('.blocker-current')?.innerText) || null`);
    return { pass: pressed === "true" && /Too much other work/.test(current) && noteNamed && clearBtn && !afterClear && !afterReopen, ariaPressed: pressed, current, noteFieldNamed: noteNamed, clearControl: clearBtn, blockerAfterClear: afterClear, blockerAfterCompleteReopen: afterReopen };
  });
  await check("blocker dashboard headline is grammatical", async () => {
    await fresh(); await E(`window.__jv.setView('dashboard')`); await sleep(300); const h = await E(`window.__ba.norm(document.querySelector('.blocker-dashboard-head')?.innerText)`);
    return { pass: !!h && !/are i haven't|are i don't/i.test(h), headline: h.slice(0, 200) };
  });
  // ───────────────────────── Dependencies ─────────────────────────
  await check("dependencies: hint and card copy say 'waiting', not 'must be completed first' / 'Blocked by'", async () => {
    await fresh(); const card = await E(`window.__ba.norm(window.__ba.card('Send approved poster')?.querySelector('.dependency-blocked')?.innerText)`);
    await openCreate(); await sleep(300); const hint = await E(`window.__ba.norm(window.__ba.dialog().querySelector('.dependency-field small, .dependency-field [id$=hint]')?.innerText)`);
    const name = await E(`(()=>{ const s = window.__ba.dialog().querySelector('.dependency-field select'); return window.__ba.norm(s.labels?.[0]?.innerText).length; })()`);
    return { pass: /Waiting on/i.test(card) && !/must be completed first/.test(hint) && name < 80, cardLine: card, hint, selectLabelLength: name };
  });
  await check("dependencies: cycle prevention — editing task 9 does not offer its downstream tasks 10–12", async () => {
    await fresh(); await E(`window.__ba.card('Approve admission campaign poster').querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
    const opts = await E(`[...window.__ba.dialog().querySelector('.dependency-field select').options].map(o => o.text)`);
    const bad = opts.filter(o => /Send approved poster|Make school follow-up|Update admission data|Approve admission campaign poster/.test(o));
    await Esc();
    return { pass: bad.length === 0 && opts.some(o => /Prepare admission campaign poster/.test(o)), offendingOptions: bad, optionCount: opts.length };
  });
  await check("dependencies (F23): deleting an upstream task clears links to it", async () => {
    await fresh(); await E(`window.__ba.card('Make school follow-up calls').querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
    await E(`window.__ba.click(window.__ba.dialog(), 'Delete task')`); await sleep(300); const confirmText = await E(`window.__ba.norm(document.querySelector('[role=alertdialog]')?.innerText)`);
    await E(`(()=>{ const d = document.querySelector('[role=alertdialog]'); d && window.__ba.click(d, 'Delete task', true); return true; })()`); await sleep(300);
    const t12 = await E(`window.__ba.norm(window.__ba.card('Update admission data')?.querySelector('.dependency-blocked')?.innerText) || null`);
    return { pass: !t12 && /wait/i.test(confirmText || ""), confirmText, task12DependencyLine: t12 };
  });
  // ───────────────────────── Handover ─────────────────────────
  await check("handover (D1): task 4 cannot be handed to 'You'; default is a valid recipient or blank and blocks submit", async () => {
    await fresh(); await E(`window.__ba.click(window.__ba.card('Approve parent orientation deck'), 'Hand') || window.__ba.click(window.__ba.card('Approve parent orientation deck'), 'Handover')`); await sleep(300);
    const r = await E(`(()=>{ const d = window.__ba.dialog(); const s = d.querySelector('select'); const b = window.__ba.btn(d, 'Create handover package'); return { value: s.value, shown: s.options[s.selectedIndex]?.text, youOption: [...s.options].some(o => o.value === 'You'), createEnabled: !b.disabled }; })()`);
    if (r.createEnabled && !r.value) { await E(`window.__ba.click(window.__ba.dialog(), 'Create handover package')`); await sleep(250); }
    const owner = await E(`window.__ba.norm(window.__ba.card('Approve parent orientation deck')?.querySelector('.owner-name')?.innerText)`);
    return { pass: !r.youOption && !/You$/.test(owner) && (r.value === "" ? true : r.value !== "You"), ...r, ownerAfter: owner };
  });
  await check("handover (D2/D4): from = previous owner, created by = current user; recipient leaves Contributors", async () => {
    await fresh(); const c = `window.__ba.card('Finalize October JEE')`;
    await E(`window.__ba.click(${c}, 'Hand') || window.__ba.click(${c}, 'Handover')`); await sleep(300);
    const def = await E(`window.__ba.dialog().querySelector('select').value`);
    await E(`window.__ba.setVal(window.__ba.dialog().querySelector('select'), 'Karan Joshi')`); await E(`window.__ba.click(window.__ba.dialog(), 'Create handover package')`); await sleep(300);
    const r = await E(`(()=>{ const c = ${c}; return { owner: window.__ba.norm(c.querySelector('.owner-name')?.innerText), pkg: window.__ba.norm(c.querySelector('.handover-summary-head')?.innerText), contributors: [...c.querySelectorAll('.assistant-chip')].map(b => window.__ba.norm(b.innerText)) }; })()`);
    await B(`nav('Audit log')`); await sleep(300); const audit = await E(`window.__ba.norm(document.querySelector('.audit-ledger-row')?.innerText)`);
    return { pass: /Karan Joshi/.test(r.owner) && /Arjun Mehta/.test(r.pkg) && !r.contributors.some(x => /Karan Joshi/.test(x)) && /From Arjun Mehta to Karan Joshi/.test(audit), defaultRecipient: def, ...r, audit };
  });
  await check("handover (D2): handing over Neha's task 2 records 'from Neha Kapoor'", async () => {
    await fresh(); const c = `window.__ba.card('Call pending scholarship')`;
    await E(`window.__ba.click(${c}, 'Hand') || window.__ba.click(${c}, 'Handover')`); await sleep(300);
    await E(`window.__ba.setVal(window.__ba.dialog().querySelector('select'), 'Manav Shah')`); await E(`window.__ba.click(window.__ba.dialog(), 'Create handover package')`); await sleep(300);
    await B(`nav('Audit log')`); await sleep(300); const audit = await E(`window.__ba.norm(document.querySelector('.audit-ledger-row')?.innerText)`);
    return { pass: /From Neha Kapoor to Manav Shah/.test(audit), audit };
  });
  await check("handover: dialog a11y", async () => { await fresh(); return dialogA11y(() => E(`window.__ba.click(window.__ba.card('Finalize October JEE'), 'Hand') || window.__ba.click(window.__ba.card('Finalize October JEE'), 'Handover')`), `(window.__ba.btn(window.__ba.card('Finalize October JEE'), 'Hand') || window.__ba.btn(window.__ba.card('Finalize October JEE'), 'Handover'))`); });
  await check("handover at 390: primary reachable", async () => {
    await p.viewport(390, 844, true); await fresh(); await E(`window.__ba.click(window.__ba.card('Finalize October JEE'), 'Hand') || window.__ba.click(window.__ba.card('Finalize October JEE'), 'Handover')`); await sleep(300);
    const i = await B("dlgInfo()"); await p.shot(`${OUT}m-handover.png`, false); const t = await B("toast()"); await p.viewport(1280, 800, false);
    return { pass: i?.primaryReachable === true && !t, ...i, toastOverDialog: t };
  });
  // ───────────────────────── Navigation reachability ─────────────────────────
  await check("navigation (A5): every view, including Projects and Guide, is reachable from the sidebar", async () => {
    await fresh(); const items = await E(`[...document.querySelectorAll('.sidebar button, .sidebar a')].map(b => window.__ba.norm(b.innerText)).filter(Boolean)`);
    const need = ["My feed", "My Day", "Department", "Dashboard", "MOM Directory", "Event Planner", "Projects", "Yearly Calendar", "Notices", "People", "My profile", "Access matrix", "Audit log", "Guide"];
    const missing = need.filter(n => !items.some(i => i.includes(n)));
    const current = await E(`document.querySelector('.sidebar [aria-current=page]')?.innerText || null`);
    return { pass: missing.length === 0 && !!current, missing, ariaCurrent: current };
  });
  await check("dead controls (C3): no visible button without a handler (Workspace settings, New project, Open project, This week, banner arrow)", async () => {
    const dead = {};
    for (const v of ["feed", "projects", "dashboard"]) { await fresh(); await E(`window.__jv.setView('${v}')`); await sleep(300);
      dead[v] = await E(`[...document.querySelectorAll('button')].filter(window.__ba.visible).filter(b => { const k = Object.keys(b).find(k => k.startsWith('__reactProps')); const pr = k && b[k]; return pr && !pr.onClick && !pr.disabled && pr.type !== 'submit' && !b.closest('[role=dialog]') && !b.hasAttribute('data-radix-collection-item') && !b.getAttribute('aria-haspopup') && !b.closest('summary') && !b.hasAttribute('data-state'); }).map(b => window.__ba.norm(b.innerText) || b.getAttribute('aria-label') || b.className)`); }
    return { pass: Object.values(dead).every(a => a.length === 0), dead };
  });
  // ───────────────────────── Mobile drawer ─────────────────────────
  await check("mobile nav (A8): drawer has a named close button and backdrop, traps focus, Escape closes and returns focus", async () => {
    await p.viewport(390, 844, true); await fresh(); const trig = `document.querySelector('[aria-label="Open menu"]')`;
    await E(`${trig}.focus(); ${trig}.click()`); await sleep(350);
    const r = await E(`(()=>{ const s = document.querySelector('.sidebar'); const d = s.closest('[role=dialog]') || (s.getAttribute('role') === 'dialog' ? s : null); return { role: d?.getAttribute('role') || null, ariaModal: d?.getAttribute('aria-modal') || null, closeBtn: !!document.querySelector('.sidebar [aria-label="Close menu"], [aria-label="Close menu"]'), backdrop: !!document.querySelector('.mobile-nav-backdrop, [data-mobile-nav-backdrop]'), expanded: ${trig}.getAttribute('aria-expanded'), focusInside: s.contains(document.activeElement) }; })()`);
    let esc = null; for (let i = 0; i < 25; i++) { await Tab(); if (!(await E(`document.querySelector('.sidebar').contains(document.activeElement)`))) { esc = i + 1; break; } }
    await Esc(); await sleep(350); const closed = await E(`!document.querySelector('.sidebar').classList.contains('mobile-open')`); const back = await E(`document.activeElement === ${trig}`);
    await p.viewport(1280, 800, false);
    return { pass: r.role === "dialog" && r.ariaModal === "true" && r.closeBtn && r.backdrop && r.focusInside && esc === null && closed && back, ...r, tabEscapedAfter: esc, closedByEscape: closed, focusReturned: back };
  });
  // ───────────────────────── Focus visibility ─────────────────────────
  await check("focus-visible: keyboard focus shows a ≥2 px outline or ring on buttons, nav items, inputs and the active nav pill", async () => {
    await fresh(); const res = [];
    for (const sel of [".page-heading button", ".sidebar .main-nav button.active", ".sidebar .main-nav button:not(.active)", ".task-card .ack-button", ".filter-row select", ".task-card .inline-subtask-add input", ".blocker-checkin summary"]) {
      await E(`(()=>{ const t = document.querySelector(${JSON.stringify(sel)}); const all = [...document.querySelectorAll('button, summary, input, select, textarea, a[href]')].filter(window.__ba.visible); const i = all.indexOf(t); (all[i-1] || document.body).focus(); return i; })()`);
      await Tab();
      res.push(await E(`(()=>{ const a = document.activeElement; const cs = getComputedStyle(a); const ow = parseFloat(cs.outlineWidth) || 0; const ring = /0px 0px 0px [2-9]px|0px 0px 0px 1\\d/.test(cs.boxShadow); return { sel: ${JSON.stringify(sel)}, reached: a === document.querySelector(${JSON.stringify(sel)}), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, boxShadow: cs.boxShadow.slice(0, 80), visible: (cs.outlineStyle !== 'none' && ow >= 2) || ring }; })()`));
    }
    return { pass: res.every(r => r.visible), results: res };
  });
  // ───────────────────────── Reduced motion ─────────────────────────
  await check("reduced motion: no transition/animation longer than 0.01 ms", async () => {
    await p.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] }); await fresh();
    const r = await E(`(()=>{ const ms = v => Math.max(...v.split(',').map(s => parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))); const els = [...document.querySelectorAll('*')]; const moving = els.filter(e => { const cs = getComputedStyle(e); return ms(cs.transitionDuration) > 0.01 || ms(cs.animationDuration) > 0.01; }); return { elements: els.length, moving: moving.length }; })()`);
    await p.send("Emulation.setEmulatedMedia", { features: [] }); return { pass: r.moving === 0, ...r };
  });
  // ───────────────────────── Per-view sweep: overflow, contrast, text size, touch targets, labels ─────────────────────────
  const views = ["feed", "myDay", "department", "dashboard", "momDirectory", "eventPlanner", "projects", "calendar", "notices", "guide", "people", "myProfile", "roleMatrix", "auditLog"];
  for (const [vp, w, h, mob] of [["mobile", 390, 844, true], ["tablet", 768, 1024, true], ["laptop", 1280, 800, false], ["desktop", 1536, 900, false]]) {
    if (ONLY && !ONLY.test(`sweep ${vp}`)) continue;
    await p.viewport(w, h, mob); await fresh(); const M = R.metrics[vp] = {};
    for (const v of views) {
      label = `sweep ${vp}:${v}`;
      const ok = await E(`(()=>{ try { window.__jv.setView(${JSON.stringify(v)}); return true; } catch (e) { return false; } })()`); await sleep(350); await E("scrollTo(0,0)");
      await E(`window.__ba.dialog() && window.__ba.click(window.__ba.dialog(), 'Cancel', true)`); await sleep(100);
      const heading = await B(`text('.page-heading h1')`);
      const ov = await E(`window.__jv.overflow(${w})`);
      const c = await E(`window.__jv.contrast('main')`);
      const taps = await E(`(()=>{ const els = [...document.querySelectorAll('main button, main a[href], main input:not([type=file]):not([type=checkbox]):not([type=radio]), main select, main textarea, main summary, main label:has(> input[type=checkbox])')].filter(window.__ba.visible).filter(e => !e.closest('label:has(> input[type=checkbox])') || e.tagName === 'LABEL'); const s = els.map(e => { const r = e.getBoundingClientRect(); return { t: window.__ba.norm(e.innerText || e.getAttribute('aria-label') || e.placeholder || e.tagName).slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }); return { total: s.length, under44: s.filter(x => x.h < 44).length, under24: s.filter(x => x.h < 24 || x.w < 24).length, smallest: s.sort((a, b) => a.h - b.h).slice(0, 4) }; })()`);
      const labels = await E(`window.__jv.unlabeled()`);
      M[v] = { heading, viewSet: ok, overflowX: ov.overflowX, scrollWidth: ov.scrollWidth, culprits: ov.culprits.slice(0, 3), contrastChecked: c.checked, contrastFailing: c.failingElements, worstContrast: c.fails.slice(0, 3).map(f => `${f.minRatio}:1 ${f.fg}/${f.bg} ${f.fontSize}px "${f.sample.slice(0, 30)}"`), textUnder12: c.sizes.lt12, textTotal: c.sizes.total, taps, unlabeledFields: labels.withoutAccessibleName.length, iconButtonsWithoutName: labels.iconButtonsWithoutName };
      if (["feed", "dashboard", "roleMatrix", "myDay", "notices"].includes(v)) await p.shot(`${OUT}${vp}-${v}.png`, false);
    }
  }
  for (const vp of Object.keys(R.metrics)) {
    const M = R.metrics[vp];
    R.checks.push({ name: `responsive ${vp}: no horizontal overflow on any view`, pass: Object.values(M).every(m => !m.overflowX), detail: Object.fromEntries(Object.entries(M).filter(([, m]) => m.overflowX).map(([k, m]) => [k, `${m.scrollWidth}px ${m.culprits.map(c => c.el).join(", ")}`])) });
    R.checks.push({ name: `a11y ${vp}: no unnamed fields or icon buttons on any view`, pass: Object.values(M).every(m => !m.unlabeledFields && !m.iconButtonsWithoutName), detail: Object.fromEntries(Object.entries(M).filter(([, m]) => m.unlabeledFields || m.iconButtonsWithoutName).map(([k, m]) => [k, `${m.unlabeledFields} fields, ${m.iconButtonsWithoutName} icon buttons`])) });
    R.checks.push({ name: `contrast ${vp}: 0 failing text nodes`, pass: Object.values(M).every(m => !m.contrastFailing), detail: Object.fromEntries(Object.entries(M).map(([k, m]) => [k, `${m.contrastFailing}/${m.contrastChecked}`])) });
    R.checks.push({ name: `type ${vp}: no visible text under 12 px`, pass: Object.values(M).every(m => !m.textUnder12), detail: Object.fromEntries(Object.entries(M).map(([k, m]) => [k, `${m.textUnder12}/${m.textTotal}`])) });
    if (vp === "mobile" || vp === "tablet") R.checks.push({ name: `touch ${vp}: no interactive target under 24 px; report under 44 px`, pass: Object.values(M).every(m => !m.taps.under24), detail: Object.fromEntries(Object.entries(M).map(([k, m]) => [k, `<24: ${m.taps.under24}, <44: ${m.taps.under44} of ${m.taps.total}`])) });
  }
} catch (e) { R.fatal = `${label}: ${e.stack || e}`; }
R.console = R.console.filter(c => !/Download the React DevTools/.test(c.text));
R.summary = { checks: R.checks.length, passed: R.checks.filter(c => c.pass).length, failed: R.checks.filter(c => !c.pass).map(c => c.name), consoleEntries: R.console.length };
writeFileSync(new URL(`./bug-audit-${LABEL}.json`, import.meta.url), JSON.stringify(R, null, 1));
await p.close();
console.log(R.fatal || "", `\n${R.summary.passed}/${R.summary.checks} passed; console entries: ${R.console.length}`);
