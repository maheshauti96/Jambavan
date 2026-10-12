import { initials } from "./format";
import type { EventPlan, EventTaskPlan, Task } from "./types";

type Context = { actor: string; at: string; nextId: () => number };

// Plan rows retain their identity when edited. Linked tasks retain their progress and history.
export function syncEventTasks(
  plan: EventPlan,
  previous: EventPlan | undefined,
  tasks: Task[],
  context: Context
): Task[] {
  if (plan.isTemplate) return tasks;
  const rows = new Map(plan.tasks.map(row => [row.id, row]));
  const linked = new Set(
    tasks
      .filter(task => task.eventLink?.eventId === plan.id)
      .map(task => task.eventLink?.rowId)
  );
  const previousRows = new Set(previous?.tasks.map(row => row.id));
  const assignment = (row: EventTaskPlan) => ({
    title: row.title,
    assignee: row.assignee,
    initials: initials(row.assignee),
    department: row.department,
    category: row.category,
    due: plan.date,
    project: plan.title,
    team: plan.title,
    source: `Event plan · ${plan.title}`,
  });
  const updated = tasks.map(task => {
    if (task.eventLink?.eventId !== plan.id) return task;
    const row = rows.get(task.eventLink.rowId);
    if (!row)
      return {
        ...task,
        archived: true,
        archivedBy: context.actor,
        archivedAt: context.at,
      };
    return {
      ...task,
      ...assignment(row),
      assignmentNotes: { ...task.assignmentNotes, [row.assignee]: row.note },
    };
  });
  const added = plan.tasks
    .filter(row => !linked.has(row.id) && !previousRows.has(row.id))
    .map(
      (row): Task => ({
        id: context.nextId(),
        ...assignment(row),
        status: "todo",
        priority: "Medium",
        visibility: "Department",
        progress: 0,
        kind: "Responsibility",
        assistants: [],
        assignmentNotes: { [row.assignee]: row.note },
        eventLink: { eventId: plan.id, rowId: row.id },
      })
    );
  return [...added, ...updated];
}

export function saveEventPlan(
  plans: EventPlan[],
  plan: EventPlan
): EventPlan[] {
  return plans.some(existing => existing.id === plan.id)
    ? plans.map(existing => (existing.id === plan.id ? plan : existing))
    : [plan, ...plans];
}
