// The seed clock (§11 IA-7, IA-10; F12, F21). One source for "today" and "now" in the prototype.
// Increment 1 only adds these constants; the call sites that still use literals (completeTask, reopenTask, the
// page-heading eyebrow, My Day's default date, the handover createdAt) switch to them in the increments that
// change those surfaces, so the increment 0 equivalence gate is not disturbed.

/** Day prefix used in seed timestamps, e.g. completedAt "05 Oct 2026, 3:15 PM". */
export const TODAY_LABEL = "05 Oct 2026";
/** The timestamp every write in the prototype records. */
export const NOW_LABEL = "05 Oct 2026, 3:15 PM";
/** Today as an ISO date (the native date input's value format). */
export const TODAY_ISO = "2026-10-05";
/** Today written out for page eyebrows. */
export const TODAY_LONG = "Monday, 5 October 2026";

/**
 * Today's date as `YYYY-MM-DD`. The prototype runs on the seed clock, so this returns TODAY_ISO.
 * When persistence arrives this becomes the user's LOCAL date (`new Date().toLocaleDateString("en-CA")`),
 * never `toISOString()`, which is UTC and one day behind in India before 05:30.
 */
export function todayIso(): string {
  return TODAY_ISO;
}
