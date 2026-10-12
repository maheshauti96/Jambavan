# JAMBAVAN Task Handover Delta — Integration Guide

## What this package contains

This delta adds only the **Task Handover** feature introduced after the previous developer package.

Previous package baseline: `2b00d0b`
Current source checkpoint: `5f248af`

## Recommended integration method

1. Make a backup or commit any local work in the developer's JAMBAVAN repository.
2. Confirm the repository is based on the previous package/checkpoint:

```bash
git status
git log -1 --oneline
```

3. Copy `jambavan-task-handover.patch` into the project root.
4. Check for conflicts without changing files:

```bash
git apply --check jambavan-task-handover.patch
```

5. Apply the patch:

```bash
git apply jambavan-task-handover.patch
```

6. Install dependencies if needed and validate:

```bash
pnpm install
pnpm check
pnpm build
```

7. Start the app and verify the task feed:

```bash
pnpm dev
```

Open an open task and confirm that **Handover Task** is visible.

## Expected behavior

- Select a receiving employee.
- Enter or review the current status, last action, waiting-for detail, next action, and important notes.
- Create the handover package.
- Confirm that the receiving employee becomes the task owner in the current prototype.
- Confirm that the package appears on the task card.
- Confirm that an in-app notification and audit entry are created.

## If the patch does not apply cleanly

Do not force the patch. The most likely cause is that the developer's files differ from the baseline. Compare the four affected files and merge the Task Handover sections manually:

- `client/src/pages/Home.tsx`
- `client/src/index.css`
- `plan.md`
- `DEVELOPER_HANDOFF.md`

The ZIP also contains the resulting versions of those four files under `files/`.

## Production reminder

The current feature is prototype/UI state. Before production, persist handovers server-side with task ID, sender, receiver, status snapshot, last action, waiting-for detail, next action, notes, actor, and timestamps. Enforce authorized handover permissions on the server and retain handover history.
