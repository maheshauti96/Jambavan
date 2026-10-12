# JAMBAVAN: local setup report

App folder: `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app`
Dev server: `http://localhost:3000` (running in the background, see section d)
Status: type-check passes, tests pass (6/6), production build passes, dev server serves the app and the UI renders with no console errors.

---

## (a) What JAMBAVAN is

1. JAMBAVAN is an "execution and accountability workspace for coaching institutes". It turns meeting decisions into owned, tracked tasks.
2. It is meant for institute leadership (CEO, Directors), Department Heads and Employees across departments such as Academic, Admissions, Operations and Marketing.
3. The core idea is the MOM (minutes of meeting). A meeting is recorded once, the written record is locked, and each action item becomes a task with a single Task Owner.
4. Work is split into four Ramayana-themed task families: Squirrel (small task, one owner), Angad (larger individual deliverable, optional subtasks), Sugriv (team task: owner plus contributors) and HANUMAN (long-running strategic mission).
5. Only the Task Owner can complete the parent task. Contributors report their own part. Tasks have a source: manual, MOM, event, project responsibility or HANUMAN mission.
6. Tasks support subtasks, progress journals, Completion Evidence and Task Guidance attachments, "seen" and "acknowledge" marks, and archive and restore.
7. Leadership gets a cross-department dashboard, a department view, reward tiers and a role access matrix.
8. Other modules: Event Planner, Yearly Calendar, Notices and Feedback (polls, open questions, star ratings), People profiles, and an Audit Log.
9. The look is the "Monsoon Ledger" theme: warm parchment background, indigo ink `#1F2A56`, saffron `#F2A93B`, photo-first people cards.
10. Reality check: as shipped, this is a front-end prototype. The whole product is one React component (`client/src/pages/Home.tsx`) with hard-coded seed data (Arjun Mehta, Priya Nair and others) held in `useState`.
11. The server has only `auth.me`, `auth.logout` and `system.*`. There is no feature table in the database, and nothing in the UI calls the API. Refreshing the page resets all data.
12. The project's own handoff doc says real server-side auth, authorization and persistence are still to be built before production.

---

## (b) Features (grouped)

### User-facing views (all in `Home.tsx`, switched by `activeView` state; the only route is `/`)

Verified by running the app (sidebar items and view contents seen in the browser):
- My feed, Department, Dashboard
- MOM Directory (department-wise MOMs, "MOM / written record", MOM action items, "Assign / add task")
- Event Planner, Yearly Calendar, Notices & feedback
- People, My profile, Access matrix, Audit log ("A complete history of sensitive actions", activity ledger)
- Task cards: family tag, source tag, priority, due date, owner and contributors, subtasks, Files & links, Mark seen, Acknowledge, Complete, Reopen, Archive, Edit
- Notice board (notices with targeting, reply, seen) and feedback requests (poll, open question)
- Sidebar role-gated items (Access matrix, Audit log) are visible for the hard-coded user Arjun Mehta (Department Head, Academic)

Opened and confirmed to render without console errors: My feed, MOM Directory, Dashboard, Event Planner, Yearly Calendar, People, Audit log (clicked through in Chrome). Not clicked through: Department, Notices & feedback page, My profile, Access matrix, the task create/edit modals, the notification drawer, search.

Unverified (doc or code only, not exercised):
- Daily digest emails: the handoff says no email provider is configured.
- Real file or photo upload: only an attachment UI and a `/manus-storage/...` URL convention exist. Nothing is uploaded to a server.
- Server-side role enforcement, employee soft deactivation, and persistence of tasks, MOM and notices: described as the "production path", not built.
- Reward tiers (Bronze/Silver/Gold) and the exact dashboard metrics from `plan.md`.

### Backend (`server/`)
Verified by reading the code; the ones marked (curl) were also called:
- `appRouter` = `system` + `auth.me` (public query) + `auth.logout` (public mutation). No feature routers.
- `system.health` (curl: `{"result":{"data":{"json":{"ok":true}}}}`, 200), `system.notifyOwner` (admin only, calls the Manus notification API; unverified).
- `auth.me` (curl: returns `null` with no session, 200).
- Express routes: `GET /api/health` (curl: `{"status":"ok"}`, 200), `GET /api/platform/config.js` (curl: 200), `GET /api/oauth/callback` (unverified), `/api/trpc/*`.
- Dev: Vite middleware with HMR. Production: static files from `dist/public`. Body limit 50 MB.
- Unused Manus helper modules in `server/_core/`: LLM, image generation, voice transcription, maps, data API, notification, storage proxy, heartbeat. Present, not wired to any UI feature.
- Tests: `server/auth.logout.test.ts`, `server/platform.test.ts` (vitest, mocked, no DB or network).

### Data model
- One table: `users` (id, openId unique, name, email, loginMethod, role `user|admin`, createdAt, updatedAt, lastSignedIn). MySQL dialect. Files: `drizzle/schema.ts`, `drizzle/0000_initial_users.sql`.
- Tasks, MOM, notices, events, calendar, feedback, profiles and audit entries exist only as in-memory TypeScript types in `Home.tsx`.

### Auth and roles
- Server: Manus OAuth (`/api/oauth/callback`), session cookie `webdev_app_session`, JWT via `jose`. DB roles are only `user` and `admin`. `OWNER_OPEN_ID` auto-promotes to admin.
- UI: CEO, Director, Department Head and Employee roles plus the permission matrix are front-end state only. The user is hard-coded.
- The home page does not call `useAuth`, so no login is needed to view the app.

### Integrations
- Manus platform only: OAuth portal, Forge API (LLM, image, voice, maps, data, notifications, storage), `/manus-storage/` managed images. None of these are used by the UI today, apart from the avatar image URLs.

### Scheduled jobs
- None implemented. `heartbeat.ts` and `scheduled-work.md` describe the Manus platform cron; no scheduled handler is registered. Unverified.

---

## (c) Tech stack (from `package.json` / lockfile)

- Package manager: pnpm 10.18.0 (`packageManager` field, `pnpm-lock.yaml`, `pnpm-workspace.yaml` with a `wouter@3.7.1` patch in `patches/`). Node 22 expected (Dockerfile `node:22-bookworm-slim`); local Node is v22.23.2.
- Frontend: React 19.2.1, Vite 7.1.9, @vitejs/plugin-react 5.0.4, Tailwind CSS 4.1.14 (@tailwindcss/vite), wouter 3.7.1 (patched), Radix UI / shadcn, framer-motion, lucide-react, recharts 2.15.4, react-hook-form 7.64.0, zod 4.1.12, sonner 2.0.7, @tanstack/react-query 5, @trpc/client and react-query 11, superjson 1.13.3.
- Backend: Express 4.21, @trpc/server 11, tsx 4.20.6 (dev runner), esbuild 0.25.10 (server bundle), jose 6.1.0, axios, dotenv 17, @aws-sdk/client-s3.
- Database layer: drizzle-orm 0.44, drizzle-kit 0.31.5, mysql2 3.15 (MySQL/TiDB dialect).
- Tooling: TypeScript 5.9.3, vitest 2.1.9, prettier 3.6.2.
- Scripts: `dev`, `build`, `start`, `check` (`tsc --noEmit`), `test` (`vitest run`), `db:push` (`drizzle-kit generate && drizzle-kit migrate`), `db:migrate`, `dev:static`.

---

## (d) Local setup (what was done)

### Where the project lives
- The canonical project is `JAMBAVAN-developer-package.zip` (160 entries). The flat files in the workspace root are a partial, partly older copy (the flat `Home.tsx`, `index.css` and `plan.md` are older than the zip's). The app was extracted from the zip.
- Extracted to `/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app`. The original files in the workspace root were not touched.

### Tooling found before installing
- node v22.23.2 (`~/.local/bin/node`), npm 10.9.8, corepack 0.34.0 (under the nvm v24 bin), Docker 28.5.1, Homebrew, psql 16.13 (PostgreSQL client, not used).
- Not present: pnpm, yarn, mysql.

### What was installed on the machine
- Nothing was installed globally and no Homebrew packages were added. No sudo.
- pnpm 10.18.0 was fetched by corepack into its user cache the first time `corepack pnpm@10.18.0 ...` ran. There is no global `pnpm` command.
- Project dependencies went into `jambavan-app/node_modules` (about 542 MB) via `pnpm install --frozen-lockfile`. Versions in `package.json` were not changed.
- No database was installed (see below).

### Files created or changed
- Created: `jambavan-app/.env` (local placeholders only, gitignored; see below).
- Created by build: `jambavan-app/dist/` (from `pnpm build`, gitignored).
- Created by dev server: `jambavan-app/node_modules/.vite` cache and content under `.manus-logs/` (harmless).
- Created outside the project: `/tmp/jambavan-dev.log` (dev server log), `/tmp/jambavan-home.png`, `/tmp/jv-*.txt` (screenshots and snapshots used for verification).
- No source file in the project was modified. No workaround code was added.

### `.env` variables (names only)
- `PORT=3000`, `NODE_ENV=development`
- `MANUS_JWT_SECRET` (local placeholder string, not a real secret), `MANUS_PROJECT_ID=jambavan-local`, `OWNER_OPEN_ID=local-owner`
- Intentionally unset: `MANUS_OAUTH_API_URL`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_API_URL`, `MANUS_API_KEY`, `MANUS_API_BROWSER_KEY` (Manus-hosted, cannot work locally)
- `DATABASE_URL` is commented out; it is optional.

### Database
- Not required to run this app. `server/db.ts` only connects if `DATABASE_URL` is set, and the UI uses no database. No DB was started and no migration was run.
- If you want the `users` table for later work, use a local MySQL only. For example: `docker run -d --name jambavan-mysql -e MYSQL_ROOT_PASSWORD=localdev -e MYSQL_DATABASE=jambavan -p 3306:3306 mysql:8`, set `DATABASE_URL=mysql://root:localdev@127.0.0.1:3306/jambavan` in `.env`, then `pnpm db:migrate`. Prefer `db:migrate` over `db:push`, because `db:push` runs `drizzle-kit generate` first. This path was not run.

### Workarounds
- None in code. Login is not available (no Manus OAuth), and nothing in the UI needs it.

### Running server
- URL: `http://localhost:3000` (also listens on `0.0.0.0:3000`).
- Started with: `nohup corepack pnpm@10.18.0 dev > /tmp/jambavan-dev.log 2>&1 < /dev/null` as a background job in the agent shell.
- Terminal/job id: background job `[2]`, PID 34098 (the pnpm wrapper); the server process is PID 34195. Log: `/tmp/jambavan-dev.log`. (Job `[1]` was an earlier failed attempt and has been killed.)
- Stop it with: `pkill -f "tsx/dist/cli.mjs watch server/_core/index.ts"` (if port 3000 is still held: `kill $(lsof -tiTCP:3000 -sTCP:LISTEN)`).

---

## (e) Verification evidence

### Commands and results (cwd = `jambavan-app`)
- `corepack pnpm@10.18.0 install --frozen-lockfile`: done in 6.2s, no errors.
- `corepack pnpm@10.18.0 check` (`tsc --noEmit`): exit 0, no type errors.
- `corepack pnpm@10.18.0 test` (`vitest run`): 2 files, 6 tests passed. The test log prints `[OAuth] ERROR: MANUS_OAUTH_API_URL is not configured!`, which is expected because that variable is unset.
- `corepack pnpm@10.18.0 build`: exit 0. Vite built 1711 modules; output `dist/public/assets/index-*.js` 1,103 kB (240 kB gzip) and `dist/index.js` 27.5 kB. Warnings only: a chunk larger than 500 kB, `<script src="/api/platform/config.js">` not bundled (no `type="module"`), and one `/manus-storage/...` image "didn't resolve at build time".
- `corepack pnpm@10.18.0 dev`: log shows `Server listening on port 3000`, preceded by `[OAuth] ERROR: MANUS_OAUTH_API_URL is not configured!`. That message is expected without Manus OAuth and the server does not exit. Later log lines: a `baseline-browser-mapping` data-age notice and `[Auth] Missing session cookie` (from `auth.me` with no login; expected).

### HTTP checks (curl)
- `GET /`: 200, `text/html; charset=utf-8`, 1368 bytes. It is the app shell (title "JAMBAVAN · Execution workspace", `<div id="root">`, `/src/main.tsx`, Vite client).
- `GET /api/health`: 200, `{"status":"ok"}`.
- `GET /api/platform/config.js`: 200, `window.__MANUS_CONFIG__={"projectId":"jambavan-local","oauthPortalUrl":"","apiUrl":"","apiBrowserKey":""};`
- `GET /api/trpc/auth.me`: 200, `{"result":{"data":{"json":null}}}`.
- `GET /api/trpc/system.health?input={"json":{"timestamp":1}}`: 200, `{"result":{"data":{"json":{"ok":true}}}}`.
- `GET /src/main.tsx` 200, `GET /src/pages/Home.tsx` 200.
- `GET /manus-routes.json`: 200, `application/json`.

### Browser check (Chrome DevTools)
- Loaded `http://localhost:3000/`. The page title is "JAMBAVAN · Execution workspace". The sidebar, the "Good morning, Arjun" feed, the HANUMAN mission card, the notice board, feedback requests, summary tiles and 7 task cards all rendered. A toast "Welcome back. 3 tasks need your attention today." appeared.
- Console on load: only debug/info messages (Vite connected, Manus debug collector, React DevTools hint) and one "form field should have an id or name" Chrome issue. No errors or warnings.
- Clicked MOM Directory, Dashboard, Event Planner, Yearly Calendar, People and Audit log. Each view rendered (MOM Directory and Audit log content confirmed in the page snapshot). No console errors or warnings after the navigation.
- All 102 network requests in the first page load returned 200 (see the image note below for why this is misleading for the avatars).

### Could NOT verify
- Login, logout, OAuth callback, session cookie, admin-only `system.notifyOwner`: need the Manus OAuth portal and API, which are not available locally.
- Any Forge API helper (LLM, image, voice, maps, storage, notifications): need `MANUS_API_URL` and `MANUS_API_KEY`.
- Database behaviour (`users` upsert, migrations): no DB was started.
- Uploads, email digests, scheduled jobs: not implemented or Manus-dependent.
- Views and modals I did not open (see section b). Behaviour of forms (create task, create MOM, send notice) was not exercised.
- Production server (`pnpm start`): the production build succeeded, but I did not run `pnpm start` or hit it over HTTP.

---

## (f) Known issues, blockers, next steps

- Avatar and background images are broken. The avatars use `/manus-storage/async-images/...` URLs that only exist on the Manus platform. Locally the server's SPA fallback answers them with `index.html` (HTTP 200, `text/html`, 1368 bytes), so the browser shows alt text ("Arjun Mehta profile") instead of photos, and the parchment/ribbon CSS backgrounds that use `/manus-storage/` do not load either. The network log shows 200 for these requests, but the responses are HTML, not images. This is cosmetic and was left as is. If you want real images, the smallest fix is to put placeholder image files under `client/public/manus-storage/...` with the same paths; I did not do that because it changes what you see and is optional.
- Backgrounding `pnpm dev` from an agent shell: `tsx watch` was stopped by the OS (process state `T`) when started as a plain background job, so the port accepted connections but never answered (curl timed out). Restarting with stdin redirected (`< /dev/null`) fixed it. In a normal terminal this does not happen.
- `[OAuth] ERROR: MANUS_OAUTH_API_URL is not configured!` is printed at every server boot. It is expected and harmless locally.
- This is a prototype: all data is in memory and resets on refresh; there is no real auth or permission enforcement; the UI role checks are cosmetic.
- Vite dev with `allowedHosts: true` and the server listening on `0.0.0.0` means anyone on your network can reach port 3000. There is no authentication on the app. Fine for a prototype on a trusted network. The bind address is hard-coded to `0.0.0.0` in `server/_core/index.ts`; change it to `127.0.0.1` if you want it reachable from this Mac only (I did not change it).
- The zip also contains `vite.config.ts.bak` and `.manus-starter-init.json`; they are harmless.
- Recommended next steps if you continue building: (1) add tables for users, departments, memberships, tasks, contributors, MOM and audit events and move the UI state behind tRPC procedures; (2) replace Manus OAuth with your own auth (or a dev-only bypass in `server/_core/context.ts` gated by `NODE_ENV !== "production"`); (3) enforce roles on the server; (4) host images and uploads yourself.

---

## (g) Commands to run it yourself from a fresh terminal

```bash
# 1. go to the app
cd "/Users/maheshauti/Documents/Startups/JAMBAVAN (1)/jambavan-app"

# 2. use pnpm 10.18.0 through corepack (no global install needed)
#    (if you prefer a plain `pnpm`, run `corepack enable` once; it may need write access to the node bin dir)

# 3. install dependencies (only needed on a fresh checkout; already done here)
corepack pnpm@10.18.0 install --frozen-lockfile

# 4. env file: already created at ./.env. To recreate it:
cat > .env <<'EOF'
PORT=3000
NODE_ENV=development
MANUS_JWT_SECRET=local-dev-only-change-me-32chars-min
MANUS_PROJECT_ID=jambavan-local
OWNER_OPEN_ID=local-owner
EOF

# 5. database: not needed for this app. (Optional, local MySQL only)
#    docker run -d --name jambavan-mysql -e MYSQL_ROOT_PASSWORD=localdev -e MYSQL_DATABASE=jambavan -p 3306:3306 mysql:8
#    add DATABASE_URL=mysql://root:localdev@127.0.0.1:3306/jambavan to .env, then:
#    corepack pnpm@10.18.0 db:migrate

# 6. checks
corepack pnpm@10.18.0 check     # TypeScript
corepack pnpm@10.18.0 test      # vitest (6 tests)
corepack pnpm@10.18.0 build     # production build into dist/

# 7. start the dev server, then open http://localhost:3000
corepack pnpm@10.18.0 dev

# 8. quick checks from another terminal
curl -i http://localhost:3000/api/health      # {"status":"ok"}
curl -I http://localhost:3000/                # 200 text/html

# If port 3000 is busy, use another port:
PORT=3001 corepack pnpm@10.18.0 dev
```
