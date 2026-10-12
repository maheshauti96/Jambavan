// Baseline visual + behavioral audit of JAMBAVAN (temporary tooling).
import { launch } from "./cdp.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const URL_ = "http://localhost:3000/";
const OUT = "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/screenshots/before";
const inpage = readFileSync(new URL("./inpage.js", import.meta.url), "utf8");
const report = { console: [], views: {}, modals: {}, bugs: {}, nav: {}, a11y: {} };
let label = "init";

const p = await launch();
p.on(m => {
  if (m.method === "Runtime.consoleAPICalled") {
    const t = m.params.type; if (["error", "warning", "warn", "assert"].includes(t)) report.console.push({ label, type: t, text: m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300) });
  }
  if (m.method === "Runtime.exceptionThrown") report.console.push({ label, type: "exception", text: m.params.exceptionDetails.exception?.description?.slice(0, 300) });
  if (m.method === "Log.entryAdded" && ["error", "warning"].includes(m.params.entry.level)) report.console.push({ label, type: "log-" + m.params.entry.level, text: (m.params.entry.text + " " + (m.params.entry.url || "")).slice(0, 300) });
});
const J = expr => p.eval(`window.__jv.${expr}`);
async function fresh() { await p.goto(URL_); await p.eval(inpage); }
const sleep = p.sleep;
const views = ["feed", "department", "momDirectory", "dashboard", "calendar", "eventPlanner", "guide", "projects", "people", "myProfile", "roleMatrix", "auditLog"];

async function viewPass(vp) {
  const mobile = vp === "mobile";
  await p.viewport(mobile ? 390 : 1280, mobile ? 844 : 800, mobile);
  label = `${vp}:load`; await fresh();
  report.nav[vp] = await J("navButtons()");
  report.a11y[`${vp}-images`] = await J("images()");
  await p.shot(`${OUT}/${vp}-00-feed-above-fold.png`, false);
  for (const [i, v] of views.entries()) {
    label = `${vp}:${v}`;
    await J(`setView(${JSON.stringify(v)})`); await sleep(350); await p.eval("scrollTo(0,0)");
    const file = `${vp}-${String(i + 1).padStart(2, "0")}-${v}.png`;
    await p.shot(`${OUT}/${file}`, true);
    report.views[`${vp}:${v}`] = { file, heading: await J(`text('.page-heading h1')`), overflow: await J("overflow()"), contrast: await J("contrast('.jambavan-app')"), taps: mobile ? await J("tapTargets()") : undefined, labels: await J("unlabeled()") };
  }
}

async function modal(vp, name, setup, open, file) {
  label = `${vp}:modal:${name}`;
  await fresh(); if (setup) await setup();
  const clicked = await open(); await sleep(400);
  const info = await J("modalInfo()");
  await p.shot(`${OUT}/${file}`, false);
  const c = info ? await J(`contrast('.task-modal, .notification-panel')`) : null;
  // keyboard: Tab 25 times, see whether focus escapes the dialog; then Escape.
  let escaped = false;
  if (info && info.cls.includes("task-modal")) {
    for (let i = 0; i < 25; i++) { await p.key("Tab", "Tab", 9); const f = await J("focusInfo()"); if (!f.insideModal) { escaped = f; break; } }
  }
  await p.key("Escape", "Escape", 27);
  const afterEsc = await J("modalInfo()");
  report.modals[`${vp}:${name}`] = { clicked, file, info, focusEscapesDialogAfterTab: escaped, closesOnEscape: info ? !afterEsc : null, contrastFails: c?.fails?.slice(0, 8), sizes: c?.sizes };
}

const modalDefs = [
  ["create-task", null, () => J(`clickText('Create task', '.page-heading button')`), "create-task-modal"],
  ["edit-task", null, () => p.eval(`(()=>{const b=document.querySelector('[aria-label="Edit task"]'); b.scrollIntoView({block:'center'}); b.click(); return true})()`), "edit-task-modal"],
  ["mom", () => J(`setView('momDirectory')`), () => J(`clickText('Write new MOM')`), "mom-modal"],
  ["mom-assign-task", () => J(`setView('momDirectory')`), () => J(`clickText('Assign / add task')`), "mom-assign-task-modal"],
  ["event", () => J(`setView('eventPlanner')`), () => J(`clickText('Plan an event')`), "event-modal"],
  ["calendar", () => J(`setView('calendar')`), () => J(`clickText('Add calendar event')`), "calendar-modal"],
  ["notice", null, () => J(`clickText('Send notice')`), "notice-modal"],
  ["feedback", null, () => J(`clickText('Request feedback')`), "feedback-modal"],
  ["attachment", null, () => J(`clickText('Add completion evidence')`), "attachment-modal"],
  ["profile", () => J(`setView('people')`), () => J(`clickText('Manage my profile')`), "profile-modal"],
  ["access", () => J(`setView('people')`), () => J(`clickText('Manage access')`), "access-modal"],
  ["notifications", null, () => p.eval(`(()=>{document.querySelector('[aria-label="Deadline reminders"]').click(); return true})()`), "notifications-panel"],
];

async function bugs() {
  await p.viewport(1280, 800, false);
  const B = report.bugs;
  // B1 cancel edit then Create task opens the edit form
  label = "bug:cancel-edit"; await fresh();
  await p.eval(`document.querySelector('[aria-label="Edit task"]').click()`); await sleep(300);
  await J(`clickText('Cancel', '.task-modal button', true)`); await sleep(300);
  await J(`clickText('Create task', '.page-heading button')`); await sleep(300);
  B.cancelEditLeak = { headingAfterCreateClick: await J(`text('.task-modal h2')`), titleValue: await p.eval(`document.querySelector('.task-modal input')?.value`), hasDeleteButton: await p.eval(`!!document.querySelector('.task-modal .danger-button')`) };
  await p.shot(`${OUT}/bug-01-create-after-cancelled-edit.png`, false);
  // B2 editing a HANUMAN task wipes its journal and progress
  label = "bug:hanuman-edit"; await fresh();
  const before = await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));return {updates: window.__jv.norm(c.querySelector('.hanuman-journal-head > span')?.innerText), progress: window.__jv.norm(c.querySelector('.task-progress > span')?.innerText), subtasks: window.__jv.norm(c.querySelector('.subtask-heading span')?.innerText)}})()`);
  await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));c.querySelector('[aria-label="Edit task"]').click()})()`); await sleep(300);
  await J(`clickText('Save changes', '.task-modal button')`); await sleep(400);
  const after = await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Build the 2027'));c.scrollIntoView({block:'start'});return {updates: window.__jv.norm(c.querySelector('.hanuman-journal-head > span')?.innerText), progress: window.__jv.norm(c.querySelector('.task-progress > span')?.innerText) || 'no progress bar', subtasks: window.__jv.norm(c.querySelector('.subtask-heading span')?.innerText)}})()`);
  B.hanumanEditDataLoss = { before, after };
  await p.shot(`${OUT}/bug-02-hanuman-after-edit-save.png`, false);
  // B3 empty title gives no feedback
  label = "bug:empty-title"; await fresh();
  await J(`clickText('Create task', '.page-heading button')`); await sleep(200);
  await J(`clickText('Create task', '.task-modal .modal-actions button')`); await sleep(300);
  B.emptyTitle = { modalStillOpen: !!(await J("modalInfo()")), invalidMarkers: await p.eval(`document.querySelectorAll('.task-modal [aria-invalid=true], .task-modal .field-error').length`), toast: await J(`text('.toast span')`) };
  await p.shot(`${OUT}/bug-03-empty-title-no-feedback.png`, false);
  // B4 delete without confirmation
  label = "bug:delete"; await fresh();
  const n0 = await p.eval(`document.querySelectorAll('.task-card').length`);
  await p.eval(`document.querySelector('[aria-label="Edit task"]').click()`); await sleep(200);
  await J(`clickText('Delete task', '.task-modal button')`); await sleep(300);
  B.deleteNoConfirm = { cardsBefore: n0, cardsAfter: await p.eval(`document.querySelectorAll('.task-card').length`), toast: await J(`text('.toast span')`) };
  // B5 event "Edit plan" creates a duplicate
  label = "bug:event-edit"; await fresh(); await J(`setView('eventPlanner')`); await sleep(200);
  const e0 = await p.eval(`document.querySelectorAll('.event-plan-card').length`); const t0 = await p.eval(`window.__jv.texts('.event-plan-card h3')`);
  await J(`clickText('Edit plan', '.event-plan-card button')`); await sleep(300);
  const evHeading = await J(`text('.task-modal h2')`);
  await p.eval(`[...document.querySelectorAll('.task-modal .modal-actions button')].pop().click()`); await sleep(300);
  B.eventEditDuplicates = { before: e0, after: await p.eval(`document.querySelectorAll('.event-plan-card').length`), modalHeading: evHeading, titlesBefore: t0, titlesAfter: await p.eval(`window.__jv.texts('.event-plan-card h3')`) };
  await p.eval("scrollTo(0,0)"); await p.shot(`${OUT}/bug-05-event-edit-creates-duplicate.png`, true);
  // B6 remove employee hard-deletes without confirmation
  label = "bug:remove-employee"; await fresh(); await J(`setView('people')`); await sleep(200);
  const pBefore = await p.eval(`document.querySelectorAll('.danger-text').length`);
  const removeLabel = await p.eval(`window.__jv.norm(document.querySelector('.danger-text')?.innerText)`);
  await p.eval(`document.querySelector('.danger-text').click()`); await sleep(300);
  B.removeEmployee = { buttonLabel: removeLabel, removeButtonsBefore: pBefore, after: await p.eval(`document.querySelectorAll('.danger-text').length`), toast: await J(`text('.toast span')`) };
  // B7 metrics are hard-coded: complete a task, see metric tiles
  label = "bug:static-metrics"; await fresh();
  const m0 = await p.eval(`window.__jv.texts('.metric-card')`);
  const completed = await J(`clickText('Complete task', '.task-card button')`); await sleep(300);
  const m1 = await p.eval(`window.__jv.texts('.metric-card')`);
  B.staticMetrics = { before: m0, after: m1, completedClicked: completed, focusBanner: await J(`text('.focus-banner')`), navBadge: await J(`text('.main-nav button em')`), toast: await J(`text('.toast span')`), toastRole: await p.eval(`document.querySelector('.toast')?.getAttribute('role') || document.querySelector('.toast')?.getAttribute('aria-live') || null`) };
  await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Approve parent'));c&&c.scrollIntoView({block:'center'})})()`);
  await p.shot(`${OUT}/bug-07-completion-feedback.png`, false);
  // B8 owner identity: Arjun is the signed-in user but cannot complete tasks assigned to "Arjun Mehta"
  B.identity = await p.eval(`(()=>{const c=[...document.querySelectorAll('.task-card')].find(c=>c.innerText.includes('Finalize October JEE'));return {header: window.__jv.text('.page-heading h1'), sidebarUser: window.__jv.text('.head-card strong'), owner: window.__jv.norm(c.querySelector('.owner-name').innerText), control: window.__jv.norm(c.querySelector('.owner-only, .complete-button')?.innerText)}})()`);
  // B9 toast persistence
  label = "bug:toast"; await fresh(); await sleep(7000);
  B.toastPersists = { after8s: await J(`text('.toast span')`), fontSize: await p.eval(`getComputedStyle(document.querySelector('.toast')).fontSize`), closeButtonName: await p.eval(`document.querySelector('.toast button')?.getAttribute('aria-label')`) };
  // B10 nav: Notices & feedback / My profile
  label = "bug:nav"; await fresh();
  await J(`clickText('Notices & feedback', '.sidebar button')`); await sleep(300);
  B.noticesNav = { heading: await J(`text('.page-heading h1')`), nav: (await J("navButtons()")).filter(b => b.active || b.text.includes("Notices")) };
  await J(`clickText('My profile', '.sidebar button')`); await sleep(300);
  B.myProfileNav = { heading: await J(`text('.page-heading h1')`), modalOpen: await J("modalInfo()") };
  await p.shot(`${OUT}/bug-10-my-profile-nav-opens-modal.png`, false);
  // B11 focus visibility (keyboard)
  label = "bug:focus"; await fresh(); const foci = [];
  for (let i = 0; i < 8; i++) { await p.key("Tab", "Tab", 9); foci.push(await J("focusInfo()")); }
  B.focusVisible = foci;
  await p.shot(`${OUT}/bug-11-keyboard-focus-not-visible.png`, false);
  // B12 dead controls
  label = "bug:dead"; await fresh();
  const deadTests = [["Search tasks", ".topbar button"], ["Workspace settings", ".sidebar button"]];
  B.deadControls = [];
  for (const [t, s] of deadTests) { const h0 = await J(`text('.page-heading h1')`); await J(`clickText(${JSON.stringify(t)}, ${JSON.stringify(s)})`); await sleep(250); B.deadControls.push({ control: t, changed: (await J(`text('.page-heading h1')`)) !== h0 || !!(await J("modalInfo()")) }); }
  // Fonts actually rendered
  await p.send("DOM.enable"); await p.send("CSS.enable");
  const doc = await p.send("DOM.getDocument", { depth: 1 });
  const fonts = {};
  for (const sel of [".page-heading h1", ".task-card h3", ".ribbon-symbol", ".hanuman-overview-mark"]) {
    const q = await p.send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: sel });
    if (q.nodeId) { const f = await p.send("CSS.getPlatformFontsForNode", { nodeId: q.nodeId }); fonts[sel] = f.fonts.map(x => `${x.familyName} (${x.glyphCount})`); }
  }
  B.fonts = { rendered: fonts, documentFonts: await p.eval(`document.fonts.size`), bodyFamily: await p.eval(`getComputedStyle(document.body).fontFamily`) };
  // Mobile: nav drawer
  await p.viewport(390, 844, true); label = "mobile:nav"; await fresh();
  await p.eval(`document.querySelector('[aria-label="Open menu"]').click()`); await sleep(400);
  B.mobileNav = { closeButton: await p.eval(`!!document.querySelector('.sidebar [aria-label*="lose"]')`), backdrop: await p.eval(`!!document.querySelector('.sidebar-backdrop, .mobile-nav-backdrop')`), sidebarRect: await p.eval(`(()=>{const r=document.querySelector('.sidebar').getBoundingClientRect();return {x:r.x,w:r.width,h:r.height}})()`) };
  await p.shot(`${OUT}/mobile-nav-drawer-open.png`, false);
  await p.key("Escape", "Escape", 27);
  B.mobileNav.closesOnEscape = !(await p.eval(`document.querySelector('.sidebar').classList.contains('mobile-open')`));
  B.viewportMeta = await p.eval(`document.querySelector('meta[name=viewport]').content`);
  B.reducedMotionRules = await p.eval(`[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch{return []}}).filter(r=>r.media && /prefers-reduced-motion/.test(r.media.mediaText)).length`);
}

try {
  await viewPass("desktop");
  await viewPass("mobile");
  for (const vp of ["desktop", "mobile"]) {
    await p.viewport(vp === "mobile" ? 390 : 1280, vp === "mobile" ? 844 : 800, vp === "mobile");
    for (const [name, setup, open, file] of modalDefs) await modal(vp, name, setup, open, `${vp}-modal-${file}.png`);
  }
  await bugs();
} catch (e) { report.fatal = String(e.stack || e); }
writeFileSync(new URL("./report.json", import.meta.url), JSON.stringify(report, null, 1));
await p.close();
console.log(report.fatal || "done");
