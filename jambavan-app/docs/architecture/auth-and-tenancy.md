# Authentication, tenancy and authorization

Status: **draft for review**. The recommendations here assume decisions 1–4 in [the architecture overview](README.md#5-decisions-needed): PostgreSQL, our own hosting, Better Auth, and phone OTP plus Google.

## 1. Concepts

| Term           | Meaning                                                                             | Scope                               |
| -------------- | ----------------------------------------------------------------------------------- | ----------------------------------- |
| **Platform**   | Jambavan the SaaS: us, the operator                                                 | Global                              |
| **User**       | A login identity: a verified phone number and/or email, plus linked Google accounts | Global. One person, one user.       |
| **Tenant**     | One coaching institute and its isolated data                                        | —                                   |
| **Branch**     | An optional centre or campus inside a tenant                                        | Tenant                              |
| **Department** | Academic, Admissions, Operations, Marketing…                                        | Tenant                              |
| **Employee**   | A person's profile and access inside one tenant: role, department, schedule, status | Tenant. Linked to at most one user. |

**User** and **Employee** are separate on purpose:

- A Director creates the employee profile before the person has ever signed in. The employee row exists with `user_id = null` and `access_status = 'invited'`.
- One person can work for two institutes, such as a visiting faculty member or a director who owns two centres. That person has one user and two employee rows, and a tenant switcher in the top bar.
- Deactivating an employee removes that person's access to one tenant. Their login and their other tenants are unaffected.

## 2. Tenancy model

**Recommendation: one shared database and schema, with `tenant_id` on every tenant-owned row.**

| Option                                               | Verdict                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Shared schema + `tenant_id` + row-level security** | **Chosen.** Institutes are small, from 10 to a few hundred staff, and we expect many of them. This option needs one migration path, one connection pool and cheap tenants. RLS supplies the isolation guarantee that this model otherwise lacks. |
| Schema per tenant                                    | Migrations fan out across N schemas, and cross-tenant platform reporting gets harder. Isolation is no better than RLS.                                                                                                                           |
| Database per tenant                                  | Strongest isolation, highest cost and operational load. We keep it as an escape hatch: because every row carries `tenant_id`, a large customer can later be moved to a dedicated database with the same schema.                                  |

### 2.1 Isolation layers

No single layer is trusted alone:

1. **The tenant comes from the session, never from request input.** The session stores `active_tenant_id`. Switching tenants is a mutation that verifies the user has an active employee row in the target tenant. Request bodies never carry a `tenantId` that the server trusts.
2. **`tenantProcedure` middleware.** It resolves the employee row for `(user, active tenant)` and rejects the request if the row is missing, `suspended` or `removed`. It loads the role and permission set, then runs the handler in a transaction with the tenant context set.
3. **Composite foreign keys.** Every tenant table has `UNIQUE (tenant_id, id)`, and child tables reference `(tenant_id, parent_id)`. The database itself refuses a task in tenant A that points at an employee in tenant B.
4. **Row-level security.** The app connects as `jambavan_app`, a role that owns no tables and lacks `BYPASSRLS`. Every tenant table carries the policy below. A forgotten `WHERE tenant_id = …` returns other tenants' rows only if RLS is also broken.
5. **Storage keys** start with `tenants/<tenant_id>/`, and signed URLs are issued only after a permission check on the owning record.
6. **Jobs, caches and logs carry `tenant_id`.** Every job payload includes it. A job sets the tenant context before it touches data, exactly as a request does.
7. **Tests.** A cross-tenant suite creates two tenants. For every router procedure it asserts that tenant B can neither read nor mutate tenant A's records by ID. A database test asserts that a query without tenant context returns zero rows.

```sql
-- Pattern for every tenant-owned table (shown for tasks).
CREATE TABLE tasks (
  id                uuid PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         uuid NOT NULL REFERENCES tenants (id),
  owner_employee_id uuid NOT NULL,
  -- …
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, owner_employee_id) REFERENCES employees (tenant_id, id)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks
  USING      (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
```

```ts
// tenantProcedure: every tenant-scoped handler runs inside this transaction.
await db.transaction(async tx => {
  await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true),
                              set_config('app.user_id',   ${userId},   true)`);
  return next({ ctx: { ...ctx, tx, employee, permissions } });
});
```

`set_config(…, true)` is transaction-local, so it is safe behind a transaction-mode connection pooler. Drizzle can declare these policies next to the tables with `pgPolicy`, which keeps the schema and its policies in one place.

### 2.2 Tenant lifecycle

| State              | Meaning                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `trial` / `active` | Normal use                                                                                                                                                                                       |
| `suspended`        | Read-only for unpaid or abusive tenants. Sign-in works, mutations return 403, and data is kept.                                                                                                  |
| `closed`           | No access. After the contractual retention window, a deletion job erases all rows keyed by `tenant_id` plus the `tenants/<id>/` storage prefix, and logs that it did so in a platform-level log. |

**Provisioning (pilot):** platform staff create the tenant, its departments and the first CEO employee, and send the CEO an invitation. Self-serve sign-up adds the same steps behind a form. **Export:** a CEO can request a full export (JSON + CSV + files ZIP) at any time. Institutes are data fiduciaries for their staff under India's DPDP Act and we are their processor, so export and erasure must work before the first paying customer.

## 3. Authentication

### 3.1 Why not keep the current setup

The starter authenticates through Manus OAuth: every staff member would need a Manus account, and the flow only works on Manus hosting. It also issues a **one-year signed JWT cookie that cannot be revoked**, so a deactivated employee would keep a valid token. Replace both.

### 3.2 Methods

| Method                                          | Use                                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phone OTP**, WhatsApp first with SMS fallback | Primary. Matches the phone number already on every profile. Codes have 6 digits, expire in 5 minutes and allow 5 attempts. Sending is rate-limited per number and per IP. |
| **Sign in with Google**                         | Convenience for staff with Google accounts. It links to the existing user only when the Google email matches a verified email on that user.                               |
| Email magic link                                | Optional fallback for leadership                                                                                                                                          |
| Passwords                                       | Not offered at launch. This removes password resets, credential stuffing and weak passwords.                                                                              |
| 2-step verification                             | Offered later for CEO and Director accounts (TOTP)                                                                                                                        |

**Recommended library: Better Auth.** It is TypeScript, runs inside our Express server and stores data in our Postgres through its Drizzle adapter. Its plugins cover phone number, magic link and two-factor authentication. We use it **only** for identity: users, linked accounts, sessions and verification codes. Tenancy, employees and permissions remain our own tables, because the employee model is richer than a generic "organization member". Alternatives: Supabase Auth if the database is Supabase too, or Clerk if we would rather pay to outsource auth, accepting per-user cost and the data leaving our database.

### 3.3 Invitations and account linking

1. A Director with `people.manage_access` adds an employee. The employee row is created as `invited`, and an `invitations` row stores a hashed token, the channel and an expiry (7 days).
2. The person opens the link, or simply signs in with the invited phone number or email.
3. On first sign-in the server matches the **verified** phone or email to pending invitations, links `employees.user_id` and sets `access_status = 'active'`. If several tenants invited the same person, each invitation is accepted separately.
4. A verified identity that matches no employee in any tenant sees a "No institute has invited you yet" screen. No tenant data is ever reachable without an employee row.

Optionally, a tenant can require a profile photo before activation, as `ideas.md` proposes. That is a tenant setting, enforced when the invitation is accepted.

### 3.4 Sessions

- Sessions are stored server-side (the `session` table) behind an opaque token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. Each session records `active_tenant_id`, IP, user agent and last-seen time.
- Sessions slide for 30 days and renew on use. Each tenant can configure a shorter lifetime for shared front-desk computers.
- **Revocation is immediate.** `tenantProcedure` reads the employee's `access_status` on every request, from a cache that holds entries for 30 seconds at most. Deactivating an employee therefore cuts off that tenant within seconds, even when the session is still valid. "Sign out everywhere" and "Sessions" (a device list) appear in My Profile.
- CSRF has three defences. `SameSite=Lax` keeps the cookie off cross-site POSTs. tRPC mutations are JSON POSTs, which a cross-site form cannot produce. The server also rejects any non-GET request whose `Origin` header is not the app's origin.

## 4. Roles and permissions

### 4.1 Access roles

Each employee has **one** access role. Workflow roles such as Task Owner, Contributor, Meeting Head, MOM Secretary and Event in-charge are relationships on records, not access roles.

| Role              | Default scope                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `ceo`             | The whole tenant, including settings, billing and the Access Matrix. **Cannot be restricted.**    |
| `director`        | The whole tenant. Directors can edit the Access Matrix for the Department Head and Employee rows. |
| `department_head` | Departments where they are `departments.head_employee_id`, plus whatever the matrix grants        |
| `employee`        | Their own work, plus their department's shared items                                              |

### 4.2 Permission catalogue

The Access Matrix (`role_permissions`) stays tenant-editable. Codes replace the current display strings:

| Code                            | Current label                                     | CEO | Director | Dept Head | Employee |
| ------------------------------- | ------------------------------------------------- | :-: | :------: | :-------: | :------: |
| `org.view_all_departments`      | View all departments                              |  ●  |    ●     |     ○     |    ○     |
| `people.manage_access`          | Manage employee access                            |  ●  |    ●     |     ○     |    ○     |
| `tasks.edit_reassign`           | Edit or reassign tasks                            |  ●  |    ●     |     ●     |    ○     |
| `calendar.create`               | Create calendar events                            |  ●  |    ●     |     ○     |    ○     |
| `notices.send_targeted`         | Send targeted notices                             |  ●  |    ●     |     ●     |    ○     |
| `tasks.view_private`            | View private tasks                                |  ●  |    ●     |     ●     |    ○     |
| `reports.export`                | Export reports                                    |  ●  |    ●     |     ●     |    ○     |
| `meetings.record`               | _(new)_ Record a MOM                              |  ●  |    ●     |     ●     |    ○     |
| `meetings.add_tasks_after_lock` | _(new)_ Add task rows to a locked MOM             |  ●  |    ●     |     ●     |    ○     |
| `events.manage`                 | _(new)_ Create and edit event plans and templates |  ●  |    ●     |     ●     |    ○     |
| `projects.manage`               | _(new)_                                           |  ●  |    ●     |     ●     |    ○     |
| `feedback.create`               | _(new)_                                           |  ●  |    ●     |     ●     |    ○     |
| `attendance.mark`               | _(new)_                                           |  ●  |    ●     |     ●     |    ○     |
| `leave.approve`                 | _(new)_                                           |  ●  |    ●     |     ●     |    ○     |
| `audit.view`                    | _(new; today tied to Manage employee access)_     |  ●  |    ●     |     ○     |    ○     |
| `departments.manage`            | _(new)_                                           |  ●  |    ●     |     ○     |    ○     |

● default on, ○ default off. Defaults for the new rows are proposals.

**Guard rails, enforced on the server:**

- The CEO row is fixed: every permission is on and none can be toggled.
- Only the CEO and Directors can change the matrix. Directors cannot change their own row. Every change is a sensitive audit event.
- A tenant must keep at least one active CEO, so the last one cannot be deactivated or demoted.
- Nobody can deactivate, remove or change the role of themselves. This is today's `SELF_GUARD_MESSAGE`, now enforced on the server.

### 4.3 Department scope

A permission held by a `department_head` applies only to records in their scope departments, unless they also hold `org.view_all_departments`. Cross-department assignment, which the MOM Directory allows today, is permitted: an assignee may be in any department, but the record belongs to the department it was created for.

## 5. Record visibility

| Record                        | Who can read it                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Task, `department` visibility | Members of the task's department; the owner and Contributors; anyone with `org.view_all_departments`; the department's head |
| Task, `private` visibility    | The owner, the Contributors and the creator; holders of `tasks.view_private` within scope                                   |
| Task, `leadership` visibility | The owner and Contributors, CEO, Directors, and the head of the task's department _(to be confirmed, decision 8)_           |
| Meeting (MOM)                 | Its department and its attendees; holders of `org.view_all_departments`                                                     |
| Notice                        | Its resolved recipients and its sender. Leadership sees receipt counts.                                                     |
| Notice reply                  | **Only the replier and the notice's sender**                                                                                |
| Feedback responses            | The creator and leadership in scope. Each respondent sees their own response.                                               |
| Calendar event                | Employees who match its visibility targets                                                                                  |
| Audit log                     | `audit.view`. My Day actions are never written to it.                                                                       |
| **My Day**                    | **Only the employee it belongs to.** This is enforced in code and by a second RLS policy keyed on `app.user_id`.            |

Lists are filtered in SQL with the same predicates, never fetched in full and filtered in the browser.

## 6. Record-level action rules

These rules come from the prototype's pure functions and the standard operating language. **New** marks rules the prototype does not enforce today.

| Action                                                 | Allowed for                                                                                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create a task                                          | Anyone, for themselves. Assigning to others needs `tasks.edit_reassign` in scope. **New**: today the prototype has no check.                         |
| Edit or reassign a task                                | `tasks.edit_reassign` in scope                                                                                                                       |
| Complete the parent task                               | **Task Owner only** (`completeTaskPure`)                                                                                                             |
| Mark a Contributor's part done or undone               | That Contributor, or the Task Owner. **New**: today anyone can toggle any part.                                                                      |
| Post a progress update, add a subtask, attach evidence | Owner and Contributors; holders of `tasks.edit_reassign`                                                                                             |
| Report or clear a blocker                              | Owner and Contributors                                                                                                                               |
| Hand a task over                                       | The current owner, or `tasks.edit_reassign` in scope. The recipient must be an active employee in the same tenant (`validateHandover`).              |
| Set a dependency                                       | Same as edit. The upstream task must be in the same tenant and must not create a cycle (`wouldCycle`).                                               |
| Archive or restore                                     | `tasks.edit_reassign` in scope, or the creator while the task is untouched. **New**: today anyone can.                                               |
| Hard-delete a task                                     | The creator within 15 minutes of creation with no activity; otherwise nobody. Everyone else archives. **New**: today the prototype deletes outright. |
| Record and lock a MOM                                  | `meetings.record`. The Meeting Head and MOM Secretary must be attendees.                                                                             |
| Add tasks to a locked MOM                              | `meetings.add_tasks_after_lock`                                                                                                                      |
| Send a notice to targets outside your own department   | `notices.send_targeted`                                                                                                                              |
| Deactivate, reactivate, remove or restore an employee  | `people.manage_access`, plus the guard rails in §4.2                                                                                                 |

The rules live in `shared/domain/policy.ts` as pure functions of the form `can(actor, action, resource) → boolean | reason`. The server calls them before every mutation, and the client calls them to decide which controls to show. Each rule has unit tests on both paths.

## 7. Platform administration and support access

- `platform_admins` lists our own staff. Platform routes such as tenant provisioning, suspension and closure use a separate router and are never reachable through tenant sessions.
- Platform staff have **no standing access to tenant data**. A CEO or Director grants **support access** from settings for a reason and a time window (24 hours by default). While the grant is active, a support session acts as a read-only pseudo-employee. Every request is audited with `on_behalf_of`, and the tenant sees a banner.
- Support access can never read My Day or notice replies.

## 8. Audit and privacy

- `audit_events` is append-only. The app role holds only `INSERT` and `SELECT` on it. Each event stores the actor (user and employee), the action code, the entity, a summary, structured detail, and the IP address and user agent for sensitive actions.
- The current "sensitive actions" list becomes an `is_sensitive` flag set from the action code. That list covers access changes, employee lifecycle, exports, the Access Matrix, support access and sign-ins from new devices.
- My Day, OTP codes and notice reply bodies never appear in audit detail.
- Personal data (phone, email, photo, attendance, leave) is limited to people with a work need. The tenant export and erasure jobs (§2.2) satisfy access and deletion requests.
