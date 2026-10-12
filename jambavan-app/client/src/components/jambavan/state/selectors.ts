// Pure, data-backed selectors (§10.1, §11 IA-7, §12 F12/F13, §13.2). Added in increment 1 with unit tests;
// nothing renders them until the views are ported (increments 3–4).
import { TODAY_LABEL } from "./clock";
import { isCurrentUser } from "./identity";
import type { Project, Task, TaskCategory } from "./types";

const clamp = (value: number, min: number, max: number) => (Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min);

// ---------- Setu values (§10.1) ----------

/** A task's contribution: 100 when done, else its own progress (0–100, clamped). */
export const contribution = (t: Task) => (t.status === "done" ? 100 : clamp(t.progress, 0, 100));

/** Rounded mean contribution; 0 for an empty set. */
export const meanPct = (ts: Task[]) => (ts.length === 0 ? 0 : Math.round(ts.reduce((sum, t) => sum + contribution(t), 0) / ts.length));

/** Only names that exist in `projects` have a Setu (event-plan tasks carry `project: event.title`, which usually has none). */
export const projectFor = (t: Task, projects: Project[]) => projects.find(p => p.name === t.project) ?? null;

export type ProjectProgress = { pct: number; source: "tasks" | "estimate"; open: number; done: number; total: number };

export function projectProgress(name: string, tasks: Task[], seed?: Project): ProjectProgress {
  const linked = tasks.filter(t => t.project === name && !t.archived);
  if (linked.length === 0)
    return seed ? { pct: clamp(seed.progress, 0, 100), source: "estimate", open: 0, done: 0, total: 0 } : { pct: 0, source: "tasks", open: 0, done: 0, total: 0 };
  const done = linked.filter(t => t.status === "done").length;
  return { pct: meanPct(linked), source: "tasks", open: linked.length - done, done, total: linked.length };
}

// ---------- Today's Mission and the feed tiles (§11 IA-7) ----------

/** The ONE HANUMAN-mission predicate (review round 3, M2): long-running work. FamilyBadge keeps `category`, sourceLabel keeps `kind`. */
export const isHanumanMission = (t: Task) => t.longRunning === true;

/** The current user's active, non-HANUMAN tasks that are open or were completed today. */
export const todaysMission = (tasks: Task[]) =>
  tasks.filter(t => !t.archived && isCurrentUser(t.assignee) && !isHanumanMission(t) && (t.status !== "done" || (t.completedAt ?? "").startsWith(TODAY_LABEL)));

export const journeyPct = (tm: Task[]) => meanPct(tm);
export const activeCount = (tm: Task[]) => tm.filter(t => t.status !== "done").length;
export const completedToday = (tm: Task[]) => tm.length - activeCount(tm);
/** The "today" celebration trigger (§8): a non-empty set where every task is done. */
export const todayComplete = (tm: Task[]) => tm.length > 0 && activeCount(tm) === 0;

/** "My open tasks" tile: all of the current user's open, active work, HANUMAN missions included. */
export const myOpenTasks = (tasks: Task[]) => tasks.filter(t => !t.archived && isCurrentUser(t.assignee) && t.status !== "done");
export const dueTodayCount = (ts: Task[]) => ts.filter(t => t.due === "Today").length;

const isOpenActive = (t: Task) => !t.archived && t.status !== "done";
const isOverdue = (t: Task) => t.due.startsWith("Overdue");

/** "Needs attention": unique open, active tasks that are overdue or Blocked. The sublines may overlap. A check-in alone does not count. */
export function needsAttention(tasks: Task[]): { count: number; overdue: number; blocked: number } {
  const open = tasks.filter(isOpenActive);
  return {
    count: open.filter(t => isOverdue(t) || t.status === "blocked").length,
    overdue: open.filter(isOverdue).length,
    blocked: open.filter(t => t.status === "blocked").length,
  };
}

/** "Team follow-ups": open, active tasks with contributors or the Team task flag. */
export const teamFollowUps = (tasks: Task[]) => tasks.filter(t => isOpenActive(t) && (t.assistants.length > 0 || Boolean(t.isTeamTask)));

/** Deadline reminders, the same rule as the store's `deadlineReminders` (Home.tsx:621–626): due Today/Tomorrow or overdue. */
export function deadlineReminders(tasks: Task[]) {
  return tasks
    .filter(task => !task.archived && task.status !== "done" && (["Today", "Tomorrow"].some(label => task.due.includes(label)) || task.due.startsWith("Overdue")))
    .map(task => ({
      id: task.id,
      task,
      people: [task.assignee, ...task.assistants.map(assistant => assistant.name)],
      urgency: (task.due.startsWith("Overdue") ? "overdue" : task.due === "Today" ? "today" : "soon") as "overdue" | "today" | "soon",
    }));
}

/** Institute completion: rounded mean of the department `done` seed values (69 from the seed). */
export const instituteCompletion = (depts: { done: number }[]) => (depts.length === 0 ? 0 : Math.round(depts.reduce((sum, d) => sum + d.done, 0) / depts.length));

/** Task counts per family (all tasks, archived included, as the feed's family tabs count them today). */
export function familyCounts(tasks: Task[]): Record<TaskCategory, number> {
  const counts: Record<TaskCategory, number> = { Squirrel: 0, Angad: 0, Sugriv: 0, HANUMAN: 0 };
  for (const t of tasks) if (t.category) counts[t.category] += 1;
  return counts;
}

// ---------- Jambavan's reflection (review round 3 M3; adopted exactly as the review wrote it) ----------

export function reflectionFor(depts: { name: string; done: number }[], tasks: Task[]): string[] {
  const sorted = [...depts].sort((a, b) => b.done - a.done || a.name.localeCompare(b.name)); // tie-break by name
  const top = sorted[0], low = sorted[sorted.length - 1], gap = top.done - low.done;
  const lines = [gap > 0 ? `${low.name} is ${gap} points behind ${top.name}.` : "All departments are moving at the same pace."];
  const stuck = tasks.filter(t => !t.archived && t.status !== "done" && (t.due.startsWith("Overdue") || t.status === "blocked"));
  if (stuck.length === 0) lines.push("Nothing is overdue or blocked.");
  else {
    const byDept = [...new Set(stuck.map(t => t.department))];
    const both = stuck.filter(t => t.due.startsWith("Overdue") && t.status === "blocked").length;
    const what = both === stuck.length ? "overdue and blocked" : "overdue or blocked";
    lines.push(
      `${stuck.length} ${stuck.length === 1 ? "mission is" : "missions are"} ${what}` +
        (byDept.length === 1 ? `, and ${stuck.length === 1 ? "it sits" : "they sit"} with ${byDept[0]}.` : ` across ${byDept.length} departments.`),
    );
    lines.push(stuck.length === 1 ? "A short check-in with its Task Owner may unblock it." : "A short check-in with each Task Owner may unblock them.");
  }
  return lines;
}

// ---------- Task Source label (F13) ----------

export const sourceLabel = (t: Task) =>
  t.kind === "MOM action"
    ? "MOM task"
    : t.kind === "HANUMAN"
      ? "HANUMAN mission"
      : t.kind === "Responsibility"
        ? (t.source ?? "").startsWith("Event plan · ")
          ? "Event task"
          : "Project responsibility"
        : "Manual task";
