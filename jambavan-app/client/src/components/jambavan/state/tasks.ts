// Pure task transitions (§13.2) so the store's rules are unit-testable.
import type { Task } from "./types";
import { isCurrentUser } from "./identity";
import { NOW_LABEL } from "./clock";

/**
 * F4 (A4), F14, F22: only the Task Owner completes, and either stored alias of the signed-in user counts as the
 * owner. A refused completion (not the owner, already done, not found) returns `result: null` so the store writes
 * no audit entry and no toast. Completing clears the blocker check-in (the reason no longer applies); the audit log
 * keeps "Task blocker reported".
 */
export function completeTaskPure(tasks: Task[], id: number): { tasks: Task[]; result: Task | null } {
  const task = tasks.find(item => item.id === id);
  if (!task || task.status === "done" || !isCurrentUser(task.assignee)) return { tasks, result: null };
  const result: Task = { ...task, status: "done", progress: 100, completedBy: "You", completedAt: NOW_LABEL, blocker: undefined };
  return { tasks: tasks.map(item => (item.id === id ? result : item)), result };
}

/** §12.3: the non-toggling archive used by the delete confirmation. Already archived → unchanged. */
export function setArchivedPure(tasks: Task[], id: number, archived: boolean, by: string, at: string): Task[] {
  return tasks.map(task => (task.id === id && Boolean(task.archived) !== archived ? { ...task, archived, archivedBy: by, archivedAt: at } : task));
}

/** F22: "It's moving again" removes the check-in. */
export const clearBlockerPure = (tasks: Task[], id: number) => tasks.map(task => (task.id === id ? { ...task, blocker: undefined } : task));

/** Attachment links must be absolute http(s) URLs (F10, M7). Returns the normalised URL or null. */
export function normaliseLink(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
