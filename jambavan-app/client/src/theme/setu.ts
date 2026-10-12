// Ram Setu progress model (§10.2), pure and unit-tested. 20 stones; the stone count and the stage label share one
// clamp, so they can never disagree: any progress above 0 places at least 1 stone, and the 20th only at exactly 100.

export const SETU_STONES = 20;

/** NaN, ±Infinity and negatives clamp to 0; values over 100 clamp to 100. */
export const clampPct = (pct: number) => (Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0);

export const setuStones = (pct: number) => {
  const p = clampPct(pct);
  return p === 0 ? 0 : p === 100 ? 20 : Math.min(19, Math.max(1, Math.round(p / 5)));
};

export type SetuStage = { stage: 1 | 2 | 3 | 4 | 5 | "complete"; label: string };

export function setuStage(pct: number): SetuStage {
  const p = clampPct(pct);
  if (p === 100) return { stage: "complete", label: "Ram Setu complete" };
  if (p === 0) return { stage: 1, label: "Ready for the first stone" };
  if (p < 20) return { stage: 1, label: "First stones placed" };
  if (p < 40) return { stage: 2, label: "The Setu takes shape" };
  if (p < 60) return { stage: 3, label: "Halfway across the ocean" };
  if (p < 80) return { stage: 4, label: "Approaching Lanka" };
  return { stage: 5, label: "Reaching the far shore" };
}

/** The accessible description every RamSetuProgress carries (AC-7.2). */
export function setuAriaLabel(label: string, pct: number): string {
  const p = Math.round(clampPct(pct));
  return `${label}: ${p}% complete, ${setuStones(p)} of ${SETU_STONES} Setu stones placed. ${setuStage(p).label}.`;
}
