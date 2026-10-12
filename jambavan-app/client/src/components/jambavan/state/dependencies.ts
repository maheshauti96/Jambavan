// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import type { Task } from "./types";

export function findBlockingDependency(task: Task, allTasks: Task[]): Task | undefined {
  let current = task;
  const visited = new Set<number>();
  while (current.dependsOnTaskId && !visited.has(current.id)) {
    visited.add(current.id);
    const upstream = allTasks.find(candidate => candidate.id === current.dependsOnTaskId);
    if (!upstream) return undefined;
    if (upstream.status !== "done") return upstream;
    current = upstream;
  }
  return undefined;
}

/** Active, unfinished tasks that wait directly on `id` (the delete confirmation counts them, F23). */
export const downstreamOf = (id: number, tasks: Task[]) => tasks.filter(task => task.dependsOnTaskId === id && !task.archived && task.status !== "done");

/** F23: deleting a task also removes every link to it, so no task waits on a ghost. */
export const clearDependentsOf = (id: number, tasks: Task[]) => tasks.map(task => (task.dependsOnTaskId === id ? { ...task, dependsOnTaskId: undefined } : task));

// Today's dependencyWouldCycle (Home.tsx:768–778), made pure: the body is unchanged, `tasks` is now a parameter.
export function wouldCycle(tasks: Task[], candidateId: number, editingId: number | null): boolean {
  if (!editingId) return false;
  let currentId: number | undefined = candidateId;
  const visited = new Set<number>();
  while (currentId && !visited.has(currentId)) {
    if (currentId === editingId) return true;
    visited.add(currentId);
    currentId = tasks.find(task => task.id === currentId)?.dependsOnTaskId;
  }
  return false;
}
