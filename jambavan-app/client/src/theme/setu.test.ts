import { describe, expect, it } from "vitest";
import { setuAriaLabel, setuStage, setuStones } from "./setu";

describe("setuStones (§10.2, AC-7.1)", () => {
  it.each([
    [0, 0], [1, 1], [2, 1], [3, 1], [24, 5], [31, 6], [34, 7], [50, 10], [69, 14], [72, 14], [97, 19], [98, 19], [99, 19], [100, 20],
  ])("%d%% → %d stones", (pct, stones) => {
    expect(setuStones(pct)).toBe(stones);
  });

  it("clamps invalid input", () => {
    expect(setuStones(Number.NaN)).toBe(0);
    expect(setuStones(-5)).toBe(0);
    expect(setuStones(Number.POSITIVE_INFINITY)).toBe(0);
    expect(setuStones(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(setuStones(140)).toBe(20);
  });

  it("20 stones ⇔ complete, and 0 stones ⇔ 0%, for every integer 0–100", () => {
    for (let p = 0; p <= 100; p++) {
      expect(setuStones(p) === 20).toBe(setuStage(p).stage === "complete");
      expect(setuStones(p) === 0).toBe(p === 0);
    }
  });
});

describe("setuStage (§10.2)", () => {
  it.each([
    [0, 1, "Ready for the first stone"],
    [1, 1, "First stones placed"],
    [19, 1, "First stones placed"],
    [20, 2, "The Setu takes shape"],
    [39, 2, "The Setu takes shape"],
    [40, 3, "Halfway across the ocean"],
    [59, 3, "Halfway across the ocean"],
    [60, 4, "Approaching Lanka"],
    [79, 4, "Approaching Lanka"],
    [80, 5, "Reaching the far shore"],
    [99, 5, "Reaching the far shore"],
    [100, "complete", "Ram Setu complete"],
  ])("%d%% → stage %s", (pct, stage, label) => {
    expect(setuStage(pct)).toEqual({ stage, label });
  });

  it("clamps invalid input like setuStones", () => {
    expect(setuStage(Number.NaN).label).toBe("Ready for the first stone");
    expect(setuStage(-5).label).toBe("Ready for the first stone");
    expect(setuStage(140).stage).toBe("complete");
  });
});

describe("setuAriaLabel (AC-7.2)", () => {
  it("states the %, the stones and the stage", () => {
    expect(setuAriaLabel("October Launch", 72)).toBe("October Launch: 72% complete, 14 of 20 Setu stones placed. Approaching Lanka.");
    expect(setuAriaLabel("Journey", 99)).toBe("Journey: 99% complete, 19 of 20 Setu stones placed. Reaching the far shore.");
  });
});
