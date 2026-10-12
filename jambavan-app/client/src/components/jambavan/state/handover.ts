// F17 (D1–D4): Task Handover passes the mission correctly (§12, §13.2).
import type { Task, TaskHandover } from "./types";
import { staffOptions } from "./seed";
import { initials, statusLabel } from "./format";
import { CURRENT_USER } from "./identity";
import { NOW_LABEL } from "./clock";

/** (a) Recipients: the static staff list without the current Task Owner. The current user is never in it. */
export const handoverRecipients = (task: Task) => staffOptions.filter(person => person !== task.assignee);

/** (b) Default: the first unfinished contributor who is a valid recipient, else "" (the user must choose). */
export function defaultHandoverRecipient(task: Task): string {
  const recipients = handoverRecipients(task);
  return task.assistants.find(assistant => !assistant.completed && recipients.includes(assistant.name))?.name ?? "";
}

export type HandoverDraft = { to: string; lastAction: string; waitingFor: string; nextAction: string; notes: string };
export type HandoverErrors = Partial<Record<"to" | "lastAction" | "nextAction", string>>;

export function validateHandover(task: Task, draft: HandoverDraft): HandoverErrors {
  const errors: HandoverErrors = {};
  if (!handoverRecipients(task).includes(draft.to)) errors.to = "Choose who takes over this task.";
  if (!draft.lastAction.trim()) errors.lastAction = "Describe the last action taken.";
  if (!draft.nextAction.trim()) errors.nextAction = "Describe the next action.";
  return errors;
}

/**
 * (c) `from` is the previous Task Owner and `createdBy` the current user; (d) `createdAt` is NOW_LABEL;
 * (e) the recipient leaves Contributors (their part state goes with them) and keeps their note under
 * assignmentNotes[to]. Returns null when the draft is invalid.
 */
export function handoverTaskPure(task: Task, draft: HandoverDraft, id: number): { task: Task; handover: TaskHandover } | null {
  if (Object.keys(validateHandover(task, draft)).length) return null;
  const leaving = task.assistants.find(assistant => assistant.name === draft.to);
  const handover: TaskHandover = {
    id,
    from: task.assignee,
    to: draft.to,
    createdBy: CURRENT_USER.name,
    createdAt: NOW_LABEL,
    statusSummary: `${statusLabel(task.status)} · ${task.progress}% complete`,
    lastAction: draft.lastAction.trim(),
    waitingFor: draft.waitingFor.trim() || "Nothing currently waiting",
    nextAction: draft.nextAction.trim(),
    notes: draft.notes.trim(),
  };
  const assignmentNotes = { ...(task.assignmentNotes || {}) };
  if (leaving?.note && !assignmentNotes[draft.to]) assignmentNotes[draft.to] = leaving.note;
  return {
    handover,
    task: { ...task, handover, assignee: draft.to, initials: initials(draft.to), assistants: task.assistants.filter(assistant => assistant.name !== draft.to), assignmentNotes },
  };
}
