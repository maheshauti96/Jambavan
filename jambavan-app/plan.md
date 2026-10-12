# JAMBAVAN first release plan

## Product outcome

Deliver a simple, responsive coaching-institute execution workspace that makes meeting action points and daily responsibilities visible until completed. The first release is intentionally a focused dashboard rather than a full enterprise suite.

## Information architecture

- `/` — authenticated-looking workspace preview with personal feed, department pulse, meeting actions, and dashboard summary.
- `/manus-routes.json` — route manifest for the SPA.

The first release keeps the main experience on one page so a department head can understand execution in one glance. Secondary actions open focused drawers/modals rather than introducing many pages.

## Frontend structure

- `client/src/pages/Home.tsx`: shell state, mock coaching-institute workspace data, filters, and interaction handlers.
- `client/src/components/`: reuse supplied primitives only where useful; keep feature-specific UI close to the page until the interaction model stabilizes.
- `client/src/index.css`: Monsoon Ledger tokens, responsive layout, card and status treatments.
- `client/public/manus-routes.json`: complete current route declaration.
- `public/`: project icon and favicon assets.

## Business model represented in the first UI

The data model shown in the interface includes people, departments, teams, reporting hierarchy, tasks, meeting MOM/action points, projects, major responsibilities, visibility, owner/task head, due dates, status, priority, progress notes, and completion history. Seeded examples use coaching roles such as Academic, Admissions, Operations, and Marketing so the experience is understandable without setup.

The first interactions are deliberately useful without an admin setup flow: department filter, task status filter, create-task modal, mark complete, team-task visibility, and navigation between My Feed, Department, Meetings, and Dashboard views. Data is currently scoped as an in-memory preview model so we can validate the workflow quickly; the server/database foundation remains enabled for the next slice where organization setup and persistence will be connected.

## Clarified accountability rules

Each task has one **task owner** and zero or more **task assistants**. Only the owner can mark the task complete; assistants can independently mark their own part complete, but the task remains in their feeds until the owner completes it. The system records who completed the task and when. A department head/manager can edit or reassign any task in their department; owners and assistants cannot reassign. Department heads or anyone above them can reopen a completed task when the result is unsatisfactory.

The organization hierarchy is CEO → Directors → Department Heads/Managers → Department Members. CEO and Directors have cross-department visibility and can see private tasks, personal notes, and all work. Employees who belong to multiple departments see separate department feeds. CEO and Directors may also have their own task feeds when they act as department heads or assistants.

Meeting records include title/date, participants, notes/MOM, decisions, action items, automatic task creation, and follow-up meeting/date tracking. Saving a meeting with an action item creates a task with the meeting as its source; assistants can then be added by the task owner’s department head.

## Leadership dashboard and reminders

CEO and Directors get a cross-department leadership lens on the Dashboard: institute completion, department pulse, department-head photo indicators, deadline attention, and leadership coverage are aggregated in one view. The prototype includes a CEO/Director lens switch to demonstrate the shared leadership scope. A notification center derives reminders from open tasks due today, tomorrow, or overdue and shows the task owner photo, owner name, assistant count, and due state; owners and assistants can open the reminder from the header and mark reminders read.

## Task attachments

Every task exposes separate controls for **completion evidence** and **helping material**. Employees can add photos, PDFs, Word files, audio, video, or links as evidence of completed work. CEOs, Directors, Department Heads, or any employee can add the same supported file/link types as helping material for task understanding. Attachments are labeled by purpose and shown with the task so the owner, assistants, and permitted viewers can open them.

## MOM Directory

The separate MOM Directory stores meeting records department-wise with date, department, meeting head, meeting secretary, present employees, written MOM, optional next-meeting date, and an action item with a direct assignee. The secretary is represented as responsible for creating the MOM and assigning tasks. Once saved, the written MOM is locked; the meeting head, department head, Directors, and CEO can visit a saved record later and assign or add tasks without changing its written content.

## Encouragement rewards, planner, and subtasks

The Dashboard includes an encouragement-only reward summary rather than a competitive leaderboard: completed tasks contribute points, on-time work earns extra recognition, overdue work subtracts a small recovery amount, and the employee receives a Bronze, Silver, or Gold tier with supportive language. It also includes a calendar-style assigned-task planner with Day, Week, and Month ranges, showing counts and task titles by due-date slot. Tasks can optionally contain subtasks; the owner or a higher authority can add them during task creation/editing, and employees can mark each subtask complete without changing the parent task's owner-only completion rule.

MOM creation begins with a prefilled employee roster for attendance. The secretary can tick Present or Absent for each person, with meeting head and secretary included in the present set. Quick task assignment uses repeatable rows with separate Department and Employee selectors, allowing a department meeting to assign work across departments and to employees who belong to multiple departments. The written MOM itself never auto-generates a task; only explicitly filled quick-task rows create tasks.

## Serving and deployment

Use the initialized React/Vite SPA plus Express server. The browser-rendered frontend is static output with dynamic API capability available under `/api/*`; personalized/private data should not be shared-cached. Keep the existing Dockerfile and server health path. Publish routing will use `/api/*` to server, versioned `/assets/*` as immutable static assets, and `/*` as an SPA fallback when publication is configured.

## Verification

Use the existing TypeScript check and production build. Start the dev service on the configured port, verify `/`, `/api/health`, and `/manus-routes.json` return successfully, and use source inspection as the primary acceptance evidence. Visual screenshot inspection is not required unless a concrete rendering issue appears.


## Audit trail, HANUMAN workstreams, and Ramayana visual direction

The workspace keeps an append-only activity trail for posted meetings/MOMs, task creation, edits, completion, reopening, attachments, subtasks, progress updates, task deletion, and person removal. Each entry records the action, subject, actor, timestamp, and a short detail; deleted records remain represented for future reference.

A **HANUMAN task** is a visible long-running workstream for responsibilities that may take months or a full year. It has a dedicated feed category, progress percentage, update journal, and expandable subtasks that employees or higher authorities can add without changing the owner-only completion rule.

The visual direction now uses a respectful Ramayana-inspired storybook treatment: saffron sunrise, deep indigo, peacock blue, palace-arch motifs, Hanuman journey cues, warm illustrated background texture, and colourful cards. Decorative imagery stays behind the interface so names, dates, owners, and audit facts remain readable.


## Four task families

Every task is grouped into one of four visible categories: **Squirrel** for quick, focused contributions; **Angad** for committed deliverables; **Sugriv** for coordinated team responsibilities; and **HANUMAN** for large, long-running missions. People can filter their feed by category, see counts for each family, and select the category while creating or editing a task.


## Targeted multimedia notices

The notice board lets coordinators, department heads, Directors, and the CEO send a schedule, timetable, or notice as text with an optional image, audio, or video attachment. The sender selects **specific candidates**, a **department**, or **everyone**. Notices retain the sender, timestamp, audience, recipients, and media filename, and each send is recorded in the audit trail.


## Multi-target notice delivery

A single notice can now target any combination of **Directors**, **Department heads**, **Candidates**, and multiple departments. The sender can also choose everyone in the institute. The composer shows grouped checkboxes, preserves all selected recipients on the notice card, and continues to support text, image, audio, and video content.


## Yearly Calendar

JAMBAVAN now includes a separate 12-month calendar for holidays, festivals, academic programs, birthdays, and other institute events. Calendar events store their date, month, type, creator, and visibility groups. Only the CEO, Directors, or a person explicitly assigned as calendar manager can create or change events; other users can only view events included in their visibility. Calendar changes are included in the audit trail.


## Feedback and acknowledgement

Department Heads, Directors, and the CEO can create feedback requests for selected groups using polls, open-ended questions, or 5-star ratings. Employees can answer directly in the feed. Tasks show Seen and Acknowledge controls with a visible seen count; notices also have a Seen by me action. These actions are recorded with actor and timestamp in the audit trail.


## Task archive

Tasks can be archived instead of deleted. Active feeds hide archived tasks, while the Work in motion filter provides an Archived tasks view with restore controls. Archive and restore actions retain the actor and timestamp in the audit trail, and archived tasks do not generate deadline reminders.


## Private notice replies

A notice sender can request replies from recipients. Employees can reply directly from the notice card; replies are not exposed to ordinary recipients and are visible only to the sender, Department Heads, Directors, and the CEO. Reply submission records the employee and action in the audit trail.


## Employee profile directory

The People view includes a photo-first profile directory visible to everyone. Each profile shows the employee name, compulsory photograph, phone number, joining year, position, department, in/out times, weekly off, and current availability (Available, On leave, or Sick). Employees can update their own contact, schedule, weekly off, and leave/sick status through the self-service profile editor; updates are added to the audit trail.


## Notice expiry and bin

Notices can be configured for 12 hours, 24 hours, 7 days, or 1 month. After the selected period, the notice moves automatically to the Notice bin instead of being immediately deleted. Binned notices remain available for review for 30 days and are then permanently removed automatically.


## Director-controlled employee access

Only Directors and the CEO can add employees, suspend or reinstate access, or remove an employee. Adding requires a profile photograph before activation. Suspension keeps the profile visible with a Suspended status but pauses future institute changes. Permanent removal revokes institute access and removes the employee's profile data from the workspace.


## Category-specific shared task assignments

Squirrel tasks are single-person simple tasks. Angad tasks are single-person larger tasks. Sugriv and HANUMAN tasks support multiple assigned people; the creator records a separate responsibility note for each assigned person. All assigned people can see the shared task progress, assistant completion updates, subtasks, evidence, helping material, and progress journal.


## Event Planner and reusable templates

JAMBAVAN includes an Event Planner where a user can create an event with date, venue, description, and multiple departments. The planner supports task rows created directly inside the event, with department, employee, task category, and a responsibility note for each assignment. Saving the plan adds those tasks to the task feed. Users can save an event and its task structure as a reusable template, and start a new event from a pre-made template.


Event information also records named roles and in-charges, including the event head, department coordinators, venue/logistics lead, or other responsibilities. Roles are carried into reusable templates and shown on event cards.


## Permissions, event feedback, and acknowledgment dashboard

Employee suspension, reinstatement, termination, and addition are guarded by the Director/CEO permission boundary. Feedback requests can be linked to an event and support Poll, Open question, or 5-star rating formats with selected recipients. The leadership dashboard includes pending acknowledgments, seen counts, and acknowledged counts by department and task.

## Event templates, notice lifecycle, and employee self-service profile

Event Planner supports creating reusable event templates and reusing them as new event plans while retaining departments, task rows, role assignments, in-charge people, categories, and responsibility notes. Notices support 12-hour, 24-hour, 7-day, and 1-month periods, automatic movement to a 30-day retention bin, and confidential replies visible only to the sender and authorized leadership. The dedicated My profile page gives employees self-service controls for attendance status, leave/sick status and notes, in/out times, weekly off, contact details, and joining year.

## Reporting, live notifications, and responsive optimization

Event Planner provides a browser-downloadable CSV analytics report covering each event, departments, task count, categories, roles, in-charges, and creator. People & teams provides a browser-downloadable CSV attendance summary covering employee identity, department, position, contact, joining year, schedule, weekly off, availability, attendance, and status note. The notification center now combines immediate in-app assignment notifications, confidential-reply notifications, and deadline reminders with unread indicators and mark-all-read behavior. Responsive rules optimize task cards, profile cards, report actions, event cards, notification panels, and profile grids for tablet and phone widths.

## Leadership access matrix and mobile validation

Directors and the CEO have an Access matrix view with editable defaults for CEO, Director, Department Head, and Employee roles across department visibility, employee access management, task editing/reassignment, calendar events, targeted notices, private tasks, and report exports. Every change is recorded in the audit trail. Event Planner and My Profile were checked in Preview for horizontal overflow, modal fit, responsive grid behavior, and the 760/620/430px breakpoint rules; narrow-screen refinements stack event rows, profile cards, acknowledgments, attachment actions, and task controls for touch use.

## Daily digest and comprehensive audit ledger

The Director/CEO Audit log provides searchable and filterable activity history, sensitive-action highlighting, actor photos, timestamps, contextual details, CSV export, summary counts, and a daily digest summary for pending acknowledgments and expiring notices. The digest is surfaced in-app and in the live notification center. Automated email delivery is intentionally marked as connector-dependent because this session has no enabled email provider; Resend and Elastic Email are available connector choices and must be authorized before scheduled external email delivery can be activated.

## Reports and leadership analytics

JAMBAVAN now provides downloadable reports from the existing Event Planner and employee directory. Event planning data can be downloaded as CSV or a lightweight multi-page PDF containing event dates, departments, task counts, categories, roles, in-charges, and creators. Employee attendance data can be downloaded as CSV or PDF with profile, department, schedule, availability, attendance, and status-note fields.

The leadership Execution Dashboard presents visual trend charts for sensitive audit actions and completion rate over time, plus current department completion bars, photo-led department coverage, deadline watch, and acknowledgment counts. Directors and CEO users can export the leadership analytics snapshot as a PDF. Existing Audit log filters and CSV export remain available for detailed record review.

## Approved standardization direction

JAMBAVAN is standardized as a simple execution and accountability workspace for coaching institutes. The official meeting workflow is the attendance-first, immutable MOM Directory; the duplicate general meeting-capture flow is removed from navigation and rendering. User-facing language uses Task Owner, Contributors, Task Family, Task Source, Completion Evidence, Task Guidance, Department Head, Acknowledgment, Availability, and Attendance Today.

Navigation is grouped into Workspace, Execution, Communication, and People & Control. Task families are Squirrel, Angad, Sugriv, and HANUMAN; task sources remain internally compatible while displaying Manual task, MOM task, Project responsibility, Event task, and HANUMAN mission labels. Dates and times should be stored as exact ISO values during the incremental persistence phase and displayed as friendly relative labels where useful.

The production path is incremental rather than an all-at-once migration: start with users, departments, memberships, tasks, task contributors, MOM records, and audit events; add notices, feedback, calendar, files, reports, and notification delivery as each workflow is adopted by the institute. Server-side role enforcement and soft deactivation remain mandatory before multi-user production use.

## Private My Day personal planner

JAMBAVAN now includes an isolated **My Day** section for each signed-in employee's personal planning. The planner is date-based and keeps previous dates available. It provides up to three private Top 3 priorities, quick daily schedule/time blocks with Planned/In Progress/Completed/Missed statuses, private personal actionables, private links to existing academy tasks assigned to the employee, and a small end-of-day review. Adding an academy task creates only a private reference; the existing academy task remains the source of truth and its assignment, permissions, status, and reports are unchanged.

The prototype keeps My Day state separate from the existing in-memory task model and excludes it from existing manager, authority, team, task, attendance, audit, and export views. Production persistence must use a separate PersonalPlanner record keyed by authenticated user/employee ID plus date, with server-side filtering on every read/write so managers and other employees cannot access another person's planner.

## Task blocker check-ins and process analytics

Open tasks now include a lightweight “Why is this task not moving?” check-in with one-click reasons: I haven't started, Waiting for someone, Waiting for information, Too much other work, I don't understand the task, Unexpected issue, Forgot, and Other. Employees can add optional context. The task keeps its existing status and completion rules; the check-in records the reason, reporter, and time as a process signal.

The leadership dashboard aggregates blocker reasons across open/delayed tasks and shows counts and percentages, using neutral language such as “of delayed tasks with a check-in” and explicitly framing the information as a way to remove dependencies, clarify work, and rebalance load—not as an employee performance score. Leadership PDF analytics include the blocker totals and reason counts.

For production, persist blocker check-ins in a task-blocker/history table with task ID, reporter ID, reason enum, optional note, timestamps, and resolved/replaced state. Enforce task visibility and role permissions server-side, and retain the blocker history in the audit trail without exposing private My Day data.

## Task dependencies and downstream impact

Tasks can now connect through an optional upstream dependency. The task editor provides a “Depends on” selector, excludes archived/self/cyclic candidates, and keeps the existing owner, assistant, status, and completion rules unchanged. The prototype demonstrates an Admission Campaign chain: Prepare admission campaign poster → Approve admission campaign poster → Send approved poster to schools → Make school follow-up calls → Update admission data.

JAMBAVAN walks each dependency chain to find the first unfinished prerequisite. Downstream task cards show a blocked-by signal, while upstream cards show their downstream impact. Leadership sees a dependency panel with messages such as “Campaign delayed because Approve admission campaign poster is pending.” Completing the upstream task automatically removes the downstream impact through derived state rather than manual cleanup.

For production, store dependency edges in a task_dependencies table with task ID, upstream task ID, created-by, timestamps, and active/replaced state. Enforce cycle prevention and task visibility server-side, and calculate downstream impact from authorized task data.

## Task Handover

Open tasks now have a one-click **Handover Task** action for situations such as leave, sickness, absence, or responsibility changes. The handover composer selects a receiving employee and captures a compact package: task title, current status and progress, last action, waiting for, next action, and important notes. The package is shown on the task card for the receiving employee, replaces the active task owner in the prototype, creates a notification, and records the actor, recipient, timestamp, and task in the audit trail.

For production, persist handovers as immutable task_handover records with task ID, from-user ID, to-user ID, status snapshot, last action, waiting-for detail, next action, notes, created-by, and created-at. Keep prior handovers in history, enforce manager/authorized delegation rules server-side, and retain the full handover package for audit and later review.
