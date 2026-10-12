# Design review, round 4 (checkpoint `5f248af`)

Reviewed: `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/redesign-proposal.md` (1545 lines) against `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/redesign-brief.md`, the round 3 findings in `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/design-review.json`, the mocks in `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/.agents/tasks/mocks/`, and the delta report. Claims about the app were checked against `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app/client/src/pages/Home.tsx` (1226 lines). I did not re-run the browser audit. I checked that the evidence files it cites exist (`audit-tools/audit-v3-report.json`, `audit-v3-probe.json`, 13 PNGs in `screenshots/before-v3/`) and read one entry (`desktop.handover.task4`), which matches D1.

**Verdict: APPROVED** (0 HIGH, 3 MEDIUM, 9 NIT). Under this step's gate rule, MEDIUM and NIT findings don't block. They go to the approval gate and should be fixed before increment 3 starts, because all three MEDIUMs touch increment 3 code (task dialog, card More menu, ChainSetu).

## What the round had to do, and whether it did

| Requirement | Result |
|---|---|
| The 4 new features designed consistently with the brief and the proposal | Yes. My Day (§3.5, §4 `vanvas-ashram`, §9.1, IA-10, F19–F21, F24), blocker check-in (§3.5 BlockerLine/BlockerCheckIn, F22, `reasonPhrase`), dependencies (§10.3 `ChainSetu`, F18, F23, `wouldCycle`), Task Handover (§3.5 HandoverDialog, F17). Functional labels stay plain ("My Day", "Depends on", "Why is this task not moving?", "New Task Owner"). Narrative words appear only in headings, CTAs and feedback, as brief §3/§18 require. No deity figures. Sanjeevani maps to rescue, as brief §7 says. |
| Cycle prevention | Kept verbatim (`dependencyWouldCycle` → pure `wouldCycle`), made explicit with a hint in edit mode (D22), backed by validation, and tested (`9→12` refused when editing 9, `8` allowed when editing 10). One gap with archived upstreams: R4-M1. |
| §2 carries the re-audit of the new features | Yes. §2.4 has D1–D24 with browser evidence, plus a valid correction to the delta report's overflow claim. |
| A1–A9, B1–B11, C1–C12 re-checked | Yes. §2.5 covers every ID with new evidence. |
| Home.tsx line references updated | Yes. §22.3, 25 references spot-checked (see Verified). |
| §13 refactor, §11 IA, ACs, §16 increments updated | Yes. §13.1 adds the new modules, §13.2 adds signatures, §13.3 adds the new equivalence signals. IA-10 to IA-12 are new. AC-19 to AC-23 are new. Increments 0, 2, 3, 4a and 6 are updated. |
| Round 3 M1/M2/M3 applied exactly | Yes, with seed-driven adaptations that keep each fix's intent (see the table below). |
| N1–N9 applied | Yes. N7 is only partly applied (R4-N7). |
| §22 added | Yes. §22.1 to §22.4. |
| Mocks regenerated | Yes. Mocks 1 to 3 were rewritten and re-captured, and mock 4 is new. All 10 PNGs date from 09:08, after the HTML edits. The copy strings in the mock HTML match the spec (checked by grep: "Waiting on … · Blocked", "Held at", "Hand over mission", "Choose who takes over this mission.", "Daily Dharma", "It's moving again", and no leftover "Blocked by", "Campaign delayed", "Handover Task" or "Today's Top 3"). The N8 fixes are present: no "(HANUMAN mission)" caption, `#i-arrowright`, Squirrel `aria-checked="true"`, "Team task" in mock 1. |
| Nav groups | The four approved groups are unchanged. My Day stays in Workspace, where the delta already put it. No new group. |
| Deployment | The proposal adds no new deployment expectation. The increment 6 production build check is unchanged from round 3 (N16) and explicitly says it is not a deployment design. |

### Round 3 findings

| ID | Status | Note |
|---|---|---|
| M1 | Closed | `celebrationFor` runs before `notify()`. `toast.dismiss()` fires on the 0→1 transition. AC-6.6 is reworded. The audit case "1, 4, then 9" is right, because task 9 is now in Today's Mission (verified: Arjun Mehta, Today, 60%). |
| M2 | Closed | `isHanumanMission` is used at all four sites. The §9.1 picker wording is verbatim, and tests are added. |
| M3 | Closed | `reflectionFor` is verbatim. The seed lines are recomputed correctly: Marketing 83 − Operations 52 = 31, and the stuck tasks are 6 (Operations, overdue and blocked) and 9 (Academic, blocked). The button target is now `Home.tsx:1181`, which I verified. |
| N1–N6, N8, N9 | Closed | As listed in §21.1. |
| N7 | Partly closed | AC-9 order is fixed, but AC-13.4 and AC-13.5 now have the wrong indent (R4-N7). |

## Findings

### R4-M1 (MEDIUM): an unchanged edit can't be saved when the task's upstream is archived

Where: §12.1 merge table (`dependsOnTaskId` row), §14.2 "Depends on", §9.3 Depends on messages, §10.3 edge cases.

Problem:
- §10.3 says an archived, unfinished upstream "still holds its chain and is labelled Archived", and archive leaves links in place (F23).
- §12.1 says `dependsOnTaskId` is taken from the draft "after `validateTaskDraft` has checked that the id exists, **is not archived**…".
- Today's select builds its options with `!candidate.archived` (`Home.tsx:1216`), so the select has no option matching an archived upstream.

So: archive task 9, edit task 10, change only its title, and click Save. Validation rejects the save with "That task is no longer available", while the select visibly shows "No dependency". The user can't save any edit without dropping the link. That breaks the F1 rule that an unchanged save is a no-op, and it contradicts §10.3.

Fix: validate the dependency only when it changed, and render the current link even when it is archived.
```ts
// validateTaskDraft (edit): an unchanged link is always valid
if (draft.dependsOnTaskId !== undefined && draft.dependsOnTaskId !== existing?.dependsOnTaskId) {
  // exists, !archived, !== self, !wouldCycle  → else the §9.3 messages
}
```
Also:
- The "Depends on" options are today's filter plus the task's current upstream when that upstream is archived, labelled "{title} (Archived)".
- Add a unit test: archive 9, then save 10 unchanged → `dependsOnTaskId: 9` is kept.
- Add the clause "changing to an archived task is refused" to AC-21.3.

### R4-M2 (MEDIUM): `canHandOver` uses a permission the app doesn't have, and its signature can't see it

Where: §12 F17(g), §13.1/§13.2 `state/handover.ts`, §3.5 More menu, §14.1 Hand over rows.

Problem:
- F17(g) defines `canHandOver(task) = isCurrentUser(task.assignee) || canEditOrReassign`. The app has no `canEditOrReassign` and no current-user role variable. `Home.tsx` has only `leadershipRole: "CEO" | "Director"` (line 546) and `accessMatrix` keyed by role (line 547). "Department Head" appears only as a static label. The proposal doesn't say which `accessMatrix` row stands for the current user.
- `canHandOver(task)` lives in a pure module but takes no permission input.
- "Open tasks" is ambiguous about archived tasks: §14.1 refuses archived tasks, but the `handoverTaskPure` comment lists only "missing, done or invalid".

Fix:
```ts
// state/handover.ts
export const canHandOver = (task: Task, ctx: { canEditOrReassign: boolean }) =>
  !task.archived && task.status !== "done" && (isCurrentUser(task.assignee) || ctx.canEditOrReassign);
// store: canEditOrReassign = accessMatrix["Department Head"]["Edit or reassign tasks"]
//        (the current user is Arjun Mehta, Department Head, §18)
// handoverTaskPure: null = refused (missing, done, archived, !canHandOver, or invalid draft); pass ctx through
```
Then:
- Add a test: with the "Edit or reassign tasks" toggle off for Department Head, the menu item shows only on tasks 1, 4, 7 and 9 (open, owned by the current user).
- Add an AC that the menu item is absent on archived and done tasks.

### R4-M3 (MEDIUM): `ChainSetu` is linear, but dependency graphs can branch, and the rendering rule is missing

Where: §10.3 Rendering, §3.5 TaskCard dependency lines, IA-11 / AC-21.2 (Dashboard "5-stone `ChainSetu md`").

Problem:
- `ChainSetu` takes one `path: Task[]`. Upstream paths are linear, but `dependencyBottlenecks` groups every waiting task under its bottleneck, and those tasks can sit on different branches.
- Branching is easy to create in the UI. The delta report's own check added a second dependent ("QA dependent task" on task 1), and any second "Depends on 9" makes the group {10, 11, 12, X}.
- The proposal doesn't say which path the Dashboard draws for a group, or what the card's "{n} task(s) wait on this one" line draws. That line is shown on task 9, whose own `upstreamPath` is only [8, 9] and contains none of the waiting stones.

Fix:
- **Dashboard group:** `path = upstreamPath(deepest)`, where `deepest` is the waiting task with the longest `upstreamPath`, ties broken by `title` ascending. The ordered list under the chain names **every** waiting task. When `waiting` has tasks that are not on `path`, add the caption "+{k} more waiting on other branches", and say the same in the `aria-label`.
- **Card "wait on this one" line:** text only, no `ChainSetu`. The `ChainSetu sm` appears only with the "Waiting on" line, using `upstreamPath(task)`.
- **Tests:** add a `dependencies.test.ts` case for two dependents of task 9, checking the deepest-path choice and the "+1 more" count.

### R4-N1 (NIT): the "only data-model change" claim is now false

Where: §12.3 People lifecycle.

Problem: §12.3 says `EmployeeProfile.access` widening "is the only data-model change in the proposal". F17(c) adds `TaskHandover.createdBy`. Today's type at `Home.tsx:97` has no such field, and today's card prints `from` as "Created by".

Fix: replace the sentence with "There are two data-model changes: `EmployeeProfile.access` gains `"Removed"`, and `TaskHandover` gains `createdBy: string` (F17)."

### R4-N2 (NIT): the HandoverLine template leaves out "created by", which F17 and mock 4 show

Where: §3.5 TaskCard handover line, compared with F17(c), §19 mock (iv) and mock 4.

Problem: the §3.5 template is "Mission handed over to {to} · from {from} · {createdAt}". Mock 4 and F17(c) show "… · created by Arjun Mehta (you)".

Fix: use the template "Mission handed over to {displayName(to)} · from {displayName(from)}{createdBy !== from ? ` · created by ${displayName(createdBy)}` : ""} · {createdAt}". The seed (Aditi → Neha, created by Aditi) then shows no "created by", which keeps AC-22.4 true.

### R4-N3 (NIT): §5 scrim results leave out mock 4

Where: §5, the "Results on the revised mocks" bullet.

Problem: §5 lists only mock 1 (5.14:1) and mock 3 (6.00:1). §19 says mock 4 was audited too (6.00:1).

Fix: add "mock 4 worst 6.00:1 (band eyebrow)" to the §5 bullet.

### R4-N4 (NIT): the new component colour pairs are not in the contrast allowlist

Where: §3.2 allowlist tables; §3.5 BlockerLine ("earth-700 on danger-100"), HandoverLine (earth-700 and ink on cream-100, as in the mock CSS).

Problem: §3.2 calls its two tables "the allowlist", but these pairs aren't in them. I computed earth-700/danger-100 = 7.91 and ink/danger-100 = 13.41, so both pass. The gap is in documentation and in `contrast.test.ts` coverage, not in the visuals.

Fix: add a "Round 4 pairs" row group with earth-700 / danger-100 (7.91), ink / danger-100 (13.41) and earth-700 / cream-100, computed with `contrast.mjs`.

### R4-N5 (NIT): singular and plural copy for dependent counts is unspecified

Where: §3.5 "{n} task(s) wait on this one", §12.3/F23 "{n} task(s) that wait on it will stop waiting.", AC-21.1, AC-21.3.

Problem: the templates use "(s)", while the ACs expect "1 task waits on this one" and "1 task that waits on it".

Fix: spell out both forms:
- "1 task waits on this one: {title}" / "{n} tasks wait on this one: {first two}{ · …}"
- "1 task that waits on it will stop waiting." / "{n} tasks that wait on it will stop waiting."

### R4-N6 (NIT): handover draft edge cases

Where: §13.2 `defaultHandoverDraft`, §14.2 Handover rows.

Problems:
- (a) "Today's prefill rules … with `to` limited to `handoverRecipients`" could be read as keeping today's fallback (the first staff option). F17(b) and the tests say `""`.
- (b) "Last action" is limited to 300 characters, but its prefill can be a journal update of up to 1000 characters, and no over-length message is defined.

Fix:
- (a) State "`to` = first unfinished contributor in `handoverRecipients(task)`, else `""`. Today's first-staff-option fallback is dropped."
- (b) Truncate the prefill to 300 characters at a word boundary and add "…", and add the message "Keep the last action under 300 characters." Apply the same to Next action.

### R4-N7 (NIT): AC-13 indentation (round 3 N7 only partly closed)

Where: §16, AC-13.4 and AC-13.5.

Problem: AC-13.3 is now indented with 4 spaces, but AC-13.4 and AC-13.5 have 3, so they fall out of the "13." list.

Fix: indent both with 4 spaces.

### R4-N8 (NIT): "Add to My Day" adds to the date selected in My Day, which may not be today

Where: §3.5 action row, §11 IA-10, LinkedTasksCard. This is today's behaviour: `updateMyDay` writes to `myDayDate`.

Problem: if the user last picked 20 Oct in My Day, the card button on My feed links the task to 20 Oct, and the label doesn't say so. The My Day eyebrow has a related ambiguity: mock 4 shows "Daily Dharma · Monday, 5 October 2026", but the spec doesn't say whether it shows `TODAY_LONG` or the selected date.

Fix (pick one and state it):
- (a) Keep today's behaviour, and label the button "Add to My Day · {d MMM}" when `myDayDate !== todayIso()`.
- (b) Always link to `todayIso()`.

Recommended: (a), because it keeps behaviour unchanged. Also state "the My Day band eyebrow is `Daily Dharma · {TODAY_LONG}`, and the selected date appears only in the date field and the 'Three arrows for {d MMM}' heading".

### R4-N9 (NIT): the handoff docs will contradict the relabelled features

Where: §16 increment 6, `DEVELOPER_HANDOFF.md:79–80`, and the Task Handover integration guide ("confirm that **Handover Task** is visible").

Problem:
- The handoff still cites "blocked-by task cards" and "Campaign delayed because Poster Approval is pending."
- The integration guide's check expects a visible "Handover Task" button.
- The redesign renames these to "Waiting on" and "Held at", and moves handover into the More menu as "Hand over task…".

Fix: in increment 6, update `DEVELOPER_HANDOFF.md` lines 79–80 to the new copy and entry point ("Hand over task… in the card's More menu"). The Downloads guide is read-only, so record its superseded check in the handoff.

## Verified assumptions (read from source or measured)

- `Home.tsx` is 1226 lines. These references are correct: `completeTask` 678 (guard `assignee === "You"` at 680), `openHandoverModal` 685–697, `createHandover` 698, `reopenTask` body 757, `dependencyWouldCycle` 768–779, `createTask` 780 (team/visibility 787/792, spread 806), `archiveTask` 820, `addTaskUpdate`/`addTaskSubtask` 840/849, `reportTaskBlocker` 854, `addEmployee` 891, `blockerAnalytics` 1026–1031, eyebrow literal 1120, My Day view 1125, Deadline watch 1181, panels 1183–1184, task modal 1216, handover modal 1218, `departments` 331–336, `projects` 349–353, `findBlockingDependency` 148–159, `plannerToday` (`toISOString`) 109, `categoryByTaskId` 291–292, `canManageCalendar` 535, `meetings` 64/1038/1055, task 4 due 222, draft default 561, profiles readers 502/671/881/904/1198.
- D7 is real. `initialTasksWithCategories` overwrites seed categories with `categoryByTaskId[...] || "Squirrel"`. With F16 the counts are Squirrel 2, Angad 4 (2, 5, 8, 12), Sugriv 5 (3, 6, 9, 10, 11), HANUMAN 1.
- D1 is real. Task 4's only contributor is "You", today's default recipient is the first unfinished contributor, and the evidence JSON shows `createEnabled: true` with "Ready for You".
- D2 is real. `from: "Arjun Mehta"` is a literal in `createHandover` (line 700), and `TaskHandover` (line 97) has no `createdBy`.
- D3: the seed package on task 2 is `from: "Neha Kapoor", to: "Aditi Rao"` while the owner is Neha. Aditi's profile is "On leave", "Back on 08 Oct", so the F17(f) story holds.
- Seed numbers: Today's Mission is {1 (68), 4 (0), 9 (60)} → 43, then 53 after task 1, then 87 after task 4 (verified; the result after task 9 follows by construction). AC-22.4 is (0+60)/2 = 30. Team follow-ups are 9 (1, 2, 3, 4, 6, 7, 9, 10, 11). Needs attention is 2 (6 overdue and blocked, 9 blocked).
- Blocker analytics: check-ins on tasks 1, 2, 3, 6 and 9 give 5 delayed tasks and 5 reported. "Waiting for someone" (tasks 3 and 9) is 2/5 = 40%.
- Dependency chain 8 (done) → 9 (blocked) → 10 → 11 → 12. `findBlockingDependency` returns the nearest unfinished upstream. Today's card shows the downstream line only when the task isn't itself blocked, and the proposal keeps that rule. Today's options exclude archived tasks and cycles.
- `wouldCycle` test expectations match today's algorithm (9→12 refused when editing 9; 8 allowed when editing 10).
- `staffOptions` has 10 names and no "Arjun Mehta", so `handoverRecipients` never contains the current user.
- 5 Oct 2026 is a Monday and 29 Sep 2026 a Tuesday.
- The access matrix has an "Edit or reassign tasks" permission, which is true for "Department Head".
- `DEVELOPER_HANDOFF.md` point 9 says My Day must stay out of dashboards, reports, audit exports and searches. IA-10 and the boundary test implement exactly that.
- The cited audit evidence files exist, and the D1 entry matches the proposal.

## Unverified or wrong assumptions

- Wrong: "`EmployeeProfile.access` … is the only data-model change" (§12.3). `TaskHandover.createdBy` is also new (R4-N1).
- Wrong: `canEditOrReassign` exists or is derivable as stated. There is no current-user role in the app (R4-M2).
- Wrong in effect: an archived upstream "still holds its chain" (§10.3) can't survive an edit under the §12.1 and §14.2 rules (R4-M1).
- Unverified (by design): mock contrast, scrim and card-height numbers in §19, and the D10–D17 accessibility measurements. I read the designer's evidence and didn't re-run it. Nothing in it raised a specific doubt.
- Unverified: real devices and screen readers for the new dialogs. The proposal says so itself.
