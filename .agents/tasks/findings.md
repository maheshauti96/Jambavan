# JAMBAVAN: findings and local setup plan

Workspace root (quote every path, it has spaces and parentheses):
`/Users/maheshauti/Documents/Startups/JAMBAVAN (1)`
Target build dir: `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app`

## 0. Zip vs flat files (decision)

- `JAMBAVAN-developer-package.zip` (160 entries) is the canonical, complete project: `client/`, `server/`, `shared/`, `drizzle/`, `patches/`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `Dockerfile`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `README.md`, `docs/`, `DEVELOPER_HANDOFF.md`.
- The flat files in the workspace root are a partial copy of it. Compared byte for byte with the zip (extracted to /tmp/jz):
  - identical: App.tsx, main.tsx, routers.ts, db.ts, schema.ts (= drizzle/schema.ts), package.json, index.html, manus-routes.json, app.config.ts, vite.config.ts, ideas.md, the Handoff .md, and 'JAMBAVAN standard operating language.md' (= docs/jambavan-standardization.md)
  - OLDER than the zip: `Home.tsx` (flat 168 KB vs zip 162 KB), `index.css`, `plan.md`.
    - The flat Home.tsx still has the duplicate "Meetings" capture flow (`meetings` seed, `showMeetingModal`, `createMeeting`).
    - The zip's Home.tsx removed it in favour of MOM Directory only and uses the standardized labels ("Project responsibility", "HANUMAN mission").
    - The zip's index.css adds a "Standardized content and governance layer" block, and its plan.md adds an "Approved standardization direction" section.
  - The flat `authentication.md`, `database.md`, `development.md`, `design.md`, `SKILL.md`, `scheduled-work.md`, `route-manifest.md` and `git-checkpoints.md` are generic Manus platform reference docs (not in the zip). They describe the platform, not this app's code.
- Decision: build from the ZIP. Do not use the flat Home.tsx. Leave the flat files untouched.

## (a) Brief: what JAMBAVAN is

1. JAMBAVAN is an "execution and accountability workspace for coaching institutes" (the repo's own positioning line). It turns meeting decisions (MOM = minutes of meeting) into owned, tracked tasks.
2. It is for institute leadership (CEO, Directors), Department Heads and Employees across departments such as Academic, Admissions, Operations and Marketing.
3. Work is split into four Ramayana-themed "task families": Squirrel (small task, one owner), Angad (larger individual deliverable, optional subtasks), Sugriv (team task: owner plus contributors), HANUMAN (long-running strategic mission).
4. Every task has one Task Owner, who alone completes the parent task. Contributors report their own part. Tasks carry a source: manual, MOM, event, project responsibility or HANUMAN mission.
5. The official meeting flow is the MOM Directory: attendance first, then date, department, Meeting Head and Secretary, written MOM, explicit task rows, and the MOM is locked once saved.
6. Tasks support subtasks, progress journals, Completion Evidence and Task Guidance attachments, acknowledgments ("seen"/"ack"), archive and restore.
7. Leadership gets a cross-department dashboard, department pulse, encouragement-style reward tiers, and a role access matrix.
8. Other modules: Event Planner (roles, in-charges, categorized task rows, reusable templates), Yearly Calendar with visibility rules, Notices and Feedback (targeting, polls, open questions, star ratings), People profiles with attendance and leave status, and an Audit Log with CSV export.
9. Look and feel: the "Monsoon Ledger" theme (warm parchment, indigo ink `#1F2A56`, saffron `#F2A93B`), with photo-first people cards.
10. IMPORTANT reality check: as shipped, this is a front-end prototype. The whole product lives in one React component (`client/src/pages/Home.tsx`, about 1050 lines, roughly 160 KB) with hard-coded seed data (Arjun Mehta, Priya Nair, etc.) and in-memory `useState`. The server has only `auth.me`, `auth.logout` and `system.*`. No feature table exists in the database, and nothing calls tRPC from the UI (grep for `trpc|localStorage|fetch(` in Home.tsx found nothing). Refreshing the page resets all data.
11. The handoff doc itself says the prototype needs real server-side auth and authorization and persistence before production, and recommends incremental persistence (users, departments, memberships, tasks, contributors, MOM, audit events first).

## (b) Feature list

### User-facing views (all inside `Home.tsx`, view switched by `activeView` state; there is only one route, `/`)
Verified in code (views and their render blocks exist):
- My feed (`feed`), Department (`department`), MOM Directory (`momDirectory`), Dashboard (`dashboard`), Yearly Calendar (`calendar`), Event Planner (`eventPlanner`), JAMBAVAN Guide (`guide`), Projects (`projects`), People (`people`), My Profile (`myProfile`).
- Role Access Matrix (`roleMatrix`) and Audit Log (`auditLog`) are only shown when `canManageEmployeeAccess` is true.
- Task modal, TaskCard with subtasks/updates/attachments/acknowledge/archive, notification drawer and notices/feedback UI (40 "Feedback" references in Home.tsx), mobile nav, filters.
- Unused leftover `meetings` ViewKey: it exists in the type but is not in the nav (the standardization intentionally removed it).

Unverified (claimed in docs only, not confirmed by reading the code or not persisted):
- "Daily digest" emails. The code has only a digest display in-app, and the Handoff says the email provider is not configured (unverified beyond the UI label).
- Real file/photo upload. Only an `/manus-storage/...` URL convention and attachment UI exist. Nothing is uploaded to a server.
- Server-side role enforcement, soft deactivation of employees, and persistence of tasks, MOM and notices. These are described as the "production path", not built.
- Reward tiers (Bronze/Silver/Gold) and other dashboard details in plan.md. Dashboard code exists but I did not audit each metric.

### Backend (server/)
- `server/routers.ts`: `appRouter` = `system` (systemRouter) + `auth.me` (public query) + `auth.logout` (public mutation). No feature routers, only a TODO comment.
- `server/_core/systemRouter.ts`: `system.health` (public query, needs `{timestamp}`), `system.notifyOwner` (admin only, calls the Manus notification API).
- `server/_core/trpc.ts`: `publicProcedure`, `protectedProcedure`, `adminProcedure` (superjson transformer).
- Express routes in `server/_core/index.ts`: `GET /api/health` (`{status:"ok"}`), `GET /api/platform/config.js` (public Manus config injected as `window.__MANUS_CONFIG__`), `GET /api/oauth/callback`, `/api/trpc/*`. Dev: Vite middleware. Prod: static files from `dist/public`. Body limit 50 MB.
- Unused Manus helper modules in `server/_core/`: llm.ts, imageGeneration.ts, voiceTranscription.ts, map.ts, dataApi.ts, notification.ts, storageProxy.ts, heartbeat.ts, plus `server/storage.ts`. Present but not wired to any UI feature.
- Tests: `server/auth.logout.test.ts`, `server/platform.test.ts` (vitest, node environment, fully mocked, no DB or network needed).

### Data model
- One table only: `users` (id, openId unique, name, email, loginMethod, role enum user|admin, createdAt, updatedAt, lastSignedIn). MySQL dialect. Files: `drizzle/schema.ts`, `drizzle/0000_initial_users.sql`, `drizzle/meta/*`.
- Everything else (tasks, MOM, notices, events, calendar, feedback, profiles, audit) is in-memory TypeScript types inside Home.tsx. No tables exist for them.

### Auth / roles
- Server: Manus OAuth (`/api/oauth/callback`, cookie `webdev_app_session`, JWT via `jose`, HS256 with `MANUS_JWT_SECRET`). DB roles are only `user` and `admin`. `OWNER_OPEN_ID` auto-promotes to admin.
- UI: the four roles CEO / Director / Department Head / Employee and the permission matrix are front-end state only. The permission checks are cosmetic. The user is hard-coded ("You" / Arjun Mehta).
- The page `/` does NOT call `useAuth`, so no login is needed to view the app.

### Integrations
- All Manus-platform: OAuth portal, the Forge/API (LLM, image generation, voice transcription, maps, data API, notifications, storage), and `/manus-storage/` managed images. None are used by the UI today.

### Scheduled jobs
- `server/_core/heartbeat.ts` and `scheduled-work.md` describe the platform "Heartbeat" cron (callback under `/api/scheduled/*`). No scheduled handler is registered (`routers.ts` has none). Unverified and not implemented.

## (c) Tech stack (package.json)

- Package manager: pnpm 10.18.0 (`"packageManager": "pnpm@10.18.0"`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` with a wouter@3.7.1 patch in `patches/`, an override `tailwindcss>nanoid: 3.3.7`, and onlyBuiltDependencies `@tailwindcss/oxide`, `esbuild`). Node expected: 22 (Dockerfile `node:22-bookworm-slim`; local Node is v22.23.2, OK).
- Frontend: React ^19.2.1, Vite ^7.1.7, @vitejs/plugin-react ^5.0.4, Tailwind CSS ^4.1.14 (@tailwindcss/vite), wouter ^3.3.5 (patched), shadcn/Radix UI, framer-motion ^12, lucide-react ^0.453, recharts ^2.15, react-hook-form ^7 + zod ^4.1, sonner, @tanstack/react-query ^5.90, tRPC client/react-query ^11.6, superjson ^1.13.
- Backend: Express ^4.21, @trpc/server ^11.6, tsx ^4.19 (dev runner), esbuild ^0.25 (server bundle), jose 6.1.0, axios, dotenv ^17, @aws-sdk/client-s3.
- DB: drizzle-orm ^0.44.5, drizzle-kit ^0.31.4, mysql2 ^3.15 (MySQL/TiDB dialect).
- Language/tooling: TypeScript 5.9.3, vitest ^2.1.4, prettier ^3.6.
- Scripts: `dev` = `NODE_ENV=development tsx watch server/_core/index.ts`; `build` = `vite build && esbuild server/_core/index.ts ... --outdir=dist`; `start` = `NODE_ENV=production node dist/index.js`; `check` = `tsc --noEmit`; `test` = `vitest run`; `db:push` = `drizzle-kit generate && drizzle-kit migrate`; `db:migrate` = `drizzle-kit migrate`; `dev:static` = `vite --host 0.0.0.0 --port ${PORT:-3000} --strictPort`.

## Environment variables (names only; from grep of `process.env` / `import.meta.env`)

No `import.meta.env` use anywhere. `process.env` names:
- `DATABASE_URL`: used by `server/db.ts` (lazy, optional) and `drizzle.config.ts` (required only for drizzle-kit commands).
- `MANUS_PROJECT_ID`, `MANUS_JWT_SECRET`, `MANUS_OAUTH_API_URL`, `OWNER_OPEN_ID`: auth (`server/_core/env.ts`).
- `MANUS_API_URL`, `MANUS_API_KEY`: Forge API (LLM/image/storage/notify), only used when those helpers are called.
- `MANUS_OAUTH_PORTAL_URL`, `MANUS_API_BROWSER_KEY`: browser-public config (`publicConfig.ts`).
- `PORT` (default 3000) and `NODE_ENV`.
- Test-only names referenced in platform.test.ts: `MANUS_ANALYTICS_ENDPOINT`, `MANUS_ANALYTICS_WEBSITE_ID`.

Minimum needed to run the UI locally: NONE. The home page needs no env vars and no DB. The server starts without them (it logs a "MANUS_OAUTH_API_URL is not configured" error at boot but does not exit).

## (d) Local setup plan

1. Extract the zip into the target dir (does not touch the originals):
   `mkdir -p "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app" && unzip -o "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/JAMBAVAN-developer-package.zip" -d "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app"`
2. Get pnpm 10.18.0. pnpm is NOT installed now (`pnpm: command not found`); corepack 0.34 is present. Prefer `corepack enable` (if it needs sudo for `/usr/local/bin`, use `corepack pnpm@10.18.0 ...` or `npx -y pnpm@10.18.0 ...` instead and avoid a global install).
3. Install, with cwd = `jambavan-app`: `pnpm install --frozen-lockfile` (the lockfile is included and `patches/` must exist for the wouter patch).
4. Create `jambavan-app/.env` (gitignored; the extracted tree has no .git). Safe local placeholders (not real secrets):
   ```
   PORT=3000
   NODE_ENV=development
   MANUS_JWT_SECRET=local-dev-only-change-me-32chars-min
   MANUS_PROJECT_ID=jambavan-local
   OWNER_OPEN_ID=local-owner
   # Optional, only if you want a DB:
   # DATABASE_URL=mysql://root:localdev@127.0.0.1:3306/jambavan
   ```
   Leave MANUS_OAUTH_API_URL, MANUS_OAUTH_PORTAL_URL, MANUS_API_URL, MANUS_API_KEY and MANUS_API_BROWSER_KEY unset. Never point DATABASE_URL at any remote or production DB.
5. Database: NOT required for the current app (the UI is in-memory and the server runs without `DATABASE_URL`). If wanted anyway (only to exercise `users` upsert), use a local MySQL 8 in Docker (docker is installed; mysql is not):
   `docker run -d --name jambavan-mysql -e MYSQL_ROOT_PASSWORD=localdev -e MYSQL_DATABASE=jambavan -p 3306:3306 mysql:8`
   then migrate with `pnpm db:migrate` (applies `drizzle/0000_initial_users.sql`). Use `db:migrate`, not `db:push`, since `db:push` first runs `drizzle-kit generate`. Skip by default.
6. Verify before running: `pnpm check` (tsc) and `pnpm test` (vitest, mocked, no network).
7. Start: `pnpm dev`, which serves Express plus Vite middleware on `http://localhost:3000`. Health: `http://localhost:3000/api/health` returns `{"status":"ok"}`. Route manifest: `/manus-routes.json`.
   Alternative frontend-only server: `pnpm dev:static` (Vite on 3000, strict port).
8. Optional production-like check: `pnpm build && pnpm start` (serves `dist/public`).
9. If port 3000 is busy, run with `PORT=3001` (server) and open that port. `vite.config.ts` allowedHosts includes localhost and 127.0.0.1, so `localhost` is fine.

## (e) Known blockers (Manus-only) and workarounds

- Login / `auth.me` / tRPC `protectedProcedure`s: need the Manus OAuth portal (`MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL`, `MANUS_PROJECT_ID`). This can't work locally. Also `startLogin()` throws "Manus login is not configured" if invoked. It only triggers on an UNAUTHORIZED tRPC error, and nothing in the UI calls a protected procedure. So NO workaround is needed to see the app. If auth is ever wanted locally, the smallest change is a dev-only bypass in `server/_core/context.ts`, gated by `process.env.DEV_AUTH_BYPASS === "1"` AND `NODE_ENV !== "production"`, returning a fixed admin user. Do not add this now.
- Forge API helpers (LLM, image, voice, maps, storage, notifyOwner): need `MANUS_API_URL` and `MANUS_API_KEY`. They are unused by the UI, so nothing to do.
- `/manus-storage/...` images: profile photos (`peoplePhotos` in Home.tsx) and the body / `.ramayana-ribbon` backgrounds in index.css reference platform-hosted files that don't exist locally. Expect broken avatar images (alt text shown) and a plain background. Cosmetic only. Optional fix: a tiny dev-only middleware or local placeholder files. Not required.
- `vite.config.ts` includes the Manus debug-collector plugin, which writes `.manus-logs/` locally (harmless), and `@builder.io/vite-plugin-jsx-loc`.
- Email digests, scheduled Heartbeat jobs and object storage uploads: not implemented, Manus-dependent, out of scope.

## Caveats / what was NOT verified

- Nothing was installed or run yet. The `pnpm check`, `pnpm test`, and `pnpm dev` outcomes are unverified until the next step.
- I did not read every line of Home.tsx (about 1050 very long lines). The per-view feature list comes from the type definitions, nav items, seed data and render-block headers.
- Zip timestamps show 2026 dates. Treat them as given.
