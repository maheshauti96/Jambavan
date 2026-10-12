import { describe, expect, it } from "vitest";
import { saveEventPlan, syncEventTasks } from "./eventPlans";
import type { EventPlan, Task } from "./types";

const row = {
  id: 10,
  title: "Prepare rooms",
  assignee: "Arjun Mehta",
  department: "Academic",
  category: "Squirrel" as const,
  note: "Hall A",
};
const plan: EventPlan = {
  id: 70,
  title: "Orientation",
  date: "18 Oct",
  venue: "Hall A",
  description: "",
  departments: ["Academic"],
  roles: [],
  tasks: [row],
  isTemplate: false,
  createdBy: "Arjun Mehta",
};
const task: Task = {
  id: 200,
  title: row.title,
  assignee: row.assignee,
  initials: "AM",
  department: row.department,
  team: plan.title,
  due: plan.date,
  status: "progress",
  priority: "High",
  visibility: "Department",
  progress: 68,
  kind: "Responsibility",
  assistants: [],
  eventLink: { eventId: plan.id, rowId: row.id },
  updates: [
    { id: 1, text: "Rooms checked", addedBy: "Arjun Mehta", at: "05 Oct" },
  ],
};
const context = { actor: "Arjun Mehta", at: "05 Oct", nextId: () => 300 };

describe("event plan edits", () => {
  it("replaces the existing plan without adding a duplicate", () => {
    const result = saveEventPlan([plan], {
      ...plan,
      title: "Updated orientation",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(plan.id);
    expect(result[0].title).toBe("Updated orientation");
  });
  it("updates assignment details and keeps progress and update history", () => {
    const changed = {
      ...plan,
      date: "19 Oct",
      tasks: [{ ...row, title: "Prepare both halls" }],
    };
    const result = syncEventTasks(changed, plan, [task], context);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 200,
      title: "Prepare both halls",
      due: "19 Oct",
      progress: 68,
      status: "progress",
    });
    expect(result[0].updates).toBe(task.updates);
  });
  it("creates only the new row's task and remains idempotent", () => {
    const changed = {
      ...plan,
      tasks: [row, { ...row, id: 11, title: "Print notices" }],
    };
    const result = syncEventTasks(changed, plan, [task], context);
    expect(result).toHaveLength(2);
    expect(result.filter(item => item.eventLink?.rowId === 11)).toHaveLength(1);
    expect(syncEventTasks(changed, changed, result, context)).toHaveLength(2);
  });
  it("archives a removed row's task without deleting its history", () => {
    const result = syncEventTasks(
      { ...plan, tasks: [] },
      plan,
      [task],
      context
    );
    expect(result[0]).toMatchObject({
      id: 200,
      archived: true,
      archivedBy: "Arjun Mehta",
    });
    expect(result[0].updates).toBe(task.updates);
  });
  it("does not assign tasks when saving a reusable template", () => {
    expect(
      syncEventTasks({ ...plan, isTemplate: true }, undefined, [task], context)
    ).toBeDefined();
    expect(
      syncEventTasks({ ...plan, isTemplate: true }, undefined, [task], context)
    ).toEqual([task]);
  });
});
