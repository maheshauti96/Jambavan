// F1 (A1): a task edit merges field by field instead of rebuilding the task from the draft (§12.1).
// F10: the task dialog's validation lives here so it can be unit-tested without a renderer.
import type { Task, TaskCategory, TaskKind } from "./types";
import { initials } from "./format";
import { wouldCycle } from "./dependencies";

export type TaskDraft = {
  title: string;
  assignee: string;
  department: string;
  due: string;
  priority: Task["priority"];
  teamTask: boolean;
  kind: TaskKind;
  category: TaskCategory;
  longRunning: boolean;
  source: string;
  assistants: string[];
  assignmentNotes: Record<string, string>;
  subtasks: string[];
  dependsOnTaskId: number | undefined;
};

export type MergeContext = { departmentOf: (name: string) => string | undefined; nextId: () => number };

export function mergeTaskEdit(existing: Task, draft: TaskDraft, ctx: MergeContext): Task {
  const assistants = draft.assistants.map(name => {
    const prior = existing.assistants.find(assistant => assistant.name === name);
    const note = draft.assignmentNotes[name] ?? prior?.note ?? "";
    return prior
      ? { ...prior, note }
      : { name, initials: initials(name), department: ctx.departmentOf(name) ?? draft.department, completed: false, note };
  });
  const people = new Set([draft.assignee, ...draft.assistants]);
  const mergedNotes = { ...(existing.assignmentNotes || {}), ...draft.assignmentNotes };
  const assignmentNotes = Object.fromEntries(Object.entries(mergedNotes).filter(([person]) => people.has(person)));
  // Subtasks: each draft title takes the first not-yet-matched existing subtask with the same trimmed title.
  const unmatched = [...(existing.subtasks || [])];
  const subtasks = draft.subtasks.map(title => {
    const index = unmatched.findIndex(subtask => subtask.title.trim() === title.trim());
    if (index >= 0) return unmatched.splice(index, 1)[0];
    return { id: ctx.nextId(), title, done: false, addedBy: "You" };
  });
  return {
    ...existing,
    title: draft.title.trim(),
    assignee: draft.assignee,
    initials: draft.assignee === existing.assignee ? existing.initials : initials(draft.assignee),
    department: draft.department,
    due: draft.due,
    priority: draft.priority,
    kind: draft.kind,
    category: draft.category,
    longRunning: draft.longRunning,
    isTeamTask: draft.teamTask,
    source: draft.source || undefined,
    dependsOnTaskId: draft.dependsOnTaskId,
    updates: draft.longRunning && existing.updates === undefined ? [] : existing.updates,
    assistants,
    assignmentNotes,
    subtasks,
  };
}

/** The task dialog's own form data, loaded from a task for editing (unchanged from today's editTask). */
export function draftFromTask(task: Task): TaskDraft {
  return { title: task.title, assignee: task.assignee, department: task.department, due: task.due, priority: task.priority, teamTask: Boolean(task.isTeamTask), kind: task.kind, category: task.category || "Squirrel", source: task.source || "", longRunning: Boolean(task.longRunning), assistants: task.assistants.map(assistant => assistant.name), assignmentNotes: task.assignmentNotes || Object.fromEntries(task.assistants.filter(assistant => assistant.note).map(assistant => [assistant.name, assistant.note || ""])), subtasks: task.subtasks?.map(subtask => subtask.title) || [], dependsOnTaskId: task.dependsOnTaskId };
}

export const emptyTaskDraft = (): TaskDraft => ({ title: "", assignee: "You", department: "Academic", due: "03 Oct", priority: "Medium", teamTask: false, kind: "Task", category: "Squirrel", longRunning: false, source: "", assistants: [], assignmentNotes: {}, subtasks: [], dependsOnTaskId: undefined });

export type TaskDraftErrors = Partial<Record<"title" | "dependsOnTaskId", string>>;

/** F10, §13.2: a title is required; a dependency must exist, be active, not be the task itself and not loop. */
export function validateTaskDraft(draft: TaskDraft, tasks: Task[], editingId: number | null): TaskDraftErrors {
  const errors: TaskDraftErrors = {};
  if (!draft.title.trim()) errors.title = "Enter what needs to move forward.";
  if (draft.dependsOnTaskId !== undefined) {
    const upstream = tasks.find(task => task.id === draft.dependsOnTaskId);
    if (!upstream || upstream.archived) errors.dependsOnTaskId = "Choose an active task.";
    else if (upstream.id === editingId) errors.dependsOnTaskId = "A task cannot wait on itself.";
    else if (wouldCycle(tasks, upstream.id, editingId)) errors.dependsOnTaskId = "That task already waits on this one, so the link would loop.";
  }
  return errors;
}
