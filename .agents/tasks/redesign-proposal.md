# JAMBAVAN redesign proposal: audit, design system and implementation plan

Round 4 (checkpoint `5f248af`): the app was updated with four features (My Day, the "Why is this task not moving?" blocker check-in, task dependencies, Task Handover). This revision re-audits the updated app in the browser (§2.4), re-checks every round 1 finding on the new code (§2.5), designs the four features into the system (§3.5, §4, §9, §10.3, §11 IA-10 to IA-12, §12 F16–F24, §13, §14, §15, §16), applies the exact round 3 fixes M1–M3 and N1–N9 (§21.1), and summarises the changes in §22. Every `Home.tsx` line reference now points at the new 1226-line file. Phase A only: no app code was changed. The seed numbers changed with the new seed (tasks 8–12 were added), so every seed-derived number below was recomputed (§22.2).

Round 3: revised after the round 2 `.agents/tasks/design-review.md` (verdict CHANGES_REQUESTED: 0 HIGH, 6 MEDIUM, 16 NIT). Every round 2 finding is answered in §21; the round 1 responses stay in §20.

Round 3 re-checks (all read from `Home.tsx` or measured, not from memory; the line numbers are for the old 1053-line file, and §22.3 maps them to the new one): the dev server still answers `GET /` with 200. `createEventPlan` gives planned tasks `kind: "Responsibility"`, `project: event.title` and `source: "Event plan · {title}"` (line 810). `addTaskUpdate` and `addTaskSubtask` write `addedBy: "Arjun Mehta"` (lines 703, 712). The task-dialog owner select is a hard-coded list of 5 options (You, Neha Kapoor, Ritesh Shah, Sana Iyer, Vikram Nair). `archiveTask` toggles `archived` (line 685). `attendanceReportRows` maps every profile (line 571). `addEmployee` has no duplicate-name check (line 746). `completeTask` logs and toasts even when its owner guard fails (lines 578–583). The bell dot uses `unreadReminders.length + unread appNotifications` (seed 4 + 1 = 5), and the My feed nav badge is a literal `3` (line 925). Seed task 4 is Squirrel / `kind: "Task"` (Manual task) with the contributor "You"; seed task 1 has no `acknowledgedBy`.

Round 2 re-checks: the dev server still answers `GET http://localhost:3000/` with 200. The round 1 baseline screenshots and `audit-report.json` are still valid because the app is unchanged. The new decisions rest on facts read from `Home.tsx`, not memory: `completeTask` writes `completedAt: "05 Oct 2026, 3:15 PM"` (line 580); 4 seed tasks carry `project` (ids 1, 2 → October Launch, 4 → Parent Connect, 7 → Faculty Excellence) while the `projects[]` seed claims 18/9/6 open tasks (lines 306–310); `access` is `"Active" | "Suspended"` (line 82); `sensitiveAuditActions` is at line 527.

- Authoritative brief: `.agents/tasks/redesign-brief.md` (sections 1–26; section 26 was truncated by the user)
- App audited: `jambavan-app/` at checkpoint `5f248af` (single route `/`, all views in `client/src/pages/Home.tsx`, now 1226 lines, 195 KB; round 1–3 audited the 1053-line, 162 KB file)
- Baseline screenshots: `.agents/tasks/screenshots/before/` (round 1, old code), `screenshots/before-v2/` (functional check of the delta, 92 PNGs) and `screenshots/before-v3/` (round 4 re-audit of the updated app, with `audit-tools/audit-v3-report.json` and `audit-v3-probe.json`)
- Mocks: `.agents/tasks/mocks/` (4 HTML mocks, each screenshotted at 1280 px and 390 px)
- Audit tooling (zero-dependency Chrome DevTools Protocol driver, Node 22 built-in WebSocket): `.agents/tasks/audit-tools/`. Run with `node audit.mjs` from that folder while the dev server is up; `inpage.js` and `report.json` resolve relative to the scripts.

---

## 1. Summary and design direction

JAMBAVAN keeps every feature, data shape, approved label and nav group. What changes is the visual language, the information density, and a set of real bugs. The new identity is a **light, warm "dawn manuscript" system**: cream paper surfaces, deep maroon as the brand and action colour, saffron for warmth and progress, royal gold used only as hairlines and ornaments, forest green for completion, deep ocean blue for information and focus. Mukta handles the UI (Latin and Devanagari in one family). Cormorant Garamond is the classical display face for the wordmark, page titles and quotes, and Tiro Devanagari Hindi sets the few sacred-text moments.

The Ramayana becomes the **structure of the screens**, not decoration. Each view gets its own environment from the section 12 mapping (Ayodhya dawn for My feed, the Ram Setu shore for Projects, Jambavan's dusk forest for the Dashboard, Kishkindha for People, and so on). The environment is drawn as original layered SVG landscape (architecture, mountains, ocean, Setu stones, diyas; no deity figures) inside a fixed 4-layer backdrop: environment, atmosphere, readability scrim, cards. Text never sits on detailed art: the readability scrim is at least 96% opaque across the whole text column and fades only beyond it (§5). Ram Setu is the progress language everywhere, and it is backed by data. Today's Mission (the current user's non-long-running work for today) and each project Setu are computed from real tasks, so every completed task moves its Setu forward (§10). A 20-stone bridge shows the five progress stages, and the far-shore diya lights at 100%. HANUMAN missions carry a Lanka-horizon strip with a dashed leap trail, which suggests Hanuman's journey without drawing him. Character art (Rama, Hanuman, Jambavan, Sugriva and the Vanara Sena) is designed as **slots**. Today each slot renders a symbolic or landscape fallback. A commissioned painting can be dropped in later through a single asset manifest, with the aspect ratio, focal point and safe-crop zones already defined.

The four checkpoint `5f248af` features join the same language without new nav groups or themed functional labels (§22). **My Day** is the private "Daily Dharma" planner in Workspace, with its own forest-hermitage environment and "Today's three arrows" for the Top 3. The **"Why is this task not moving?"** check-in carries the Sanjeevani rescue symbol, on the card and in the leadership panel. **Task dependencies** are drawn as Setu stones laid in order, so leadership sees which stone the rest of the bridge is waiting on. **Task Handover** reads as passing the mission ("Mission handed over to {name}"). Labels on controls stay plain: "My Day", "Depends on", "Hand over task", "New Task Owner".

---

## 2. Audit findings (prioritized, with evidence)

The audit drove headless Chrome 1280×800 (desktop) and 390×844 (mobile, touch emulation) over every view and every modal. It measured computed contrast for every visible text node and tested keyboard access, Escape and Tab behaviour. It also reproduced the bugs. Raw numbers are in `screenshots/before/audit-report.json`.

Capture note: the first pass produced 8 blank viewport captures (`desktop/mobile-modal-edit-task-modal`, `desktop/mobile-modal-attachment-modal`, `mobile-modal-feedback-modal`, `mobile-modal-mom-assign-task-modal`, `bug-02`, `bug-07`). The cause was that the clip rectangle ignored the page's scroll offset. The driver was fixed and all 8 were recaptured and checked by eye (now 47–191 KB each). The DOM measurements taken in the first pass were not affected.

Contrast caveat: the checker composites the background colours of ancestor elements. It cannot see gradients or background images. Entries flagged `gradient` were checked by eye. For example, the cream text on the indigo-to-brown `.ramayana-ribbon` in `desktop-00-feed-above-fold.png` is readable, so it is **not** listed as a defect.

### 2.1 P0: broken behaviour or data loss

| # | Finding | Evidence |
|---|---|---|
| A1 | **Editing a task destroys its data.** Saving the edit form unchanged on the HANUMAN task reset the journal (1 update to 0), progress (24% to no bar), subtask completion (1/2 to 0/2), contributor parts (1/2 to 0/2) and team ("Strategic initiatives" to "Leadership"). Cause: `createTask` rebuilds the task from the draft and spreads it over the existing one. | `bug-02-hanuman-after-edit-save.png`; `audit-report.json` → `bugs.hanumanEditDataLoss` |
| A2 | **Cancelling an edit leaks into "Create task".** Edit, then Cancel, then the header "Create task" button opens **"Edit task"** pre-filled with the old task and a Delete button. `editingTaskId` is never cleared on close. | `bug-01-create-after-cancelled-edit.png`; `bugs.cancelEditLeak` |
| A3 | **Create/Edit task dialog cannot be finished on most screens.** The dialog is 963 px tall at 1280×800 and 1229 px at 390×844, with no `max-height` or scroll. The bottom half, including the "Create task" button, is off-screen and unreachable. The same happens with Feedback (desktop 819 px of 800; mobile 1001 px of 844), Profile (mobile 940 px) and Add employee (mobile 852 px). | `desktop-modal-create-task-modal.png`, `mobile-modal-create-task-modal.png`, `mobile-modal-feedback-modal.png`; `modals.*.info.clippedBottom=true, scrollable=false` |
| A4 | **The signed-in user cannot complete their own tasks.** The header says "Good morning, Arjun" and the sidebar user is Arjun Mehta, but tasks owned by "Arjun Mehta" show "Owner completes" and no Complete button. Only tasks owned by the literal string "You" can be completed. The edit form also shows Task owner = "You" for Arjun's task because "Arjun Mehta" is not an option. | `bugs.identity`; `desktop-modal-edit-task-modal.png` |
| A5 | **Projects and JAMBAVAN Guide are unreachable.** The sidebar has 11 items and neither of these views is among them. `navItems` has no `projects` entry, and `guide` is filtered out of every group. The code has no `setActiveView("projects"/"guide")` anywhere. The screenshots were taken by setting state directly. | `nav.desktop` in report; `desktop-07-guide.png`, `desktop-08-projects.png` |
| A6 | **Event "Edit plan" duplicates the event.** Clicking Edit plan and saving produced two "Annual Parent Orientation" cards. The dialog title is "Plan an event", and the task rows are re-added to the feed. | `bug-05-event-edit-creates-duplicate.png`; `bugs.eventEditDuplicates` |
| A7 | **Destructive actions have no confirmation, and one contradicts the approved lifecycle.** "Delete task" removes the card immediately (7 → 6 cards). "Remove" on People hard-deletes a profile, and the first row is the signed-in user, Arjun Mehta, who can remove himself. `docs/jambavan-standardization.md` says to use **Deactivated** and to "avoid permanently deleting business records". | `bugs.deleteNoConfirm`, `bugs.removeEmployee` |
| A8 | **No dialog is accessible.** None of the 12 dialogs or panels has `role="dialog"` or `aria-modal`. Escape closes none of them. Tab leaves every dialog and moves into the page behind (for example to "My feed"). The close (X) icon buttons have no accessible name. The mobile nav drawer has no close button, no backdrop and no Escape handling. | `modals.*` (`focusEscapesDialogAfterTab`, `closesOnEscape:false`); `bugs.mobileNav`; `mobile-nav-drawer-open.png` |
| A9 | **Task status is never shown.** `statusLabel()` and `StatusIcon` are defined but never rendered. The Blocked task "Resolve projector issue" shows no "Blocked" anywhere on its card. | code grep; `extra` check `blockedCardShowsStatusText:false` |

### 2.2 P1: accessibility and responsive (hard requirements in sections 24–25)

| # | Finding | Evidence |
|---|---|---|
| B1 | **Contrast fails across the app.** On My feed, 166 of 270 text nodes fail WCAG AA. The worst real failures: 7–9 px grey on white at 2.13–2.9:1 (subtask authors, "0 people seen", timestamps, "Private", "Low"), sidebar group labels at 2.71:1, the "+18%" green at 2.41:1, and "High"/"Overdue" coral at 3.1:1. Other views have similar ratios (Dashboard 139/200, Role matrix 72/94). | `views.*.contrast` in report |
| B2 | **Text is far too small.** On My feed, 232 of 270 text nodes are under 12 px and 183 are under 10 px. The CSS uses 7–11 px throughout, including an 8 px rule for mobile notifications, and the toast is 10 px. | `views.desktop:feed.contrast.sizes`; `index.css:1167` |
| B3 | **The page cannot be zoomed on mobile.** The viewport meta includes `maximum-scale=1`. | `client/index.html`; `bugs.viewportMeta` |
| B4 | **Touch targets are too small.** On mobile My feed, 111 of 111 interactive elements are under 44 px tall and 24 are under 24 px. On Role matrix, 29 of 44 are under 24 px. | `views.mobile:*.taps` |
| B5 | **Horizontal overflow on mobile.** The Dashboard is 609 px wide on a 390 px screen (`.reward-card`). The Role matrix is 766 px wide (`.access-matrix-hero` and the matrix card). | `overflow.mjs` output; `mobile-11-roleMatrix.png` |
| B6 | **Focus is barely visible.** There is no custom `:focus-visible`. Only the browser's 1 px auto outline shows, and it is lost on the dark active nav pill. | `bugs.focusVisible`; `bug-11-keyboard-focus-not-visible.png` |
| B7 | **Fields have no labels.** On My feed, 14 fields rely on a placeholder only (notice reply, journal, inline subtask, feedback answer). Chrome logs a "form field should have an id or name" issue. | `views.desktop:feed.labels` |
| B8 | **The sidebar does not fit an 800 px tall window.** The sidebar is 894 px tall inside 100vh with `overflow: visible`, so the user card and "Workspace settings" fall off-screen. | `desktop-08-projects.png` (footer below fold); `extra` `sidebarOverflow` |
| B9 | **The toast is not announced and never goes away.** The toast has no `role`/`aria-live`, its close button has no name, and it is still on screen after 8 s. It sits above dialogs (z-index 50 vs 40) and covers their bottom-right corner. | `bugs.toastPersists`; every modal screenshot |
| B10 | **The webfont is declared but not loaded.** `body` asks for "Plus Jakarta Sans", but `document.fonts.size` is 0 and the page renders in `.SF NS` (system font). Devanagari falls back to `.SF Devanagari`. | `bugs.fonts` |
| B11 | **A React key warning appears on Role matrix.** "Each child in a list should have a unique key prop" is logged on desktop and mobile. This was the only console error found. | `console[]` in report |

### 2.3 P2: UX, consistency and content

| # | Finding | Evidence |
|---|---|---|
| C1 | **My feed buries the tasks.** At 1280×800 the first task card starts 1552 px down (1.9 screens); on mobile it is 2553 px down (3 screens). Ahead of it sit the focus banner, the HANUMAN overview, the full notice board with reply box, feedback requests, metrics and the family strip. Each task card is 415–720 px tall (desktop) and 508–865 px (mobile), because every card always shows its contributors, subtask input, files and journal. | `extra` output; `desktop-01-feed.png`, `mobile-01-feed.png` |
| C2 | **Metrics are hard-coded or fake.** "Team follow-ups 8", "Completed this week 24", "+18% vs last week", "Needs attention 3", the focus banner's "68%", "Institute completion 69%" and the nav badge "3" never change. Completing a task changed only "My open work", which is itself computed as `count + 2`. | `bugs.staticMetrics` |
| C3 | **Several controls do nothing.** Search (⌘K), Workspace settings, the workspace switcher chevron, the focus-banner arrow, Projects "New project" and "Open project", and Dashboard "This week" have no effect. | `bugs.deadControls`; code grep (buttons without `onClick`) |
| C4 | **Navigation misleads in two places.** "Notices & feedback" jumps to My feed with no active state. "My profile" both switches view and opens the edit modal on top of it. | `bugs.noticesNav`, `bug-10-my-profile-nav-opens-modal.png` |
| C5 | **Every avatar is broken.** All 22 avatar images are broken (`/manus-storage/...` returns `index.html`), so alt text ("Arjun Mehta profile") shows instead of a face. The body and ribbon background images from `/manus-storage` are broken as well. | `a11y.desktop-images {total:22, broken:22}`; header avatar in `desktop-00-feed-above-fold.png` |
| C6 | **The theme reads as an ornament.** A single "॥ श्री राम ॥" ribbon is repeated on every view (Audit log and Access matrix included), and ॐ is used as the HANUMAN mark (ॐ is not specific to Hanuman). The rest is generic SaaS: indigo, Plus-Jakarta-style weights, lucide icons. This is the "generic app with a Ramayana image" result the brief rejects. | every view screenshot |
| C7 | **The same pill is repeated three times.** A HANUMAN task shows "HANUMAN", "HANUMAN mission" and "HANUMAN · year-long". MoreHorizontal (…) means "Edit" on cards but is decorative in the head card and project cards. | `bug-02-hanuman-after-edit-save.png` |
| C8 | **There are two primary actions per view.** The global "Create task" sits beside each view's own primary (Write new MOM, Plan an event, Send notice). It also appears on Access matrix and Audit log, where it makes no sense. | `desktop-03-momDirectory.png`, `desktop-12-auditLog.png` |
| C9 | **Validation is silent.** An empty task title, MOM, event, calendar event, notice or feedback request simply does nothing: no message, no `aria-invalid`. Attachment links accept any text. | `bug-03-empty-title-no-feedback.png`; `bugs.emptyTitle` |
| C10 | **Copy has grammar slips.** "What should You do?", "1 updates", "0 people seen", "2 response s", "1 / 1 parts done". | `desktop-modal-create-task-modal.png`, `desktop-01-feed.png` |
| C11 | **Code leftovers remain.** The `meetings` ViewKey and its title strings are unused. `canManageCalendar` is hard-coded to `true`. | `Home.tsx` lines 64, 535, 1038 and 1055 |
| C12 | **Project progress is static and contradicts the tasks.** The project cards show 72% / 46% / 81% and "18 / 9 / 6 open tasks", but only 2 / 1 / 1 tasks link to those projects. Completing a linked task changes nothing on Projects. (Found in round 2 while checking review H3.) | `desktop-08-projects.png`; `Home.tsx:349–353` vs task `project` fields |

Not verified (needs real data or services): server-side permission enforcement, persistence (all state resets on refresh, as designed in the prototype), uploads, email digest. These are out of scope here, as the handoff document already says.

### 2.4 Re-audit of the updated app (checkpoint `5f248af`, round 4)

Method: `audit-tools/audit-v3.mjs` and `audit-v3-probe.mjs` drive the running dev server (`http://localhost:3000`, HTTP 200, not restarted) in headless Chrome at 1280×800 and 390×844 (mobile emulation plus touch), from a fresh load per scenario. Every finding below was measured or reproduced in the browser, not read from code. Raw output is in `audit-tools/audit-v3-report.json` and `audit-v3-probe.json`; screenshots are in `screenshots/before-v3/` (13 PNGs). The functional pass in `delta-update-report.md` (all four features PASS) stays valid; this pass covers what it did not: bugs at the edges, accessibility, contrast, text size, dialog height and scroll, keyboard and mobile layout.

One correction to the delta report: it says "no horizontal overflow on any view" because `scrollWidth == innerWidth`. Under Chrome mobile emulation the layout viewport widens to fit wide content, so both numbers grow together. On the Dashboard at 390 px both read 609, and on the Access matrix both read 766. B5 still holds (§2.5).

**New P0: broken behaviour or data loss**

| # | Finding | Evidence |
|---|---|---|
| D1 | **Handover can silently hand a task to "You".** Task 4's default recipient is its first unfinished contributor, "You". "You" is not one of the 11 options, so the select shows "Select employee", but the Create button is enabled. Clicking it makes the owner "You", shows "Ready for You", and toasts "Handover package created for You." | `audit-v3-report.json` → `desktop.handover.task4` (`domSelectValue:""`, `createEnabled:true`, `afterCreate.owner:"Task Owner · You"`) |
| D2 | **The handover records the wrong previous owner.** Handing over Neha Kapoor's task 2 to Manav Shah writes "From Arjun Mehta to Manav Shah" and "Created by Arjun Mehta". `from` is always the literal "Arjun Mehta", so the actor and the previous Task Owner are conflated. The new package replaces the seed package, and no history remains on the card. | `desktop.handover.task2After` (`packages:1`) |
| D3 | **The seed handover contradicts live behaviour.** Task 2's package reads "Ready for Aditi Rao · Created by Neha Kapoor", but the Task Owner is still Neha Kapoor. A UI handover always moves ownership to the recipient. | `desktop.handover.seedTask2` |
| D4 | **The recipient stays a Contributor after taking over.** The default recipient is an unfinished contributor, for example Karan Joshi on task 1. After the handover that person is both Task Owner and Contributor, which breaks "owner excluded from contributors" (§14.2). | `desktop.handover.defaults.to:"Karan Joshi"`; Home.tsx:701 keeps `assistants` |
| D5 | **Editing a My Day time block deletes it.** "Edit" removes the block from the list and copies it into the add form (rows 1 → 0). Changing the date, or leaving the view, loses the block. | `desktop.myDay.scheduleEdit` (`before:1, afterEditClick:0, afterDateSwitchAndBack:0`) |
| D6 | **A saved end-of-day answer cannot be cleared.** After "Save review", emptying "What did I complete?" puts the saved text straight back, because the field value is `draft \|\| saved`. | `desktop.myDay.reviewValueAfterClearing:"Finished the timetable"` |
| D7 | **Seed task families for tasks 8–12 are overwritten.** The Admission Campaign seed declares Angad and Sugriv, but every card shows "Squirrel". `initialTasksWithCategories` (Home.tsx:292) replaces any category that is not in the 7-entry `categoryByTaskId`. | `desktop.feed.campaignCategories` (5 × "Squirrel") |
| D8 | **"Depends on" promises a rule the app does not enforce.** The field hint says "the upstream task must be completed first". A "You" task that depends on the not-started task 2 shows "Blocked by … Pending" and still completes with one click while task 2 stays open. The delta's own handoff says completion rules are unchanged, so the copy is what is wrong. | `audit-v3-probe.json` → `completeWithPendingUpstream`; `desktop-dependency-completed-while-upstream-pending.png` |
| D9 | **A blocker can never be cleared, and it outlives completion.** No control removes a check-in. On task 4, reporting "Too much other work", completing, then reopening brings back "Current blocker: Too much other work". | `audit-v3-probe.json` → `blockerAfterCompleteReopen` |

**New P1: accessibility and responsive**

| # | Finding | Evidence |
|---|---|---|
| D10 | **The Task Handover dialog repeats A8.** It has no `role="dialog"` or `aria-modal`. Escape does not close it. Focus stays on the trigger when it opens, and the first Tab leaves it (to the next card's "Why is this task not moving?"). The close X has no accessible name. | `desktop.handover.dialog`, `.tab.escapedAfterTabs:1`, `.closesOnEscape:false`, `.focusOnOpen.insideModal:false` |
| D11 | **The Task Handover dialog cannot be finished on a phone (A3, delta R1).** It is 954 px tall at 390×844 with `max-height: none`, and the backdrop does not scroll. "Create handover package" sits at y = 952, and the "Important notes" field is cut off. At 1280×800 it fits (613 px, button at y = 682). | `mobile.handover.dialog`; `mobile-handover-dialog.png` |
| D12 | **The new "Depends on" field makes A3 worse.** The create dialog is now 1049 px at 1280×800 (Create at y = 1047) and 1315 px at 390×844 (Create at y = 1313). The select itself is visible (y = 411–449 desktop). Its accessible name is the whole label text, including the hint and all 13 option texts, because the hint `<small>` and the select sit inside one `<label>`. | `desktop.createTask`, `mobile.createTask`; `*-create-task-dialog-depends-on.png` |
| D13 | **The new text is 8–10 px and fails contrast.** In the blocker check-ins, 110 of 110 text nodes are under 12 px and 20 fail AA. The worst are the selected reason (white on #C7894A, 2.96:1, 9 px), "Reported by…" (3.28:1, 8 px) and the help line (3.40:1). Dependency lines are 8 px at 3.04–3.16:1, the handover package 8 px at 2.84–2.95:1, the "Depends on" hint 8 px at 3.19:1, the Dashboard blocker panel 9 of 18 failing (worst 2.88:1), and the dependency panel 12 of 20 failing (worst 2.81:1). My feed overall: 264 of 522 text nodes fail, and 478 are under 12 px (round 1: 166 of 270 and 232). | `desktop.feed.blockerCheckin/.dependencyBlocked/.handoverSummary`, `desktop.dashboard.*Panel`, `desktop.createTask.dependsOnContrast` |
| D14 | **My Day: small text, small targets, unlabeled fields.** 31 of 39 text nodes are under 12 px (minimum 8 px). 19 of 22 controls are under 44 px tall (minimum 13 px). 11 of 15 fields have no label: the date pickers, "Add a priority…", the time inputs, "Activity or time block", "Category", the actionable fields and both status selects. The four planner hero texts read 1.04–1.23:1 in the checker, but that is the gradient caveat: by eye in `desktop-myDay-full.png` the cream text on the indigo-to-saffron band is readable, so they are **not** counted as defects. | `desktop.myDay.contrast/.taps/.unlabeled`; `*-myDay-full.png` |
| D15 | **Blocker reasons show their selected state only by colour.** The selected reason differs only in fill (#C7894A vs #FFFDF9) and text colour. There is no `aria-pressed`, check icon or text change, so screen-reader users cannot tell which reason is recorded. The ten "optional context" fields have no label. | `desktop.feed.blockerSelectedState` (`ariaPressed:null`), `blockerInputsUnlabeled:10` |
| D16 | **Touch targets on the new card controls are small.** The 100 blocker controls are all under 44 px (minimum 23 px, 10 under 24 px), and 38 of 38 acknowledgment-row buttons, including "Add to My Day" and "Handover Task", are under 44 px (34 px on mobile). On mobile, 261 of 261 feed controls are under 44 px and 35 are under 24 px (round 1: 111 and 24). | `mobile.feed.blockerTaps/.ackRowTaps`, `recheck.mobileTapsFeed` |
| D17 | **The persistent welcome toast now covers the handover dialog on phones (B9).** "Welcome back. 3 tasks need your attention today." sits over the "Important notes" field of the open dialog at 390×844. On desktop the toast from a previous action (for example "Task reopened…") stays visible next to the open dialog. | `mobile-handover-dialog.png`; `audit-v3-probe.json` → `toastVisibleWhileHandoverOpen` |

**New P2: UX, consistency and content**

| # | Finding | Evidence |
|---|---|---|
| D18 | **Three different "todays".** The page eyebrow says "Tuesday, 29 September 2026" (literal, Home.tsx:1120). My Day says "Wednesday, 7 October 2026", which is the machine's UTC date (`toISOString`, Home.tsx:109), so it is one day behind in India before 05:30. Completions, check-ins and audit entries use "05 Oct 2026", and handovers use "06 Oct 2026, 3:45 PM". | `desktop.myDay.dateLabel`, `audit-v3-probe.json` → `headerDate` |
| D19 | **My Day says "My Day" twice and "Today's Top 3" on any date.** The page H1 "My Day" is followed by the planner hero and a second H2 "My Day". The Top 3 heading stays "Today's Top 3" when another date is selected. The "Use 'Add to My Day'…" empty line renders larger than the card heading. The personal-actionable inputs truncate their placeholders ("What do you wa…"). | `desktop.myDay.headings`; `desktop-myDay-full.png` |
| D20 | **A handed-over task stays in My Day as if it were still yours.** After task 1 is added to My Day and handed to Neha Kapoor, My Day still lists it under "academy tasks assigned to you" with no change. The "Add to My Day" button disappears from the card, because Neha now owns it. | `desktop.myDay.linkedAfterHandover`; `desktop-myDay-linked-task-after-handover.png` |
| D21 | **Dependency copy is misleading in two places.** Every leadership row says "Campaign delayed because…", including for non-campaign tasks. Each row names the *nearest* unfinished upstream task, so "Update admission data" reads "delayed because Make school follow-up calls is pending", while the real hold-up for the whole chain is "Approve admission campaign poster" (Blocked). On the card, "Blocked by … Pending" reuses the word of the Blocked status for a task whose own status is Not started. | `desktop.dashboard.dependencyRows` |
| D22 | **The blocker headline is ungrammatical for some reasons.** The template is "{pct}% of delayed tasks with a check-in are {reason in lower case}". The seed reads "…are waiting for someone", which works, but "I haven't started" would read "…are i haven't started". Cycle prevention is silent: cyclic tasks are simply missing from "Depends on", with no explanation. | `desktop.dashboard.blockerHeadline`; delta report (cycle prevention) |
| D23 | **Duplicate nav icon and more card weight.** My Day and Event Planner both use `CalendarDays`. Five of the ten blocker check-ins are open by default (every task with a check-in), and cards are now 465–772 px tall on desktop and 559–1105 px on mobile (round 1: 415–720 and 508–865). | `audit-v3-probe.json` → `navIcons`; `desktop.feed.detailsOpenByDefault`, `taskCardHeights` |
| D24 | **Any user can hand over or report a blocker on any open task.** The handover button shows on 10 of 12 cards (all open ones), whoever owns them. This is cosmetic in a client-only prototype, and the handoff lists server-side delegation rules as production work. It is flagged again here as a security gap (§14.3). | `desktop.feed.handoverButtonCount:10` |

Checked and found correct: My Day content never appears in Dashboard, Audit log, My feed or Department (a unique Top 3 string was searched for after each view switch; `audit-v3-probe.json` → `myDayTextLeaksTo`, all `false`). "Add to My Day" only links, and the toast says the academy task was not changed. Enter adds a Top 3 item, and the input disappears at 3/3. Enter opens the check-in disclosure (a native `<summary>`). The new controls are reachable by Tab (the 1 px browser outline is B6). Editing a task keeps its blocker, handover package and dependency. The only console error is the pre-existing Role matrix key warning (B11).

### 2.5 Round 1 findings re-checked on the new code

Every round 1 finding still holds. None was fixed by the delta, and several got worse because the new features add text, controls and a dialog that follow the same patterns. The column "New evidence" is from `audit-v3-report.json` → `recheck` unless noted.

| # | Status on `5f248af` | New evidence |
|---|---|---|
| A1 | Still holds | HANUMAN task edit, saved unchanged: "1 updates" → "0 updates", 24% → no bar, team "Strategic initiatives" → "Leadership". The spread at Home.tsx:806 now also carries `dependsOnTaskId` from the draft; `blocker` and `handover` survive because the draft never contains them. |
| A2 | Still holds | Edit, Cancel, then Create task: heading "Edit task" with Delete present. |
| A3 | Still holds, worse | Create dialog 1049 px (desktop) and 1315 px (mobile); the new handover dialog is unreachable on mobile (D11, D12). |
| A4 | Still holds, wider | Task 1 still shows "Owner completes". New seed task 9 ("Approve admission campaign poster") is also owned by "Arjun Mehta" and also cannot be completed, so neither of the user's two tasks due today can be completed. The Complete guard is Home.tsx:680. |
| A5 | Still holds | Sidebar: My feed, My Day, Department, Dashboard, MOM Directory, Event Planner, Yearly Calendar, Notices & feedback, People, My profile, Access matrix, Audit log, Workspace settings. There is still no Projects or Guide. |
| A6 | Still holds | "Edit plan" + save: "Annual Parent Orientation" cards 1 → 2. |
| A7 | Still holds | Delete in the edit dialog: cards 12 → 11, with no confirmation. |
| A8 | Still holds, plus one more dialog | Handover dialog: D10. |
| A9 | Still holds | No card shows its status. Task 9 is Blocked, and its top line reads only "Squirrel Project responsibility". `statusLabel` is now used only inside the handover package. |
| B1 | Still holds, worse | My feed 264 of 522 failing (D13). |
| B2 | Still holds, worse | 478 of 522 under 12 px, 408 under 10 px; `index.css:1167` still sets 8 px. |
| B3 | Still holds | `maximum-scale=1`. |
| B4 | Still holds, worse | Mobile My feed 261 of 261 under 44 px (D16). |
| B5 | Still holds | Dashboard 609 px and Access matrix 766 px wide at 390 (see the correction above). The mobile feed filter select also extends to x = 474, clipped. |
| B6 | Still holds | Focus on the new controls is the 1 px browser `auto` outline. |
| B7 | Still holds, worse | Plus 10 blocker-note fields and 11 My Day fields (D14, D15). |
| B8 | Still holds, worse | The sidebar is 935 px inside an 800 px window (was 894), because My Day was added. |
| B9 | Still holds | The welcome toast is still there after 8 s, and it covers dialogs (D17). |
| B10 | Still holds | `document.fonts.size` 0; body still asks for "Plus Jakarta Sans". |
| B11 | Still holds | The Role matrix key warning is the only console error. |
| C1 | Still holds | The first card is at 1552 px (desktop) and 2553 px (mobile), unchanged, and the cards are taller (D23). |
| C2 | Still holds | The tiles still read "Team follow-ups 8", "Completed this week 24", "Needs attention 3"; the nav badge is still the literal 3 (Home.tsx:1080), while 6 reminders are now due. The welcome toast still says "3 tasks". |
| C3 | Still holds | The search button still has no `onClick` (it is the `.search-button` in the topbar). |
| C4 | Still holds | "Notices & feedback" still jumps to My feed. |
| C5 | Still holds | 31 of 31 avatar images broken. |
| C6, C7, C8 | Still hold | The ribbon is on My Day too. "Create task" is on My Day (`desktop-myDay-full.png`). |
| C9 | Still holds, wider | "Create handover package" is disabled with no message; an empty Top 3 or time block does nothing. |
| C10 | Still holds | "0 people seen", "1 updates". |
| C11 | Still holds | `meetings` ViewKey (Home.tsx:64) and titles (1038, 1055); `canManageCalendar = true` (535). |
| C12 | Still holds | Projects seed at Home.tsx:349–353 is unchanged. The new Admission Campaign chain (tasks 8–12) uses `project: "Admission Campaign"`, which has no Projects entry, so it never appears on Projects. |

---

## 3. Design system

### 3.1 Technology stack (locked once approved)

- React 19 + TypeScript + Vite 7 + Tailwind CSS 4 (`@tailwindcss/vite`), all already in the repo.
- Radix primitives already installed and wrapped by `client/src/components/ui/*`: `dialog` (all modals), `alert-dialog` (destructive confirmations), `sheet` (mobile nav), `popover` (notifications), `tooltip`. Also `cmdk` (via `ui/command.tsx`) for search and `sonner` (already mounted in `App.tsx`) for toasts.
- framer-motion 12 (already present) is used only for the splash and the celebration overlay (enter/exit choreography). Micro-interactions use CSS keyframes and transitions.
- lucide-react stays for standard UI icons. Ramayana symbols are a small local SVG icon set (§7).
- **New dependencies: exactly three font packages, pinned:** `@fontsource/mukta@5.3.0`, `@fontsource/cormorant-garamond@5.3.0`, `@fontsource/tiro-devanagari-hindi@5.3.0`. Versions were checked on npm on 2026-10-06. Self-hosting is chosen over Google Fonts so that the app makes no third-party requests, works offline, and needs no CSP changes. Only the needed subsets and weights are imported (`latin` and `devanagari`, Mukta 400/500/600/700, Cormorant 600/700 latin, Tiro 400 devanagari). fontsource uses `font-display: swap` by default.
- No other new packages. Component tests use Node vitest for pure logic plus the zero-dependency CDP browser audit (§13). jsdom and Testing Library are deliberately not added.

### 3.2 Colour tokens

These are defined as CSS variables in `client/src/theme/tokens.css` with the **`--jb-` prefix** (for example `--jb-maroon-700`, `--jb-ink`), so they cannot collide with the legacy `--ink`. They are exposed to Tailwind 4 through `@theme` as `--color-jb-*`. The shadcn variables (`--primary`, `--ring`, …) are re-pointed to them so `components/ui/*` match automatically.

The old Monsoon Ledger tokens (`--ink`, `--saffron`, `--mint`, `--coral`, `--parchment`, indigo `#1F2A56`, `#f2a93b`) and the `/manus-storage` background rules are removed in two steps, so unported views never lose their styling:
- Increment 1 adds `client/src/theme/legacy-aliases.css`, which maps each legacy variable onto the nearest new token (`--ink: var(--jb-ink)`, `--saffron: var(--jb-saffron-700)`, `--mint: var(--jb-forest-700)`, `--coral: var(--jb-danger-700)`, `--parchment: var(--jb-cream-100)`, …). It deletes the old definitions; nothing is layered over them.
- Each legacy rule in `index.css` is deleted as its component is ported (§13.2).
- Increment 6 deletes `legacy-aliases.css`. AC-1.3 then greps for every legacy name.

| Token | Hex | Role |
|---|---|---|
| `cream-50` | #FFFBF3 | page surface |
| `cream-100` | #FBF3E4 | sidebar, sunken areas, artboards |
| `cream-200` | #F3E6CF | hover fill, track, dividers |
| `sand-300` | #E3D3B5 | decorative card borders (not used for input borders) |
| `white` | #FFFFFF | card surface |
| `ink` | #2B1D14 | primary text (earth-brown black) |
| `earth-700` | #5A3F2E | secondary text, ghost buttons |
| `earth-600` | #6B5344 | body-secondary and meta text |
| `stone-600` | #6E675E | tertiary text, placeholders, captions |
| `stone-500` | #8A8378 | input borders, unplaced stones, disabled outlines (UI only, never text) |
| `maroon-700` | #7A1E2C | brand, primary buttons, active nav text, HANUMAN |
| `maroon-800` | #5E1622 | primary hover/pressed, Lanka |
| `maroon-50` | #F8E9E7 | active nav fill, selected option |
| `saffron-500` | #E8862A | progress fill, highlights (fills only, never text on light) |
| `saffron-700` | #9A4A12 | saffron text: eyebrows, Sugriv |
| `saffron-100` | #FCE9D2 | saffron tint |
| `gold-500` | #C9A227 | royal gold: hairlines, ornaments, glow, text on dark only |
| `gold-600` | #A88414 | ornament on light, active nav bar (decorative) |
| `gold-100` | #F7EDCC | reward/celebration tint |
| `forest-700` | #2F5D3A | completed, Squirrel, success |
| `forest-100` | #E2EEDF | success tint |
| `blue-700` | #1E3A5F | info, In progress, Angad, links, **focus ring**, ocean |
| `blue-100` | #E1E9F2 | info tint, Setu water |
| `danger-700` | #A8261B | errors, High, overdue, Blocked, destructive |
| `danger-100` | #FBE4E0 | danger tint |
| `night-900` | #1C1512 | dark surfaces (reflection band, celebration, splash scrim) |

Measured contrast (computed with the WCAG 2.x formula in `audit-tools/contrast.mjs`; round 2 added and re-ran the pairs the components need). Together the two tables below are the allowlist of text/background combinations:

| Pair | Ratio | Use |
|---|---|---|
| ink / cream-50 · white | 15.79 · 16.30 | body |
| earth-700 / cream-50 | 9.31 | secondary |
| earth-600 / cream-50 · cream-100 · white | 6.91 · 6.46 · 7.13 | meta |
| stone-600 / cream-50 · cream-100 | 5.40 · 5.06 | captions, placeholders |
| cream-50 / maroon-700 · maroon-800 | 9.93 · 12.61 | primary button |
| maroon-700 / cream-50 · maroon-50 | 9.93 · 8.69 | active nav, HANUMAN text |
| saffron-700 / cream-50 · saffron-100 | 6.05 · 5.27 | eyebrow, Sugriv |
| ink / saffron-500 | 6.11 | rare saffron-filled chip |
| forest-700 / forest-100 · cream-50 | 6.38 · 7.40 | completed |
| blue-700 / blue-100 · cream-50 | 9.39 · 11.14 | info; focus ring vs page (UI ≥ 3:1) |
| danger-700 / danger-100 · cream-50 | 5.84 · 6.88 | errors |
| gold-500 / night-900 · maroon-800 | 7.45 · 5.38 | gold text on dark only |
| cream-50 / night-900 | 17.46 | text on dark bands |
| stone-500 / cream-50 · white | 3.63 · 3.75 | input borders, PriorityBadge outline (UI, ≥ 3:1) |

Pairs added in round 2 (review M5), all recomputed:

| Pair | Ratio | Use |
|---|---|---|
| cream-50 / danger-700 | 6.88 | danger button |
| ink / gold-100 · maroon-50 · blue-100 · forest-100 · saffron-100 | 13.92 · 13.81 · 13.30 · 13.60 · 13.76 | PersonAvatar initials on department tints |
| stone-600 / white | 5.58 | input placeholder |
| earth-700 / cream-200 · white | 7.79 · 9.61 | ghost hover, Medium PriorityBadge |
| maroon-700 · saffron-700 · forest-700 · blue-700 · danger-700 / white | 10.25 · 6.25 · 7.64 · 11.50 · 7.10 | coloured text on white cards |
| ink / cream-100 · cream-200 | 14.78 · 13.22 | sidebar nav text, hover rows |
| maroon-700 / cream-100 | 9.29 | active nav on sidebar |
| earth-600 / maroon-50 · gold-100 | 6.04 · 6.09 | meta on active nav, reward card |
| forest-700 / gold-100 | 6.53 | completion text inside the reward card |
| cream-100 · gold-100 / night-900 | 16.34 · 15.39 | text on the dark reflection card |
| stone-600 / cream-200 · maroon-50 | 4.52 · 4.73 | **allowed only at ≥ 14 px** (too close to 4.5 for 13 px captions) |

Forbidden pairs (a unit test asserts they fail, so nobody "fixes" the test by adding them): saffron-500 text on light (2.58), gold-500 text on light (2.34), gold-600 text on light (3.40 on cream-50, 3.51 on white; ornament only), sand-300 as an input or control border (1.43). The 2 px blue-700 focus ring sits on the page background with a 2 px offset and is never drawn directly against maroon-700 (1.12).

Family colours: Squirrel = forest, Angad = blue, Sugriv = saffron, HANUMAN = maroon (filled). Every family badge also shows its emblem and name, so colour is never the only signal. Priority does **not** use family colours (review N10): High = danger-700, Medium = earth-700, Low = stone-600, on an outline chip with a different shape (§3.5).

### 3.3 Typography

- `--font-sans`: "Mukta", "Noto Sans Devanagari", system-ui, sans-serif. Used for all UI text.
- `--font-display`: "Cormorant Garamond", "Tiro Devanagari Hindi", Georgia, serif. Used for the wordmark, page H1, section H2, dialog titles, empty-state titles, project names and quotes. Never below 20 px.
- `--font-deva`: "Tiro Devanagari Hindi". Used only for the sacred-text lines (§9.4).

| Token | Size / line height | Face, weight | Use |
|---|---|---|---|
| display-xl | 46/50 (mobile 34/38) | display 600 | feed hero headline |
| display-l | 38/42 (mobile 30/34) | display 600 | page H1 in scene band |
| h2 | 26/30 | display 600 | section headings, dialog title (30) |
| h3 / title | 18/24 | sans 600 | card and task titles |
| body | 16/24 | sans 400 | default; inputs are 16 px to avoid iOS zoom |
| body-s | 15/22 | sans 400/500 | nav items, buttons, descriptions |
| meta | 14/20 | sans 400/600 | meta rows, labels |
| caption | 13/18 | sans 400 | timestamps, hints, badge text |
| eyebrow | 12/16, +0.1em, uppercase | sans 600 | eyebrows, nav group labels (the only 12 px style) |
| wordmark | 20–22, +0.16–0.32em, caps | display 700 | JAMBAVAN (20 in the sidebar lockup and hero, 22 on the splash) |

Hard floor: no text under 12 px. 12 px is used only for uppercase eyebrows and the bold count numerals in nav and notification pills. Avatar initials are always 13/700, including the 32 px small avatar. Today 183 of 270 text nodes on My feed are under 10 px.

### 3.4 Spacing, radii, elevation, layout

- Spacing on a 4 px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Card padding is 20 (16 on mobile). Page gutters are 40 desktop, 24 tablet, 16 mobile.
- Radii: `sm` 6 (chips), `md` 10 (buttons, inputs), `lg` 14 (cards), `xl` 20 (dialogs, scene panels), `pill` 999.
- Elevation (warm-tinted shadows):
  - `e0`: flat with a 1 px border.
  - `e1` (card): `0 1px 2px rgba(43,29,20,.06), 0 2px 8px rgba(43,29,20,.05)`.
  - `e2` (hover, popover, toast): `0 6px 20px rgba(43,29,20,.10)`.
  - `e3` (dialog): `0 24px 64px rgba(28,21,18,.28)`.
- Ornament: `ornament-top` draws a 4 px temple-border band (repeating gold-600/gold-500 steps at 55% opacity). It is used only on feature cards: Today's Mission, project cards, Guide family cards and celebration.
- Breakpoints (Tailwind defaults; **768 is the only phone/tablet threshold**, used by dialogs, ArtSlot `<picture>` sources and scene layout alike, and 640 is not used):
  - < 768: single column, topbar plus drawer nav, full-screen dialog sheets, scene art as a block above the copy (§5).
  - 768–1023: drawer nav, 2-column grids, centred dialogs.
  - ≥ 1024 (laptop): fixed 256 px sidebar.
  - ≥ 1280: content max 1240 px; My feed gains a 320 px right rail.
  - ≥ 1536: content max 1320 px; scene art shows more landscape and the copy stays left-aligned.
  - `@media (max-height: 520px)` (landscape phones, short windows; review M13): the My feed hero drops to band intensity (wordmark and "Inspired by…" line hidden, H1 26 px, 44 px buttons). The mobile art block drops to 140 px. Measured in mock 1 at 844×390: the hero is 205 px (it was 360+ in round 1).
- Audit and acceptance widths: 390×844, 768×1024, 844×390 (landscape), 1024×768, 1280×800, 1536×900.

### 3.5 Components (specs)

All of these live in `client/src/components/jambavan/primitives/` unless noted.

- **Button** (`cva` variants):
  - Variants: `primary` (maroon-700, cream text, hover maroon-800), `secondary` (white, ink text, 1 px stone-500 border), `ghost` (transparent, earth-700, hover cream-200) and `danger` (danger-700, cream text).
  - Sizes: `sm` 36 px (desktop dense rows only, with a 44 px hit area through padding or margin), `md` 44 px (default), `lg` 52 px (hero). "Desktop" means a viewport ≥ 1024 px wide (the sidebar breakpoint, §3.4). Below 1024 px, `sm` renders at 44 px: the component applies `min-height: 44px` under `@media (max-width: 1023px)`, so AC-9.2 holds at 768×1024.
  - Text is 15 px/600. Icons are 18 px, left of the label.
  - Disabled uses `aria-disabled` plus 45% opacity and stays focusable when it needs to show a reason in a tooltip. `disabled` is used only when no explanation is needed.
  - Pressed state: translateY(1px).
  - Focus (global `:focus-visible`): 2 px solid blue-700 outline, 2 px offset.
- **IconButton**: 44×44. `aria-label` is a **required** TypeScript prop. Used for edit (lucide `Pencil`, replacing the misleading `MoreHorizontal`), more, close, archive and menu.
- **Field**: label above (14/600 ink), control, hint (13 stone-600), error (14 danger-700 with icon). It wires `id`, `htmlFor`, `aria-describedby` and `aria-invalid` automatically. Required fields show " *" with `aria-hidden` plus `required` on the control. Input/Select/Textarea: 44 px tall, 1 px stone-500 border, radius 10, white background, 16 px text; focus uses a blue-700 border plus a 3 px blue ring at 15%; the error state uses a danger border. Selects stay **native `<select>`** (best a11y and mobile pickers), restyled with a CSS chevron.
- **Checkbox and ToggleRow**: 20 px box in a 44 px clickable row. Toggle buttons (Mark seen / Acknowledge, contributor parts, poll options) use `aria-pressed`.
- **Badge**: 28 px pill, 13/600, icon plus text. `FamilyBadge` (emblem plus name; HANUMAN uses a filled maroon pill), `SourceBadge` (approved labels: Manual task, MOM task, Event task, Project responsibility, HANUMAN mission; the text always comes from the pure `sourceLabel(task)` in `state/selectors.ts`, §12 F13, never from an inline ternary), `StatusBadge` (Not started, In progress, Blocked, Completed, each with its own icon). `PriorityBadge` is deliberately a different shape from every pill badge (review N10): a 26 px chip with 6 px radius (not a pill), a white fill, a 1 px stone-500 outline (danger-700 for High), signal-bar glyphs (3, 2 or 1 bars), the text "High", "Medium" or "Low", and `aria-label="Priority: Medium"`. In mock 2 it no longer resembles the saffron Sugriv pill.
- **Card**: white, 1 px sand-300 border, `e1`, radius 14, padding 20. Optional `ornament`. A header slot holds the eyebrow and an h2/h3.
- **TaskCard** (`components/jambavan/task/TaskCard.tsx`, see mocks 1 and 2):
  - Left 4 px family stripe.
  - Top row: FamilyBadge, SourceBadge, StatusBadge (fixes A9), then right-aligned Edit (Pencil, aria-label "Edit task: {title}") and a More menu (round 4: **Hand over task… and Archive/Restore**; see the More menu bullet below). "Add Task Guidance" and "Add Completion Evidence" live only in the Details panel next to the file list (review N9), so each action has one home.
  - Title 18/600.
  - Meta row: due (overdue in danger-700 with an icon and the word "Overdue"), PriorityBadge, Private (lock), Team task (`Users` icon, when `isTeamTask`; review round 3 N8), project and source. On an overdue **High**-priority card that is not done, the overdue item also shows the `Sanjeevani` glyph (aria-hidden) before the word "Overdue": the rescue mark of brief §7 (review round 3 N9). The text "Overdue by 2d" is what carries the meaning.
  - Dependency lines (checkpoint `5f248af`; §10.3, F18), directly under the title. Both are plain text with a small `ChainSetu` (§10.3):
    - When `findBlockingDependency(task, tasks)` is non-null: "Waiting on {upstream.title} · {statusLabel(upstream.status)}" (for example "Waiting on Approve admission campaign poster · Blocked"), with "· Archived" appended when the upstream is archived. "Blocked by" is not used, because Blocked is a task status (D21).
    - Otherwise, when the task is open and `downstreamOf(task.id, tasks)` is non-empty: "{n} task(s) wait on this one: {first two titles}{ · …}".
  - Blocker check-in (§9.1 "Why is this task not moving?", F22), open tasks only:
    - With a check-in, a `BlockerLine` sits under the meta row: the `Sanjeevani` glyph (aria-hidden), then "Not moving: {reason} · {note} · Reported by {displayName(reportedBy)}". The text is 14 px earth-700 on danger-100, and the glyph and the words "Not moving" mean colour is never the only signal.
    - Below it (or alone when there is no check-in) is a `BlockerCheckIn` disclosure, a ghost button "Why is this task not moving?" (44 px, `aria-expanded`, `aria-controls`). It is **closed by default**, including when a check-in exists (D23). Opened, it shows the help line, the 8 reasons as `ToggleButton`s (`aria-pressed`; the recorded one also gets a `check` icon), a labelled "Context for management (optional)" field and, when a check-in exists, the ghost button "It's moving again". One click on a reason still records it immediately, as today.
  - Handover line (F17): when `task.handover` exists, a `HandoverLine` under the owner row reads "Mission handed over to {displayName(to)} · from {displayName(from)} · {createdAt}" with a "View handover" disclosure. The full package (Current status, Last action, Waiting for, Next action, Important notes, as a 2-column definition list, 14 px) opens inside it. It is **expanded by default only when `isCurrentUser(task.assignee)`**, because the package is written for the person receiving the mission.
  - High-priority "Take action" nudge (brief §7; review N8): on High-priority cards that are not done, the primary action uses the `MissionArrow` icon, which nudges 2 px toward the label on hover and focus. Nothing else moves.
  - Owner row: avatar, "Task Owner · {displayName(owner)}" (for example "Arjun Mehta (you)", §12 F4), team · department (shown once when they are equal, for example "Operations"), and a contributor avatar stack with "x of y parts done".
  - Progress: stone-segmented bar (10 segments) with the numeric %.
  - Action row: "Complete mission" (primary, only for the owner; otherwise the note "Only the Task Owner completes"), Mark seen / Acknowledge toggles, "Add to My Day" (secondary, `Sunrise` icon, only when `isCurrentUser(task.assignee)`, as today; it reads "In My Day" with a check icon and `aria-pressed="true"` once the task is linked for the selected My Day date, and clicking it then does nothing more, as today), and a **Details disclosure** (`aria-expanded`, `aria-controls`).
  - More menu (round 4): **"Hand over task…"** (open tasks, when `canHandOver(task)`, §12 F17) and **Archive/Restore**. Handover is occasional (leave, sickness, a change of responsibility), so it lives in the menu rather than as a fifth button on every card. It is still one menu choice away, and the menu item names the action exactly.
  - The Details panel holds everything the card has today: contributors (toggle each part), responsibility notes, subtasks (checkboxes plus a labelled add field), Files & links (both attachment kinds) and the reopen/audit line. Nothing is removed; it is only collapsed by default.
  - HANUMAN variant, rendered when **`isHanumanMission(task)`** (`task.longRunning === true`, §11 IA-7; review round 3 M2): a 64 px Lanka-horizon strip at the top (decorative, `aria-hidden`), a Setu progress bar instead of the plain bar, a "Post update" button, and the journal inside Details. "HANUMAN · year-long" is shown once, as a SourceBadge suffix. The FamilyBadge keeps showing `category` and the SourceBadge keeps using `kind`; both are display-only, so a `category: "HANUMAN"` task without `longRunning` shows the HANUMAN FamilyBadge but the standard card body.
  - Completed variant: StatusBadge "Completed" with the arrow-in-target icon, muted title, "Completed by {displayName} · time", and a Reopen ghost button. Right after completion, the card shows the CompletionReward panel (§8) with the Setu that actually changed. The panel is local card state: it stays until the card unmounts (a filter or view change removes it from the list) or the task is reopened (`status !== "done"` clears it).
  - Every card, whatever its family, keeps the same top row (Edit + More with Hand over task and Archive/Restore) and the same action row (Complete mission or the owner note, Mark seen / Acknowledge, Add to My Day for the owner, Details), so the Sugriv, Angad and Squirrel cards differ only in content.
  - Measured in mock 1 at 1280 px (round 4, with the blocker and dependency lines): 372–545 px per card, versus 465–772 px in the updated app (round 3 mock: 208–439 px).
- **Dialog** (`primitives/Dialog.tsx`, wrapping `ui/dialog`): `role=dialog`, `aria-modal`, focus trap, Escape closes, focus returns to the trigger, and the first invalid or first field is focused on open.
  - Desktop: centred, max-width 560 (task, task handover, feedback, attachment, profile, access), 720 (MOM, notice, calendar) or 880 (event); `max-height: min(90dvh, 900px)`. The task handover dialog was 954 px tall on a phone (D11); on the primitive it becomes a full-screen sheet with a scrolling body and the "Hand over mission" button in the sticky footer.
  - Layout: header (eyebrow, display title, description, close IconButton), a **scrolling body**, and a **sticky footer** (Cancel, then the primary on the right). This fixes A3.
  - Mobile (< 768): full-screen sheet with a 20 px top radius, safe-area padding and a sticky footer.
  - Errors raised while the dialog is open render inside it as `InlineError` above the footer (`role="alert"`), never as a toast (review M7; §14.1).
  - Backdrop: night-900 at 55%, 2 px blur.
  - Destructive confirms use `ui/alert-dialog`.
- **Navigation** (`layout/Sidebar.tsx`, `layout/MobileNav.tsx`):
  - Sidebar: 256 px, cream-100. Brand lockup (bow mark in a maroon tile with a gold inset ring, plus the JAMBAVAN wordmark). The approved groups Workspace, Execution, Communication and People & Control. Footer: JAMBAVAN Guide, user card and the small "॥ श्री राम ॥".
  - Nav items: 44 px rows. The active item gets maroon-50 fill, maroon text, a 3 px gold-600 bar and `aria-current="page"`. Counts are pills with an `aria-label` (for example "6 reminders"). The My feed count is **unread deadline reminders** (seed **6**: tasks 1, 2, 3, 6, 9 and 10), replacing today's literal 3. It differs from the bell (7) on purpose: the bell also counts app notifications.
  - Workspace order (round 4): My feed, **My Day**, Department, Dashboard, as the updated app already has it (IA-10). My Day uses lucide `Sunrise`, so it no longer shares `CalendarDays` with Event Planner (D23). My Day has no count pill: its contents are private and are never summarised outside the view.
  - The nav list scrolls inside the sidebar (fixes B8).
  - Below 1024 the same component renders inside `ui/sheet`: opaque, with a close button, Escape support, a backdrop and a focus trap.
- **Topbar**: 64 px. Breadcrumb (group / view). Search button that opens the ⌘K command palette (§11). A contextual "Create mission" button, shown only where the page has no such primary (IA-5). Notifications IconButton (aria-label "Notifications, N unread", with a count pill, not only a dot). **N = unread deadline reminders + unread app notifications**, the same sum today's dot uses (seed 6 + 1 = **7**). A handover adds one unread "Task handover received" notification, as today. It opens `ui/popover` as **`<Popover modal>`**: Radix Popover is non-modal by default, and `modal` gives the focus trap, outside-pointer blocking and `aria-modal` behaviour that AC-4.1 and AC-4.3 require. The content gets `role="dialog"`, `aria-modal="true"` and `aria-labelledby` on its "Notifications" heading; Escape closes it and returns focus to the bell. Avatar.
- **Toasts**: sonner themed through the existing `components/ui/sonner.tsx`, with `theme="light"` passed explicitly. The wrapper reads `useTheme()` from next-themes, which has no provider here, so it would otherwise follow the OS and show dark toasts (review N6). Styling: ink background, cream 15 px text, gold icon, 5 s, close button with aria-label "Dismiss notification", `role=status`. Position: bottom-center on mobile, bottom-right on desktop. Sonner's default z-index stays. **Toasts are used only when no dialog is open** (review M7): Radix hides everything outside an open dialog from assistive tech, so a toast fired during a dialog would go unannounced. Messages that happen while a dialog is open use InlineError, or are toasted after the dialog closes (for example "Mission started" after Save). The custom `.toast` and the sticky welcome toast are removed. The open-dialog registry is a counter in context with one hook, `useRegisterOpenDialog(open: boolean)`. The Dialog primitive calls it, and in increment 2 (when `notify()` lands) every **legacy** modal that is not yet ported calls it too, with its existing `show…Modal` flag (the handover modal included: `showHandoverModal`). So the "no toast over a dialog" rule (AC-6.6) holds from increment 2, not only after increment 4.
  - **Toasts already on screen are cleared when a dialog opens** (review round 3 M1). When the open-dialog count goes from 0 to 1, `useRegisterOpenDialog` calls sonner's `toast.dismiss()`, so a toast created a moment before (for example "Mission completed…" followed at once by Edit) never sits unannounced behind an `aria-modal` dialog. `notify()` gates new toasts; the dismiss clears existing ones.
  - **A completion that celebrates shows no toast** (M1). The CelebrationOverlay is a Radix dialog, so the store's `completeTask` computes `celebrationFor(...)` first and calls `notify()` only when it returns `null`; the overlay headline carries the message (§8).
- **EmptyState**: 96 px symbolic SVG (Setu stone, path, diya, bow), a display title (24), a 15 px body and an optional action. Copy is in §9.2.
- **InlineError / ErrorState**: danger-100 panel with an alert icon and title, a short explanation and a retry action. `role=alert` is used only for errors produced by a user action. Inside dialogs, InlineError sits directly above the sticky footer, so it is visible without scrolling, and focus does not move to it (the alert role announces it).
- **Loading**: lazy view chunks show a quiet cream skeleton (no shimmer when reduced motion is on). The branded splash is described in §8.
- **PersonAvatar**: initials (2 letters, 13/700, ink) on a department-toned tint (Academic = gold-100, Admissions = forest-100, Operations = blue-100, Marketing = saffron-100, Leadership = maroon-50), with a 1.5 px gold inset ring and a tiny kolam-dot motif in one corner (decorative). It renders a photo only when `avatarOverrides[name]` (manifest) or `profile.photo` (the blob URL from the Add employee flow, which is kept) exists. If the image fails to load, `onError` switches to initials. `alt` = person's name, or `""` with `aria-hidden` when the name is printed next to it.
- **RamSetuProgress**: see §10. **ChainSetu** (dependency chain as ordered stones): see §10.3.
- **My Day components** (`components/jambavan/myday/`, round 4; mock 4):
  - `MyDayView` is laid out as a band scene (`vanvas-ashram`, §4), then a 2-column grid at ≥ 1024 px (one column below). The order is: Today's three arrows, My schedule, Academy tasks in My Day, Personal actionables, then a full-width End-of-day review.
  - `PrivacyNote` sits in the band, one line with the `Lock` icon: "Private to you. My Day never appears in dashboards, reports, search or team views." (14 px, earth-700). It replaces the separate banner, the second "My Day" H2 and the duplicate planner hero (D19).
  - `DatePicker`: a labelled native `<input type="date">` ("Plan for") plus a "Today" ghost button that returns to `todayIso()` (§11 IA-10).
  - `ArrowsCard` holds the Top 3 as checkbox rows (20 px box in a 44 px row). A done row swaps the `MissionArrow` icon for `TargetHit`. The labelled add field is "Add a priority" (Enter or the "Add" button) and is hidden at 3 of 3. The count pill reads "1 of 3" with `aria-label="1 of 3 priorities done"`.
  - `ScheduleCard` lists rows of "09:00–10:00 · title · category" with a `StatusChip` (Planned, In progress, Completed, Missed, each with its own icon), a labelled status select, an "Edit" button that edits **in place** (F19) and a delete IconButton ("Delete time block: {title}"). The add form has labelled "Start", "End", "Activity" and "Category" fields.
  - `ActionablesCard` rows show title, note, "Due {date}" and the PriorityBadge. Its add form is a 2×2 grid of labelled fields ("What do you want to remember?", "Note (optional)", "Due", "Priority"), so placeholders no longer truncate (D19).
  - `LinkedTasksCard` rows show the FamilyBadge, title and StatusBadge, then "Open task" (switches to My feed and focuses the card with the IA-6 select-task behaviour) and "Remove from My Day". A task the user no longer owns shows "Handed over to {name}. It stays here until you remove it." (D20). The empty line is 15 px body text: "Use "Add to My Day" on a task you own."
  - `DayReviewCard`: three labelled textareas and "Save review" (secondary), under the eyebrow "Close the loop" with the Jambavan moon-and-cave symbol (aria-hidden). This is the brief §8 "reflecting on the journey" moment, kept small.
- **HandoverDialog** (`task/HandoverDialog.tsx`, round 4; mock 4) is built on the Dialog primitive (560 px wide; full-screen sheet below 768 px):
  - Header: eyebrow "Task Handover" (`Send`-style relay icon), title "Hand over this mission", and the description "Share where things stand so the next Task Owner can carry it on without reading every comment."
  - Body: a summary box (task title, "{project or team} · {department}", "Current Task Owner · {displayName(owner)}", and the read-only "Current status" shown as a StatusBadge plus "{progress}% complete", not as a disabled input), then the fields from §14.2: "New Task Owner" (required select), "Last action" (required), "Waiting for", "Next action" (required) and "Important notes".
  - Footer: Cancel, then the primary "Hand over mission". Validation errors are inline (§9.3); the button is never silently disabled (C9).

---

## 4. Per-screen environment mapping (section 12)

Each view's environment is configured in `client/src/theme/environments.ts` (`environmentByView: Record<ViewKey, EnvironmentConfig>`). No two Workspace, Execution or Communication views share an environment id. The quiet pattern screens (Guide and My profile share `temple-pattern`; Access matrix and Audit log share `palace-pattern`) may share, because they are deliberately low-key (AC-12.1). There are **14 environment ids** (round 4 adds `vanvas-ashram` for My Day): 12 scene SVGs plus 2 pattern SVGs, and `temple-pattern` has a lotus variant. The splash reuses a minimal `ayodhya-dawn`. `intensity`:
- `hero`: 360 px panel, used on My feed only.
- `band`: 188 px header panel.
- `quiet`: pattern-only strip for dense data and control screens.

| View | Environment id | Scene content (SVG, no figures) | Brief mapping | Art slot | Intensity |
|---|---|---|---|---|---|
| My feed | `ayodhya-dawn` | dawn sky, sun disk behind the central shikhara (divine-light focal point), palace domes and chhatris, saffron dhvaja, Sarayu ghat with diyas | Home → Ayodhya / Rama | `hero.landing` | hero |
| My Day (round 4) | `vanvas-ashram` | forest hermitage (parnakuti roofline) at sunrise, one diya on the step, a bow resting against the post, a path leading into the trees | Daily tasks → forest / journey; brief §3 "daily dharma" | — | band |
| Department | `vanvas-path` | sunrise forest, layered trees, earthy path receding toward mountains | Daily tasks → forest / journey | — | band |
| Dashboard | `jambavan-dusk` | deep-blue dusk, crescent moon, quiet forest, cave mouth on a hill (Jambavan's cave) | Analytics / reflection → Jambavan | `jambavan.reflection` | band, plus the Reflection card |
| MOM Directory | `ayodhya-sabha` | royal court arches and pillars, hanging lamps, palm-leaf scroll motif | Records, decisions (Ayodhya court) | — | band |
| Event Planner | `yuddha-camp` | shore encampment at dawn, banners (pennants), strategy-map lines | Planning → Jambavan; Yuddha = strategic preparation | `jambavan.planning` | band |
| Projects | `setu-shore` | Kishkindha cliffs, ocean, Setu stones heading to a faint Lanka horizon | Projects → Kishkindha; Progress → Ram Setu | `sugriva.team` (optional) | band |
| People | `kishkindha` | mountains and caves, pennants of the Sena on ridges | Team → Sugriva + Vanara Sena | `sugriva.team` | band |
| Yearly Calendar | `panchavati` | calm river, lotus, seasonal trees, hermitage roofline | Panchavati (peace, seasons) | — | band |
| Notices & feedback (new view, §11) | `kishkindha-council` | cave council ledge, beacon fires on peaks (messages travelling) | Leaders coordinating, instructions to the Sena | — | band |
| JAMBAVAN Guide | `temple-pattern` | gopuram silhouette on kolam/rangoli lattice | Settings / guide → temple pattern | — | quiet |
| My profile | `temple-pattern` (lotus variant) | lotus border, kolam field | Settings → traditional pattern | — | quiet |
| Access matrix, Audit log | `palace-pattern` | jaali (lattice screen) pattern only | Settings → palace pattern | — | quiet |
| HANUMAN surfaces (cards, mission empty state) | `lanka-strip` | dusk sky, ocean, Lanka spires, dashed leap trail | Difficult tasks → Hanuman; Goals → journey toward Lanka | `hanuman.action` | inline strip |
| Celebration overlay | `ayodhya-deepotsav` | night palace, rows of diyas lighting, marigold garlands | Completed goals / achievements → Return to Ayodhya | `celebration.ayodhya` | overlay |
| Splash | `ayodhya-dawn` (minimal) | sun glow and wordmark | Loading | `loading.splash` | overlay |

## 5. 4-layer background architecture (section 13)

`<SceneBackdrop env intensity>` lives in `components/jambavan/art/SceneBackdrop.tsx`. It is the only way a view draws an environment.

1. **Environment** (`z -3`, `aria-hidden`). `<EnvironmentArt id>` renders the manifest image when a slot or env has `src`. Otherwise it renders the lazy-loaded SVG component from `art/environments/{id}.tsx`. The SVG uses `preserveAspectRatio="xMaxYMax slice"` so the focal content (right third) and the horizon survive cropping. On mobile the art becomes a 230 px block above the text (mock 1 @390) instead of sitting behind it.
2. **Atmosphere** (`z -2`, `aria-hidden`). CSS only: a radial sun glow, a linear mist gradient and optional static light rays (in the SVG). It fades in once over 320 ms. There is no looping motion.
3. **Readability layer** (`z -1`). The scrim contract is numeric and identical in spec, component and mocks (review H2):
   ```css
   /* ≥ 768 px, light: solid across the whole text zone, fade only beyond it */
   .scene { --text-zone-end: 56%; }
   .scene > .l-scrim {
     background:
       linear-gradient(90deg, rgb(255 251 243 / .96) 0%, rgb(255 251 243 / .96) var(--text-zone-end),
                       rgb(255 251 243 / 0) calc(var(--text-zone-end) + 16%)),
       linear-gradient(0deg, rgb(255 251 243 / 1) 0%, rgb(255 251 243 / 0) 22%);   /* bottom fade into the page */
   }
   .scene .scene-copy { max-width: min(560px, 54%); }   /* text column always ends inside the solid zone */
   ```
   - Rule: the scrim is ≥ 0.92 opaque everywhere inside the text column's bounding box (it is 0.96 by construction, because `54%` of the padded content box always ends before `56%` of the scene, for every width ≥ 768).
   - Dark variant (Dashboard reflection card): night-900 at 0.92 up to `--text-zone-end: 62%`, fading to 0 over the next 22%, with the copy at `max-width: min(520px, 58%)`. Below 768 it is a flat 0.92 night-900. The floor is ≥ 0.85.
   - Below 768 (hero and every band): the art is a block **above** the copy (`--art-h`: hero 230 px, band 120 px, 140 px when `max-height: 520px`). The scrim is solid cream under the copy and only fades the lowest 20% of the art, which is exactly the mobile text zone `.04,.80,.92,.18` that every slot keeps low-detail (§6.3). Text is never placed over the art on phones.
   - The scrim is **not optional**: `SceneBackdrop` has no prop to remove it, and `--text-zone-end` and the copy width are owned by the component, not by views.
4. **Content** (`z 0`). Eyebrow, H1, lede and actions. Cards below the band sit on plain cream, never on art.

Rules owned by this component: no important text over detailed artwork; the env layer is decorative (`aria-hidden`, no `alt`). The scrim is **verified by pixels, not by its declared colour**. The H2 method is implemented and already run on the mocks in `audit-tools/scrimaudit.mjs`:
- For every text node inside `.scene` or `.reflect`, set all scene text to `color: transparent` and hide inline icons.
- Screenshot each text box and decode the PNG (zero-dependency decoder on `node:zlib`).
- Take the worst-case background pixel and compute its contrast against the real text colour.
- Fail below 4.5:1, or below 3:1 for text ≥ 24 px or ≥ 18.66 px bold.
- Results on the revised mocks (0 failures): mock 1 worst 5.14:1 at 1024/1280/768, mock 3 worst 6.00:1, across 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900.
- Negative control (`CONTROL=1` re-applies the round 1 scrim): 1–2 failures per desktop width, as low as 1.37:1 at 768. The check catches exactly the defect the review found.

## 6. Artwork approach and slot list

### 6.1 Approach

- **Today**: original layered SVG landscapes and symbols, written by hand. Reference shapes are in `mocks/jambavan-mock-art.js`: `shikhara`, `dome`, `chhatri`, `wall`, `tree`, `diya` path builders; the environments `ayodhya-dawn`, `lanka-strip`, `setu-shore`, `jambavan-dusk`; and `setuSvg()`. Each environment is ≤ 6 KB of SVG and is code-split with its view. The following are **never drawn**: Lord Rama, Sita, Lakshmana, Hanuman, Jambavan, Sugriva, or any Vanara figure. Presence is implied by symbols: Rama by the bow (Kodanda) and the divine light behind the central temple; Hanuman by the gada, the Sanjeevani mountain silhouette and the leap trail; Jambavan by the cave, the moon and the scroll; Sugriva and the Sena by pennants and banners; the squirrel's seva by striped stones.
- **Later**: commissioned paintings plug into `client/src/theme/assets.ts` and `client/public/art/...` with **no code change** beyond the manifest entry.
- `docs/art-direction.md` (written in increment 5) will hold:
  - the slot table below;
  - palette and lighting rules (golden hour, warm cream highlights, deep maroon shadows);
  - dignity rules for depicting Rama: calm and compassionate, traditional Indian painting idiom (Pahari / Tanjore-inspired, not cartoon), never cropped at the head or face, never under UI text;
  - file formats (AVIF + WebP, sRGB), size budgets, and naming.

### 6.2 Manifest shape (`client/src/theme/assets.ts`)

```ts
export type ArtSlotId =
  | "hero.landing" | "celebration.ayodhya" | "hanuman.action" | "hanuman.sanjeevani"
  | "jambavan.planning" | "jambavan.reflection" | "sugriva.team" | "vanara.sena" | "loading.splash";
export type Box = { x: number; y: number; w: number; h: number }; // fractions 0–1 of the image
export interface ArtSlot {
  id: ArtSlotId;
  purpose: string;
  aspect: { desktop: `${number}:${number}`; mobile: `${number}:${number}` };
  focal: { desktop: { x: number; y: number }; mobile: { x: number; y: number } }; // → object-position
  safe: { desktop: Box; mobile: Box };     // must never be cropped or covered by UI
  textZone: { desktop: Box | null; mobile: Box | null }; // where UI copy goes (scrim-covered, low-detail); null = copy sits outside the image
  src?: { desktop?: string; mobile?: string }; // e.g. "/art/hero/landing-desktop.avif"
  alt: string;        // "" when purely decorative
  fallback: EnvironmentId | SymbolId;      // what renders today
}
export const artSlots: Record<ArtSlotId, ArtSlot>;
export const environmentArt: Partial<Record<EnvironmentId, { desktop?: string; mobile?: string }>>; // optional painted bands
export const avatarOverrides: Record<string, string>; // person name → "/art/people/{slug}.webp"
```

`<ArtSlot id>` renders `<picture>` (mobile source below 768 px) with `object-fit: cover` and `object-position` taken from `focal`. Only `hero.landing` is loaded eagerly (`fetchpriority="high"`); every other slot uses `loading="lazy"` and `decoding="async"`. If `src` is missing or the image fails (`onError`), the slot renders the fallback. A slot can never produce a broken image.

### 6.3 Slot list

Boxes are `x, y, w, h` as fractions of the image.

| Slot | Where | Aspect desktop / mobile | Focal desktop / mobile | Safe zone desktop / mobile | Text zone desktop / mobile | Fallback today |
|---|---|---|---|---|---|---|
| `hero.landing` | My feed hero (Rama as the spiritual centre; Hanuman and Jambavan dignified, Sena distant) | 16:5 (2400×750) / 4:3 (1200×900) | .72,.42 / .55,.38 | .55,.08,.38,.84 / .22,.04,.62,.62 | .03,.10,.50,.80 / `null` (copy sits below the art block) | `ayodhya-dawn` |
| `celebration.ayodhya` | Celebration overlay (Return to Ayodhya: Rama at centre, Sita, Lakshmana, Hanuman respectfully, citizens and diyas) | 16:9 / 9:16 | .50,.42 / .50,.38 | .25,.10,.50,.70 / .10,.08,.80,.55 | .20,.80,.60,.18 / .06,.70,.88,.26 | `ayodhya-deepotsav` |
| `hanuman.action` | HANUMAN mission banner, high-priority "Take Action" (leap toward Lanka) | 3:1 / 3:2 | .78,.36 / .70,.40 | .60,.05,.36,.80 / .40,.05,.56,.75 | .03,.15,.50,.70 / **.04,.80,.92,.18** | `lanka-strip` |
| `hanuman.sanjeevani` | Rescue (brief §7: Hanuman carrying the Sanjeevani = emergency, critical, rescue): the header art of the Dashboard "Why are open tasks not moving?" panel, and the Needs attention tile | 1:1 / 1:1 | .50,.45 / .50,.45 | .15,.10,.70,.80 / .15,.10,.70,.80 | `null` / `null` (tile only) | Sanjeevani mountain symbol. Large (48 px) in the blocker panel header and in the "No mission needs rescue today." tile (Needs attention = 0). Review round 3 N9 adds the 16 px aria-hidden `Sanjeevani` **glyph** (icon set, §7, not this slot) next to "Overdue" on the Needs attention tile when the count is > 0, on overdue High-priority cards, and on every card `BlockerLine`, so the symbol marks the rescue and not only its absence |
| `jambavan.planning` | Event Planner band (Jambavan observing and guiding) | 4:1 / 3:2 | .80,.45 / .72,.40 | .62,.08,.34,.84 / .45,.05,.52,.70 | .03,.15,.52,.75 / **.04,.80,.92,.18** | `yuddha-camp` |
| `jambavan.reflection` | Dashboard Reflection card and band (calm, wise, dusk) | 4:1 / 3:2 | .82,.50 / .75,.45 | .66,.10,.30,.80 / .50,.08,.46,.70 | .03,.12,.55,.78 / **.04,.80,.92,.18** | `jambavan-dusk` |
| `sugriva.team` | People and Projects band (Sugriva addressing the Sena) | 4:1 / 3:2 | .75,.45 / .65,.42 | .55,.08,.40,.84 / .35,.05,.60,.70 | .03,.15,.48,.75 / **.04,.80,.92,.18** | `kishkindha` / `setu-shore` |
| `vanara.sena` | "Every great mission needs a Vanara Sena" empty state | 4:3 / 4:3 | .50,.55 / .50,.55 | .10,.20,.80,.70 / .10,.20,.80,.70 | `null` / `null` (title sits below the image) | pennants symbol |
| `loading.splash` | Splash emblem (512×512) | 1:1 / 1:1 | .50,.50 / .50,.50 | .10,.10,.80,.80 / .10,.10,.80,.80 | `null` / `null` (the wordmark sits below the emblem) | bow + sun-glow SVG |

Avatars are **not** art slots. They live in `avatarOverrides: Record<string, string>` (person name → `/art/people/{slug}.webp`), rendered by `PersonAvatar` at 1:1 (256×256 source), `object-position: 50% 40%`, inside a circle that shows the central 80% of the image. A missing or broken file falls back to initials.

Crop rules (review M6). `safe` must not intersect `textZone` on **both** desktop and mobile. Intersection uses strict inequality, so boxes that only touch, like `.05+.75 = .80` against `.80`, are allowed. `textZone: null` means the copy sits outside the image (below it on phones, or tile-only). On phones the mobile text zone is the band the scrim fades over (§5), so commissioned art must keep its lowest 20% low-detail. The `assets.test.ts` integrity test asserts all of this for every slot (§15).

Budgets: hero ≤ 180 KB desktop and ≤ 90 KB mobile (AVIF, with a WebP fallback); env bands ≤ 80 KB; avatars ≤ 20 KB. Files go in `client/public/art/{hero,env,characters,celebration,people}/`.

## 7. Iconography (section 17)

New symbols live in `components/jambavan/icons/` as 24 px stroke icons at the lucide stroke width (1.75), so they sit cleanly next to lucide. The source paths are in `mocks/jambavan-mock-art.js`.

| Concept | Icon | Where |
|---|---|---|
| Task / mission | Arrow in flight (`MissionArrow`) | "Create mission" / "Start mission", task source |
| Completed | Arrow in target (`TargetHit`) | Completed status, "Complete mission" |
| Goal | lucide `Target` | goals, filters |
| Project | Arch bridge (`SetuBridge`) | Projects nav, project cards, Today's Mission |
| Team / Sena | Two pennants (`SenaPennants`) | People nav, contributors header |
| Planning | Palm-leaf scroll (`StrategyScroll`) | MOM Directory nav, MOM source, journal |
| Energy / HANUMAN | Gada (`Gada`) | HANUMAN family, high-energy missions |
| Leadership | Bow / Kodanda (`Bow`) | brand mark, leadership lens |
| Journey | Dotted forest path (`JourneyPath`) | Guide, journey empty state |
| Achievement | Diya (`Diya`) | rewards, celebration, streaks |
| Squirrel family | Striped stone (`SquirrelStone`) | badge, picker, filter tab |
| Angad family | Planted footprint (`AngadFoot`, Angad's immovable foot) | badge, picker |
| Sugriv family | Pennant (`SugrivPennant`) | badge, picker |
| Rescue / not moving (round 4) | Sanjeevani mountain (`Sanjeevani`) | card `BlockerLine`, overdue High cards, Needs attention tile, blocker panel header (review round 3 N9) |
| Dependency chain (round 4) | Setu stones (`ChainSetu`, §10.3; a component, not a 24 px icon) | card "Waiting on" line, Dashboard dependency panel |
| Mission handed over (round 4) | Relay arrow (`HandoverArrow`: an arrow passing from one open hand-curve to another) | More menu "Hand over task…", HandoverDialog eyebrow, card `HandoverLine` |

Standard lucide icons stay where they help usability: Search, Bell, Menu, X, Pencil (edit), MoreHorizontal (menus only), Calendar, Clock, Lock, Flag (priority), Paperclip, Archive/ArchiveRestore, ChevronDown, AlertCircle, Users (Department), BarChart3 (Dashboard), Megaphone, UserRound, ShieldCheck, Sunrise (My Day, round 4), ArrowRight (in-app "View tasks" and "Open task" links; review round 3 N8: `ArrowUpRight` is reserved for links that leave the app). ॐ is removed from the HANUMAN mark. Every icon-only control has an aria-label; icons next to text are `aria-hidden`.

---

## 8. Animation plan (sections 19, 22, 23)

Tokens live in `theme/motion.ts` and as CSS variables: `--motion-fast 120ms`, `--motion-base 200ms`, `--motion-slow 320ms`, `--motion-reward 600ms`, easing `cubic-bezier(.2,.7,.2,1)`.

`useReducedMotion()` combines framer-motion's hook with the media query. `base.css` also contains a global kill switch, so reduced motion is respected even if a component forgets. It uses near-zero rather than zero durations, so Radix Presence and `tw-animate-css` still fire `animationend` and dialogs unmount (review N5):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
```

| Moment | Motion | Duration | Reduced motion |
|---|---|---|---|
| Branded splash (first load per session, `sessionStorage["jb.splash"]`) | Cream fills to dawn glow, 6 static gold motes fade in, the JAMBAVAN wordmark and "॥ श्री राम ॥" fade up 6 px, then the whole overlay fades out. **Non-blocking**: the app renders and hydrates underneath from the first frame. The overlay is `pointer-events:auto` (review M16): the first `pointerdown` or `keydown` anywhere only dismisses it (`preventDefault` + `stopPropagation` in the capture phase), so a dismissal never reaches an unseen control. A visible "Skip" button does the same for pointer users. The overlay keeps `aria-hidden="true"` (it is decorative and lasts under a second), so the Skip button gets `tabIndex={-1}`: nothing focusable sits inside an aria-hidden subtree, and keyboard users dismiss with any key. Focus stays on the document, so the first Tab after dismissal lands on the first control of the app. | ≤ 900 ms total, hard cap 1000 ms | not shown |
| View change | Content fades and rises 4 px | 200 ms | none |
| Scene band | Atmosphere fades in once | 320 ms | none |
| Complete task (micro-reward, `CompletionReward`) | The state updates **immediately** (no waiting). The store's `completeTask` calls the pure `completeTaskPure(tasks, id, NOW_LABEL, projects)` (§13.1), which returns `{ tasks, result }` with `result: CompletionResult \| null` (null when the guard refuses, §14.1). `CompletionResult = { taskId, journey: { before, after } \| null, project: { name, before, after } \| null }`. `journey` is non-null only when the task belongs to Today's Mission after completion (every task the current user completes today for which `!isHanumanMission(task)`, §11 IA-7). `project` is non-null only when `projectFor(task, projects)` finds a Projects entry, so an event-created task (its `project` is the event title) and an Admission Campaign task (`project: "Admission Campaign"`, which has no Projects entry) get `project: null`. The card shows a gold-100 reward panel with the Setu that changed: the project Setu when `project` is non-null, otherwise the Today's Mission Setu, animating from `before` to `after`. Newly placed stones get a gold edge and settle with a 30 ms stagger, and a gold glow ring fades 0 → .6 → 0. Copy (bold first sentence), by case: project + journey: "**One more stone placed.** The {project.name} Setu moved forward. Today's journey is now {journey.after}%."; journey only: "**One more stone placed.** Today's journey moved from {journey.before}% to {journey.after}%."; project only (`isHanumanMission` with a project): "**One more stone placed.** The {project.name} Setu moved from {project.before}% to {project.after}%."; neither (`isHanumanMission` without a project): "**Mission completed.** Every great mission is completed one step at a time." The Today's Mission Setu on My feed animates too when `journey` is non-null. **Toast only when `celebrationFor` returns null** (review round 3 M1): the store computes `celebration = celebrationFor(task, before, after, celebrated)` right after `completeTaskPure`, and when it is non-null it opens the CelebrationOverlay and calls no `notify()`, because the overlay is a dialog and its headline carries the message. Otherwise the toast reads "Mission completed. Today's journey moved to {journey.after}%." when `journey` is non-null, else "Mission completed." Completion also clears the task's active blocker check-in (F22). Seed example (mock 2): completing "Finalize October JEE batch timetable" moves October Launch 34% → 50% (tasks 1 and 2: (68+0)/2 → (100+0)/2) and Today's journey 43% → 53% (Today's Mission is tasks 1, 4 and 9: (68+0+60)/3 → (100+0+60)/3). The panel stays until the card unmounts (filter or view change) or the task is reopened. Task entry and other inputs are never blocked. | 600 ms | static panel + toast |
| Ram Setu progress change | Newly placed stones settle with a 30 ms stagger | ≤ 400 ms | static |
| My Day: a Top 3 item ticked (round 4) | The row's `MissionArrow` swaps to `TargetHit` with a 120 ms fade. When all three are done, the card shows the inline line "All three arrows found their mark." (`role="status"`). There is no toast and no overlay: My Day is private and its small wins never count as milestones. | 120 ms | icon swap only |
| Dependency unblocked (round 4) | When the upstream task is completed, the downstream card's "Waiting on" line fades out, and in `ChainSetu` the stone that was waiting gets the gold "placed" edge (the same 30 ms settle as the Setu) | ≤ 400 ms | static |
| Mission handed over (round 4) | No animation. The dialog closes, focus returns to the card's title (`h3`, `tabIndex={-1}`), the `HandoverLine` appears, and the toast "Mission handed over to {name}." fires after the dialog has closed | — | — |
| Major milestone celebration (`CelebrationOverlay`) | Triggers are decided by the pure `celebrationFor(task, before, after, celebrated)` in `state/celebration.ts` (§13.1), called right after `completeTaskPure` with a non-null result. It returns `{ keys: string[]; kind } \| null` (review round 3 N5): (a) **`isHanumanMission(task)`** (one predicate, §11 IA-7; `category === "HANUMAN"` alone no longer triggers, review round 3 M2) gives `keys: ["hanuman:{taskId}"]`, kind `"hanuman"`; (b) Today's Mission became finished by this completion (`todayComplete(todaysMission(after)) && !todayComplete(todaysMission(before))`, §11 IA-7) gives `keys: ["today:{TODAY_LABEL}"]`, kind `"today"`. A HANUMAN mission is never in Today's Mission, so (b) fires on its own: from the seed, completing tasks 1, 4 and 9 triggers it on the third completion. If both ever fire on one completion, one overlay shows with the HANUMAN headline and `keys` holds both. The store **adds every returned key** to `celebrated: Set<string>` (in memory, like the rest of the prototype); `celebrationFor` returns `null` when every key that would fire is already in the set. `reopenTask` replaces the set with `onReopen(celebrated, id)`, which deletes `hanuman:{id}`, so a re-completion celebrates again; the `today:` key is never cleared within a session. While the overlay is open no toast is shown (§3.5 Toasts, AC-6.6). Ayodhya Deepotsav overlay: 12 diyas light in sequence, then "Mission completed. Return to Ayodhya." and "जय श्री राम" (small, Tiro, `lang="hi"`). It is a Radix dialog with `aria-labelledby` on the headline. **It never auto-closes** (review M8, WCAG 2.2.1): it closes via "Continue" (focused on open), Escape or a backdrop click, then returns focus to the trigger's card heading. | 1.2 s in | the same dialog, static, no diya sequence |
| "Start mission" / "Take action" button | Arrow icon nudges 2 px on hover | 120 ms | none |
| Hover / press | Background or elevation | 120–200 ms | color only |

Not used anywhere: video, looping backgrounds, particles after the splash, bouncing, parallax, moving clouds, or any transition longer than 400 ms (except the milestone celebration, which fires for major milestones only and is always dismissible). No "Show celebrations" preference is added: brief §19's "optional" is met by the reward being non-blocking and dismissible, and by reduced motion removing the diya sequence.

## 9. Copy changes (sections 18–21)

The rule is to keep narrative words in headings, CTAs and feedback. Approved functional labels stay exactly as they are: Task Owner, Contributors, Task Family, Task Source, Completion Evidence, Task Guidance, MOM Directory, MOM task, Project responsibility, Event task, HANUMAN mission, Department Head, Acknowledgment, Availability, Attendance Today, Archived, Notice Archive, Deactivated.

### 9.1 Missions (section 18)

| Where | Today | Proposed |
|---|---|---|
| Feed hero | "Good morning, Arjun" + ribbon | wordmark JAMBAVAN · H1 "Plan. Act. Complete." · lede "Good morning, {first name}. {activeCount} active missions are on your path today. Every great mission is completed one step at a time." (review round 3 N1: "on your path today" no longer implies "due today", which the tile reports separately; numerals; seed "3 active missions are on your path today."; singular "1 active mission is on your path today."; when `activeCount === 0` and the set is non-empty: "All of today's missions are complete."; when the set is empty: "No missions are on your path today.") · one primary "Create mission" (no secondary hero button) · "Inspired by the wisdom, courage and teamwork of the Ramayana." |
| Feed summary | focus banner "Keep the October Launch moving" (static) | "Today's Mission · Journey progress" with a Setu showing `journeyPct` and "{activeCount} active missions · {completedToday} completed today" (§11 IA-7; singular "1 active mission"). Seed: 43% (tasks 1, 4 and 9), "3 active missions · 0 completed today". HANUMAN missions (`isHanumanMission`) are not part of it; each keeps its own Setu on its card. My Day items never feed it (§11 IA-10) |
| Metric tiles | My open work / Team follow-ups / Completed this week / Needs attention | **3 tiles** next to the Today's Mission card: My open tasks / Needs attention / Team follow-ups (all computed, §11 IA-7). "My open tasks" uses its own selector `myOpenTasks` and **includes** HANUMAN missions, so it can be larger than Today's active count. "Completed" is folded into the Today's Mission card as "{k} completed today" (review M11). Seed: 4 ("2 due today") · 2 ("1 overdue · 2 blocked", with the Sanjeevani glyph before "1 overdue", N9) · 9 |
| Feed list heading | "Work in motion" | "Missions in motion" |
| Primary CTA (feed, department, projects) | "Create task" | "Create mission" |
| Task dialog title / eyebrow | "Create a task" / "Quick capture" | "Create mission" / "New mission"; edit: "Edit mission" / "Manager edit" |
| Title field | "What needs to move forward?" | "Mission title" (placeholder "e.g. Confirm next week's faculty roster") |
| Owner field | "Task owner" select with 5 hard-coded options (You, Neha Kapoor, Ritesh Shah, Sana Iyer, Vikram Nair) | label "Task Owner"; exactly one current-user option labelled "You (Arjun Mehta)" (§12 F4), then the 10 `staffOptions` (a deliberate widening, §12 F15) |
| Owner note field | "What should You do?" | "Mission brief for {owner name}" (for the current user: "Mission brief for you") |
| Due field | "Due date" | "Deadline" |
| Submit | "Create task" / "Save changes" | "Start mission" / "Save changes" |
| Complete button | "Complete task" | "Complete mission" |
| Family picker | select | Radio group of 4 cards (`role="radiogroup"`, `aria-labelledby` "Task Family", `name="taskFamily"`, roving tabindex, arrow keys move and select, Space selects). It writes `category` with today's side effects verbatim (review round 3 M2): Squirrel and Angad clear contributors and keep only the owner's note (`Home.tsx:1216`, the category `onChange`); HANUMAN also sets `longRunning: true` and `kind: "HANUMAN"`. The Task source select and the "Keep as HANUMAN mission" toggle keep today's coupling (`kind = HANUMAN` forces `longRunning`; the toggle sets `kind`, and unticking it sets `longRunning: false, kind: "Task"` while `category` stays). A fresh draft selects **Squirrel** (`Home.tsx:561`). Card copy comes from the family table in `docs/jambavan-standardization.md` (review M3): Squirrel "Small, focused work · one Task Owner"; Angad "Larger deliverable · optional subtasks"; Sugriv "Team responsibility · Owner + Contributors"; HANUMAN "Strategic work over months · updates and milestones". Hint under the group: "Squirrel and Angad have one Task Owner, so switching to them clears Contributors." |
| HANUMAN toggle | "Keep as HANUMAN task" | "Keep as HANUMAN mission (long-running, with updates)" |
| Projects H1 | "Major responsibilities" / "What must not get lost" | "Projects" · "Every project is a Setu. Each completed task moves the Setu forward." Each card adds the caption "From {n} linked task(s)", or "Planned estimate" when no task links to it, and a foot line "{open} open · {done} completed", replacing the static "18 open tasks" (§10, C12) |
| Dashboard band | "{role} lens across JAMBAVAN" | eyebrow "Leadership control room" · H1 "Execution dashboard" · Reflection card "Jambavan's reflection": the lines of the pure `reflectionFor(departments, tasks)` (§13.2, review round 3 M3), each its own sentence, then a `secondary` Button "Review deadline watch" that scrolls to and focuses the Dashboard "Deadline watch" card heading (today `Home.tsx:1181`; the `h3` gets `id="deadline-watch"` and `tabIndex={-1}`; `scrollIntoView({ block: "start" })` then `focus({ preventScroll: true })`, smooth only without reduced motion). Seed lines: "Operations is 31 points behind Marketing." / "2 missions are overdue or blocked across 2 departments." / "A short check-in with each Task Owner may unblock them." "This week" is not used, because the department values are static seed · the existing reward card (`rewardSummary`, streaks and achievements, brief §§7, 11) restyled with the `Diya` icon on a gold-100 Ayodhya tint, titled "Victories this week" (review N8) |
| Guide hero | "JAMBAVAN is a field guide, not a maze." | keep, plus the line "Know your mission. Plan your path. Act with discipline. Complete your Dharma." |
| Grammar | "1 updates", "0 people seen", "2 response s", "1 / 1 parts done" | pluralised: "1 update", "No one has seen this yet" / "Seen by 1 person", "2 responses", "1 of 1 parts done" |
| My Day (round 4) | "My Day" H1 twice, "Private personal planner", "Plan the day you want to complete.", "Today's Top 3" | nav and H1 stay **"My Day"** · eyebrow "Daily Dharma" · lede "A private plan for your day. Choose three priorities, block your time and close the loop." · Top 3 card: H2 **"Today's three arrows"** with the plain sub-label "Top 3 priorities" (on another date: "Three arrows for {d MMM}") · "My schedule" · "Personal actionables" · "Academy tasks in My Day" (sub-line "Private links to tasks you own. The tasks themselves do not change.") · "End-of-day review" (eyebrow "Close the loop"); toasts unchanged ("Your private end-of-day review was saved.", "{title} was added to your private My Day plan. The academy task was not changed.") |
| Blocker check-in (round 4) | "Why is this task not moving?" · "One click helps management fix process bottlenecks instead of blaming people." · "Current blocker: {reason}" | the question stays exactly **"Why is this task not moving?"** (plain, approved by the delta) · help line kept · card line "Not moving: {reason} · {note} · Reported by {displayName}" · field label "Context for management (optional)" · clear action **"It's moving again"** (toast "Check-in cleared. The task is moving again.") · record toast "Check-in recorded. Leadership sees it as a process signal, not a performance mark." (replaces "Thanks — …", no em dash) |
| Blocker panel (Dashboard, round 4) | "Process signals" · "Why are open tasks not moving?" · "{pct}% of delayed tasks with a check-in are {reason lower-case}" · "{n} delayed/open process signals" | eyebrow "Process signals" with the `Sanjeevani` symbol · H2 "Why are open tasks not moving?" · lede "Every stalled mission can be rescued. These reasons show where help is needed; they are not performance labels." · headline "{pct}% of delayed tasks with a check-in are {reasonPhrase(top)}." (D22; seed "40% of delayed tasks with a check-in are waiting for someone.") · footer "{d} open tasks with a delay signal · {c} check-ins" (seed "5 · 5"); zero state §9.2 |
| Dependencies (round 4) | "Depends on · Optional · the upstream task must be completed first" · "Blocked by" · "Downstream impact" · "Campaign delayed because" | field **"Depends on"**, hint "Optional. This task shows as waiting until the chosen task is completed." (D8: completion is not gated, as the delta specifies), plus in edit mode "Tasks that already depend on this one are not listed, so a chain never loops." · card "Waiting on {title} · {status}" / "{n} task(s) wait on this one" · Dashboard panel: eyebrow "Task dependencies", H2 "Where the Setu is waiting", lede "Each stone needs the one before it. JAMBAVAN shows the stone the rest of the bridge is waiting on." · row "Held at {bottleneck.title} · {status} · {displayName(owner)}" with "{n} task(s) waiting: …" (D21; no "Campaign delayed") |
| Task Handover (round 4) | "Handover Task" · "Make this task easy to take over" · "Hand over to" · "Create handover package" · "Ready for {to}" · toast "Handover package created for {to}." | menu item **"Hand over task…"** · dialog title "Hand over this mission" · field **"New Task Owner"** (approved term) · primary **"Hand over mission"** · card "Mission handed over to {name}" · toast **"Mission handed over to {name}."** · audit action string stays "Task handed over", detail "From {previous owner} to {new owner}" · notification stays "Task handover received" / "{title} · Ready for {to}" |

Delete stays "Delete task" and Archive stays "Archive". Destructive and lifecycle actions are never themed.

### 9.2 Empty states (section 20)

| Context | Title | Body | Action |
|---|---|---|---|
| No tasks (feed filter or department empty) | Your journey awaits. | Every great mission begins with one step. | Create mission · Clear filters |
| No projects | The Setu has not yet begun. | Choose your mission and start placing the first stone. | — (project creation is backlog) |
| Completed filter empty | Your victory board is waiting. | Completed missions will gather here. | Show all work |
| No contributors on a Sugriv or HANUMAN task (inside Details) | Every great mission needs a Vanara Sena. | Add contributors to share the work. | Edit task (shown only to the Task Owner or a manager) |
| Person search returns no one (the People group of the ⌘K palette; People itself has no search field) | Every great mission needs a Vanara Sena. | No one matches "{q}". Try another name or department. | Clear search |
| Needs attention = 0 (tile on My feed and Dashboard; `hanuman.sanjeevani` slot, review N8) | No mission needs rescue today. | Nothing is overdue or blocked. | — |
| Archived filter empty | Nothing archived. | Every mission here is still in motion. | Show active tasks |
| MOM Directory filter empty | No MOM recorded for {dept} yet. | Write the first record to begin. | Write new MOM |
| Notifications empty | All quiet. | No new notifications. | — |
| Audit search empty | No entries match "{q}". | Try another name or action. | Clear search |
| No subtasks (inside Details) | Subtasks · none yet | Break the mission into steps, or complete it as one. | the inline "Add a subtask" field |
| No files (inside Details) | Files & links · none yet | — | Add Completion Evidence · Add Task Guidance |
| Notice bin empty | (keep) No expired notices in the bin. | | |
| My Day: no priorities for the date (round 4) | Three arrows, one day. | Choose up to three priorities. Finish them before anything else. | the "Add a priority" field |
| My Day: no time blocks | Your day is unplanned. | Block time for the work that matters most. | the add form |
| My Day: no personal actionables | Nothing to remember yet. | Personal reminders stay private to you. | the add form |
| My Day: no academy tasks linked | No academy tasks in My Day. | Use "Add to My Day" on a task you own. The task itself does not change. | — |
| Blocker panel: no check-ins (round 4) | No mission needs rescue right now. | When a Task Owner says why a task is not moving, the reason shows here. | — |
| Dependency panel: nothing waiting (round 4) | Every stone is in place. | No task is waiting on an unfinished one. | — |
| Calendar month empty | (keep, quiet) No events added | | |

### 9.3 Errors (section 21)

- **Validation** (inline, under the field):
  - Task: "Give your mission a title to start it."
  - MOM: "Add a meeting title." / "Write the MOM before locking it."
  - Event: "Give the event a title."
  - Calendar: "Add a title." / "Add a date."
  - Notice: "Add a title, a message or a file."
  - Feedback: "Add a title." / "Add a question." / "Choose at least one group." / "Add at least two choices."
  - Attachment link: "Enter a full link that starts with http:// or https://"
  - Task handover (round 4): "Choose who takes over this mission." / "Add the last action." / "Add the next action." / (stale recipient, §14.2) "Choose someone from the list."
  - Depends on (round 4, defensive; the UI never offers such an option): "This task cannot depend on that one. It would create a loop." / "That task is no longer available. Choose another or No dependency."
  - My Day (round 4): an empty Top 3, time block or actionable title still writes nothing, as today. The Add button is now `disabled` while its field is empty, the same rule as the inline subtask field (§14.2), so no message is needed. A time block whose end is before its start: "End the block after it starts."
  - Add employee: the existing message, split per field. Duplicate name (§14.2): "A profile for {name} already exists. Restore it from Show removed." when the match is a Removed profile, otherwise "A profile with this name already exists."
- **Permission**: keep the current sentences ("Only Directors and the CEO can edit the access matrix."). Shown as a warning toast on views, or as InlineError when raised inside a dialog (Add employee).
- **Operation failure** (file read, object-URL creation, CSV/PDF export, unexpected exception in an action): "The mission could not be completed. Please try again." For exports: "The report could not be downloaded. Please try again." Shown as InlineError when a dialog is open (attachment, notice media, employee photo), otherwise as a toast (exports run from views).
- **Render crash** (`ErrorBoundary`, restyled): "The mission could not be completed. Please try again." with "Try again" (remount the view) and "Reload JAMBAVAN".

### 9.4 Sacred text (section 16): four placements only

1. Splash: "॥ श्री राम ॥" (Tiro, maroon-700, 20 px).
2. Sidebar footer: "॥ श्री राम ॥" (14 px, 85% opacity).
3. Dashboard Reflection card: "धर्मो रक्षति रक्षितः" with the translation "Dharma protects those who protect it." (`lang="hi"` on the Devanagari). The observation under it is the output of `reflectionFor(departments, tasks)` (§13.2, review round 3 M3), never canned. Seed (mock 3, round 4 seed): "Operations is 31 points behind Marketing. 2 missions are overdue or blocked across 2 departments. A short check-in with each Task Owner may unblock them." My Day is not a placement: it uses no sacred text.
4. Celebration overlay: "जय श्री राम" (small, beneath the headline).

The per-page ribbon "॥ श्री राम ॥" is removed. Sacred text is never a watermark, never repeated as a pattern, and never placed behind data.

## 10. Ram Setu progress (section 10)

### 10.1 What the Setu measures (data-backed; review H3, option A)

Brief §10 makes the Setu the main metaphor: task → stone, completed task → stone placed, project progress → bridge approaching completion. The copy may only claim what the data does, so every Setu value is computed from tasks. All of these functions live in `state/selectors.ts`.

```ts
// Shared rule: a task's contribution is 100 when done, else its own progress (0–100, clamped).
const contribution = (t: Task) => t.status === "done" ? 100 : clamp(t.progress, 0, 100);
const meanPct = (ts: Task[]) => ts.length === 0 ? 0 : Math.round(ts.reduce((s, t) => s + contribution(t), 0) / ts.length);

// state/types.ts: the seed `projects` const (Home.tsx:349–353) is typed for the first time.
// Fields exactly as the seed has them; `tasks` ("18 open tasks") stays in the seed but is no longer rendered (C12).
export type Project = { name: string; label: string; progress: number; due: string; tasks: string; color: string };

// Only names that exist in `projects` have a Setu. Event-plan tasks carry `project: event.title`, which usually has none.
export const projectFor = (t: Task, projects: Project[]) => projects.find(p => p.name === t.project) ?? null;

export type ProjectProgress = { pct: number; source: "tasks" | "estimate"; open: number; done: number; total: number };
export function projectProgress(name: string, tasks: Task[], seed?: Project): ProjectProgress {
  const linked = tasks.filter(t => t.project === name && !t.archived);
  if (linked.length === 0)
    return seed ? { pct: clamp(seed.progress, 0, 100), source: "estimate", open: 0, done: 0, total: 0 }
                : { pct: 0, source: "tasks", open: 0, done: 0, total: 0 };
  const done = linked.filter(t => t.status === "done").length;
  return { pct: meanPct(linked), source: "tasks", open: linked.length - done, done, total: linked.length };
}
```

- **Field names.** Checked against `Home.tsx:349–353`: `name`, `label` ("Admissions + Academic"), `progress` (72/46/81), `due` ("Launches 03 Oct"), `tasks` ("18 open tasks") and `color` ("saffron"/"blue"/"mint"). No seed value changes; `color` is mapped to the new tokens by the card (saffron → saffron-700, blue → blue-700, mint → forest-700).
- **Who passes `seed`.** ProjectsView passes the matching `Project` (so unlinked projects show "Planned estimate"). `completeTaskPure` calls `projectProgress` only after `projectFor` returned a project, so `seed` is always defined there; without a seed and without linked tasks the result is an honest 0.

- **Formula.** It is the progress-weighted mean, not the `done / total` the review suggested. Reason: with the seed, `done / total` gives 0% for all three projects, because no linked task is done. That would erase the 68% of work already logged on the timetable task and show three empty bridges. The mean uses the same rule as Today's Mission (§11 IA-7), so the two Setus agree.
- **It still meets the review's requirement.** Completing a task sets `contribution` to 100, which is ≥ any progress value, so a completion can never lower a project's Setu.
- **Seed result.** October Launch is (68+0)/2 = **34%**, Parent Connect **0%**, Faculty Excellence **24%**. Completing task 1 moves October Launch to **50%** (mock 3, mock 2).
- **Static values.** The seed values 72/46/81 are used only for a project with no linked task, captioned "Planned estimate" (13 px, stone-600). The static "18 open tasks" strings are replaced by `{open} open · {done} completed` (C12).
- **Other changes.** Adding a new 0% task to a project lowers its Setu. That is honest and expected; only completion is guaranteed monotonic. Reopening uses today's rule (`Home.tsx:757`: `status: "progress"`, `progress: min(progress || 40, 80)`, so 80 after a completion), so the Setu steps back slightly. This is today's data behaviour and is not changed.
- **Copy.** "Each completed task moves the Setu forward." The claim "one task = one stone" is dropped: stones are 5% buckets.

### 10.2 Rendering

- `theme/setu.ts` (pure, unit-tested):
  - `setuStones(pct)`, out of 20 stones, agrees with the stage labels at both ends (review round 2, M4): any progress above 0 places at least 1 stone, and the 20th stone is placed only at exactly 100.
    ```ts
    export const setuStones = (pct: number) => {
      const p = Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
      return p === 0 ? 0 : p === 100 ? 20 : Math.min(19, Math.max(1, Math.round(p / 5)));
    };
    ```
    Boundaries: 0 → 0, 1 → 1, 2 → 1, 3 → 1, 97 → 19, 98 → 19, 99 → 19, 100 → 20. Seed values are unchanged: 24 → 5, 31 → 6, 34 → 7, 50 → 10, 69 → 14, 72 → 14.
  - `setuStage(pct)` returns stage 1 for 0–19, with the label "Ready for the first stone" at exactly 0 and "First stones placed" for 1–19. Then 2 for 20–39 "The Setu takes shape", 3 for 40–59 "Halfway across the ocean", 4 for 60–79 "Approaching Lanka", 5 for 80–99 "Reaching the far shore", and `complete` at 100 "Ram Setu complete".
  - Invalid input (NaN, ±Infinity or negative) clamps to 0; values over 100 clamp to 100. Both functions share this clamp, so the stone count and the label can never disagree.
  - `setu.ts` and `RamSetuProgress` are built in **increment 1** (review M4), because increments 3 and 4 already render Setus.
- `components/jambavan/progress/RamSetuProgress.tsx`, `props { value; label; size: "sm"|"md"|"lg"; showStage?; animate? }`:
  - SVG viewBox 320×72: Kishkindha shore with trees on the left, Lanka cliff with spires on the right, water band, and 20 stones on a gentle arch. Placed stones are sandstone with a gold highlight; unplaced stones are dashed stone-500.
  - At 100% a gold deck line joins the shores and the far-shore diya lights.
  - The **numeric % is always visible as text**, so meaning never depends on the image or on colour.
  - Wrapper: `role="img"`, `aria-label="{label}: 72% complete, 14 of 20 Setu stones placed. Approaching Lanka."`.
- `props` also take `from?: number`. When `from < value`, the stones from `setuStones(from)` up to `setuStones(value)` get a gold edge and settle in. The text reads "34% → 50%", and the `aria-label` still reports the final value. CompletionReward uses this.
- Used in: Today's Mission (feed), each project card, the HANUMAN task card (its own `progress`), CompletionReward, Dashboard institute completion, and the Dashboard department pulse (`sm`: the SVG at 40 px tall, without the stage row; the department's % stays as text in the row, so AC-7.2 holds; mock 3).
- Assumption: the brief's "80–100% → completed Ram Setu" is read as "80–99% reaching the far shore; the bridge only shows as joined at exactly 100%". `setuStones` enforces it: at 98–99% one stone is still missing and the `aria-label` reads "19 of 20 Setu stones placed. Reaching the far shore."

### 10.3 Dependencies as Setu stones placed in order (round 4)

Brief §10 says "individual task → stone; completed task → stone placed". A dependency chain is the most literal case: each stone can only be laid once the stone before it is in place. `RamSetuProgress` shows a percentage of 20 stones; `ChainSetu` shows **one stone per task**, in dependency order, and is used only for dependency chains.

Data (pure, `state/dependencies.ts`, §13.2). A task has at most one upstream (`dependsOnTaskId`), so the path from any task back to its root is linear even though a task can have many downstream tasks:
```ts
// Root first, ending with `task`. Stops at a missing upstream; a visited set makes a corrupt cycle terminate.
export function upstreamPath(task: Task, tasks: Task[]): Task[];
// The nearest unfinished upstream task: today's findBlockingDependency (Home.tsx:148–159), moved verbatim.
export function findBlockingDependency(task: Task, tasks: Task[]): Task | undefined;
// The earliest unfinished task on the path before `task`: the stone the rest of the bridge is waiting on.
export const bottleneckOf = (task: Task, tasks: Task[]) => upstreamPath(task, tasks).slice(0, -1).find(t => t.status !== "done") ?? null;
export type Bottleneck = { stone: Task; waiting: Task[] };        // waiting = open, non-archived tasks held by `stone`
export function dependencyBottlenecks(tasks: Task[]): Bottleneck[]; // sorted by waiting.length desc, then stone.title
```
- Seed: path of task 12 = 8 (done) → 9 (Blocked) → 10 → 11 → 12. `findBlockingDependency(12)` = 11 (shown on the card as "Waiting on Make school follow-up calls · Not started"). `bottleneckOf(12)` = 9. `dependencyBottlenecks` = one group: task 9 "Approve admission campaign poster" holding 10, 11 and 12. Today's alert count (3 downstream alerts, `dependencyAlerts`) is unchanged and is shown as "3 tasks waiting".
- Edge cases. A deleted upstream ends the path, and F23 clears `dependsOnTaskId` references to a deleted task, so this does not happen through the UI. An archived, unfinished upstream still holds its chain and is labelled "Archived" (it really is unfinished; archiving does not complete it). A done task with an unfinished upstream shows no waiting line, because only open tasks wait. A cycle cannot be created (§14.3), and `upstreamPath` terminates even on corrupt data.

Rendering (`components/jambavan/progress/ChainSetu.tsx`, `props { path: Task[]; focusId: number; size: "sm" | "md" }`):
- One stone per task on a gentle arch from the Kishkindha shore to a small far-shore cliff (the same shapes as `RamSetuProgress`, so the two read as one family).
- Done → placed sandstone stone with a gold highlight. The bottleneck stone gets a 2 px gold-600 dashed ring ("the stone the bridge waits on"), and a danger-700 outline as well when its status is Blocked. Later unfinished stones are dashed stone-500 ("waiting"). The focused task (the card's own task) has a small maroon pennant above it.
- `sm` (on the card, 24 px tall, max 6 stones; longer paths show "+n" at the root end) and `md` (Dashboard, 48 px, with titles under the stones at ≥ 1024 px and a numbered list below on phones).
- The meaning is always also in text: `role="img"` and `aria-label="{project or team} chain: 1 of 5 stones placed. Held at Approve admission campaign poster (Blocked). This task is stone 5."`; the visible text line beside it says the same in short.
- Completing the bottleneck places its stone with the 30 ms settle (§8); the next unfinished stone becomes the bottleneck.

---

## 11. Information architecture changes (each justified)

The four approved nav groups and their order stay. The changes:

- **IA-1. Restore Projects to Execution** (MOM Directory, Event Planner, Projects), exactly as `docs/jambavan-standardization.md` lists it. Justification: the view exists but is unreachable (A5).
- **IA-2. Make JAMBAVAN Guide reachable** as a sidebar footer link (help), not as a fifth group. It is outside the approved groups, so it is placed where help links go. Justification: A5.
- **IA-3. Give "Notices & feedback" a real view (`notices`)**, holding the notice board, the notice bin and feedback requests as they work today (same handlers). My feed keeps a compact "Latest notices" rail card (2 newest, a "Seen by me" action, and "Open notices & feedback") plus a feedback-pending count. Justification: C1 (the task list starts 1.9 to 3 screens down) and C4 (the nav item points at the feed with no active state). This matches the approved Communication group.
- **IA-4. Stop the "My profile" nav item from opening the edit modal.** The view already has "Edit my profile". Justification: C4.
- **IA-5. Contextual primary actions** (revised for review M9). "Create mission" is the page primary on My feed, Department and Projects. MOM Directory keeps "Write new MOM" as its only page primary, Event Planner keeps "Plan an event", Calendar keeps "Add calendar event", and Notices & feedback keeps "Send notice".
  - A topbar **secondary** button labelled "Create mission" appears only on views whose page primary is not "Create mission" and that are outside People & Control: My Day (round 4; its own adds are personal items, so a quick route to an academy task stays useful), MOM Directory, Event Planner, Yearly Calendar, Notices & feedback, Dashboard and Guide. It is icon-only below 1024 px, with `aria-label="Create mission"`.
  - It never appears on My feed, Department or Projects (where it would duplicate the page primary), or on People, My profile, Access matrix and Audit log (where it makes no sense, C8).
  - The ⌘K palette has a "Create mission" command, so capture stays one shortcut away on every view.
  - Justification: C8.
- **IA-6. Remove or wire up the dead controls (C3):**
  - Search opens a ⌘K/Ctrl+K command palette (`ui/command`, cmdk already installed). It searches task titles (archived ones included, each with an "Archived" badge), people and MOM titles, and offers the "Create mission" command.
    - Choosing a task (review M15): switch to My feed, then set `departmentFilter = "All departments"`, `statusFilter = "All work"`, `categoryFilter = "All categories"`, `projectFilter = null`, and `archiveFilter = task.archived ? "Archived tasks" : "Active tasks"`. Then, after the palette closes, scroll to `#task-{id}` and focus its `h3` (`tabIndex={-1}`). The card is therefore always rendered.
    - Choosing a person opens People and scrolls to and focuses that person's row heading. The People view has no search field today and none is added. People results **exclude Removed profiles** unless People's "Show removed" toggle is on (the palette reads the same `showRemoved` state), so a removed person is never surfaced by search alone. When the toggle is on, Removed people are listed with a "Removed" badge, and choosing one keeps the toggle on.
    - Choosing a MOM opens MOM Directory with that department filtered.
    - **My Day content is never a search source** (round 4; `DEVELOPER_HANDOFF.md` point 9: My Day must not appear in searches). The palette indexes tasks, people and MOMs only, and `CommandSearch` does not import `state/myDay.ts` (enforced by the import-boundary test, §15). The palette may offer a "Go to My Day" navigation command, which reveals nothing.
  - "Open project" becomes "View tasks": My feed with a new `projectFilter` chip (tasks already carry `project`).
  - The focus-banner arrow is removed (its banner is replaced).
  - Removed: "New project" (no project data model; backlog), "Workspace settings" (no settings view; backlog), the workspace switcher chevron (one institute; it stays as a static label), and Dashboard "This week" (it becomes static text "This week").
- **IA-7. Computed metrics (C2; formulas fixed for review H1 and M11).** All are pure selectors in `state/selectors.ts`. "Active" means `!t.archived`. `TODAY_LABEL = "05 Oct 2026"` and `NOW_LABEL = "05 Oct 2026, 3:15 PM"` move into `state/clock.ts`, replacing the literals in `completeTask` and `reopenTask`, so the seed clock has one source.
  ```ts
  // A HANUMAN mission is long-running work. This matches today's UI, which keys the journal and the "year-long" pill on longRunning.
  // The ONE predicate (review round 3, M2): Today's Mission, the celebration trigger, the TaskCard HANUMAN variant and the copy
  // variants all use it. FamilyBadge keeps showing `category` and sourceLabel keeps using `kind`; both are display-only.
  export const isHanumanMission = (t: Task) => t.longRunning === true;
  // Today's Mission = the current user's active tasks that are not HANUMAN missions and are open, OR were completed today.
  // A mission due in 2027 does not belong on today's path (review round 2, M1).
  export const todaysMission = (tasks: Task[]) => tasks.filter(t => !t.archived && isCurrentUser(t.assignee) && !isHanumanMission(t) &&
    (t.status !== "done" || (t.completedAt ?? "").startsWith(TODAY_LABEL)));
  export const journeyPct     = (tm: Task[]) => meanPct(tm);                         // §10.1 rule; seed tasks 1, 4, 9: (68+0+60)/3 = 43
  export const activeCount    = (tm: Task[]) => tm.filter(t => t.status !== "done").length;   // seed 3
  export const completedToday = (tm: Task[]) => tm.length - activeCount(tm);                  // seed 0
  export const todayComplete  = (tm: Task[]) => tm.length > 0 && activeCount(tm) === 0;       // celebration trigger (§8)
  // The "My open tasks" tile counts all of the current user's open work, HANUMAN missions included.
  export const myOpenTasks    = (tasks: Task[]) => tasks.filter(t => !t.archived && isCurrentUser(t.assignee) && t.status !== "done");  // seed 1, 4, 7, 9 → 4
  ```
  - **Invariant:** completing a task never lowers `journeyPct`. The task stays in the set (its `completedAt` starts with `TODAY_LABEL`) and its contribution rises to 100. Seed: completing task 1 gives (100+0+60)/3 = **53**, "2 active missions · 1 completed today"; then task 4 gives 87; then task 9 gives 100 and fires the "today" celebration (AC-6.5). Completing task 7 changes neither number (it is not in the set). Unit-tested. A handover is not a completion: handing one of the user's tasks to someone else removes it from the set, so `journeyPct` may go up or down (AC-22.4 states it).
  - The edge case the review found (M2) is covered: a `category: "HANUMAN"` task without `longRunning` (an Event Planner task row with family HANUMAN, `Home.tsx:955`, or a dialog task whose "Keep as HANUMAN mission" toggle was unticked) **is** in `todaysMission`, never triggers the `hanuman` celebration, gets a non-null `journey`, and renders the standard card body with the HANUMAN FamilyBadge.
  - The lede, the card and the toast use the same numbers, written as numerals.
  - **My open tasks** = `myOpenTasks(tasks).length` (seed 4); subline "{n} due today" (`due === "Today"` among them, seed 2: tasks 1 and 9).
  - **Needs attention** = the unique count of active, not-done tasks where `due.startsWith("Overdue") || status === "blocked"` (seed 2: "Resolve projector issue" is both, "Approve admission campaign poster" is Blocked). The subline counts are independent and may overlap: "{x} overdue · {y} blocked" (seed "1 overdue · 2 blocked"). A blocker check-in alone does **not** count: it is a reason, not a status, and it has its own panel (IA-11). When the count is > 0 the Sanjeevani glyph sits before the overdue count (N9); at 0 the tile shows the Sanjeevani empty state (§9.2).
  - **Team follow-ups** = active, not-done tasks with `assistants.length > 0 || isTeamTask` (seed 9: tasks 1, 2, 3, 4, 6, 7, 9, 10 and 11). Subline "Open tasks with contributors".
  - **Completed** is not a separate tile. It is folded into Today's Mission as "{completedToday} completed today". The mock and spec now agree on 1 card + 3 tiles.
  - Nav badge (My feed) = unread deadline reminders, `unreadReminders.length` (seed **6**: tasks 1, 2 and 9 "Today", 3 and 10 "Tomorrow", 6 "Overdue"). Bell count = unread reminders + unread app notifications (seed 6 + 1 = **7**), the same sum today's dot uses (§3.5 Topbar).
  - **Jambavan's reflection** = `reflectionFor(departments, tasks)` (§13.2, M3).
  - Institute completion = rounded mean of department `done` (69 from today's seed, now derived).
  - Project Setus: `projectProgress` (§10.1).
  - "+18% vs last week" is removed (no data source). Department seed percentages stay (seed data, not computed).
- **IA-8. Delete the unused `meetings` ViewKey** and its title strings (C11).
- **IA-9. Sorting (brief §26; review N14).** The app has no sort controls today, and none are added. Lists keep their current order: insertion order, with new items prepended, so newest first. The redesign does not reorder any list.
- **IA-10. My Day stays in Workspace, second (round 4).** The updated app already places it there (My feed, My Day, Department, Dashboard, `Home.tsx:1078`). No nav group is added. It is the user's personal view of the day, which is what Workspace holds. `docs/jambavan-standardization.md` lists Workspace as "My Feed, Department, Dashboard" and does not yet name My Day, so increment 6 adds "My Day" to that line (a documentation update that follows the shipped feature, not a new IA decision).
  - **One clock.** `state/clock.ts` gains `TODAY_ISO = "2026-10-05"` and `TODAY_LONG = "Monday, 5 October 2026"` next to `TODAY_LABEL` and `NOW_LABEL`, plus `todayIso()`, which returns `TODAY_ISO` in the prototype. My Day's default date, its "Today" button, the page-heading eyebrow (today a literal "Tuesday, 29 September 2026", `Home.tsx:1120`) and the handover `createdAt` (today "06 Oct 2026, 3:45 PM") all read from it (F21, D18). When persistence arrives, `todayIso()` becomes the user's **local** date (`toLocaleDateString("en-CA")`), never `toISOString()`, which is UTC and one day behind in India before 05:30. This is the only line that changes.
  - **Privacy is a module boundary.** My Day state (`personalPlans`, `myDayDate` and the drafts) lives in its own `MyDayProvider` and `state/myDay.ts`. Only `MyDayView` and the TaskCard's "Add to My Day" control read it. Selectors, exports, the audit log, notifications, ⌘K, the Dashboard and Today's Mission never import it (`DEVELOPER_HANDOFF.md` point 9). No My Day handler calls `logActivity` or `pushNotification`, as today. Enforced by the import-boundary test (§15) and AC-19.4.
  - **Today's Mission and My Day stay separate.** Today's Mission (My feed) measures academy tasks. My Day is a private plan. Ticking a Top 3 item never moves a Setu, and linking a task to My Day never changes the task (as today).
- **IA-11. The leadership panels live on the Dashboard, after the Deadline watch / Needs attention row (round 4).** These are "Why are open tasks not moving?" (blocker check-ins, Sanjeevani) and "Task dependencies" (`ChainSetu`), as today, side by side at ≥ 1024 px and stacked below. They stay where the delta put them, because the Dashboard is the "Leadership control room" and the panels are leadership signals. The Reflection's "Review deadline watch" button goes to the Deadline watch card heading, which sits directly above them.
  - My feed gets no extra panel. Its cards carry the per-task signals (Not moving, Waiting on, wait-on-this count).
  - Department shows the same TaskCard, so the same signals.
  - The leadership PDF export keeps the blocker totals it has today (`exportLeadershipAnalytics`, `Home.tsx:676`).
- **IA-12. Entry points for the new task actions (round 4).**
  - "Why is this task not moving?" is on every open card (§3.5).
  - "Hand over task…" is in the card More menu (§3.5).
  - "Add to My Day" is in the action row for tasks the current user owns.
  - "Depends on" is a field in the task dialog, create and edit (§9.1).
  - None of these gets a nav item, a topbar button or a ⌘K command, except "Go to My Day" (IA-6).

## 12. Bug fixes (behaviour changes)

The refactor itself (§13) keeps behaviour identical. These fixes are deliberate behaviour changes, listed so the review can accept or reject each one.

Version control (review N1): `jambavan-app/` is not a git repository today (`git status` → "not a git repository"; only a `.gitignore` exists). Increment 0 therefore starts with `git init` and one baseline commit of the untouched copy. `.env` stays excluded by the existing `.gitignore`; this is checked before the first `git add`. Nothing is pushed anywhere. Each fix below then lands as its own local commit, which gives increment 0 a real diff baseline.

| Fix | Change | Owner layer |
|---|---|---|
| F1 (A1) | Edit merges instead of replacing, field by field (§12.1). | pure `mergeTaskEdit(existing, draft, ctx)` in `state/taskEdit.ts`, called by store action `saveTask` |
| F2 (A2) | Every close path (X, Cancel, backdrop, Escape, after save or delete) calls `closeTaskDialog()`, which resets `editingTaskId` and the draft. "Create mission" always opens a fresh draft. | store |
| F3 (A3) | Dialog scroll body and sticky footer | `primitives/Dialog` |
| F4 (A4) | One current-user identity with two stored aliases (§12.2). | `state/identity.ts` |
| F5 (A6) | Remove the redundant "Edit plan" button. "Reuse plan" and "Use template" remain and keep today's copy behaviour. Real in-place editing is backlog: it needs a decision about tasks already created from the plan. | EventPlannerView |
| F6 (A7) | Confirmed deletes for tasks; no hard delete for people (§12.3). | views + store guards |
| F7 (A9) | StatusBadge rendered on every TaskCard | TaskCard |
| F8 (B3) | Remove `maximum-scale=1`; theme-color → #7A1E2C | `client/index.html` |
| F9 (B11) | Add the missing `key` in the Role matrix rows | RoleMatrixView |
| F10 (C9) | Inline validation per §9.3 and §13.2 | Field + validators |
| F11 (C5) | Replace `peoplePhotos` with PersonAvatar plus the manifest; remove the `/manus-storage` CSS backgrounds | art |
| F12 (C12, C2) | Project Setus, Today's Mission and the metric tiles are computed from tasks (§10.1, §11 IA-7); the seed clock literals move to `state/clock.ts` | `state/selectors.ts`, `state/clock.ts` |
| F13 (round 2 M3) | Event-plan tasks are labelled **"Event task"** instead of "Project responsibility". A pure `sourceLabel(task)` derives the approved Task Source label (code below). Display-only: the data model is unchanged, `createEventPlan` still writes `kind: "Responsibility"`, and the Task source select in the dialog keeps its 4 options. | `state/selectors.ts` |
| F14 (round 2 N11) | A refused `completeTask` (not the Task Owner, already done, or not found) writes **no** "Task completed" log entry and shows no toast. Today it logs and toasts even when the guard leaves the task unchanged (`Home.tsx:678–683`). Lands in increment 3, after the increment 0 equivalence gate. | `state/tasks.ts` `completeTaskPure` returns `result: null`; the store skips `logActivity` and `notify` |
| F15 (round 2 N3) | The Task Owner select widens from today's 5 hard-coded options to "You (Arjun Mehta)" plus the 10 `staffOptions`, the same list the Contributors picker already uses. Reason: today a task cannot be assigned to Priya Nair, Karan Joshi, Aditi Rao, Manav Shah, Rhea Sen or Omkar Patil, although they can be contributors. | `state/identity.ts` `ownerOptions` |
| F16 (D7, round 4) | Seed families are kept. `initialTasksWithCategories` becomes `{ ...task, category: task.category ?? categoryByTaskId[task.id] ?? "Squirrel" }`, so tasks 8 and 12 are Angad and 9–11 Sugriv, as their seed says. Seed family counts become Squirrel 2 · Angad 4 · Sugriv 5 · HANUMAN 1 (12 tasks). This is a seed-data correction, the only one in this list. | `state/seed.ts` |
| F17 (D1–D4, D24, round 4) | **Task Handover passes the mission correctly.** `handoverTaskPure` (§13.2) does the following: (a) Recipients are `handoverRecipients(task) = staffOptions.filter(p => p !== task.assignee)`, the same list as today, so the current user is never a recipient (taking a task yourself is an Edit). (b) The default recipient is the first unfinished contributor **who is in that list**, else `""`. Validation requires `to ∈ handoverRecipients(task)`, so "You" can never be submitted (D1). (c) The package's `from` is the **previous Task Owner** (`task.assignee`), and a new `createdBy` field holds `CURRENT_USER.name`, so "From Neha Kapoor to Manav Shah · created by Arjun Mehta (you)" is truthful (D2). (d) `createdAt` uses `NOW_LABEL` (F21). (e) The recipient is removed from `assistants` (their part state goes with them) and their responsibility note is kept under `assignmentNotes[to]`, so the owner is never also a contributor (D4). The previous owner is not added as a contributor. (f) The seed package on task 2 is corrected to match live behaviour: `from: "Aditi Rao", to: "Neha Kapoor", createdBy: "Aditi Rao"` (Aditi is on leave until 08 Oct, so the story holds), and the owner stays Neha (D3). (g) "Hand over task…" shows when `canHandOver(task) = isCurrentUser(task.assignee) \|\| canEditOrReassign` (the access-matrix permission "Edit or reassign tasks"; true for the seed Department Head, so nothing disappears in the prototype). This is cosmetic until the server enforces it (§14.3). The audit string ("Task handed over"), the notification and the single `handover` field stay; history lives in the audit log, and a stored list of handovers is backlog (§17). | `state/handover.ts`; store `createHandover` |
| F18 (D8, D21, round 4) | **Dependency copy says what the app does.** The hint becomes "Optional. This task shows as waiting until the chosen task is completed." Completion is **not** gated, as the delta specifies ("keeps the existing … completion rules unchanged"). The card says "Waiting on …" instead of "Blocked by …". The Dashboard rows group by `bottleneckOf` and say "Held at …" instead of "Campaign delayed because …" (§10.3). Display-only: `dependsOnTaskId`, cycle prevention and `findBlockingDependency` are unchanged. | `state/dependencies.ts`, TaskCard, DashboardView |
| F19 (D5, round 4) | **My Day time blocks are edited in place.** "Edit" sets `editingBlockId` and fills the form. "Save block" replaces the block (same id), and "Cancel" clears the form without touching the list. Changing the date while editing cancels the edit. The block is never removed before the user saves. | `state/myDay.ts` `saveScheduleBlock` |
| F20 (D6, round 4) | **The end-of-day review can be cleared.** `reviewDraft` is loaded from the saved plan whenever the date changes or the view mounts, and each textarea shows the draft only (no `draft \|\| saved` fallback). Saving an empty field stores `""`. | `MyDayView`, `state/myDay.ts` `saveReview` |
| F21 (D18, round 4) | **One clock** (§11 IA-10): `TODAY_ISO`, `TODAY_LONG`, `todayIso()` in `state/clock.ts`. The page-heading date, My Day's default date and "Today" button, and the handover `createdAt` read from it. The literal "Tuesday, 29 September 2026" becomes `TODAY_LONG`. | `state/clock.ts` |
| F22 (D9, D15, round 4) | **A blocker check-in can be cleared and is cleared on completion.** "It's moving again" calls `clearBlockerPure` (`blocker: undefined`, audit "Task blocker cleared"). `completeTaskPure` also clears `blocker` (the reason no longer applies once the work is done; the audit log keeps "Task blocker reported"), so reopening never brings back a stale reason. Reason buttons get `aria-pressed`, and the recorded one gets a check icon. `reportedBy` = `CURRENT_USER.name` (today the same literal). | `state/blockers.ts`, `state/tasks.ts` |
| F23 (round 4) | **Deleting a task clears the links to it.** `deleteTask` also sets `dependsOnTaskId: undefined` on every task that pointed at it, so no task depends on a ghost. The delete AlertDialog says so when it applies: "Delete this task? This cannot be undone. {n} task(s) that wait on it will stop waiting. Archive keeps it for reference." Archive leaves links in place (§10.3). | `state/dependencies.ts` `clearDependentsOf`; §12.3 |
| F24 (D20, round 4) | **A linked task you no longer own is marked in My Day.** The row shows "Handed over to {name}. It stays here until you remove it." My Day is never changed by someone else's action, so the link is not removed automatically. Display-only. | `MyDayView` |

```ts
// F13: Task Source label (state/selectors.ts), unit-tested for all five outputs.
export const sourceLabel = (t: Task) =>
  t.kind === "MOM action" ? "MOM task"
  : t.kind === "HANUMAN" ? "HANUMAN mission"
  : t.kind === "Responsibility" ? ((t.source ?? "").startsWith("Event plan · ") ? "Event task" : "Project responsibility")
  : "Manual task";
```

### 12.1 F1: field-by-field edit merge (review M1)

Today (`Home.tsx:780–819`) the edit builds a fresh task from the draft and spreads it over the existing one (line 806), keeping only `id`, `status`, `completedBy` and `completedAt`, plus whatever the draft does not contain (`blocker`, `handover`). The pure function below replaces that spread. Creation is unchanged (`buildTaskFromDraft`, today's rules). The function receives everything it reads (review round 3 N2):
```ts
export function mergeTaskEdit(existing: Task, draft: TaskDraft,
  ctx: { departmentOf: (name: string) => string | undefined; nextId: () => number }): Task;
// store: mergeTaskEdit(t, draft, { departmentOf: name => profiles.find(p => p.name === name)?.department,
//                                  nextId: () => Date.now() + Math.random() })   // today's id style
// tests: fixed stubs, e.g. { departmentOf: n => ({ "Neha Kapoor": "Admissions" })[n], nextId: (() => { let i = 900; return () => ++i; })() }
```

| Field | On edit |
|---|---|
| `title`, `assignee`, `department`, `due`, `priority`, `kind`, `category`, `longRunning`, `isTeamTask`, `source` | from the draft (title trimmed; `source: draft.source \|\| undefined`, as today). **`isTeamTask` changes only the Team task pill on edit; `team` and `visibility` never change through edit** (review round 3 N3). Today's edit recomputes both from the toggle (`Home.tsx:787` and `792`), which is part of A1. In edit mode the toggle shows the hint "Visibility is set when the mission is created." |
| `dependsOnTaskId` (round 4) | from the draft, after `validateTaskDraft` has checked that the id exists, is not archived, is not the task itself and does not loop (`wouldCycle`, §13.2). `undefined` ("No dependency") removes the link |
| `blocker`, `handover` (round 4) | **kept from existing**. The dialog never edits them; the check-in and the handover have their own actions |
| `initials` | `draft.assignee === existing.assignee ? existing.initials : initials(draft.assignee)`. An unchanged owner keeps the stored initials, so seed task 4 stays "YO" (`initials("You")` would give "Y") |
| `visibility`, `project`, `team`, `progress`, `status`, `attachments`, `seenBy`, `acknowledgedBy`, `completedBy`, `completedAt`, `reopenedAt`, `archived`, `archivedAt`, `archivedBy` | **kept from existing**. A Private task stays Private; today it silently becomes Leadership-visible |
| `updates` | kept. If `longRunning` turns on and `existing.updates` is undefined → `[]`. If it turns off → kept (the journal is hidden, not deleted, and reappears if the toggle returns) |
| `assistants` | for each draft name in order: an existing entry with the same name keeps `completed`, `department` and `initials`; its `note` = `draft.assignmentNotes[name] ?? existing.note ?? ""`. New names → `{ name, initials: initials(name), department: ctx.departmentOf(name) ?? draft.department, completed: false, note }`. Names no longer in the draft are dropped, along with their part state. Changing the family to Squirrel or Angad clears the draft's contributors (today's side effect), so saving drops them; the dialog hint warns about this (§9.1) |
| `assignmentNotes` | `{ ...existing.assignmentNotes, ...draftNotes }` restricted to the owner and current contributors |
| `subtasks` | the draft titles in order. Each title takes the **first not-yet-matched** existing subtask with the identical trimmed title and keeps its `id`, `done` and `addedBy`, so duplicate titles match one-to-one in order. New titles → `{ id: ctx.nextId(), title, done: false, addedBy: "You" }`. Unmatched existing subtasks are dropped |

Tests (`taskEdit.test.ts`): saving the HANUMAN task (7) and "Approve parent orientation deck" (4) unchanged is a deep-equal no-op except for the log, including task 4's initials "YO"; "Approve parent orientation deck" stays `Private`; contributor departments survive (on the HANUMAN task, Neha Kapoor stays Admissions and Ritesh Shah stays Operations, and his part stays done); duplicate subtask titles keep their own `done`; toggling `longRunning` off and on keeps the journal; toggling `isTeamTask` on task 4 keeps `team: "Leadership"` and `visibility: "Private"`; saving task 10 unchanged keeps `dependsOnTaskId: 9`; saving task 2 unchanged keeps its `blocker` and `handover`.

### 12.2 F4: identity (review M2)

- `CURRENT_USER = { name: "Arjun Mehta", alias: "You" }` and `isCurrentUser(name) = name === "You" || name === "Arjun Mehta"`. Every read goes through it: owner completion, Today's Mission, "(you)" display, `pendingAcknowledgementCount`, seen and ack state.
- **Every write keeps its current literal, per call site.** No call site changes which name it writes, and no data is migrated. For example: `completedBy`, `seenBy`, `acknowledgedBy`, notice replies, feedback responses and dialog-created subtasks write `"You"`; `addTaskSubtask` (inline subtask), `addTaskUpdate` (journal), `logActivity`'s default actor and `archivedBy` write `"Arjun Mehta"`. Reads treat both the same through `isCurrentUser`.
- **Owner select**: exactly one current-user option, labelled "You (Arjun Mehta)". Its `value` follows the draft, not the dialog mode: `value = isCurrentUser(draft.assignee) ? draft.assignee : "You"`. This covers editing task 1 (`"Arjun Mehta"`), editing task 4 (`"You"`), a fresh draft (`"You"`) and assign-from-MOM, which pre-fills `assignee: mom.taskAssignee` and can be `"Arjun Mehta"` (seed MOM). So the select always has a matching option, and saving an untouched select writes back exactly the stored value. The other options are the 10 `staffOptions` (F15), which never contain "Arjun Mehta", so no person appears twice.
- **Display**: `displayName(name)` returns "Arjun Mehta (you)" for either alias, else the name. It is used in owner rows, "Completed by", contributor chips, subtask authors and journal authors.
- Tests: `isCurrentUser` for both aliases and a stranger; the owner options list has no duplicate person when the stored owner is "Arjun Mehta"; `pendingAcknowledgementCount` counts a task acknowledged by "You" and one acknowledged by "Arjun Mehta" identically.

### 12.3 F6: destructive and lifecycle actions (review M12)

- **Delete task** opens an AlertDialog: "Delete this task? This cannot be undone. Archive keeps it for reference." When `downstreamOf(id, tasks)` is non-empty, the body adds "{n} task(s) that wait on it will stop waiting." (F23). Actions: Archive / Delete task (danger) / Cancel. The audit string stays "Task deleted".
  - The Archive action calls a new non-toggling store action `setArchived(id, true)`, never the toggling `archiveTask` (`Home.tsx:820–826`), so it cannot restore an already-archived task. It is **hidden when `task.archived`** (deleting from the "Archived tasks" filter then offers only Delete task and Cancel, with the body "Delete this archived task? This cannot be undone."). `setArchived(id, true)` writes the same fields, audit string ("Task archived") and message as `archiveTask` does when archiving; the card's More menu keeps calling `archiveTask` (Archive/Restore toggle, unchanged).
  - Both Archive and Delete task close the AlertDialog **and** the TaskDialog through `closeTaskDialog()` (F2), so the edit draft and `editingTaskId` are reset. Cancel closes only the AlertDialog and returns focus to the Delete button.
- **People lifecycle: no hard delete.** `docs/jambavan-standardization.md` says to use Deactivated and to avoid permanently deleting records.
  - `EmployeeProfile.access` widens from `"Active" | "Suspended"` to `"Active" | "Suspended" | "Removed"`. This is the only data-model change in the proposal. The stored value `"Suspended"` is kept, and the UI labels it "Deactivated".
  - "Suspend" / "Reinstate" become **Deactivate / Reactivate**. Audit strings: "Employee deactivated" / "Employee reactivated".
  - "Remove" becomes **Remove profile**, a soft removal behind an AlertDialog: "Remove {name}'s profile? They lose institute access and are hidden from People. The record is kept, and you can restore it from Show removed." It sets `access: "Removed"`. Audit: "Employee removed", detail "Profile hidden; record retained".
  - People hides Removed profiles by default. A "Show removed" toggle lists them with a "Restore profile" action, which sets `access: "Active"` and logs "Employee restored".
  - `sensitiveAuditActions` adds "Employee deactivated", "Employee reactivated" and "Employee restored". It keeps "Employee suspended", "Employee reinstated", "Employee removed" and "Person removed", so seed and historical entries still classify.
  - AC-13.1 expects the new strings.
- **Self-protection guard**: the current user's own row shows none of these actions, and `toggleEmployeeSuspension` and `removeEmployee` refuse `isCurrentUser(name)` with the warning "You cannot deactivate or remove your own profile."
- **Consumers of the new `Removed` state** (review round 2, M6). Each one is decided here, so nothing changes by accident:
  - **Attendance export.** `attendanceReportRows` (the "Employee Attendance Summary" CSV and PDF, `Home.tsx:671`) uses `reportableProfiles(profiles) = profiles.filter(p => p.access !== "Removed")`. Removed people leave the report, as they do today when the row is deleted. Deactivated (`"Suspended"`) people stay in it, as today.
  - **People list.** Hidden by default; "Show removed" lists them (above).
  - **⌘K people results.** Excluded unless "Show removed" is on (§11 IA-6).
  - **Department and dashboard headcounts.** Unaffected: they come from the static `departments` seed, not from `profiles`.
  - **Handover recipients** (round 4) come from the static `staffOptions`, like the other pickers, so a Removed or Deactivated person can still be chosen in the prototype. Deriving pickers from active profiles is already backlog (§17), and it would fix both lists at once.
  - **My profile** (`Home.tsx:881`) reads only the current user's record, which can never be Removed (self-protection guard). A grep of `Home.tsx` finds no other reader of `profiles` (lines 502 (state), 671, 881, 904 and 1198 are all of them; the new code adds no reader).
  - **Add employee duplicates.** `validateEmployee(draft, profiles)` rejects a name that matches an existing profile after trimming, case-insensitively, **including Removed ones**. For a Removed match the message is "A profile for {name} already exists. Restore it from Show removed."; otherwise "A profile with this name already exists." The check also blocks re-adding "Arjun Mehta". This keeps names unique, so `key={profile.name}` (AC-11.1) and the name-keyed handlers (`toggleEmployeeSuspension`, `removeEmployee`, restore) always touch exactly one record. Today the app has no such check; the guard is new behaviour, but it only refuses input that would corrupt state.
- Pickers (`staffOptions`) stay the static list they are today. Deriving them from active profiles is backlog.
- **Where the rules live (testable without a renderer).** `state/people.ts` holds `applyAccessAction`, `reportableProfiles` and the duplicate check used by `validateEmployee` (§13.1). The store handlers keep their names and only call them.

---

## 13. Home.tsx refactor plan (identical behaviour)

### 13.1 Target structure

```
client/src/theme/
  tokens.css          --jb-* colour/type/space/radius/shadow/motion variables + Tailwind 4 @theme
  legacy-aliases.css  temporary: legacy --ink/--saffron/--mint/--coral/--parchment → --jb-* (increment 1 → deleted in increment 6)
  base.css            reset, body, :focus-visible, reduced-motion kill switch, .sr-only, selection
  fonts.ts            @fontsource subset imports (Mukta 400-700 latin+devanagari, Cormorant 600/700 latin, Tiro 400 devanagari)
  environments.ts     EnvironmentId, environmentByView, intensity, scrim
  assets.ts           artSlots, environmentArt, avatarOverrides (§6.2)
  setu.ts             setuStones, setuStage (pure)
  motion.ts           durations, easing, useReducedMotion
  contrast.ts         WCAG ratio helper + approved pair list (used by tests)
client/src/components/jambavan/
  state/
    types.ts          Task, Notice, MOM, EventPlan, … (moved verbatim from Home.tsx), plus BlockerReason, TaskHandover (+ createdBy, F17),
                      PersonalPlan, PersonalScheduleStatus (round 4)
    seed.ts           initialTasks, noticeSeed, … (moved verbatim; F16 category fix and the F17 task 2 package fix land in increment 3)
    identity.ts       CURRENT_USER, isCurrentUser, displayName, ownerOptions (F4)
    clock.ts          TODAY_LABEL, NOW_LABEL, TODAY_ISO, TODAY_LONG, todayIso() (the seed clock, replacing literals; F21)
    selectors.ts      visibleTasks, deadlineReminders, rewardSummary, plannerTasks, acknowledgementSummary,
                      todaysMission, journeyPct, activeCount, completedToday, todayComplete, needsAttention,
                      teamFollowUps, projectProgress, meanPct, isHanumanMission, reflectionFor, sourceLabel (pure)
    dependencies.ts   findBlockingDependency (moved verbatim), downstreamOf, dependencyAlerts, upstreamPath, bottleneckOf,
                      dependencyBottlenecks, wouldCycle, clearDependentsOf (pure; round 4)
    blockers.ts       blockerReasons, reasonPhrase, reportBlockerPure, clearBlockerPure, blockerAnalytics (pure; round 4)
    handover.ts       handoverRecipients, defaultHandoverDraft, validateHandover, handoverTaskPure, canHandOver (pure; round 4)
    myDay.ts          planFor, addTop3, toggleTop3, saveScheduleBlock, deleteScheduleBlock, setBlockStatus, addActionable,
                      toggleActionable, deleteActionable, linkTask, unlinkTask, saveReview (pure; round 4; imported ONLY by
                      MyDayProvider, MyDayView and the TaskCard My Day control, §11 IA-10)
    taskEdit.ts       mergeTaskEdit (F1), buildTaskFromDraft
    tasks.ts          completeTaskPure (F14, CompletionResult), setArchivedPure (§12.3) (pure)
    people.ts         applyAccessAction, reportableProfiles, findDuplicateProfile (F6, M6) (pure)
    celebration.ts    celebrationFor, onReopen (§8 dedupe) (pure)
    validation.ts     validateTaskDraft, validateMomDraft, validateEventDraft, validateCalendarDraft, validateNoticeDraft, validateFeedbackDraft, validateLink, validateEmployee(draft, profiles)
    exports.ts        downloadCsv, downloadPdf, report row builders (moved verbatim in increment 0; the try/catch and the export error toast are added in increment 5)
    useJambavanStore.ts   all useState + handlers from Home.tsx, same names, same semantics; handlers delegate to the pure modules above
    JambavanProvider.tsx  context provider + useJambavan()
    MyDayProvider.tsx     round 4: personalPlans, myDayDate, top3Draft, scheduleDraft, editingBlockId (new, F19), actionableDraft,
                          reviewDraft + the My Day handlers; useMyDay(). Kept out of the main store so no other view can read it
  primitives/   Button, IconButton, Field, Input, Select, Textarea, Checkbox, ToggleButton, Badge (Family/Source/Status/Priority), Card, Dialog, ConfirmDialog, EmptyState, InlineError
  icons/        Ramayana symbol icons (§7)
  art/          SceneBackdrop, EnvironmentArt, ArtSlot, PersonAvatar, Ornament, environments/{id}.tsx
  layout/       AppShell, Sidebar, MobileNav, Topbar, PageHeader, NotificationsPopover, CommandSearch
  task/         TaskCard, TaskDetails, HanumanJournal, TaskDialog, AttachmentDialog, CompletionReward,
                BlockerLine, BlockerCheckIn, DependencyLine, HandoverLine, HandoverDialog (round 4)
  myday/        MyDayView parts: ArrowsCard, ScheduleCard, ActionablesCard, LinkedTasksCard, DayReviewCard, PrivacyNote (round 4)
  progress/     RamSetuProgress, ChainSetu (round 4), CelebrationOverlay
  loading/      BrandedSplash, ViewSkeleton
  views/        FeedView, MyDayView (round 4), DepartmentView, MomDirectoryView, DashboardView (+ BlockerPanel, DependencyPanel), CalendarView, EventPlannerView, GuideView, ProjectsView, NoticesView, PeopleView, MyProfileView, RoleMatrixView, AuditLogView
  modals/       MomDialog, EventDialog, CalendarDialog, NoticeDialog, FeedbackDialog, ProfileDialog, AccessDialog
  styles/       per-area CSS files ported from index.css onto tokens (task.css, views.css, …), imported by their components
client/src/pages/Home.tsx   → <JambavanProvider><AppShell>{lazy view by activeView}</AppShell><dialogs/></JambavanProvider>
client/src/index.css        → @import "tailwindcss"; @import "tw-animate-css"; @import "./theme/tokens.css"; @import "./theme/base.css";
```

### 13.2 Decisions

- **State.** Everything stays in React `useState` inside one `useJambavanStore()` hook, moved line by line with the same initial values and handler bodies. It is exposed through a context so views do not take 20 props. A reducer, Zustand or a server call were rejected because they would change semantics and add risk with no gain before the persistence phase. `TaskCard` keeps its local draft state.
- **Rules live in pure functions; the hook only wires them (review round 2, M5).** Vitest runs in Node and no renderer is installed (no jsdom, happy-dom, Testing Library or react-test-renderer), so a hook's state updates cannot be observed in a unit test. Every rule that a test must cover therefore lives in a pure module the hook calls, and each handler becomes `setX(pure(...))` plus `logActivity` and `notify`. Signatures:
  ```ts
  // state/tasks.ts
  export type CompletionResult = { taskId: number; journey: { before: number; after: number } | null;
                                   project: { name: string; before: number; after: number } | null };
  export function completeTaskPure(tasks: Task[], id: number, now: string, projects: Project[]):
    { tasks: Task[]; result: CompletionResult | null };   // null = refused (not owner, already done, not found); tasks returned unchanged
  export function setArchivedPure(tasks: Task[], id: number, archived: boolean, by: string, at: string): Task[];

  // state/people.ts
  export type AccessAction = "deactivate" | "reactivate" | "remove" | "restore";
  export function applyAccessAction(profiles: EmployeeProfile[], name: string, action: AccessAction, ctx: { canManage: boolean }):
    { profiles: EmployeeProfile[]; audit?: { action: string; detail: string }; warning?: string };
    // refuses (profiles unchanged, warning set, no audit) when !canManage or isCurrentUser(name); never shortens the array
  export const reportableProfiles = (profiles: EmployeeProfile[]) => profiles.filter(p => p.access !== "Removed");
  export function findDuplicateProfile(profiles: EmployeeProfile[], name: string): EmployeeProfile | null; // trimmed, case-insensitive

  // state/celebration.ts
  export function celebrationFor(task: Task, before: Task[], after: Task[], celebrated: ReadonlySet<string>):
    { keys: string[]; kind: "hanuman" | "today" } | null;
  export const onReopen = (celebrated: ReadonlySet<string>, taskId: number) =>
    new Set([...celebrated].filter(k => k !== `hanuman:${taskId}`));
  // trigger (a) is isHanumanMission(task) (selectors.ts); the store adds EVERY returned key to `celebrated` (review round 3 N5)

  // state/selectors.ts: Jambavan's reflection (review round 3 M3; adopted exactly as the review wrote it)
  export function reflectionFor(depts: { name: string; done: number }[], tasks: Task[]): string[] {
    const sorted = [...depts].sort((a, b) => b.done - a.done || a.name.localeCompare(b.name));   // tie-break by name
    const top = sorted[0], low = sorted[sorted.length - 1], gap = top.done - low.done;
    const lines = [gap > 0 ? `${low.name} is ${gap} points behind ${top.name}.` : "All departments are moving at the same pace."];
    const stuck = tasks.filter(t => !t.archived && t.status !== "done" && (t.due.startsWith("Overdue") || t.status === "blocked"));
    if (stuck.length === 0) lines.push("Nothing is overdue or blocked.");
    else {
      const byDept = [...new Set(stuck.map(t => t.department))];
      const both = stuck.filter(t => t.due.startsWith("Overdue") && t.status === "blocked").length;
      const what = both === stuck.length ? "overdue and blocked" : "overdue or blocked";
      lines.push(`${stuck.length} ${stuck.length === 1 ? "mission is" : "missions are"} ${what}` +
        (byDept.length === 1 ? `, and ${stuck.length === 1 ? "it sits" : "they sit"} with ${byDept[0]}.` : ` across ${byDept.length} departments.`));
      lines.push(stuck.length === 1 ? "A short check-in with its Task Owner may unblock it." : "A short check-in with each Task Owner may unblock them.");
    }
    return lines;
  }
  // `departments` is the static seed (Home.tsx:331–336), so no line says "this week".
  // Seed (round 4 seed): ["Operations is 31 points behind Marketing.",
  //   "2 missions are overdue or blocked across 2 departments.", "A short check-in with each Task Owner may unblock them."]
  // (task 6 is overdue and blocked in Operations; task 9 is blocked in Academic). The round 3 review's single-mission lines
  // ("1 mission is overdue and blocked, and it sits with Operations." / "…with its Task Owner may unblock it.") are what the
  // function returns once task 9 is completed, and "Nothing is overdue or blocked." once task 6 is archived as well (AC-12.3).

  // state/dependencies.ts (round 4): see §10.3 for upstreamPath, bottleneckOf, dependencyBottlenecks
  export const downstreamOf = (id: number, tasks: Task[]) => tasks.filter(t => t.dependsOnTaskId === id && !t.archived && t.status !== "done");
  export function wouldCycle(tasks: Task[], candidateId: number, editingId: number | null): boolean;  // today's dependencyWouldCycle (Home.tsx:768–779), made pure
  export function clearDependentsOf(tasks: Task[], deletedId: number): Task[];                        // F23

  // state/blockers.ts (round 4)
  export const reasonPhrase: Record<BlockerReason, string> = {
    "I haven't started": "not started yet", "Waiting for someone": "waiting for someone", "Waiting for information": "waiting for information",
    "Too much other work": "held up by other work", "I don't understand the task": "unclear to the Task Owner",
    "Unexpected issue": "stuck on an unexpected issue", "Forgot": "forgotten", "Other": "held up for another reason" };
  export function reportBlockerPure(tasks: Task[], id: number, reason: BlockerReason, note: string | undefined, by: string, at: string):
    { tasks: Task[]; ok: boolean };                     // ok = false (tasks unchanged) when the task is missing or done, as today
  export function clearBlockerPure(tasks: Task[], id: number): { tasks: Task[]; ok: boolean };   // ok = false when there is no check-in
  export function blockerAnalytics(tasks: Task[]): { delayed: Task[]; reported: Task[];
    byReason: { reason: BlockerReason; count: number }[]; top: { reason: BlockerReason; count: number } | null; topPercent: number };
    // today's rule (Home.tsx:1026–1031): delayed = open, active and (blocked || overdue || has a check-in); byReason sorted by
    // count desc, ties in blockerReasons order (stable sort); top = null when there is no check-in. Seed: 5 delayed, 5 reported,
    // top "Waiting for someone" 2 → 40%. My Day is never an input.

  // state/handover.ts (round 4, F17)
  export type HandoverDraft = { to: string; lastAction: string; waitingFor: string; nextAction: string; notes: string };
  export const handoverRecipients = (task: Task) => staffOptions.filter(p => p !== task.assignee);
  export function defaultHandoverDraft(task: Task): HandoverDraft;   // today's prefill rules (Home.tsx:685–697), with `to` limited to handoverRecipients
  export function validateHandover(task: Task, draft: HandoverDraft): Partial<Record<keyof HandoverDraft, string>>;  // {} = valid
  export function handoverTaskPure(tasks: Task[], id: number, draft: HandoverDraft, ctx: { by: string; at: string }):
    { tasks: Task[]; handover: TaskHandover | null };  // null = refused (missing, done or invalid): tasks unchanged, nothing logged

  // state/myDay.ts (round 4): every function is (plans: Record<string, PersonalPlan>, date: string, …) => Record<string, PersonalPlan>
  export const planFor = (plans: Record<string, PersonalPlan>, date: string) => plans[date] ?? emptyPersonalPlan(date);
  export function addTop3(plans, date, title: string): Record<string, PersonalPlan>;          // no-op when the title is empty or 3 exist
  export function saveScheduleBlock(plans, date, block: Omit<ScheduleBlock, "id">, editingId: number | null, nextId: () => number);  // F19
  export function linkTask(plans, date, task: Task): Record<string, PersonalPlan>;            // no-op unless isCurrentUser(task.assignee)
  export function saveReview(plans, date, review: PersonalPlan["review"]): Record<string, PersonalPlan>;  // stores "" too (F20)
  ```
  In increment 0 the extracted handlers keep today's bodies (so the equivalence gate holds). The pure modules arrive with the fixes that need them: `completeTaskPure`, `celebration.ts`, `dependencies.ts`, `blockers.ts` and `handover.ts` in increment 3, `myDay.ts` and `MyDayProvider` in increment 4a, `people.ts` in increment 4d. In increment 0, `findBlockingDependency` and `dependencyWouldCycle` move verbatim into `dependencies.ts` (they are already pure), and the My Day state moves verbatim into `MyDayProvider`, so the boundary exists from the start.
  - The handler names never change: `completeTask`, `toggleEmployeeSuspension`, `removeEmployee`, and the round 4 `addTop3`, `addScheduleBlock`, `addPersonalActionable`, `addTaskToMyDay`, `removeLinkedTask`, `toggleTop3`, `toggleActionable`, `updateScheduleStatus`, `editScheduleBlock`, `deleteScheduleBlock`, `deleteActionable`, `saveDayReview`, `openHandoverModal`, `createHandover` and `reportTaskBlocker`.
  - Round 4 adds three new handlers: `clearTaskBlocker` (F22), `cancelScheduleEdit` (F19) and `selectMyDayDate(date)` (wraps `setMyDayDate` and loads `reviewDraft`, F20).
  - Round 4 adds new state: `editingBlockId: number | null` in `MyDayProvider`.
  - `closeHandoverDialog()` resets `showHandoverModal`, `handoverTaskId` and `handoverDraft` on every close path (X, Cancel, Escape, backdrop, after submit), the same rule as F2.
- **Code splitting.** Views are loaded with `React.lazy` keyed by `activeView`. This shrinks the 1.1 MB entry chunk and loads each environment SVG with its view. Suspense shows `ViewSkeleton`.
- **Routing.** It stays as single route `/` with `activeView` state. URL routing per view is backlog: it would change behaviour such as deep links and the back button.
- **CSS.** The 1167-line `index.css` is ported onto tokens and split per area. Class names may change, since the components own them. Each old Monsoon Ledger rule is deleted as its component is ported, never kept alongside the new one. Until a view is ported it keeps rendering through `legacy-aliases.css` (§3.2), so no increment leaves a view unstyled. The new primitives use Tailwind utilities plus `cva`; view layout CSS lives in the `styles/` files.
- **Order of work.** First move code with no visual change and verify the behaviour is identical (increment 0). Then restyle.

### 13.3 Equivalence check for increment 0

The baseline audit script is re-run against the refactored build:
- same 12 sidebar items plus "Workspace settings" (round 4: My Day added);
- same headings for all 13 views (the 12 of round 1 plus My Day);
- same task-card count (12);
- same bug reproductions (A1, A2, A4 and A6 still reproduce, plus the round 4 D1, D5, D6 and D7, which proves behaviour is unchanged before the fixes);
- same audit-log entries after a scripted action sequence (complete, add subtask, archive, post update, send notice, create MOM, report a blocker, hand over task 2 to Manav Shah, create a task that depends on task 2);
- same derived signals: "3 downstream alerts" on the Dashboard, the blocker headline "40% …", 5 check-ins, "Waiting on"/"Blocked by" on tasks 10–12, and **no** audit entry or notification after a scripted My Day sequence (add a Top 3, add a block, save the review).

## 14. Error handling, validation and invariants

### 14.1 Operations that can fail

| Operation | Failure condition | Recoverable? | Caller receives | Logged |
|---|---|---|---|---|
| Any form submit (task, MOM, event, calendar, notice, feedback, employee, attachment link) | Validation fails | Yes | Dialog stays open; inline errors with `aria-invalid` and `aria-describedby`; focus moves to the first invalid field; nothing is written to state or the audit log | No |
| Permission-gated action (access matrix toggle, employee add/deactivate/remove) | Role lacks the permission, or the target is the current user | Yes | Warning toast with the existing sentence on views; InlineError inside the Add employee dialog; no state change | No |
| Add attachment files | `URL.createObjectURL` throws, or the FileList is empty | Yes | `InlineError` inside the attachment dialog (`role="alert"`): "The mission could not be completed. Please try again."; the dialog stays open and the draft is kept. No toast while the dialog is open (review M7) | `console.warn("[attachments]", err)` |
| Attachment files over 25 MB | One or more files are too large | Yes | Valid files are added; `InlineError` lists the skipped ones: "Skipped: a.pdf, b.mov (over 25 MB)." | No |
| Notice media / employee photo | `createObjectURL` throws, or the file is over 25 MB | Yes | `InlineError` inside the notice or Add employee dialog; the draft is unchanged | `console.warn("[media]", err)` |
| Complete task | Current user is not the Task Owner, or the task is already done or not found | Yes | `completeTaskPure` returns `result: null` and the tasks unchanged; the store writes no log entry, shows no toast and no reward. This is fix F14 (today a refused completion still logs "Task completed" and toasts), landing in increment 3 | No (the UI never offers the action) |
| CSV/PDF export | Blob or anchor creation throws | Yes | Toast "The report could not be downloaded. Please try again." Added in increment 5; increments 0–4 keep today's unguarded export (behaviour unchanged for the equivalence gate) | `console.error("[export]", err)` |
| Art slot or avatar image | 404, decode error, or wrong MIME type (as with today's `/manus-storage`) | Yes | Silent fallback to SVG or initials | Dev only: `console.debug` |
| Fonts | Network or file failure | Yes | System fallback through `font-display: swap` | No |
| Splash | `sessionStorage` unavailable (private mode) or throws | Yes | Splash shows once per mount; never blocks; a dismissal never reaches the app | No |
| Deactivate / remove / restore employee | Caller lacks `canManageEmployeeAccess`, or the target is the current user | Yes | Warning toast with the existing sentence (or "You cannot deactivate or remove your own profile."); no state change, no audit entry | No |
| Hand over task (round 4) | Validation fails (no or stale recipient, empty last or next action) | Yes | `handoverTaskPure` returns `handover: null` and the tasks unchanged; the dialog stays open with inline errors and focus on the first invalid field; no log, notification or toast | No |
| Hand over task | The task was completed, archived or deleted while the dialog was open, or `canHandOver` is false | Yes | Same `null` result; InlineError above the footer: "This task can no longer be handed over." with Close | `console.warn("[handover]", id)` |
| Hand over task | Success | — | Dialog closes through `closeHandoverDialog()`; focus to the card title; then (after close) the toast "Mission handed over to {name}."; audit "Task handed over" ("From {from} to {to}"); notification "Task handover received" | audit log (user-visible) |
| Report / clear a blocker (round 4) | Task missing or done; clear with no check-in | Yes | `ok: false`, tasks unchanged, no log, no toast (the UI never offers it) | No |
| Add to My Day (round 4) | The task is not owned by the current user | Yes | Warning toast with today's sentence "Only academy tasks assigned to you can be added to My Day."; My Day unchanged | No (and never in the audit log, §11 IA-10) |
| My Day edits (round 4) | Empty title; Top 3 already has 3; block end before start | Yes | Nothing is written; the Add button is disabled for empty fields; inline "End the block after it starts." | No |
| Save task with "Depends on" (round 4) | Chosen upstream is now missing, archived, the task itself or would loop | Yes | Inline error on the field (§9.3); dialog stays open; nothing written | No |
| Lazy view chunk | Import fails (offline or a stale deploy) | Yes | View-level `ErrorBoundary`: InlineError "The mission could not be completed. Please try again." with Try again (re-import) and Reload | `console.error` |
| Render exception in a view | Bug | Contained | The view boundary shows the same InlineError; the shell and nav stay usable; the app-level `ErrorBoundary` (existing) is the last resort | `console.error` with the component stack |

### 14.2 External input validation

All rules live in `state/validation.ts`, which is pure and unit-tested. Text is trimmed before checking.

| Input | Rules | On failure |
|---|---|---|
| Mission title | required; 1–160 chars (`maxLength=160`) | "Give your mission a title to start it." |
| Mission brief / responsibility notes | optional; ≤ 1000 | counter shown after 900 |
| Subtask (dialog and inline) | 1–120; empty input does nothing (as today) | inline add button disabled while empty |
| Journal update | 1–1000 | "Post update" disabled while empty |
| Contributors | optional; 0–10; owner excluded (as today) | — |
| MOM | title 1–120 required; content 1–5000 required; Meeting Head and Secretary required (defaults exist); quick-task rows with an empty title are ignored (as today) | inline per field |
| Event plan | title 1–120 required; date and venue optional (defaults "to be confirmed", as today) | inline |
| Calendar event | title 1–120 required; date required (free text, as today); month 0–11 | inline |
| Notice | at least one of title / body / media; title ≤ 120; body ≤ 2000; media file ≤ 25 MB | inline per field; an oversized file shows InlineError "This file is over 25 MB. Choose a smaller file." inside the dialog |
| Feedback | title, prompt and ≥ 1 target required; Poll needs ≥ 2 non-empty choices | inline |
| Attachment link | must parse with `new URL()` and use `http:` or `https:` (rejects `javascript:` and other schemes) | "Enter a full link that starts with http:// or https://" |
| Attachment files | any type (as today); ≤ 25 MB each | InlineError in the attachment dialog naming the skipped files: "Skipped: a.pdf, b.mov (over 25 MB)." Valid files are still added |
| Add employee | name, contact, position and photo required (as today); name ≤ 80; contact 7–20 of `[0-9 +()-]`; **name must not match an existing profile** (trimmed, case-insensitive, Removed profiles included; `findDuplicateProfile`) | inline per field; duplicate: "A profile for {name} already exists. Restore it from Show removed." for a Removed match, else "A profile with this name already exists." Nothing is written |
| Search query | free text, ≤ 80; case-insensitive substring match; never matches My Day content (§11 IA-6) | empty result state |
| Handover: New Task Owner (round 4) | required; must be one of `handoverRecipients(task)` at submit time | "Choose who takes over this mission." / stale: "Choose someone from the list." |
| Handover: Last action, Next action | required; 1–300 chars after trim; prefilled by `defaultHandoverDraft` (today's rules) | "Add the last action." / "Add the next action." |
| Handover: Waiting for | optional; ≤ 300; empty stores "Nothing currently waiting" (today's default) | counter after 270 |
| Handover: Important notes | optional; ≤ 1000 | counter after 900 |
| Blocker: reason | one of the 8 `blockerReasons` (fixed buttons, so never invalid) | — |
| Blocker: context note | optional; ≤ 280; trimmed; empty stores no note (as today) | counter after 250 |
| Depends on | optional; a task id that exists, is not archived, is not the task itself and `!wouldCycle` | §9.3 messages |
| My Day: date | required; `YYYY-MM-DD` from the native picker; an invalid or empty value falls back to `todayIso()` | — |
| My Day: Top 3 / actionable / block title | 1–120 chars; Top 3 at most 3 per date | Add disabled while empty |
| My Day: time block | start and end `HH:MM`; end > start; category ≤ 40 (default "Work") | "End the block after it starts." |
| My Day: review fields | optional; ≤ 1000 each; empty allowed (F20) | counter after 900 |

### 14.3 Invariants and who enforces them

- **Only the Task Owner completes the parent task.** Enforced in the store: `completeTask` checks `isCurrentUser(task.assignee)` and returns without a state change otherwise. The UI only mirrors this (button hidden, note shown). Server-side enforcement is backlog, as the handoff document says.
- **A written MOM is immutable.** Enforced by the store's API shape: there is no update action for MOM content, and the UI has no edit control.
- **The access matrix and audit log are leadership-only.** Enforced in the UI and store (`canManageEmployeeAccess`). This is cosmetic in a client-only prototype; server enforcement is mandatory before production (handoff #8). It is flagged again here because it is a security gap.
- **The current user cannot deactivate or remove themselves.** Enforced by a store guard (F6).
- **Text contrast ≥ 4.5:1 (3:1 for large text and UI).** Tokens are single colours, so no token layer can enforce pairs (review M5). `theme/contrast.test.ts` checks that every pair in the §3.2 allowlist passes and every forbidden pair fails. **Enforcement is the browser audit**: computed contrast for every text node, plus the H2 pixel method for text inside scenes (§5, §15). AC-1.2 fails the increment on any violation.
- **Today's Mission and project Setus never drop on completion.** Owned by `selectors.ts` (a completed task contributes 100) and enforced by its unit tests (§15).
- **A Private task stays Private through an edit.** Owned by `mergeTaskEdit` (visibility is never read from the draft) and enforced by its unit test.
- **Readability scrim always present over art, ≥ 0.92 opaque inside the text box.** Owned by `SceneBackdrop`, which has no API to omit it and owns `--text-zone-end` and the copy width. Verified by the pixel audit.
- **No broken images.** Enforced by `ArtSlot` and `PersonAvatar` through `onError` fallback.
- **Motion respects user preference.** Enforced by the global CSS kill switch in `base.css`, plus `useReducedMotion` in the JS-driven animations.
- **Splash never blocks and never passes clicks through.** Enforced by `BrandedSplash`: content renders underneath, the overlay has a hard 1000 ms timeout, can always be skipped, and swallows the dismissing pointer or key event in the capture phase.
- **Toasts never fire while a dialog is open.** Owned by a `notify()` helper in the store that checks the open-dialog count. Every Dialog primitive registers itself through `useRegisterOpenDialog(open)`, and from increment 2 every legacy modal that is not yet ported calls the same hook with its `show…Modal` flag, so the rule holds in every increment from 2 on. When a dialog is open it routes the message to the dialog's InlineError slot, or defers it until close for success messages. Toasts already visible are dismissed when the first dialog opens (`toast.dismiss()` in `useRegisterOpenDialog`), and a completion that opens the CelebrationOverlay calls no `notify()` at all (review round 3 M1).
- **No person is ever hard-deleted.** Owned by `state/people.ts` `applyAccessAction`, the only writer of `access`: it maps, never filters, and its unit test asserts the array length is unchanged.
- **Profile names are unique.** Owned by `validateEmployee` (the only path that adds a profile) through `findDuplicateProfile`. Name-keyed handlers and `key={profile.name}` rely on it.
- **Removed people leave the attendance export and search.** Owned by `reportableProfiles` (export) and the ⌘K people source (`showRemoved` gate); both unit-tested.
- **My Day is private** (round 4). Owned by the module boundary (§11 IA-10): only `MyDayProvider`, `MyDayView` and the TaskCard My Day control import `state/myDay.ts`, and no My Day handler logs or notifies. This is enforced by the import-boundary test and AC-19.4. In the prototype the planner belongs to the one signed-in user. Server-side ownership on every read and write is mandatory before production (handoff point 9), and it is flagged here as a security requirement.
- **The Task Owner is never also a Contributor after a handover** (round 4). Owned by `handoverTaskPure` (F17e); unit-tested.
- **A handover goes to someone else, from the real previous owner** (round 4). Owned by `validateHandover` (recipient ∈ `handoverRecipients`) and `handoverTaskPure` (`from = task.assignee`). Who *may* hand over is gated by `canHandOver` in the UI only. Server-side delegation rules are mandatory before production (handoff), and this is flagged again as a security gap (D24).
- **A dependency chain never loops and never points at a deleted task** (round 4). Owned by `wouldCycle` (options and `validateTaskDraft`) and `clearDependentsOf` (`deleteTask`); unit-tested.
- **Dependencies never block completion** (round 4; delta rule). Owned by `completeTaskPure`, which does not read `dependsOnTaskId`; the copy says so (F18).
- **A blocker check-in describes an open task only** (round 4). Owned by `reportBlockerPure` (refuses done tasks, as today) and `completeTaskPure` (clears it, F22).
- **Blocker analytics never label people.** The panel aggregates reasons only and names no reporter. Owned by `blockerAnalytics`, whose output has no person fields.

## 15. Testability

- **Unit tests** (vitest, Node environment). Extend `vitest.config.ts` `include` with `client/src/**/*.test.ts`. No new deps. Covered:
  - `setu.ts`: stage boundaries 0/19/20/39/40/59/60/79/80/99/100, NaN, −5, 140; stone boundaries 0 → 0, 1 → 1, 2 → 1, 97 → 19, 98 → 19, 99 → 19, 100 → 20; for every integer 0–100, `setuStones(p) === 20` if and only if `setuStage(p)` is `complete`, and `setuStones(p) === 0` if and only if p is 0.
  - `contrast.ts`: every approved pair passes; the forbidden pairs fail.
  - `selectors.ts`:
    - seed values (round 4 seed): Today's Mission = tasks 1, 4 and 9, 43% with 3 active and 0 completed today; the HANUMAN task 7 is excluded; My open tasks 4 (2 due today); Needs attention 2 (1 overdue · 2 blocked); Team follow-ups 9; nav reminders 6; projects 34 / 0 / 24; institute 69; family counts 2 / 4 / 5 / 1 after F16;
    - `isHanumanMission` (M2): a `category: "HANUMAN"` task without `longRunning` is in `todaysMission`, `celebrationFor` returns `today` or `null` for it (never `hanuman`), and `completeTaskPure` gives it a non-null `journey`;
    - `reflectionFor` (M3): the seed gives the three round 4 lines (§13.2); after completing task 9 it gives "Operations is 31 points behind Marketing." / "1 mission is overdue and blocked, and it sits with Operations." / "A short check-in with its Task Owner may unblock it."; after also archiving task 6, the second line is "Nothing is overdue or blocked." and there is no third line; equal `done` values give "All departments are moving at the same pace."; a gap tie between two lowest departments picks the alphabetically last name as `low` (the sort is by `done` desc, then name asc); two stuck tasks in one department give "…, and they sit with {dept}.";
    - **completion never lowers `journeyPct` or `projectProgress`**, checked for every seed task the current user owns and for a table of synthetic tasks (progress 0, 50, 100, not-done at 100);
    - completing task 1 gives 53%, "2 active · 1 completed today", and October Launch 50%; completing task 7 leaves `journeyPct` at 43;
    - `todayComplete` is true only when the set is non-empty and every task is done; from the seed it becomes true after completing tasks 1, 4 and 9;
    - a task completed on another day is excluded; a `longRunning` task is excluded even when due today;
    - "Planned estimate" fallback when no task links to a project; `projectProgress` without a seed and without linked tasks returns 0 / "tasks";
    - `projectFor`: task 1 → October Launch; an event-created task (`project: "Annual Parent Orientation"`, not in `projects`) → `null`;
    - `sourceLabel` (F13): all five outputs, including `kind: "Responsibility"` with `source: "Event plan · Annual Parent Orientation"` → "Event task" and with no source → "Project responsibility";
    - ⌘K people source: Removed profiles are excluded unless `showRemoved` is true;
    - deadline reminders; `visibleTasks` filters including the new project filter; the M15 search-select filter reset, including archived results.
  - `taskEdit.ts` (F1 regression, §12.1): unchanged save is a no-op; visibility stays Private; contributor departments and parts survive; duplicate subtask titles; `longRunning` off and on.
  - `identity.ts` (§12.2): both aliases, `displayName`, owner options without duplicates, `pendingAcknowledgementCount` with both aliases.
  - `tasks.test.ts` (`completeTaskPure`, `setArchivedPure`): owner completion of task 1 returns `{ journey: { before: 43, after: 53 }, project: { name: "October Launch", before: 34, after: 50 } }`; task 4 returns `project: { name: "Parent Connect", before: 0, after: 100 }` and journey 53 → 87 after task 1; task 9 (Blocked, owner "Arjun Mehta") completes and returns `project: null` ("Admission Campaign" has no Projects entry) and journey 87 → 100 after tasks 1 and 4; task 7 returns `journey: null` and `project: { name: "Faculty Excellence", before: 24, after: 100 }`; an event-created task owned by the current user returns `project: null`; completion clears `blocker` (F22) and ignores `dependsOnTaskId` (a task waiting on task 2 still completes); **AC-6.7 lives here (review round 3 N6):** a non-owner (task 2, Neha Kapoor), an already-done task and an unknown id return `result: null` with `tasks` referentially unchanged (F14), and the 6-line store handler calls `logActivity` and `notify` only when `result !== null` (code review); `setArchivedPure(…, true)` on an archived task leaves it archived.
  - `dependencies.test.ts` (round 4): seed `upstreamPath(12)` = [8, 9, 10, 11, 12]; `findBlockingDependency(12)` = 11, `(10)` = 9, `(9)` = undefined (8 is done); `bottleneckOf(12)` = 9; `dependencyBottlenecks(seed)` = one group {stone 9, waiting [10, 11, 12]}; after completing task 9 the bottleneck is 10 holding [11, 12]; `wouldCycle` refuses 9→12 when editing 9 and allows 8 when editing 10 (the delta's browser check); `clearDependentsOf(tasks, 9)` leaves task 10 with no `dependsOnTaskId`; a hand-built corrupt cycle terminates; an archived unfinished upstream still holds its chain.
  - `blockers.test.ts` (round 4): seed analytics 5 delayed, 5 reported, top "Waiting for someone" 2 → 40%, headline "40% of delayed tasks with a check-in are waiting for someone."; ties keep `blockerReasons` order; every `reasonPhrase` reads as "…are {phrase}." (8 strings); no check-in → `top: null`; `reportBlockerPure` on a done task returns `ok: false`; `clearBlockerPure` removes the check-in.
  - `handover.test.ts` (round 4): task 4's default recipient is `""` (its only contributor is "You", which is not a recipient) and `validateHandover` rejects `to: "You"` (D1); task 1's default is Karan Joshi; handing task 2 to Manav Shah gives `from: "Neha Kapoor"`, `createdBy: "Arjun Mehta"`, `createdAt: NOW_LABEL`, owner Manav Shah with initials "MS", and Manav is no longer a contributor (D2, D4); handing task 1 to Karan Joshi removes Karan from `assistants` and keeps Priya Nair's part done; a done or missing task returns `handover: null` with tasks unchanged; seed task 2's package reads from Aditi Rao to Neha Kapoor (D3).
  - `myDay.test.ts` (round 4): `addTop3` stops at 3 and ignores blank titles; `saveScheduleBlock` with an `editingId` keeps the id and position, and cancelling never removes the block (D5); `saveReview` stores `""` (D6); `linkTask` refuses a task the user does not own and is idempotent; plans for two dates never mix.
  - `boundary.test.ts` (round 4, Node fs only): reads every file under `client/src` and asserts that only `MyDayProvider.tsx`, `MyDayView.tsx`, `myday/*` and `task/TaskCard.tsx` import `state/myDay`, and that no file under `state/` except `myDay.ts` and `MyDayProvider.tsx` mentions `personalPlans`.
  - `people.test.ts` (`applyAccessAction`, `reportableProfiles`, `findDuplicateProfile`): self-deactivate and self-remove refused with the warning and no audit; `!canManage` refused; remove sets `Removed` and never shortens `profiles`; restore sets `Active`; audit strings "Employee deactivated" / "Employee reactivated" / "Employee removed" / "Employee restored"; `reportableProfiles` drops Removed and keeps Suspended; duplicates found for " arjun mehta " and for a Removed name, and the two messages differ.
  - `celebration.test.ts` (`celebrationFor`, `onReopen`): completing task 7 → kind `hanuman`, `keys: ["hanuman:7"]`; completing tasks 1, 4 and then 9 → kind `today`, `keys: ["today:05 Oct 2026"]`, once, on the third completion; a `category: "HANUMAN"` task without `longRunning` never returns `hanuman` (M2); every key already in `celebrated` → `null`; `onReopen(…, 7)` removes `hanuman:7` and keeps `today:…`.
  - `validation.ts`: every rule in §14.2, including `javascript:` links and the Add employee duplicate rule.
  - `identity.ts`: the owner-select `value` rule for edit task 1 ("Arjun Mehta"), edit task 4 ("You"), a fresh draft and an assign-from-MOM draft pre-filled with "Arjun Mehta"; `ownerOptions` has 11 entries with no duplicate person.
  - `assets.ts` integrity: every slot has aspects; focal, safe and text boxes within 0–1; `safe` does not intersect a non-null `textZone` on **desktop and mobile**; a fallback is registered.
- **Browser integration** (zero-dependency CDP script, promoted from `.agents/tasks/audit-tools/` to `jambavan-app/scripts/ui-audit/run.mjs`, run with `node scripts/ui-audit/run.mjs` against the dev server; `scrimaudit.mjs` is merged into it). At 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900, for every view and dialog, it:
  - takes screenshots into `.agents/tasks/screenshots/after/`;
  - asserts 0 console errors;
  - asserts no horizontal overflow (`scrollWidth ≤ viewport`);
  - asserts no visible text under 12 px;
  - asserts 0 contrast failures, using computed colours for text on flat surfaces and the H2 pixel method for text inside `.scene` and `.reflect` (§5). Compositing against a declared scrim colour is not used;
  - asserts no toast element exists while a `[role=dialog][aria-modal=true]` is open: the scripted attachment-failure and oversized-file cases, **complete task 1, 4 and then 9 → the CelebrationOverlay is open and `[data-sonner-toast]` has count 0**, complete task 7 → the same, and complete task 1 and then at once open Edit on another card → 0 toasts (review round 3 M1);
  - asserts the splash dismissal click does not activate the control under the pointer;
  - asserts every dialog has `role=dialog`, closes on Escape and keeps Tab focus inside;
  - asserts 0 broken images;
  - asserts mobile tap targets ≥ 44 px;
  - asserts the nav contains all 14 views (13 in the four groups plus the Guide link);
  - asserts the seed counts (nav badge 6, bell 7, lede "3 active missions are on your path today.", Today's Mission 43%) and the AC-6.4 numbers after completing task 1;
  - round 4: replays the D1–D24 scenarios of §2.4 and expects the fixed behaviour (AC-19 to AC-22), including the My Day privacy sweep (a unique Top 3 string is absent from every other view, ⌘K results and the audit log);
  - asserts no focusable element inside any `[aria-hidden="true"]` subtree (splash Skip, decorative art);
  - in increment 6, runs the same view sweep against the production build (§16, AC-18.1);
  - re-runs the A1, A2, A4, A6 and A7 scenarios and expects the fixed behaviour.
- **Manual checks**: a VoiceOver pass on Feed, Task dialog, Notifications and People. A visual art-direction review of the SVG scenes. Full WCAG validation still needs testing with assistive technology and an expert accessibility review; this proposal does not claim it.

---

## 16. Implementation plan (ordered increments)

Each increment ends with `corepack pnpm@10.18.0 check`, `corepack pnpm@10.18.0 test`, `corepack pnpm@10.18.0 build`, and the browser audit for the screens it touched.

**0. Extract with identical behaviour.**
- `git init` in `jambavan-app/` and make a baseline commit of the untouched copy (§12; `.env` stays ignored).
- Move types, seeds, store, selectors and exports into `components/jambavan/state/*`. Round 4: `findBlockingDependency` and `dependencyWouldCycle` move verbatim into `state/dependencies.ts`, and the My Day state and handlers move verbatim into `MyDayProvider`, so the privacy boundary (§11 IA-10) exists from the first increment.
- Move views, modals, TaskCard and the shell into components, keeping the current CSS class names.
- Home.tsx becomes the composition root.
- Gate: the §13.3 equivalence check passes, with the bugs still reproducing.

**1. Tokens, fonts and base components.**
- Add `theme/tokens.css`, `base.css` and `fonts.ts`; install the 3 pinned `@fontsource` packages.
- Re-point the shadcn variables to the new tokens.
- Build the primitives (Button, IconButton, Field family, Badge family including the new PriorityBadge, Card, Dialog with the open-dialog registry and InlineError slot, ConfirmDialog, EmptyState, InlineError), the Ramayana icons and PersonAvatar.
- Build `theme/setu.ts` and `progress/RamSetuProgress` (with `from`), with their tests, here and not in increment 5, because increments 3 and 4 render Setus (review M4).
- Add `state/clock.ts` (with `TODAY_ISO`, `TODAY_LONG`, `todayIso()`), the new selectors (§11 IA-7, §10.1, including `isHanumanMission` and `reflectionFor`) and `identity.ts` with tests. Nothing renders them yet.
- Replace the Monsoon Ledger token definitions with `theme/legacy-aliases.css` (§3.2), so every unported view keeps rendering. Remove the `/manus-storage` CSS backgrounds.
- Fix the viewport meta (F8) and remove `peoplePhotos` (F11).

**2. Layout shell, navigation, background system and loading.**
- Build AppShell, Sidebar (IA-1, IA-2, IA-4, IA-10 with the `Sunrise` icon for My Day, B8) and MobileNav as a Sheet (A8).
  - Implementation review IR1-3: the rebuilt brand mark must not use `--saffron` (saffron-700) as text on the indigo/ink ground; the legacy `.brand-mark` "J" is about 1.9–2.2:1 there since increment 1. Use an allowlisted pair from §3.2.
  - Implementation review IR1-4: the Sidebar user card moves to `PersonAvatar`; the interim `.head-card span:not(.avatar)` scoping is removed with the legacy rule.
- Review round 3 N4: add the `projectFilter` state (default `null`, no UI yet; the ⌘K select-task reset writes it) and the `notices` ViewKey now. Until 4c, `NoticesView` renders today's notice board and feedback markup, moved verbatim from My feed, so the Sidebar, `environmentByView: Record<ViewKey, …>` and the view audit are complete from this increment.
- Build Topbar with the ⌘K CommandSearch (IA-6, M15 select behaviour, "Create mission" command), NotificationsPopover and the contextual "Create mission" button (IA-5 view list).
- Build SceneBackdrop (scrim contract §5), EnvironmentArt, ArtSlot and the `assets.ts` and `environments.ts` config, with all 14 environment ids (12 scene SVGs + 2 pattern SVGs, including `vanvas-ashram` for My Day).
- Add the BrandedSplash (M16 contract) and ViewSkeleton; lazy-load the views.
- Swap the custom toast for sonner with `theme="light"` and the `notify()` router (B9, M7, N6). Add `useRegisterOpenDialog(open)`, which calls `toast.dismiss()` on the 0 → 1 transition (review round 3 M1), and call it from every legacy modal still rendered by the old markup (MOM, event, notice, calendar, feedback, profile, access, attachment, task, **task handover**), so AC-6.6 holds from this increment on.
- NotificationsPopover as `<Popover modal>` with the bell count = unread reminders + unread app notifications, and the My feed nav badge = unread reminders (IA-7).
- Promote `scrimaudit.mjs` and the audit driver into `scripts/ui-audit/` now, so every later increment runs the pixel check.

**3. TaskCard, task dialog, Create mission and completion reward.**
- New TaskCard with StatusBadge (F7) and a Details disclosure.
- TaskDialog on the Dialog primitive, with the family radio group (M3), the single current-user owner option (M2), mission copy and validation (F10).
- Fixes F1 (merge table §12.1), F2 (close reset), F3 (scroll body) and F4 (identity §12.2), plus the delete confirm (F6, tasks).
- `state/tasks.ts` (`completeTaskPure`, `setArchivedPure`) and `state/celebration.ts` with their tests; `completeTask` delegates to `completeTaskPure` and skips log and toast on a refused completion (F14). CompletionReward renders the changed Setu with the four copy variants (§8). CelebrationOverlay with the dedupe set (M8).
- SourceBadge through `sourceLabel` (F13); owner select with the draft-based `value` rule and the widened list (F15); delete confirm with `setArchived(id, true)`, Archive hidden for archived tasks, both actions closing through `closeTaskDialog()` (§12.3).
- AttachmentDialog with link validation and in-dialog InlineError (M7).
- Round 4 on the card and dialogs: `BlockerLine` and `BlockerCheckIn` (F22, `state/blockers.ts`), `DependencyLine` with `ChainSetu sm` (F18, §10.3), `HandoverLine` and `HandoverDialog` on the Dialog primitive (F17, D10, D11, `state/handover.ts`), the More menu with "Hand over task…", "Add to My Day" in the action row, the "Depends on" field with its label, hint and validation (D12), and the delete confirm wording for dependents (F23). The seed corrections F16 and F17(f) land here, after the increment 0 equivalence gate.
- `completeTask` computes `celebrationFor` before `notify()` and skips the toast when it is non-null (M1).

**4. Views, one group at a time** (each with its scene band, contextual primary and copy):
- 4a. Workspace: My feed (hero with the landscape rule, Today's Mission card plus 3 tiles per IA-7, "Missions in motion", rail with "Seen by me"), **My Day** (round 4: `MyDayProvider` with `state/myDay.ts`, the `vanvas-ashram` band, the six cards, F19, F20, F21, F24, labelled fields, the boundary test), Department, Dashboard (Reflection card from `reflectionFor` with the "Review deadline watch" button (M3), Setu for institute completion, "Victories this week" reward card, the "Why are open tasks not moving?" and "Task dependencies" panels (IA-11, `ChainSetu md`), planner restyle, fix B5 overflow).
  - Implementation review IR1-3: the Department hero "76%" (saffron-700 on ink, 2.61:1 since increment 1) is re-paired to an allowlisted §3.2 pair.
  - Implementation review IR1-5: fix the pre-existing 768×1024 overflow on My feed (849 px, `.hanuman-mini-list` inside the flex `.hanuman-overview`), so AC-9.1 holds at 768.
- 4b. Execution: MOM Directory with MomDialog; Event Planner with EventDialog (F5); Projects with data-backed Setus (§10.1, F12) and the project filter (IA-6).
- 4c. Communication: Yearly Calendar with CalendarDialog; the new Notices & feedback view (IA-3) with NoticeDialog and FeedbackDialog.
  - Implementation review IR1-5: the notice board and feedback markup moved verbatim from My feed in increment 2 carries the same 849 px overflow at 768×1024 (`.hanuman-mini-list`); fix it here.
- 4d. People & Control: People (F6 §12.3: Deactivate/Reactivate, soft Remove profile, Show removed and Restore, current-user guard, new audit strings), with `state/people.ts` and `people.test.ts`; `attendanceReportRows` switched to `reportableProfiles`; the Add employee duplicate rule; the ⌘K people source gated by `showRemoved`. My profile with ProfileDialog and AccessDialog, Access matrix (F9, fix B5 overflow), Audit log.
  - Implementation review IR1-5: the Access matrix overflow also occurs at 768×1024 (996 px, `.access-matrix-hero`, `.access-matrix-card`, `.access-matrix-footer`), not only at 390 (766 px); fix both.
- Guide restyled with the family emblems.
- Remove the `meetings` ViewKey (IA-8).

**5. Empty and error states, Setu adoption and art direction.**
- All empty states from §9.2 (including the Sanjeevani tile) and errors from §9.3; view-level error boundaries.
- Wrap `exports.ts` `downloadCsv` / `downloadPdf` in try/catch with the export error toast and `console.error("[export]", err)` (§14.1). This is the first increment allowed to change export behaviour.
- Adoption only: confirm every Setu surface listed in §10.2 uses `RamSetuProgress` (built in increment 1), and every celebration trigger is wired.
- Write `docs/art-direction.md` (§6.1) and fill the `assets.ts` slot table.

**6. Responsive and accessibility pass.**
- Delete `theme/legacy-aliases.css`; AC-1.3 must now pass.
- Run `scripts/ui-audit/run.mjs` at 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900; fix every failure.
- Keyboard-only walk-through and VoiceOver spot check.
- Capture the "after" screenshots.
- Update `DEVELOPER_HANDOFF.md` with the design-system and art-slot sections, and add "My Day" to the Workspace line of `docs/jambavan-standardization.md` (IA-10).
- **Production build check** (brief §1 "prepare for handoff"). This is not a deployment design: the brief's deployment instructions were never received, so none is proposed. It only checks that the redesigned app builds and serves with what the repo already defines:
  - `corepack pnpm@10.18.0 build && PORT=3100 corepack pnpm@10.18.0 start` (a free port, so the dev server on 3000 keeps running);
  - `GET http://127.0.0.1:3100/` returns 200 and serves the built `index.html`; the hashed JS/CSS assets and the self-hosted font files return 200;
  - the audit driver loads every view from the built server at 1280×800 and 390×844 with 0 console errors and 0 failed requests;
  - `docker build .` with the existing `Dockerfile` succeeds (when Docker is available on the machine; otherwise this is reported as not verified). The Dockerfile runs `pnpm install --frozen-lockfile`, so `pnpm-lock.yaml` must contain the three pinned `@fontsource` packages (added through `corepack pnpm@10.18.0 add -E …` in increment 1, never by hand-editing `package.json`).
  - `server/_core/index.ts` reads `PORT` (default 3000), which is what makes the free-port run possible; no server change is needed.

### Acceptance criteria (testable)

1. **Tokens.**
   - AC-1.1: `contrast.test.ts` passes. Every allowlisted pair in §3.2 (both tables) meets its threshold, and every forbidden pair fails.
   - AC-1.2: the browser audit reports 0 contrast failures on all views and dialogs at all six audit widths, including 0 failures from the H2 pixel method for text in scenes.
   - AC-1.3 (after increment 6): `grep -rniE "#1f2a56|#f2a93b|--ink\b|--saffron\b|--mint\b|--coral\b|--parchment\b|manus-storage|legacy-aliases" client/src` returns nothing. The `--jb-` prefix means `--jb-ink` and `--jb-saffron-700` do not match.
2. **Type.**
   - AC-2.1: no visible text under 12 px.
   - AC-2.2: `CSS.getPlatformFontsForNode` reports Mukta for body text, Cormorant Garamond for H1 and Tiro Devanagari Hindi for sacred text.
3. **Navigation.**
   - AC-3.1: the sidebar lists the 4 approved groups with My Day second in Workspace and Projects under Execution, plus a Guide link; every view is reachable by click; My Day and Event Planner have different icons.
   - AC-3.2: the active item has `aria-current="page"`.
   - AC-3.3: at 1280×800 the sidebar footer is reachable (internal scroll).
   - AC-3.4: below 1024 px the drawer has a close button, a backdrop, Escape support and a focus trap.
4. **Dialogs.** All 17 modal surfaces (review N11; round 4 adds one): (1) TaskDialog: create, (2) TaskDialog: edit, (3) TaskDialog: assign from MOM, (4) AttachmentDialog, (5) MomDialog, (6) EventDialog, (7) CalendarDialog, (8) NoticeDialog, (9) FeedbackDialog, (10) ProfileDialog, (11) AccessDialog (Add employee), (12) NotificationsPopover, (13) MobileNav sheet, (14) ConfirmDialog (delete task, remove profile), (15) CelebrationOverlay, (16) CommandSearch, (17) HandoverDialog. Each one:
   - AC-4.1: have `role="dialog"` and `aria-modal="true"`;
   - AC-4.2: close on Escape and return focus to the trigger;
   - AC-4.3: keep Tab focus inside for 25 presses;
   - AC-4.4: have the primary action visible without page scroll at 390×844 and 1280×800 (sticky footer).
5. **Tasks.**
   - AC-5.1: editing and saving the HANUMAN task unchanged keeps "1 update", 24%, 1/2 subtasks, 1/2 parts and team "Strategic initiatives".
   - AC-5.2: Edit, Cancel, then Create mission opens an empty "Create mission" dialog with no Delete button.
   - AC-5.3: task 1 and task 9 (owner Arjun Mehta) show "Complete mission" and complete.
   - AC-5.4: every card shows a status badge; "Resolve projector issue" shows "Blocked".
   - AC-5.5: Delete asks for confirmation.
   - AC-5.6: submitting an empty title shows the inline error and sets `aria-invalid`.
   - AC-5.7: editing and saving "Approve parent orientation deck" keeps visibility Private. Editing the HANUMAN task keeps Neha Kapoor (Admissions) and Ritesh Shah (Operations, part done).
   - AC-5.8: when editing task 1 (owner "Arjun Mehta"), the owner select shows exactly one option for him, "You (Arjun Mehta)", and it is selected; the same holds for "Assign task" from the Academic Huddle MOM (pre-filled "Arjun Mehta"). The select lists 11 options (F15). Completed tasks read "Completed by Arjun Mehta (you)". Saving task 4 unchanged keeps its initials "YO".
   - AC-5.9: the family control is a `radiogroup`. Arrow keys change the family. Choosing Angad with contributors present clears them (today's behaviour), and the Task source and HANUMAN toggle coupling is unchanged.
   - AC-5.10: ⌘K → selecting an archived task shows My feed with "Archived tasks", all other filters reset, and focus on that card's title.
6. **Completion.**
   - AC-6.1: completing a task updates the UI in the same frame (no awaited animation).
   - AC-6.2: the reward animation is ≤ 600 ms and absent under `prefers-reduced-motion: reduce`.
   - AC-6.3: the toast is announced (`role=status`) and auto-dismisses within 6 s.
   - AC-6.4: from the seed, the My feed lede reads "3 active missions are on your path today.", the Today's Mission card shows 43% and "3 active missions · 0 completed today", and the My open tasks tile shows 4 ("2 due today"). After completing task 1 the card shows 53% and "2 active missions · 1 completed today", the tile shows 3 ("1 due today"), the reward panel shows October Launch 34% → 50% with "The October Launch Setu moved forward. Today's journey is now 53%.", and the toast reads "Mission completed. Today's journey moved to 53%."
   - AC-6.5: from the seed, completing tasks 1, 4 and 9 opens the "today" celebration once, on the third completion, and that completion shows no toast. It stays open until Continue, Escape or a backdrop click, with no timer; reopening and re-completing task 9 that day does not reopen it. Completing task 7 opens the HANUMAN celebration with no toast; reopening and re-completing it opens it again.
   - AC-6.6 (reworded for review round 3 M1): from increment 2 on, while any dialog (ported or legacy) is open, no toast element is rendered, **including toasts created just before it opened**. Browser cases: complete tasks 1, 4 and then 9 → the overlay is open and `[data-sonner-toast]` has count 0; complete task 1 and open Edit within 5 s → 0 toasts. An attachment failure shows an in-dialog `role="alert"`.
   - AC-6.7 (moved to a unit test, review round 3 N6): `tasks.test.ts` asserts that `completeTaskPure(seed, 2, NOW_LABEL, projects)` returns `result: null` and the same `tasks` reference, and the store handler calls `logActivity` and `notify` only when `result !== null` (F14). There is no browser path, because the UI never offers the action.
   - AC-6.8: completing an event-created task owned by the current user shows the journey-only reward copy ("Today's journey moved from …% to …%") and never names a Setu that is not on Projects.
7. **Setu.**
   - AC-7.1: `setuStage` and `setuStones` unit tests pass for all boundaries, including 1 → 1 stone and 98/99 → 19 stones, and the "20 stones ⇔ complete" property for 0–100.
   - AC-7.2: every RamSetuProgress shows the numeric % as text and has a descriptive `aria-label`.
8. **Splash.**
   - AC-8.1: the splash dismisses within 1000 ms, is skippable by key, click or the Skip button, and is not shown with reduced motion.
   - AC-8.2 (reworded for review M16): the app is rendered underneath from the first frame and is interactive immediately after the splash dismisses. A dismissing click on the position of "Create mission" does not open the task dialog.
9. **Responsive.**
   - AC-9.1: no horizontal overflow at 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900 (Dashboard and Role matrix included).
   - AC-9.2: tap targets are ≥ 44 px at 390×844, 768×1024 and 844×390.
   - AC-9.3: the first task card on My feed starts at ≤ 960 px at 1280×800 (today 1552 px, unchanged on `5f248af`; the round 4 mock 1 measures 899 px) and at ≤ 1750 px at 390×844 (today 2553 px; the round 4 mock 1 measures 1612 px, round 3 measured 1588 px).
   - AC-9.4: at 844×390 the My feed hero is ≤ 220 px tall (mock 1 measures 205 px), and at ≤ 767 px wide the scene art never sits behind text.
10. **Images.** AC-10.1: 0 broken images; all avatars render initials unless the manifest provides a photo.
11. **Console.** AC-11.1: 0 console errors or warnings on load and on every view (the React key warning is gone).
12. **Scenes.**
    - AC-12.1: every view renders the environment from §4 (`data-env` attribute); no two Workspace, Execution or Communication views share an environment id (quiet pattern screens may share).
    - AC-12.2: sacred text appears in exactly the 4 placements of §9.4.
    - AC-12.3 (review round 3 M3): from the seed, the Dashboard Reflection shows exactly the `reflectionFor` lines "Operations is 31 points behind Marketing.", "2 missions are overdue or blocked across 2 departments." and "A short check-in with each Task Owner may unblock them." After task 9 is completed and task 6 is archived it shows "Nothing is overdue or blocked." "Review deadline watch" moves focus to the "Deadline watch" heading (`document.activeElement.id === "deadline-watch"`), which is in the viewport.
13. **Behaviour preserved.**
    - AC-13.1: every action in the §13.3 scripted sequence produces the same audit-log action strings as the baseline, except the deliberate renames in §12.3: "Employee suspended" → "Employee deactivated", "Employee reinstated" → "Employee reactivated", plus the new "Employee restored". These are classified as sensitive.
    - AC-13.2: "Remove profile" never shortens `profiles`. The person reappears under "Show removed" and can be restored. The current user's row has no Deactivate or Remove action.
    - AC-13.3: after removing Priya Nair, the Employee Attendance Summary CSV has no Priya Nair row (a Deactivated person still has one), ⌘K "Priya" finds no person until Show removed is on, and Add employee with the name " priya nair " is refused with "A profile for Priya Nair already exists. Restore it from Show removed." with no new profile and no React key warning.
   - AC-13.4: event-plan tasks show the Task Source badge "Event task"; other `Responsibility` tasks show "Project responsibility" (F13).
   - AC-13.5: in the Delete confirm of an archived task there is no Archive action; Archive and Delete both close the task dialog, and the next "Create mission" opens an empty draft.
14. **Setu truthfulness.**
    - AC-14.1: the Projects cards show 34% / 0% / 24% from the seed, with "From n linked task(s)". No card claims a task count that the data does not have.
    - AC-14.2: the `selectors.test.ts` monotonicity tests pass (completion never lowers `journeyPct` or any `projectProgress`).
    - AC-14.3: the `assets.test.ts` crop tests pass for desktop and mobile.
15. **Primary actions.** AC-15.1: the topbar "Create mission" button is present on My Day, MOM Directory, Event Planner, Yearly Calendar, Notices & feedback, Dashboard and Guide, and absent on every other view. ⌘K lists a "Create mission" command. My feed, Department and Projects each show "Create mission" as their page primary.
16. **Counts and notifications.** AC-16.1: from the seed, the My feed nav badge reads 6 (`aria-label="6 reminders"`) and the bell reads 7 (`aria-label="Notifications, 7 unread"`); marking a reminder read lowers both by 1; a handover raises the bell by 1. AC-16.2: the open NotificationsPopover has `aria-modal="true"` and keeps Tab focus inside (it is part of AC-4).
17. **Splash a11y.** AC-17.1: no element inside the aria-hidden splash overlay is in the tab order (`tabIndex=-1` on Skip); axe-style check "aria-hidden-focus" passes.
18. **Production build check** (not a deployment design; §16 increment 6). AC-18.1: the increment 6 production build check passes (build, start on a free port, `GET /` 200, all views load from the built assets with 0 console errors); the Docker build passes or is reported as not verified with the reason.
19. **My Day (round 4).**
    - AC-19.1: the band shows "My Day" once as H1, with the eyebrow "Daily Dharma" and the privacy line; the date picker defaults to 2026-10-05 and the page eyebrow reads "Monday, 5 October 2026" (F21); the Top 3 heading reads "Today's three arrows", and "Three arrows for 20 Oct" after picking 2026-10-20.
    - AC-19.2: every My Day field has a label; every control is ≥ 44 px tall at 390×844; no text under 12 px; 0 contrast failures.
    - AC-19.3: Edit on a time block keeps it in the list; Cancel restores it unchanged; Save keeps its position (F19). After saving a review, clearing a field and saving again stores an empty field (F20).
    - AC-19.4: after adding a unique Top 3 string, the string appears in no other view, in no ⌘K result and in no audit or notification entry; `boundary.test.ts` passes.
    - AC-19.5: after task 1 is added to My Day and handed over to Neha Kapoor, its My Day row reads "Handed over to Neha Kapoor. It stays here until you remove it." (F24).
20. **Blocker check-in (round 4).**
    - AC-20.1: the check-in is closed by default on every card; its reasons expose `aria-pressed`, and the recorded one also has a check icon; the context field has a label.
    - AC-20.2: recording a reason shows the `BlockerLine` "Not moving: …" with the Sanjeevani glyph; "It's moving again" removes it and logs "Task blocker cleared"; completing a task clears its check-in, and reopening does not bring it back (F22).
    - AC-20.3: the Dashboard panel reads "40% of delayed tasks with a check-in are waiting for someone." and "5 open tasks with a delay signal · 5 check-ins" from the seed; with no check-ins it shows the §9.2 empty state.
21. **Dependencies (round 4).**
    - AC-21.1: task 10 reads "Waiting on Approve admission campaign poster · Blocked", task 12 "Waiting on Make school follow-up calls · Not started", and task 9 "1 task waits on this one: Send approved poster to schools". A card counts direct dependents only; the Dashboard groups the whole chain (AC-21.2).
    - AC-21.2: the Dashboard panel shows one group "Held at Approve admission campaign poster · Blocked · Arjun Mehta (you)" with 3 waiting tasks and a 5-stone `ChainSetu` whose `aria-label` reports "1 of 5 stones placed"; no row says "Campaign delayed".
    - AC-21.3: the "Depends on" select's accessible name is "Depends on" and its hint is linked by `aria-describedby`; a task that depends on an open task still completes (the copy says it only waits, F18); deleting task 9 asks for confirmation mentioning "1 task that waits on it", and afterwards task 10 has no "Waiting on" line (F23).
22. **Task Handover (round 4).**
    - AC-22.1: "Hand over task…" in the More menu opens a `role="dialog"` with focus on "New Task Owner"; Escape closes it and returns focus to the More button; Tab stays inside for 25 presses; "Hand over mission" is visible without page scroll at 390×844 and 1280×800.
    - AC-22.2: on task 4 the New Task Owner field starts empty, and submitting it shows "Choose who takes over this mission." with no state change (D1).
    - AC-22.3: handing task 2 to Manav Shah shows "Mission handed over to Manav Shah · from Neha Kapoor", the audit entry "Task handed over · From Neha Kapoor to Manav Shah", one new notification, the toast "Mission handed over to Manav Shah." (after the dialog closed), and Manav Shah is no longer listed as a Contributor (D2, D4).
    - AC-22.4: from the seed, task 2's card reads "Mission handed over to Neha Kapoor · from Aditi Rao" (D3); handing task 1 to Karan Joshi removes it from Today's Mission (the card shows 2 active missions at 30% = (0+60)/2) and from the My open tasks tile.
23. **Seed and clock (round 4).** AC-23.1: tasks 8 and 12 show the Angad badge and 9–11 the Sugriv badge (F16); every audit, completion, check-in and handover timestamp reads "05 Oct 2026, …" (F21).

## 17. Out of scope / backlog

| Item | Reason |
|---|---|
| Painted character artwork (Rama, Hanuman, Jambavan, Sugriva, the Sena) | Needs a commissioned artist; the slots are ready (§6). |
| Persistence, server-side auth and authorization, uploads, email digest | Already listed in the handoff document as the production path. The access controls stay cosmetic and are flagged as a security gap. |
| "New project" creation, real event editing (F5), workspace settings | No data model or decision on behaviour yet. |
| URL routing per view | Changes navigation behaviour; deferred. |
| Dark theme | The brief asks for light, warm surfaces; tokens are structured so it can be added later. |
| Section 26 checklist items after "user …" and the deployment instructions | Truncated in the user's message; the audit covers the functional items that were readable. No deployment design is proposed. |
| A stored handover history on the task (`handovers: TaskHandover[]`) | The audit log already keeps every "Task handed over" entry. A list on the task is a data-model change best made together with the server-side `task_handover` table the handoff describes. |
| A Projects entry for "Admission Campaign" (or Projects derived from `task.project` values) | The seed's `projects` list has 3 entries and the redesign does not change seed data beyond F16/F17(f). Today the chain has no project Setu; its `ChainSetu` on the Dashboard covers it. |
| Gating completion on dependencies | The delta explicitly keeps completion rules unchanged; the copy now says "waits" (F18). A product decision, not a design one. |
| My Day persistence, per-user ownership on the server, and real local dates | Production work listed in the handoff (point 9); `todayIso()` is the single switch (§11 IA-10). |
| A My Day summary on My feed | Not needed to fix any finding, and it would put private data on a shared-looking screen. |
| Handover recipients and pickers from active profiles | Same backlog item as `staffOptions` (round 2); the static list is kept. |

## 18. Assumptions

- My feed is the "first screen / landing" (section 5). The app has no unauthenticated landing route, so the hero lives on My feed rather than a new route. The hero's full height (360 px) shows on My feed only.
- "Mission" language is used for CTAs and headings while the approved compound labels keep "task" (Task Owner, Task Family, Task Source), per section 18's "retain standard terminology if users may become confused".
- The interpretation of the Setu stage at 80–100% is in §10.
- The current user is Arjun Mehta, Department Head, Academic, as the seed implies. "You" in seed data is an alias for him.
- Mocks use Google Fonts for convenience. The app will self-host via `@fontsource` (§3.1).
- Project progress is computed from linked tasks (§10.1). Users who prefer the planned seed numbers would see them only for projects with no linked task. This is the one interpretation in round 2 that the user may want to confirm.
- Removed employees are a new third `access` value. No migration is needed, because the prototype has no persistence.
- Round 4: the seed clock is 05 Oct 2026 (it already was for completions, audit entries and check-ins). Absolute seed due dates such as "30 Sep" and "03 Oct" are kept as seed strings and are not reinterpreted as overdue; only "Overdue by …" counts as overdue, as today.
- Round 4: "My Day", "Depends on", "Why is this task not moving?" and "Task Handover" are the delta's own labels and are treated as approved functional labels, like the ones in `docs/jambavan-standardization.md`. "Hand over task", "New Task Owner" and "Hand over mission" reuse the approved "Task Owner" term.
- Round 4: whoever can see a task can report a check-in on it (as today); only who may hand over is gated (F17g). Both are UI-only until the server enforces them.

## 19. Mocks

| Mock | File | PNGs |
|---|---|---|
| (i) My feed: Ayodhya-dawn hero (scrim contract, one primary, lede "3 active missions are on your path today."), Today's Mission card (43%, "3 active missions · 0 completed today") plus 3 computed tiles (4 "2 due today" · 2 "1 overdue · 2 blocked" with the Sanjeevani glyph · 9), nav with My Day (`Sunrise`), badge 6 and bell 7, family tabs (12 · 2 / 4 / 5 / 1 after F16), 4 TaskCards with the same top row and action row: MOM/Squirrel task 1 with its "Not moving: Waiting for information" line, the closed check-in disclosure and "Add to My Day"; HANUMAN with Lanka strip and Setu; Blocked Sugriv task 6 with the Sanjeevani glyph before "Overdue", its "Not moving: Unexpected issue" line and the Team task meta item; Sugriv task 10 with "Waiting on Approve admission campaign poster · Blocked" and a 5-stone `ChainSetu sm`; PriorityBadge; notices rail with "Seen by me" | `mocks/mock-1-home-feed.html` | `mocks/mock-1-home-feed@desktop-1280.png`, `mocks/mock-1-home-feed@mobile-390.png`, `mocks/mock-1-home-feed@laptop-1024.png`, `mocks/mock-1-home-feed@landscape-844x390.png` |
| (ii) TaskCard expanded details for seed task 4 (Squirrel, Manual task, Private, Parent Connect, owner "Arjun Mehta (you)" with stored initials "YO", contributor "You", no subtasks or files yet, file actions in Details) with the open More menu (Hand over task…, Archive), "In My Day" pressed, a recorded check-in ("Not moving: Too much other work") and the open check-in disclosure (reason toggles with `aria-pressed` and a check icon, labelled context field, "It's moving again"); completed task 1 with the data-backed reward panel (October Launch 34% → 50%, "Today's journey is now 53%"); toast "Today's journey moved to 53%"; empty state; Create mission dialog with validation error, the family radio group with **Squirrel** selected (the draft default), the contributor hint, the single "You (Arjun Mehta)" owner option, the new "Depends on" field with its hint, sticky footer | `mocks/mock-2-taskcard-create-mission.html` | `mocks/mock-2-taskcard-create-mission@desktop-1280.png`, `mocks/mock-2-taskcard-create-mission@mobile-390.png` |
| (iii) Projects: Setu-shore band ("Each completed task moves the Setu forward.") with the "Create mission" page primary (IA-5), 3 data-backed project Setus (34 / 0 "Ready for the first stone" / 24, "From n linked task(s)" with no suffix, "{open} open · {done} completed", "View tasks" with `ArrowRight`), reference strip of all 6 Setu states using the boundary values 2% (1 stone) and 99% (19 stones, not joined), Dashboard preview (institute Setu 69%, department pulse drawn with `RamSetuProgress sm`, Jambavan Reflection on the dark scrim contract with the `reflectionFor` seed lines and the "Review deadline watch" button), Sanjeevani "Needs attention: 0" tile, "The Setu has not yet begun" empty state | `mocks/mock-3-projects-dashboard-setu.html` | `mocks/mock-3-projects-dashboard-setu@desktop-1280.png`, `mocks/mock-3-projects-dashboard-setu@mobile-390.png` |
| (iv) **New in round 4.** My Day: `vanvas-ashram` band (eyebrow "Daily Dharma · Monday, 5 October 2026", H1 "My Day" once, privacy line, labelled "Plan for" date and "Today"), "Today's three arrows" (1 of 3, arrow → target icons), "My schedule" with a block being **edited in place** and Cancel / Save block, "Academy tasks in My Day" with a handed-over row ("Handed over to Karan Joshi. It stays here until you remove it."), "Personal actionables" with a labelled 2×2 form, "End-of-day review". Dashboard leadership panels: "Why are open tasks not moving?" (Sanjeevani, "40% … waiting for someone.", reason bars with count and % as text, "5 open tasks with a delay signal · 5 check-ins") and "Where the Setu is waiting" (one bottleneck group, 5-stone `ChainSetu md`, ordered list). Task Handover: the dialog on task 4 showing the D1 fix (New Task Owner empty with "Choose who takes over this mission."; prefilled fields; scrolling body; sticky "Hand over mission"), and task 2 after a handover to Manav Shah ("Mission handed over to Manav Shah · from Neha Kapoor · created by Arjun Mehta (you)", package expanded, Manav no longer a contributor) with the toast | `mocks/mock-4-my-day-handover.html` | `mocks/mock-4-my-day-handover@desktop-1280.png`, `mocks/mock-4-my-day-handover@mobile-390.png` |

Mock self-check (round 4; all 10 PNGs regenerated with `audit-tools/mockshots.mjs`, which now also reports card heights, text under 12 px and tap targets, and checked with `audit-tools/scrimaudit.mjs`, which now includes mock 4):
- Computed contrast: 0 failures in every capture (153, 126, 153, 124, 107, 107, 105, 75, 194 and 166 text nodes checked).
- No horizontal overflow at 1280, 1024, 844×390 or 390, for all four mocks.
- No visible text under 12 px in any mock.
- Scrim pixel audit: 0 failures at 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900 for mocks 1, 3 and 4; worst case 5.14:1 (mock 1), 6.00:1 (mock 3) and 6.00:1 (mock 4, the band eyebrow).
- First task card in mock 1: 899 px at 1280×800 and 1612 px at 390×844 (AC-9.3 limits 960 and 1750). Hero height at 844×390: 205 px.
- Tap targets: the mocks draw `sm` buttons (36 px) and toggles (40 px) at every width, so 25 of 43 controls in mock 1 at 390 px are under 44 px. The spec's rule (§3.5 Button: `sm` renders 44 px below 1024 px) is authoritative; no mock control is under 24 px.

Round 3 self-check (kept for reference; re-run with `audit-tools/mockshots.mjs` and `audit-tools/scrimaudit.mjs` after the round 3 mock fixes; all PNGs regenerated):
- Computed contrast: 0 failures in every capture (125, 99, 125, 97, 86, 86, 104 and 75 text nodes checked).
- Scrim pixel audit: 0 failures at 390×844, 768×1024, 844×390, 1024×768, 1280×800 and 1536×900 for mocks 1 and 3; worst case 5.14:1 (mock 1) and 6.00:1 (mock 3, including the new band button).
- `jambavan-mock-art.js` now uses the §10.2 `setuStones` rule, and its `aria-label` reports the same stone count.

Round 2 self-check (kept for reference):
- Computed contrast: 0 failures in every capture (116, 90, 116, 88, 90, 90, 103 and 74 text nodes checked).
- No horizontal overflow at 1280, 1024, 844×390 or 390.
- Scrim pixel audit: 0 failures at six sizes for both scene mocks; the worst case is 5.14:1.
- Fonts: Mukta and Cormorant Garamond load everywhere. Tiro Devanagari Hindi loads wherever sacred text is visible (it is in the sidebar footer, which is hidden below 1024).
- First task card: 899 px at 1280×800 and 1588 px at 390×844. Hero height: 205 px at 844×390.

Shared mock assets: `mocks/jambavan-mock.css` (tokens, components, scrim contract, landscape rule; round 4 adds BlockerLine, check-in, DependencyLine, HandoverLine, package, reason toggles, menu and status chips) and `mocks/jambavan-mock-art.js` (icon sprite including signal bars, Sanjeevani and, in round 4, Sunrise, ArrowRight, the handover relay and moon-and-cave; environment SVG builders including the new `vanvas-ashram`; `setuSvg(value, from)`; and the new `chainSvg(states, focus)` for `ChainSetu`). The mocks stop short of the mobile drawer and dialog-sheet states; those follow §3.5.

**Spec wins over mocks** (review N13). The mocks are illustrations; where a mock and this document differ, this document is authoritative. The round 1 deviations the review listed are fixed in the round 2 mocks: avatar and pill text is now ≥ 12 px with 13 px initials; the empty-state extra sentence, the lede em dash and the undefined "Today's missions" button are removed; "Seen by me" is added. Round 3 fixed every deviation the round 2 review listed (N8, N9): nav badge 4 and bell 5 in mocks 1 and 3 (6 and 7 since round 4); mock 3's Projects band has its "Create mission" primary; mock 2's expanded card is seed task 4 exactly (Squirrel / Manual task, contributor "You"); task 1 in mock 1 is no longer "Acknowledged"; mock 3's department pulse uses `RamSetuProgress sm`; the Sugriv card in mock 1 has the More menu and Mark seen / Acknowledge. Round 4 fixed the four details the round 3 review listed (N8): mock 3's caption no longer says "(HANUMAN mission)", "View tasks" uses `ArrowRight`, mock 2's fresh dialog selects Squirrel, and the meta-row spec now lists "Team task" (§3.5). Remaining deliberate simplifications: the reward panel is shown statically; mock 4 shows the handover dialog and its result side by side, and shows the dependency and blocker panels as a Dashboard preview inside the My Day mock; the mocks use Google Fonts (the app self-hosts, §3.1); the mobile drawer and dialog-sheet states are not mocked (they follow §3.5); mock 3's 6-card "Ram Setu stages" strip is a design reference, not a product screen.

## 20. Responses to design review (round 1 → round 2)

Every finding in `design-review.json` is addressed. None is ignored. One is addressed with a deliberate variant (H3 formula), which is explained.

| ID | Response | Where |
|---|---|---|
| H1 | **Addressed.** (Seed numbers superseded in round 3 by the HANUMAN exclusion, §21 M1.) Today's Mission, `journeyPct`, `activeCount`, `completedToday` and the milestone trigger are defined exactly as the review proposed, with a single seed clock (`state/clock.ts`). Numerals are used in the lede and card. Monotonicity and the 31 → 41 example are unit-tested. | §11 IA-7, §8, §9.1, §15, AC-6.4 |
| H2 | **Addressed.** The numeric scrim contract (0.96 to `--text-zone-end` 56%, copy `min(560px, 54%)`; dark 0.92), with phones putting the art above the copy. The pixel-based audit is implemented (`audit-tools/scrimaudit.mjs`): the revised mocks score 0 failures (worst 5.14:1) at six sizes, and a negative control with the round 1 scrim fails (down to 1.37:1). The `data-scrim` compositing claim is removed. | §5, §15, AC-1.2, mocks |
| H3 | **Addressed, option A with one variant.** Project Setus are computed from linked tasks; a "Planned estimate" fallback covers unlinked projects; the copy is "Each completed task moves the Setu forward"; the micro-reward animates the Setu that actually changed (`from → to`). Variant: the progress-weighted mean instead of `done/total`, because `done/total` shows 0% for all three seed projects and ignores logged progress. It is still monotonic under completion, which was the review's requirement. | §10.1, §8, §9.1, AC-14.1, mocks 2 and 3 |
| M1 | **Addressed.** The field-by-field merge table is adopted. It also covers `initials`, `updates` on the toggle, duplicate subtask titles, and contributor drops when switching to Squirrel or Angad (with a dialog hint). Tests are listed. | §12.1, AC-5.7 |
| M2 | **Addressed.** One owner option; writes keep "You"; reads go through `isCurrentUser`; `displayName` gives "Arjun Mehta (you)"; tests include `pendingAcknowledgementCount` with both aliases. | §12.2, AC-5.8, mock 2 |
| M3 | **Addressed.** (Wording superseded in round 4, §21.1 M2: the picker writes `category` with all of today's side effects.) The radio group sets only `category` (today's side effects kept); the source and toggle coupling is unchanged; the card copy comes from the standardization doc. | §9.1, AC-5.9, mock 2 |
| M4 | **Addressed.** `legacy-aliases.css` comes in increment 1 and is deleted in increment 6; `setu.ts`, `RamSetuProgress` and the selectors move to increment 1; increment 5 is adoption only. | §3.2, §13.2, §16 |
| M5 | **Addressed.** All 16 listed pairs plus 6 more were recomputed and added (`contrast.mjs` re-run). stone-600 on cream-200 and on maroon-50 is limited to ≥ 14 px. The invariant now reads "allowlist test + browser audit is the enforcement". | §3.2, §14.3, AC-1.1 |
| M6 | **Addressed.** The four mobile text zones are now `.04,.80,.92,.18`; null text zones are allowed; the test checks desktop and mobile. The mobile scrim fade is narrowed to that same bottom 20%. | §6.3, §5, AC-14.3 |
| M7 | **Addressed.** In-dialog failures use InlineError (`role=alert`); a `notify()` router never toasts while a dialog is open; sonner keeps its default z-index; "below dialogs" is removed. | §3.5, §9.3, §14.1, §14.3, AC-6.6 |
| M8 | **Addressed.** No auto-close; a `celebrated` Set with keys `hanuman:{id}` (cleared on reopen) and `today:{TODAY_LABEL}`; static under reduced motion. | §8, AC-6.5 |
| M9 | **Addressed.** The topbar "Create mission" appears only on MOM Directory, Event Planner, Calendar, Notices, Dashboard and Guide; ⌘K has the command. | §11 IA-5, AC-15.1 |
| M10 | **Addressed (option a).** The hero's secondary button is removed from the spec and both mocks. | §9.1, mock 1 |
| M11 | **Addressed.** `needsAttention` is the union count (seed 1, subline "1 overdue · 1 blocked"); "Completed" is folded into the Today's Mission card; spec and mock both show 1 card + 3 tiles. | §11 IA-7, §9.1, mock 1 |
| M12 | **Addressed.** Soft removal (`access: "Removed"`, Show removed, Restore profile) behind an AlertDialog; no hard delete; audit strings renamed to deactivated/reactivated/restored; `sensitiveAuditActions` and AC-13.1 updated. | §12.3, AC-13.1, AC-13.2 |
| M13 | **Addressed.** 1024×768 and 844×390 are added to the audit matrix and AC-9; the `max-height: 520px` rule is specified and mocked (hero 205 px at 844×390, PNG captured). | §3.4, §15, AC-9.1/9.2/9.4 |
| M14 | **Addressed.** The rows are split. While checking, I found that People has no search field today, so the "no one matches" row applies to the person results in ⌘K. No People search is invented. | §9.2, §11 IA-6 |
| M15 | **Addressed.** The full filter reset includes `projectFilter`; `archiveFilter` follows `task.archived`; scroll and focus the `h3`; an Archived badge shows in results. | §11 IA-6, AC-5.10 |
| M16 | **Addressed.** `pointer-events:auto`; the first pointerdown or key only dismisses (capture phase, no pass-through); AC-8.2 is reworded. | §8, §14.3, AC-8.2 |
| N1 | **Addressed.** `git init` and a baseline commit start increment 0 (local only; `.env` is already ignored). | §12, §16 |
| N2 | **Addressed.** Reworded to the AC-12.1 scope; the count is fixed to 13 environment ids. | §4, §16 |
| N3 | **Addressed.** The wordmark is 20–22 px. | §3.3 |
| N4 | **Addressed.** 768 everywhere; 640 is not used. | §3.4, §3.5 |
| N5 | **Addressed.** `.01ms !important` durations plus `iteration-count: 1`. | §8 |
| N6 | **Addressed.** `theme="light"` on the themed Toaster. | §3.5 |
| N7 | **Addressed.** The message now reads "…starts with http:// or https://". | §9.3, §14.2 |
| N8 | **Addressed.** The High-priority `MissionArrow` nudge on TaskCard; the Dashboard "Victories this week" reward card with the Diya and gold tint; the Sanjeevani tile for "Needs attention: 0" (mocked in mock 3). | §3.5, §9.1, §9.2, §6.3 |
| N9 | **Addressed.** The attachment actions live in Details only; More = Archive/Restore. | §3.5 |
| N10 | **Addressed.** PriorityBadge is a square-cornered outline chip with signal bars, `aria-label="Priority: …"`, and earth-700 for Medium (no saffron). | §3.2, §3.5, mocks 1 and 2 |
| N11 | **Addressed.** All 16 modal surfaces are enumerated in AC-4. | AC-4 |
| N12 | **Addressed.** The `--jb-*` prefix is specified; the grep adds `--saffron\b` and word boundaries. | §3.2, AC-1.3 |
| N13 | **Addressed.** The mocks are fixed, and "spec wins" is stated. | §19 |
| N14 | **Addressed.** No sort controls exist and none are added; lists stay newest first. | §11 IA-9 |

Backlogged as a result of this round (with reasons): deriving `staffOptions` from active profiles (it would change who appears in pickers; today it is a static list); a People search field (not in the app today; not needed to fix any finding).

## 21. Responses to design review (round 2 → round 3)

All 22 findings in the round 2 `design-review.json` are addressed; none is backlogged or ignored. Two are addressed with a small, explained variant (M2 return type, M5 `celebrationFor` return type).

| ID | Response | Where |
|---|---|---|
| M1 | **Addressed (option a).** `todaysMission` excludes `longRunning`; a separate `myOpenTasks` selector feeds the tile (seed 3). New seed numbers everywhere: lede "2 missions need you today", card 34% "2 active missions · 0 completed today", after task 1: 50%, "1 active mission · 1 completed today", toast 50%. Trigger (b) now fires on its own (tasks 1 and 4). Mocks 1 and 2 updated. | §11 IA-7, §9.1, §8, §15, AC-6.4, AC-6.5, mocks 1–2 |
| M2 | **Addressed, with one variant.** `Project` type (fields checked against the seed, including `tasks`), `projectFor`, optional `seed`, and the reward uses the project Setu only when `projectFor` is non-null. Variant: `journey` is also nullable (`null` for HANUMAN missions, which are no longer in Today's Mission after M1), so the copy never claims "Today's journey moved from 34% to 34%". Four copy variants are written out. Test for an event task not in `projects`. | §8, §10.1, §13.2, §15 `tasks.test.ts`, AC-6.8 |
| M3 | **Addressed.** Pure `sourceLabel(task)` exactly as proposed, listed as F13 (display-only), unit-tested, used by SourceBadge. | §12 F13, §3.5, §15, AC-13.4 |
| M4 | **Addressed.** New `setuStones` rule with the 1/2/97/98/99/100 boundaries plus a "20 stones ⇔ complete" property test. The mock renderer uses the same rule, and mock 3's stage strip now shows the 2% and 99% boundaries. | §10.2, §15, AC-7.1, mock 3 |
| M5 | **Addressed, with one variant.** Pure `state/tasks.ts` (`completeTaskPure`, `setArchivedPure`), `state/people.ts` (`applyAccessAction`, `reportableProfiles`, `findDuplicateProfile`) and `state/celebration.ts` (`celebrationFor`, `onReopen`); the hook keeps its handler names and delegates. `tasks.test.ts`, `people.test.ts` and `celebration.test.ts` are listed. Variant: `celebrationFor` returns `keys: string[]` so both keys are recorded when both triggers fire at once. | §13.1, §13.2, §15 |
| M6 | **Addressed.** `attendanceReportRows` uses `reportableProfiles` (Removed out, Deactivated in); Add employee rejects duplicate names (trimmed, case-insensitive, Removed included) with the two messages; ⌘K excludes Removed unless Show removed is on. All other `profiles` readers were grepped and listed. Tests and AC-13.3 added. | §12.3, §14.2, §14.3, §11 IA-6, §9.3, §15, AC-13.3 |
| N1 | **Addressed.** "Every write keeps its current literal, per call site", with the call sites that write "Arjun Mehta" named. | §12.2 |
| N2 | **Addressed.** `initials` kept when the owner is unchanged; task 4 added to the no-op test and AC-5.8. | §12.1, AC-5.8 |
| N3 | **Addressed.** `value = isCurrentUser(draft.assignee) ? draft.assignee : "You"`; the widening from 5 hard-coded owners to 11 options is listed as F15. | §12.2, §12 F15, §9.1, AC-5.8 |
| N4 | **Addressed.** Non-toggling `setArchived(id, true)`, Archive hidden for archived tasks, both actions close through `closeTaskDialog()`. | §12.3, AC-13.5 |
| N5 | **Addressed.** Skip gets `tabIndex={-1}`; the overlay stays aria-hidden; AC-17.1 and an audit assertion added. | §8, §15, AC-17.1 |
| N6 | **Addressed.** `<Popover modal>` specified. | §3.5 Topbar |
| N7 | **Addressed (second option).** `useRegisterOpenDialog(open)` for legacy modals in increment 2, so AC-6.6 holds from increment 2. | §3.5 Toasts, §14.3, §16 increment 2, AC-6.6 |
| N8 | **Addressed.** Bell N = unread reminders + unread app notifications (seed 5); nav badge = unread reminders (seed 4); mocks 1 and 3 fixed. | §3.5, §11 IA-7, AC-16.1, mocks |
| N9 | **Addressed by fixing the mocks** (all five items), not by listing them. | §19, mocks 1–3 |
| N10 | **Addressed.** Every slot row has desktop/mobile pairs, null text zones are `null`, and avatars moved out of the slot table into `avatarOverrides`. | §6.3 |
| N11 | **Addressed.** Listed as F14, landing in increment 3 after the equivalence gate; AC-6.7. | §12 F14, §14.1, §16, AC-6.7 |
| N12 | **Addressed.** `exports.ts` moves verbatim in increment 0; try/catch lands in increment 5. | §13.1, §14.1, §16 increment 5 |
| N13 | **Addressed.** Reworded to "milestone celebration, major milestones only, always dismissible"; no preference added, with the reason. | §8 |
| N14 | **Addressed.** "Until the card unmounts (filter or view change) or the task is reopened". | §3.5, §8 |
| N15 | **Addressed.** Desktop = ≥ 1024 px; `sm` renders 44 px below that. | §3.5 Button |
| N16 | **Addressed.** Production smoke test in increment 6 (build, `PORT=3100` start, `GET /` 200, view sweep on the built server, Docker build with the frozen-lockfile note) and AC-18.1. | §16 increment 6, §15, AC-18.1 |

### 21.1 Responses to design review (round 3 → round 4)

All 12 findings in the round 3 `design-review.json` (0 HIGH, 3 MEDIUM, 9 NIT) are addressed with the exact fix the review gave. None is backlogged or ignored. The only adaptations are where the round 4 seed (tasks 8–12) changed a number the review quoted, and the review's intent is kept in each case.

| ID | Response | Where |
|---|---|---|
| M1 | **Addressed exactly.** `completeTask` computes `celebrationFor(...)` first and calls `notify()` only when it is `null`. `useRegisterOpenDialog` calls sonner `toast.dismiss()` on the 0 → 1 transition. AC-6.6 now covers "toasts created just before it opened". The §8 Complete task row says "Toast only when `celebrationFor` returns null". Adaptation: the review's audit case "complete task 1 then 4" becomes "complete tasks 1, 4 and then 9", because task 9 joined Today's Mission. The task 7 case and a "complete, then Edit within 5 s" case were added. | §3.5 Toasts, §8, §14.3, §15, §16 inc. 2 and 3, AC-6.5, AC-6.6 |
| M2 | **Addressed exactly.** `isHanumanMission = (t) => t.longRunning === true` in `state/selectors.ts` is used for `todaysMission`, celebration trigger (a) (with `category === "HANUMAN"` dropped), the TaskCard HANUMAN variant and the §8 copy-variant comments. FamilyBadge keeps `category`, and `sourceLabel` keeps `kind`. §9.1 now says the picker "writes `category` with today's side effects verbatim … HANUMAN also sets `longRunning: true` and `kind: "HANUMAN"`". The tests cover a `category: "HANUMAN"` task without `longRunning`: it is in `todaysMission`, never triggers `hanuman`, and has a non-null `journey`. | §11 IA-7, §8, §3.5 TaskCard, §9.1, §15 |
| M3 | **Addressed exactly.** `reflectionFor(depts, tasks)` is in `state/selectors.ts`, with the review's code verbatim (tie-break by name, zero case, singular and plural, "sits with" only for one department). "This week" is dropped. "Review deadline watch" is a `secondary` button that scrolls to and focuses the Deadline watch heading (now `Home.tsx:1181`). AC-12.3 and unit tests are added. Adaptation: on the round 4 seed the function returns "2 missions are overdue or blocked across 2 departments.", because task 9 is Blocked. The review's single-mission lines are what it returns once task 9 is completed, and both are tested. AC-12.3 reaches "Nothing is overdue or blocked." after completing task 9 and archiving task 6. Mock 3 shows the new lines. | §9.1, §9.4, §11 IA-7, §13.2, §15, AC-12.3, mock 3 |
| N1 | **Addressed (reworded).** The lede is "{n} active missions are on your path today." / "1 active mission is on your path today." (seed: 3). AC-6.4 and mock 1 are updated. | §9.1, AC-6.4, mock 1 |
| N2 | **Addressed exactly.** `mergeTaskEdit(existing, draft, ctx: { departmentOf, nextId })`. The store passes the `profiles` lookup and `Date.now() + Math.random()`, and the tests pass stubs. | §12 F1, §12.1 |
| N3 | **Addressed exactly.** "`isTeamTask` changes only the Team task pill on edit; `team` and `visibility` never change through edit", plus the edit-mode hint "Visibility is set when the mission is created." and a unit test. | §12.1 |
| N4 | **Addressed (first option).** Increment 2 adds the `projectFilter` state (null, no UI) and the `notices` ViewKey, with `NoticesView` rendering today's notice and feedback markup verbatim until 4c. | §16 increment 2 |
| N5 | **Addressed exactly.** The text uses `keys: ["hanuman:7"]` and `keys: ["today:05 Oct 2026"]`, and the store adds every returned key to `celebrated`. | §8, §13.2, §15 |
| N6 | **Addressed exactly.** AC-6.7 is a `tasks.test.ts` assertion (`result: null`, same `tasks` reference), and the store calls `logActivity` and `notify` only when `result !== null`. | AC-6.7, §15 |
| N7 | **Addressed exactly.** AC-9.3 now precedes AC-9.4, and AC-13.3 is indented like its siblings. | §16 AC-9, AC-13 |
| N8 | **Addressed by fixing the mocks and the spec.** Mock 3's caption suffix is removed, "View tasks" uses `ArrowRight`, mock 2's fresh dialog selects Squirrel, and the §3.5 meta row lists "Team task (when `isTeamTask`)". | §3.5, §7, §19, mocks 2 and 3 |
| N9 | **Addressed exactly, and extended to the new rescue moment.** The aria-hidden Sanjeevani glyph sits next to "Overdue" on the Needs attention tile when the count is > 0 and on overdue High-priority cards. It is also on the card `BlockerLine` and in the "Why are open tasks not moving?" panel header (brief §7: Sanjeevani = rescue). | §3.5, §6.3, §7, §9.1, mocks 1 and 4 |

## 22. Changes for checkpoint 5f248af

### 22.1 What changed in the app, and what this proposal now does about it

The delta (`delta-update-report.md`) replaced `Home.tsx`, `index.css`, `plan.md` and `DEVELOPER_HANDOFF.md` and added four front-end-only features. It also added five seed tasks (8–12, the Admission Campaign chain) and blocker check-ins on tasks 1, 2, 3, 6 and 9.

| Feature | In the app today | In the redesign |
|---|---|---|
| My Day | A private, date-based planner view in Workspace (Top 3, schedule blocks, personal actionables, links to own tasks, end-of-day review) | It stays in Workspace, second (IA-10), with the `Sunrise` icon and its own `vanvas-ashram` environment (§4). The copy is "Daily Dharma" and "Today's three arrows", and the functional labels stay plain (§9.1). There is a privacy module boundary with a test (IA-10, §15), one clock (F21), in-place block editing (F19), a clearable review (F20), handed-over links marked (F24), labelled fields and 44 px controls (§3.5, AC-19). Mock 4. |
| "Why is this task not moving?" | A check-in disclosure on every open card (8 reasons, optional note) and a Dashboard aggregation | The card gets a Sanjeevani `BlockerLine` and a check-in disclosure that is closed by default, with `aria-pressed` reasons and a labelled note. The check-in can be cleared and is cleared on completion (F22). The Dashboard panel stays (IA-11), with a grammatical headline (`reasonPhrase`) and its own empty state (§9.2). Pure `state/blockers.ts`. Mocks 1, 2 and 4. |
| Task dependencies | A "Depends on" select with cycle prevention, "Blocked by" and "Downstream impact" card lines, and a Dashboard alert list | Setu stones placed in order: `ChainSetu` (§10.3), "Waiting on …" on the card, and the Dashboard grouped by the bottleneck stone ("Held at …"). Honest copy (F18; completion is not gated, as the delta specifies), a labelled field with a hint (D12), and links cleared when a task is deleted (F23). Pure `state/dependencies.ts`. Mocks 1, 2 and 4. |
| Task Handover | "Handover Task" on every open card; a package dialog; ownership moves to the recipient, with notification and audit | "Hand over task…" in the More menu (`canHandOver`), on the Dialog primitive (D10, D11). "New Task Owner" can only be someone else in the list (D1), `from` is the real previous owner and `createdBy` is the actor (D2), the recipient leaves Contributors (D4), and the seed package is corrected (D3). Card copy: "Mission handed over to {name}". Pure `state/handover.ts` (F17). Mock 4. |

### 22.2 Seed numbers that changed (recomputed from the new seed)

| Number | Round 3 | Round 4 | Why |
|---|---|---|---|
| Today's Mission set, `journeyPct`, active | tasks 1, 4 · 34% · 2 | tasks 1, 4, 9 · **43%** · 3 | task 9 is Arjun's, due Today, 60% |
| After completing task 1 | 50% · "1 active · 1 completed today" | **53%** · "2 active · 1 completed today" | (100+0+60)/3 |
| "today" celebration | after tasks 1 and 4 | after tasks **1, 4 and 9** | — |
| Lede | "2 missions need you today" | "**3 active missions are on your path today.**" | N1 + seed |
| My open tasks | 3 · "1 due today" | **4** · "2 due today" | + task 9 |
| Needs attention | 1 · "1 overdue · 1 blocked" | **2** · "1 overdue · 2 blocked" | task 9 is Blocked |
| Team follow-ups | 6 | **9** | + tasks 9, 10, 11 |
| Nav badge / bell | 4 / 5 | **6 / 7** | + tasks 9 (Today), 10 (Tomorrow) |
| Family counts (all tasks) | 2 / 2 / 2 / 1 of 7 | **2 / 4 / 5 / 1 of 12** | new tasks, after F16 |
| Reflection | "1 mission is overdue and blocked, and it sits with Operations." | "**2 missions are overdue or blocked across 2 departments.**" | task 9 (Academic) |
| Project Setus | 34 / 0 / 24 | **34 / 0 / 24** (unchanged) | "Admission Campaign" has no Projects entry |
| Institute completion | 69 | **69** (unchanged) | static department seed |
| Blocker panel | — | 5 delayed · 5 check-ins · 40% "waiting for someone" | new |
| Dependency panel | — | 3 waiting, 1 bottleneck (task 9) | new |

### 22.3 Home.tsx line references (old → new)

`completeTask` 578–583 → **678–683** (owner guard 680) · `createTask` 644–671 → **780–819** (edit spread 806; team/visibility 787/792) · `archiveTask` 683–689 → **820–826** · `reopenTask` 633 → **757** · `addTaskUpdate` / `addTaskSubtask` writes 703 / 712 → **840 / 849** · `attendanceReportRows` 571 → **671** · `profiles` readers 453/571/736/759/1027 → **502/671/881/904/1198** · `addEmployee` 746 → **891** · `EmployeeProfile.access` 82 → **85** · `sensitiveAuditActions` 527 → **627** · `projects` seed 306–310 → **349–353** · `departments` 291–296 → **331–336** · seed task 4 due 185 → **222** · draft default 503 → **561** · `createEventPlan` tasks 810 → **955** · assign-from-MOM 854 → **999** · nav badge literal 925 → **1080** · Deadline watch 1012 → **1181** · event modal 1040 → **1211** · task modal (category `onChange`) 1045 → **1216** · `meetings` ViewKey 63 → **64**, its titles → **1038, 1055**; `canManageCalendar` → **535** · `index.css:1167` unchanged. New code: `findBlockingDependency` 148–159, `plannerToday` 109, `categoryByTaskId` / `initialTasksWithCategories` 291–292, `addTaskToMyDay` 586, `openHandoverModal` 685–697, `createHandover` 698–707, `dependencyWouldCycle` 768–779, `reportTaskBlocker` 854–860, `blockerAnalytics` 1026–1031, page eyebrow date 1120, My Day view 1125–1137, dashboard panels 1183–1184, handover modal 1218. The round 2 and round 3 re-check paragraphs at the top and the §20/§21 tables keep the old numbers as a historical record.

### 22.4 Sections edited in round 4

Header · §1 · §2.4 and §2.5 (new) · §3.5 (TaskCard, Dialog, Navigation, Topbar, Toasts, new My Day and HandoverDialog components) · §4 (`vanvas-ashram`, 14 environment ids) · §6.3 (`hanuman.sanjeevani`) · §7 (new symbols, Sunrise, ArrowRight) · §8 (Complete task, Major milestone, three new rows) · §9.1 (lede, summary, tiles, family picker, Dashboard band, five new rows) · §9.2 (six new empty states) · §9.3 (new validation copy) · §9.4 · §10.3 (new) · §11 IA-5, IA-6, IA-7, IA-10 to IA-12 · §12 (F16–F24, F1 signature, §12.1 merge table, §12.3) · §13.1 to §13.3 · §14.1 to §14.3 · §15 · §16 (increments 0–4a and 6, AC-3.1, AC-4, AC-5.3, AC-6.4 to AC-6.7, AC-9.3/9.4, AC-12.3, AC-13.3, AC-15.1, AC-16.1, AC-18, new AC-19 to AC-23) · §17 · §18 · §19 · §21.1 · §22.

What was not verified: real devices, a screen reader pass on the new dialogs (the keyboard and ARIA findings are from DOM measurements), and the redesign itself. Phase A changes no app code, so every "after" claim is a design target measured on the mocks, not on the app.

## 23. Approval gate decisions (user)

- (a) IA approved in full: IA-1 to IA-9 plus the round 4 IA-10, IA-11 and IA-12.
- (b) Hero headline is "Plan. Act. Complete." with the JAMBAVAN wordmark above it, and the supporting line "Inspired by the wisdom, courage and teamwork of the Ramayana." is kept. The H1 is updated in §4 and in mock 1's HTML. The mock 1 PNGs still show the old headline until they are recaptured.
- (c) The brief ends at §26, as received. There is no deployment work. Bug-audit coverage follows the existing plan.
- Design review round 4 findings R4-M1, R4-M2, R4-M3 and R4-N1 to R4-N9 are fixed before or within the increments they affect. The three MEDIUM findings are fixed before increment 3.
