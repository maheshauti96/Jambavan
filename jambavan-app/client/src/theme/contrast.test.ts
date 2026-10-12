import { describe, expect, it } from "vitest";
import { approvedPairs, contrastRatio, forbiddenPairs, palette } from "./contrast";

describe("contrast allowlist (§3.2, AC-1.1)", () => {
  it.each(approvedPairs.map(p => [`${p.fg} on ${p.bg}`, p] as const))("%s meets its threshold", (_name, pair) => {
    expect(contrastRatio(palette[pair.fg], palette[pair.bg])).toBeGreaterThanOrEqual(pair.min);
  });

  it.each(forbiddenPairs.map(p => [`${p.fg} on ${p.bg}`, p] as const))("%s is forbidden and fails", (_name, pair) => {
    expect(contrastRatio(palette[pair.fg], palette[pair.bg])).toBeLessThan(pair.min);
  });

  it("matches the ratios the proposal measured", () => {
    expect(contrastRatio(palette.ink, palette["cream-50"])).toBeCloseTo(15.79, 1);
    expect(contrastRatio(palette["cream-50"], palette["maroon-700"])).toBeCloseTo(9.93, 1);
    expect(contrastRatio(palette["stone-600"], palette["cream-200"])).toBeCloseTo(4.52, 1);
    expect(contrastRatio(palette["saffron-500"], palette["cream-50"])).toBeCloseTo(2.58, 1);
  });
});
