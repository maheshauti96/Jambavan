# JAMBAVAN — Developer Handoff

## Project

JAMBAVAN is a coaching-institute execution workspace for tasks, MOM records, employee profiles, events, notices, feedback, permissions, audit logs, reports, and Ramayana-inspired task categories.

## Source location

Project directory: `/home/ubuntu/jambavan`

Latest checkpoint: `d8b3d80` — `Add task handover packages`
Blocker feature checkpoint: `3c2b4cb` — `Add task blocker check-ins and process analytics`

## Main technology

- React + TypeScript frontend
- Vite development/build tooling
- Express server
- tRPC API layer
- Drizzle ORM with MySQL-compatible database support
- Tailwind/CSS visual system
- OAuth-based starter authentication support

## Local setup

Requirements:

- Node.js 22 or compatible recent Node.js version
- pnpm 10.18.0
- MySQL-compatible database if persistence is enabled
- Required platform/authentication environment variables supplied by the deployment environment

Commands:

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

The development server uses port `3000` by default. The health endpoint is:

```text
/api/health
```

## Production start

```bash
pnpm build
pnpm start
```

The included `Dockerfile` is the reference container deployment configuration. The production server honors the `PORT` environment variable.

## Important deployment notes

1. Configure the production database connection before enabling persistent production data.
2. Configure the authentication/OAuth environment variables required by the existing server starter.
3. Keep all secrets in the deployment platform's secret manager. Do not commit `.env` files or API keys.
4. Run the existing Drizzle migrations before using production persistence:

```bash
pnpm db:migrate
```

5. Confirm the deployed service responds successfully at `/api/health`.
6. Configure file/object storage before treating task evidence, helping material, profile photos, or multimedia notices as production uploads.
7. Configure an email provider such as Resend or Elastic Email if automated daily digest emails are required. The current interface displays the digest in-app when no email connector is available.
8. Review role and authentication enforcement server-side before production launch. The current prototype contains the product workflows and UI model; production access controls should be backed by authenticated database records and server-side authorization.
9. My Day must be persisted separately from academy tasks using an employee/user ID plus date. Enforce server-side ownership on every read/write so managers, authorities, and other employees cannot access another person's personal planner. Do not include My Day data in dashboards, reports, audit exports, searches, or team-performance metrics.

## Current product areas

- My Feed and Department Dashboard
- Private My Day planner with date-based Top 3 priorities, schedule blocks, personal actionables, end-of-day review, and non-destructive links to assigned academy tasks
- “Why is this task not moving?” blocker check-in with one-click process reasons, optional context, actor/time, and leadership aggregation of delayed-task blockers
- Task dependency chains with upstream selectors, cycle prevention, blocked-by task cards, downstream impact highlighting, and leadership messages such as “Campaign delayed because Poster Approval is pending.”
- Task Handover packages with recipient selection, status/progress snapshot, last action, waiting for, next action, important notes, ownership transfer, notification, and audit trail entry.
- Squirrel, Angad, Sugriv, and HANUMAN task families
- Owners, multiple assistants, responsibility notes, subtasks, progress journals, evidence, guidance, archive/restore, acknowledgments, and audit trail
- MOM Directory with attendance-first capture, present/absent selection, locked written MOM content, quick task assignment, and cross-department assignment
- Event Planner with departments, roles, in-charges, categorized task rows, reusable templates, and reports
- Yearly Calendar with restricted editing and visibility controls
- Notices & Feedback with targeting, multimedia content, expiry/bin lifecycle, private replies, polls, open questions, star ratings, and Seen acknowledgments
- People & hierarchy with photo profiles, schedules, weekly offs, attendance, leave/sick status, and Director/CEO access management
- Role Access Matrix
- Audit Log with sensitive-action filtering, analytics, daily digest readiness, and CSV export
- Responsive layouts for task, event, profile, notification, and audit views

## Package contents

The ZIP includes the complete application source and configuration, excluding generated dependency folders and Git history. The receiving developer should run `pnpm install` after extracting it.
