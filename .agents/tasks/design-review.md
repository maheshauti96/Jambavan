# Design review: JAMBAVAN redesign proposal (Phase A, round 3)

Reviewed: `.agents/tasks/redesign-proposal.md` (round 3) against `.agents/tasks/redesign-brief.md` (sections 1–26), the mock PNGs (mock 1 at 1280 and 390, mock 2 at 1280, mock 3 at 1280), and the source in `jambavan-app/`: `client/src/pages/Home.tsx`, `package.json`, `vitest.config.ts`, `Dockerfile` and `server/_core/index.ts`. I re-read every round 3 claim against the code, re-derived the seed numbers, and spot-checked 22 contrast pairs with the WCAG 2.x formula. No builds or tests were run.

**Verdict: CHANGES_REQUESTED** (0 HIGH, 3 MEDIUM, 9 NIT)

Round 3 answers all 22 round 2 findings, and the answers hold up against the code:
- Today's Mission now excludes long-running work.
- `projectFor`, `sourceLabel`, the new `setuStones` rule, the pure `tasks`/`people`/`celebration` modules and the `Removed`-state consumers are all specified.
- The mocks now match the seed: nav badge 4, bell 5, task 4 as Squirrel / Manual task, task 1 not acknowledged, and the Projects band has its primary.

IA, data model, approved terminology, the artwork constraint (no figures, slots plus a manifest), the 4-layer backdrop, the 5-stage Setu and the empty, error and completion copy all still conform to the brief.

Three problems remain, and each is narrow:
- A completion that triggers the celebration overlay also fires a toast, which breaks the proposal's own "no toast over a dialog" rule.
- "HANUMAN mission" is defined three different ways.
- The Dashboard's Jambavan reflection sentence and its button have no specification.

---

## Findings

### MEDIUM

**M1. A celebrating completion fires a toast and opens the CelebrationOverlay together. This breaks AC-6.6 and the a11y rationale behind it.**
Where: §8, Complete task row ("Toast (no dialog is open at that moment)…") and Major milestone row ("called right after `completeTaskPure`"); §3.5 Toasts; §14.3 "Toasts never fire while a dialog is open"; AC-6.5 and AC-6.6.
Problem: completing task 4 after task 1, or completing task 7, shows the reward toast ("Mission completed…"). In the same handler, `celebrationFor` returns non-null and opens the CelebrationOverlay, which is a Radix dialog. The sonner toast lasts 5 s, so it is on screen while an `aria-modal` dialog is open. Radix aria-hides it, so it is never announced, and AC-6.6 ("while any dialog … is open, no toast element is rendered") fails during AC-6.5's own scenario.
The same gap affects any toast that is already visible when the user opens a dialog within 5 s, for example Complete followed by Edit. `notify()` only gates new toasts. It never clears existing ones.
Fix:
1. In the store's `completeTask`, compute `celebration = celebrationFor(...)` before notifying. When it is non-null, call no toast; the overlay headline carries the message. Otherwise call `notify(...)` as specified.
2. In `useRegisterOpenDialog`, call `toast.dismiss()` from sonner when the open-dialog count goes from 0 to 1.
3. Reword AC-6.6: "while any dialog is open, no toast element is rendered, including toasts created just before it opened". Add a browser-audit case: complete task 1, then task 4, and assert the overlay is open and `[data-sonner-toast]` has count 0.
4. Update the §8 Complete task row to: "Toast only when `celebrationFor` returns null."

**M2. "HANUMAN mission" has three conflicting definitions, so Today's Mission, the celebration trigger, the reward copy and the card variant can disagree about the same task.**
Where: §11 IA-7 (`todaysMission` excludes `!t.longRunning`); §8 (the reward says "HANUMAN missions are excluded, §11 IA-7"; celebration trigger (a) is `category === "HANUMAN" || longRunning`; the copy variant "project only (a HANUMAN mission with a project)"); §9.1 ("HANUMAN missions are not part of it"); §12 F13 (`sourceLabel` uses `kind === "HANUMAN"`); §3.5 TaskCard ("HANUMAN variant", no predicate given).
Problem: a task with `category: "HANUMAN"` and no `longRunning` can be reached in two ways today:
- The Event Planner task-row select offers HANUMAN (`Home.tsx:1040`), and `createEventPlan` creates the task with `kind: "Responsibility"` and no `longRunning` (`Home.tsx:810`).
- In the task dialog, choosing the HANUMAN family sets `longRunning`, but unticking "Keep as HANUMAN task" afterwards sets `longRunning: false, kind: "Task"` and leaves `category: "HANUMAN"`.

Such a task:
- is counted in Today's Mission;
- fires the HANUMAN celebration;
- gets a non-null `journey`, which contradicts the copy-variant assumption;
- shows a HANUMAN FamilyBadge with the "Event task" or "Manual task" source.

Whether it gets the Lanka-strip card variant is undefined.
§9.1 also says the family picker "sets only `category`, with today's side effects kept verbatim". It then lists only the contributor clearing. It omits today's coupling, where choosing HANUMAN also sets `longRunning: true` and `kind: "HANUMAN"` (`Home.tsx:1045` category onChange). A coder could read "only `category`" literally and drop that coupling.
Fix: add one predicate in `state/selectors.ts` and use it everywhere:
```ts
// A HANUMAN mission is long-running work. This matches today's UI, which keys the journal and the "year-long" pill on longRunning.
export const isHanumanMission = (t: Task) => t.longRunning === true;
```
- `todaysMission`: `!isHanumanMission(t)`.
- `celebrationFor` trigger (a): `isHanumanMission(task)`. Drop `category === "HANUMAN"`.
- TaskCard HANUMAN variant (Lanka strip, Setu bar, journal, "Post update"): `isHanumanMission(task)`.
- FamilyBadge keeps showing `category`, and `sourceLabel` keeps using `kind`. Both are display-only.
- Rewrite the §8 copy-variant comments as "project only (`isHanumanMission` with a project)" and "neither (`isHanumanMission` without a project)".
- In §9.1, replace "It sets only `category`" with: "It writes `category` with today's side effects verbatim: Squirrel and Angad clear contributors and keep only the owner's note; HANUMAN also sets `longRunning: true` and `kind: "HANUMAN"`."
- Add tests: a `category: "HANUMAN"` task with no `longRunning` is in `todaysMission`, `celebrationFor` returns `today` or `null` (never `hanuman`), and `journey` is non-null.

**M3. The Dashboard "Jambavan's reflection" sentence and its "Review deadline watch" button are not specified.**
Where: §9.1 Dashboard band ("a data-derived observation (largest department gap, overdue and blocked counts)"); §9.4 item 3 ("derived from data, never canned", with one seed example); mock 3 (the "Review deadline watch" button).
Problem: every other piece of user-facing copy in the proposal has an exact template, but this one has none. The coder has to decide:
- how "the largest gap" is chosen when there are ties;
- which department a blocked or overdue mission "sits with" when there are several, or when it is the owner's department and not the team's;
- what to say when nothing is overdue or blocked;
- singular and plural forms;
- whether "this week" is truthful, since department `done` values are static seed (`Home.tsx:291–296`, and §11 IA-7 says "Department seed percentages stay").

The button in mock 3 has no action anywhere in the spec. There is no selector, no test and no AC, so the Reflection can drift from the data. It is also the brief §8 "analytics: calm, wise Jambavan" surface.
Fix: add to `state/selectors.ts`, and unit-test with the seed and a zero case:
```ts
export function reflectionFor(depts: { name: string; done: number }[], tasks: Task[]): string[] {
  const sorted = [...depts].sort((a, b) => b.done - a.done || a.name.localeCompare(b.name));
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
```
- Seed output: "Operations is 31 points behind Marketing.", then "1 mission is overdue and blocked, and it sits with Operations.", then "A short check-in with its Task Owner may unblock it." This matches mock 3 except for "this week".
- Drop "this week" from the observation, because the department values are static.
- Specify the button: "Review deadline watch" scrolls to and focuses the existing Dashboard "Deadline watch" card heading (`Home.tsx:1012`). It is a `secondary` Button on the dark card.
- Add AC-12.3: the Reflection shows the `reflectionFor` lines for the seed and, after task 6 is completed or archived, shows "Nothing is overdue or blocked."

### NIT

- **N1. The lede and the tile disagree on "today".** The lede says "2 missions need you today", but the adjacent tile says "My open tasks 3 · 1 due today". Task 4 is due "30 Sep" (`Home.tsx:185`); it is open, not due today. Either reword the lede to "{n} active missions are on your path today." / "1 active mission is on your path today.", or keep it and accept the wording. Pick one, and update AC-6.4 and mock 1 if the wording changes.
- **N2. `mergeTaskEdit(existing, draft)` is called pure, but §12.1 needs `profiles` and a `nextId()`.** The text says `employeeDepartment` "looks the name up in `profiles`" and new subtasks use `nextId()`, and neither is a parameter. Change the signature to `mergeTaskEdit(existing, draft, ctx: { departmentOf: (name: string) => string | undefined; nextId: () => number })`. The store passes `name => profiles.find(p => p.name === name)?.department` and `() => Date.now() + Math.random()`, matching today's id style. Tests pass fixed stubs.
- **N3. The Team task toggle on edit: isTeamTask changes but visibility does not.** On edit, `isTeamTask` comes from the draft, while `team` and `visibility` are kept. Toggling "Show as team task" in the edit dialog therefore changes only the pill. Today's edit recomputes both fields (`Home.tsx:648–653`), and that recompute is the source of bug A1. State the decision in §12.1: "isTeamTask changes only the Team task pill on edit; `team` and `visibility` never change through edit." Also show the hint "Visibility is set when the mission is created." under the toggle in edit mode.
- **N4. Increment ordering puts dependencies late.** Increment 2's ⌘K select-task reset writes `projectFilter`, which is only introduced in 4b. Increment 2's Sidebar, the `environmentByView: Record<ViewKey,…>` with `kishkindha-council`, and the "13 views" audit all need the `notices` ViewKey, but the view arrives in 4c. Fix: in increment 2, add the `projectFilter` state (default `null`, no UI yet) and the `notices` ViewKey. Until 4c, `NoticesView` renders the existing notice board and feedback markup, moved verbatim from My feed. Alternatively, state that the nav item keeps today's `setActiveView("feed")` until 4c, and that the 13-view audit assertion starts at 4c.
- **N5. The `celebrationFor` return shape is described inconsistently.** §13.2 returns `{ keys: string[]; kind }`, but §8 and the `celebration.test.ts` text say "key `hanuman:7`". Change the wording to `keys: ["hanuman:7"]` and `keys: ["today:05 Oct 2026"]`, and state that the store adds every returned key to `celebrated`.
- **N6. AC-6.7 cannot be run as a browser check.** There is no UI path to complete task 2 (the button is hidden), and the browser audit has no store hook. Move AC-6.7 to `tasks.test.ts`: `completeTaskPure(seed, 2, NOW_LABEL, projects)` returns `result: null` and the same `tasks` reference. Also assert that the store only calls `logActivity` and `notify` when `result !== null`, which is code-reviewable in the 6-line handler.
- **N7. AC ordering.** In AC-9, AC-9.4 is listed before AC-9.3, and AC-13.3 is mis-indented. Renumber the items so the test IDs are stable.
- **N8. Small mock details the spec does not cover (spec wins, but say so in §19):**
  - mock 3's project caption reads "From 1 linked task (HANUMAN mission)", while the spec says "From {n} linked task(s)";
  - mock 3's "View tasks" uses an external-link arrow (↗) for in-app navigation; use lucide `ArrowRight`;
  - mock 2's fresh "Create mission" dialog shows Angad selected, while the draft default is Squirrel (`Home.tsx:503`);
  - mock 1's Sugriv card shows a "Team task" meta item, which the §3.5 meta-row list omits. Add "Team task (when `isTeamTask`)" to the meta row spec.
- **N9. The Sanjeevani symbol is used for the opposite moment.** Brief §7 maps Hanuman carrying the Sanjeevani to "Emergency / Critical task / Rescue mission". The proposal uses it only for the "No mission needs rescue today." empty tile. Also show the Sanjeevani glyph (aria-hidden, next to the word "Overdue") on the Needs attention tile when the count is > 0, and on overdue High-priority cards, so the symbol marks the rescue as well as its absence.

---

## Verified assumptions

All of the following were checked against the source.

**Round 3 re-checks**
- `createEventPlan` creates tasks with `kind: "Responsibility"`, `project: event.title`, `source: "Event plan · {title}"`, no `longRunning`, and `category: planned.category` (`Home.tsx:810`).
- `addTaskUpdate` and `addTaskSubtask` write `addedBy: "Arjun Mehta"`. Dialog-created subtasks, attachments, `seenBy`, `acknowledgedBy` and `completedBy` write `"You"`. `logActivity`'s default actor and `archivedBy` are `"Arjun Mehta"`.
- The task-dialog owner select has exactly 5 hard-coded options (You, Neha Kapoor, Ritesh Shah, Sana Iyer, Vikram Nair).
- `staffOptions` has 10 names and does not include "Arjun Mehta", so `ownerOptions` has 11 entries with no duplicate.
- `archiveTask` toggles `archived` (`Home.tsx:683–689`). `deleteTask` hard-deletes and resets `editingTaskId`.
- `completeTask` checks `assignee === "You"` and then logs "Task completed" and sets the notice unconditionally (`Home.tsx:578–583`), so F14 is a real behaviour change.
- `attendanceReportRows` maps every profile (`Home.tsx:571`). The `profiles` readers are lines 453 (state), 571, 736, 759 and 1027, as listed.
- `addEmployee` has no duplicate-name check.
- The My feed nav badge is the literal `3` (`Home.tsx:925`).
- The assign-from-MOM flow pre-fills `assignee: mom.taskAssignee` (`Home.tsx:854`), which is "Arjun Mehta" for the seed Academic Huddle.
- The `projects` seed fields are `name, label, progress, due, tasks, color`, so the `Project` type is correct.

**Seed tasks and computed numbers**
- Seed task 4 is "You"/"YO", category Squirrel (via `categoryByTaskId`), `kind: "Task"`, due "30 Sep", Private, Parent Connect, with contributor "You". Task 1 has no `acknowledgedBy`.
- Task 7 is owned by "Arjun Mehta", is `longRunning`, and is linked to "Faculty Excellence", which exists in `projects`. So `projectFor` works and AC-6.5's HANUMAN case can be reached.
- Today's Mission (formula as written) is tasks 1 and 4, giving (68+0)/2 = 34. After completing task 1 it is 50, and after tasks 1 and 4 it is 100.
- `myOpenTasks` is tasks 1, 4 and 7 = 3, with 1 due "Today".
- Deadline reminders are tasks 1, 2, 3 and 6 = 4. One app notification is unread, so the bell sum is 5.
- Project Setus are 34 / 0 / 24, and October Launch becomes 50 after task 1.
- The reflection gap is 83 − 52 = 31. Task 6 is the only overdue or blocked task (both), and it is in Operations.

**Family coupling in the dialog and Event Planner**
- In the dialog, choosing the HANUMAN category sets `longRunning: true` and `kind: "HANUMAN"`.
- The HANUMAN toggle unticked sets `kind: "Task"` and leaves `category`.
- The Event Planner category select offers HANUMAN.
- These are the basis for M2.

**Tooling and environment**
- `vitest.config.ts` uses `environment: "node"` and includes only `server/**`, so extending `include` is required, as §15 says.
- `package.json` has `check`, `test`, `build` and `start`, and pins `packageManager: pnpm@10.18.0`.
- The `Dockerfile` runs `pnpm install --frozen-lockfile`.
- `server/_core/index.ts` reads `PORT` (default 3000). The §16 smoke test is feasible.
- `components/ui/` includes `dialog`, `alert-dialog`, `sheet`, `popover`, `command`, `sonner` and `radio-group`, as §3.1 assumes.

**Contrast**
- 22 pairs were spot-checked with the WCAG formula, and all match the §3.2 tables: for example 15.79, 6.46, 5.06, 5.27, 6.38, 5.84, 5.38, 4.73, 4.52, 6.09, 6.53, 15.39, 5.58 and 7.10, plus the forbidden 3.40 and 1.12.

**Mocks**
- Mock 1 (1280 and 390): the art sits right on desktop and above the copy on phones. The lede is "2 missions need you today". The cards show 34% "The Setu takes shape", 3 · 1 · 6, nav badge 4 and bell 5. The family counts (2/2/2/1) match `categoryByTaskId`. The HANUMAN card has the Lanka strip and the 24% Setu. The Sugriv card has the More menu and Mark seen / Acknowledge.
- Mock 2: task 4 is rendered as in the seed. Completed task 1 shows a 34% → 50% "Halfway across the ocean" reward with the project+journey copy. The dialog has a sticky footer, the family radio cards and the single "You (Arjun Mehta)" owner option.
- Mock 3: there are no figures, only architecture, landscape and symbols. The artwork constraint holds.

## Unverified or wrong assumptions

- **Wrong:** "HANUMAN missions are excluded" from Today's Mission (§8, §9.1). Only `longRunning` tasks are excluded, and `category: "HANUMAN"` tasks without `longRunning` can be created through the Event Planner and the dialog toggle (M2).
- **Wrong:** "the family picker sets only `category`" (§9.1). Today, choosing HANUMAN also sets `longRunning` and `kind` (M2).
- **Wrong:** "Toast (no dialog is open at that moment)" on completion (§8). The CelebrationOverlay dialog opens in the same completion (M1).
- **Unspecified:** the Reflection observation's derivation and the "Review deadline watch" button (M3).
- **Unspecified:** how a pure `mergeTaskEdit` reads `profiles` and generates ids (N2). What the Team task toggle does on edit (N3).
- **Not re-verified here:** the bell dot formula line in `Home.tsx`. I relied on the round 2 verification and the matching seed arithmetic (4 reminders + 1 unread notification).
- **Unverified (cannot be checked in Phase A):** that the mock-measured first-card offsets (899 px / 1588 px), the hero height at 844×390 (205 px), and the scrim pixel results carry over to the React build. That is for AC-9.3, AC-9.4 and AC-1.2 in Phase B. I did not re-run `scrimaudit.mjs` or `mockshots.mjs`.
- **Accepted as out of scope:** server-side permissions, persistence, uploads, and the truncated deployment part of brief §26.
