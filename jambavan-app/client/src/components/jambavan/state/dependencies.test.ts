// Increment 0: the dependency rules moved verbatim from Home.tsx into state/dependencies.ts. These tests pin today's
// behaviour (the round 4 additions upstreamPath, bottleneckOf, … arrive with increment 3).
import { describe, expect, it } from "vitest";
import { findBlockingDependency, wouldCycle } from "./dependencies";
import { initialTasksWithCategories as seed } from "./seed";

const task = (id: number) => seed.find(t => t.id === id)!;

describe("findBlockingDependency (Home.tsx:148–159)", () => {
  it("returns the nearest unfinished upstream task", () => {
    expect(findBlockingDependency(task(12), seed)?.id).toBe(11);
    expect(findBlockingDependency(task(10), seed)?.id).toBe(9);
    expect(findBlockingDependency(task(9), seed)).toBeUndefined(); // task 8 is done and has no upstream
  });

  it("terminates on a corrupt cycle", () => {
    const cyclic = seed.map(t => (t.id === 8 ? { ...t, dependsOnTaskId: 12, status: "todo" as const } : t));
    expect(() => findBlockingDependency(task(12), cyclic)).not.toThrow();
  });
});

describe("wouldCycle (Home.tsx:768–778, made pure)", () => {
  it("refuses 9 → 12 when editing 9 and allows 8 when editing 10", () => {
    expect(wouldCycle(seed, 12, 9)).toBe(true);
    expect(wouldCycle(seed, 8, 10)).toBe(false);
  });

  it("never reports a cycle for a new task", () => {
    expect(wouldCycle(seed, 12, null)).toBe(false);
  });
});
