// D22: the Dashboard blocker headline reads "{pct}% of delayed tasks with a check-in are {phrase}." for every reason
// (§13.2 reasonPhrase, approved copy).
import type { BlockerReason } from "./types";

export const reasonPhrase: Record<BlockerReason, string> = {
  "I haven't started": "not started yet", "Waiting for someone": "waiting for someone", "Waiting for information": "waiting for information",
  "Too much other work": "held up by other work", "I don't understand the task": "unclear to the Task Owner",
  "Unexpected issue": "stuck on an unexpected issue", "Forgot": "forgotten", "Other": "held up for another reason",
};
