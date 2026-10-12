# Jambavan interface

The redesign keeps tasks, meeting records, events, notices, employee profiles and access controls in their existing workflow groups. It uses warm cream, maroon, readable Mukta text and Cormorant headings. Ramayana landscapes identify the workspace context, while task families and Setu progress use the existing symbol components.

## Component ownership

`layout/viewMeta.ts` owns view titles, descriptions and artwork IDs. `PageHeader` renders those values and shows Create task only in task-related views. `AppShell` returns the page to the top when the view changes. The sidebar keeps its header and account controls visible while the navigation list scrolls.

`TaskCard` keeps the title, status, due date, owner, progress and primary actions visible. Blocker editing, handover packages, contributors, subtasks, files and update history use disclosures. Disclosure state is local UI state. Task ownership and mutations stay in `useJambavanStore`.

`RamSetuProgress` reads existing task and project selectors. Its percentage, stone count and accessible label use the same value. The completion panel shows the progress that actually changed. `EmptyState` renders an explanation and a Reset filters action when the task list is empty.

`MyDayProvider` retains the personal planner. Its content stays out of shared dashboards and search. Plans remain in memory for the session, as in the original preview. Schedule and personal-task fields have visible labels and enough space for their native date and time controls.

`eventPlans.ts` owns plan replacement and linked-task synchronization. An event edit preserves its ID. New rows create new tasks, removed rows archive their linked tasks, and existing rows retain task progress and history. Templates create no assigned tasks until used.

`GuideView` uses the existing Card component for section padding, borders and radii. The first section has a compact Create task action. Ownership and workflow descriptions use semantic lists. Dashboard acknowledgment rows give the avatar, task copy and counters separate layout classes so the avatar's HTML element cannot change its grid placement.

## Style structure

`theme/tokens.css` is the palette and type source. `styles/workspace.css` contains the shared interface rules. `scripts/refine-legacy-styles.mjs` produces `styles/sections.css` from the initial screen layouts after removing the old shared layout rules, theme aliases and tiny type. The generated file stays committed so the application does not need Git at runtime.

`page-container` sets one 1600 px maximum for the top bar, page content and footer. Their side gutters are 28 px on desktop, 20 px on tablet and 16 px on phones. The shell uses block layout so each view fills the available width regardless of its content. A stable scrollbar gutter keeps short and long pages aligned.

The artwork is decorative and has empty alternative text. Essential information stays in HTML. The seven illustrations use one art direction and are stored locally as WebP files. Their original PNGs were preserved outside the source tree during the design run.

## Checks

Run the commands in the application README. `check:design` checks the type floor in every source CSS file, stale copy and artwork files. `scripts/ui-audit/dom.js` measures the rendered interface. Inspect desktop, tablet and phone layouts, then test task creation, edit cancellation, completion, archive and restore, blockers, handovers, personal planning, meeting capture, event edits and search. Review complete pages in readable detail, including sections below the opening viewport. The page review is recorded in `docs/design/page-review.md`.

Production persistence and authorization remain separate backend work. This redesign preserves the current preview data model.
