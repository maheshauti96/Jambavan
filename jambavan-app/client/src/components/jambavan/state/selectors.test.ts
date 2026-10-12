import { describe, expect, it } from "vitest";
import { NOW_LABEL } from "./clock";
import { departments, initialTasksWithCategories as seed, projects } from "./seed";
import {
  activeCount, completedToday, deadlineReminders, dueTodayCount, instituteCompletion, isHanumanMission, journeyPct, meanPct,
  myOpenTasks, needsAttention, projectFor, projectProgress, reflectionFor, sourceLabel, teamFollowUps, todayComplete, todaysMission,
} from "./selectors";
import type { Task } from "./types";

// Mirrors today's owner completion (Home.tsx:678–683) with the seed clock.
const complete = (tasks: Task[], id: number): Task[] =>
  tasks.map(t => (t.id === id ? { ...t, status: "done", progress: 100, completedBy: "You", completedAt: NOW_LABEL } : t));
const ids = (ts: Task[]) => ts.map(t => t.id);
const byId = (id: number) => seed.find(t => t.id === id)!;
const project = (name: string) => projects.find(p => p.name === name)!;

describe("Today's Mission (§11 IA-7)", () => {
  it("seed: tasks 1, 4 and 9 at 43%, 3 active and 0 completed today; HANUMAN task 7 excluded", () => {
    const tm = todaysMission(seed);
    expect(ids(tm)).toEqual([1, 4, 9]);
    expect(journeyPct(tm)).toBe(43);
    expect(activeCount(tm)).toBe(3);
    expect(completedToday(tm)).toBe(0);
    expect(todayComplete(tm)).toBe(false);
  });

  it("completing task 1 gives 53% with 2 active · 1 completed today; then 87; then 100 and todayComplete", () => {
    let tasks = complete(seed, 1);
    expect(journeyPct(todaysMission(tasks))).toBe(53);
    expect(activeCount(todaysMission(tasks))).toBe(2);
    expect(completedToday(todaysMission(tasks))).toBe(1);
    tasks = complete(tasks, 4);
    expect(journeyPct(todaysMission(tasks))).toBe(87);
    expect(todayComplete(todaysMission(tasks))).toBe(false);
    tasks = complete(tasks, 9);
    expect(journeyPct(todaysMission(tasks))).toBe(100);
    expect(todayComplete(todaysMission(tasks))).toBe(true);
  });

  it("completing the HANUMAN task 7 leaves the journey at 43", () => {
    expect(journeyPct(todaysMission(complete(seed, 7)))).toBe(43);
  });

  it("a task completed on another day is excluded; a longRunning task is excluded even when due today", () => {
    const old: Task = { ...byId(4), id: 900, status: "done", completedAt: "29 Sep 2026, 4:12 PM" };
    const longToday: Task = { ...byId(4), id: 901, due: "Today", longRunning: true };
    expect(ids(todaysMission([old, longToday]))).toEqual([]);
  });

  it("isHanumanMission (M2): category HANUMAN without longRunning is in Today's Mission", () => {
    const eventHanuman: Task = { ...byId(4), id: 902, category: "HANUMAN", longRunning: false };
    expect(isHanumanMission(eventHanuman)).toBe(false);
    expect(ids(todaysMission([eventHanuman]))).toEqual([902]);
    expect(isHanumanMission(byId(7))).toBe(true);
  });

  it("todayComplete is false for an empty set", () => {
    expect(todayComplete([])).toBe(false);
  });
});

describe("feed tiles (§11 IA-7)", () => {
  it("My open tasks 4 (2 due today)", () => {
    expect(ids(myOpenTasks(seed))).toEqual([1, 4, 9, 7]);
    expect(dueTodayCount(myOpenTasks(seed))).toBe(2);
  });

  it("Needs attention 2 (1 overdue · 2 blocked)", () => {
    expect(needsAttention(seed)).toEqual({ count: 2, overdue: 1, blocked: 2 });
  });

  it("Team follow-ups 9", () => {
    expect(ids(teamFollowUps(seed)).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 6, 7, 9, 10, 11]);
  });

  it("deadline reminders: 6 (tasks 1, 2, 3, 6, 9, 10)", () => {
    expect(ids(deadlineReminders(seed).map(r => r.task)).sort((a, b) => a - b)).toEqual([1, 2, 3, 6, 9, 10]);
    expect(deadlineReminders(seed).find(r => r.id === 6)?.urgency).toBe("overdue");
  });

  it("institute completion 69", () => {
    expect(instituteCompletion(departments)).toBe(69);
  });
});

describe("project Setus (§10.1, AC-14.1)", () => {
  it("seed: 34 / 0 / 24 from linked tasks", () => {
    expect(projectProgress("October Launch", seed, project("October Launch"))).toEqual({ pct: 34, source: "tasks", open: 2, done: 0, total: 2 });
    expect(projectProgress("Parent Connect", seed, project("Parent Connect")).pct).toBe(0);
    expect(projectProgress("Faculty Excellence", seed, project("Faculty Excellence")).pct).toBe(24);
  });

  it("completing task 1 moves October Launch to 50%", () => {
    expect(projectProgress("October Launch", complete(seed, 1)).pct).toBe(50);
  });

  it("falls back to the planned estimate without linked tasks; 0 without a seed", () => {
    const none = seed.filter(t => t.project !== "Parent Connect");
    expect(projectProgress("Parent Connect", none, project("Parent Connect"))).toEqual({ pct: 46, source: "estimate", open: 0, done: 0, total: 0 });
    expect(projectProgress("Nowhere", seed)).toEqual({ pct: 0, source: "tasks", open: 0, done: 0, total: 0 });
  });

  it("archived tasks do not count", () => {
    const archived = seed.map(t => (t.id === 2 ? { ...t, archived: true } : t));
    expect(projectProgress("October Launch", archived).pct).toBe(68);
  });

  it("projectFor: task 1 → October Launch; an event-created task → null", () => {
    expect(projectFor(byId(1), projects)?.name).toBe("October Launch");
    expect(projectFor({ ...byId(1), project: "Annual Parent Orientation" }, projects)).toBeNull();
    expect(projectFor(byId(9), projects)).toBeNull(); // "Admission Campaign" has no Projects entry
  });
});

describe("completion never lowers journeyPct or projectProgress (AC-14.2)", () => {
  const owned = seed.filter(t => t.status !== "done" && (t.assignee === "You" || t.assignee === "Arjun Mehta"));
  it.each(owned.map(t => [t.id, t.title] as const))("seed task %d (%s)", id => {
    const after = complete(seed, id);
    expect(journeyPct(todaysMission(after))).toBeGreaterThanOrEqual(journeyPct(todaysMission(seed)));
    for (const p of projects) expect(projectProgress(p.name, after, p).pct).toBeGreaterThanOrEqual(projectProgress(p.name, seed, p).pct);
  });

  it.each([0, 50, 100])("synthetic not-done task at %d%%", progress => {
    const base: Task = { ...byId(4), id: 950, project: "Synthetic", status: "progress", progress };
    const others: Task = { ...byId(4), id: 951, project: "Synthetic", progress: 30 };
    const before = [base, others];
    const after = complete(before, 950);
    expect(meanPct(todaysMission(after))).toBeGreaterThanOrEqual(meanPct(todaysMission(before)));
    expect(projectProgress("Synthetic", after).pct).toBeGreaterThanOrEqual(projectProgress("Synthetic", before).pct);
  });
});

describe("reflectionFor (review round 3 M3, AC-12.3)", () => {
  it("seed gives the three round 4 lines", () => {
    expect(reflectionFor(departments, seed)).toEqual([
      "Operations is 31 points behind Marketing.",
      "2 missions are overdue or blocked across 2 departments.",
      "A short check-in with each Task Owner may unblock them.",
    ]);
  });

  it("after completing task 9: the single-mission lines", () => {
    expect(reflectionFor(departments, complete(seed, 9))).toEqual([
      "Operations is 31 points behind Marketing.",
      "1 mission is overdue and blocked, and it sits with Operations.",
      "A short check-in with its Task Owner may unblock it.",
    ]);
  });

  it("after also archiving task 6: nothing is overdue or blocked, and no third line", () => {
    const tasks = complete(seed, 9).map(t => (t.id === 6 ? { ...t, archived: true } : t));
    expect(reflectionFor(departments, tasks)).toEqual(["Operations is 31 points behind Marketing.", "Nothing is overdue or blocked."]);
  });

  it("equal done values → same pace", () => {
    expect(reflectionFor([{ name: "A", done: 50 }, { name: "B", done: 50 }], [])[0]).toBe("All departments are moving at the same pace.");
  });

  it("a tie between the two lowest picks the alphabetically last name as low", () => {
    expect(reflectionFor([{ name: "Top", done: 90 }, { name: "Alpha", done: 40 }, { name: "Zulu", done: 40 }], [])[0]).toBe("Zulu is 50 points behind Top.");
  });

  it("two stuck tasks in one department → they sit with it", () => {
    const tasks = [{ ...byId(6) }, { ...byId(6), id: 960, due: "Overdue by 1d", status: "blocked" as const }];
    expect(reflectionFor(departments, tasks)[1]).toBe("2 missions are overdue and blocked, and they sit with Operations.");
  });
});

describe("sourceLabel (F13)", () => {
  it("returns all five approved labels", () => {
    expect(sourceLabel(byId(1))).toBe("MOM task");
    expect(sourceLabel(byId(4))).toBe("Manual task");
    expect(sourceLabel(byId(7))).toBe("HANUMAN mission");
    expect(sourceLabel({ ...byId(3), source: "Event plan · Annual Parent Orientation" })).toBe("Event task");
    expect(sourceLabel({ ...byId(3), source: undefined })).toBe("Project responsibility");
  });
});
