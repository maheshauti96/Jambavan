// One current-user identity with two stored aliases (§12.2, F4).
// Every READ goes through isCurrentUser; every WRITE keeps the literal its call site writes today ("You" or
// "Arjun Mehta"), so no data is migrated.
import { staffOptions } from "./seed";

export const CURRENT_USER = { name: "Arjun Mehta", alias: "You" } as const;

/** True for either stored alias of the signed-in user. */
export function isCurrentUser(name: string | undefined | null): boolean {
  return name === CURRENT_USER.alias || name === CURRENT_USER.name;
}

/** "Arjun Mehta (you)" for either alias, else the name unchanged. */
export function displayName(name: string): string {
  return isCurrentUser(name) ? `${CURRENT_USER.name} (you)` : name;
}

export type OwnerOption = { value: string; label: string };

/**
 * Task Owner select options (F15): exactly one current-user option plus the 10 staffOptions, which never contain
 * "Arjun Mehta", so no person appears twice. The select's `value` is the draft's assignee; the current-user
 * option's value follows the draft (currentUserOptionValue), so the select always has a matching option and saving
 * an untouched select writes back exactly the stored value.
 */
export function ownerOptions(draftAssignee: string): OwnerOption[] {
  return [
    { value: currentUserOptionValue(draftAssignee), label: `${CURRENT_USER.alias} (${CURRENT_USER.name})` },
    ...staffOptions.map(name => ({ value: name, label: name })),
  ];
}

/** §12.2: `isCurrentUser(draft.assignee) ? draft.assignee : "You"`. */
export function currentUserOptionValue(draftAssignee: string): string {
  return isCurrentUser(draftAssignee) ? draftAssignee : CURRENT_USER.alias;
}

/** Open, active tasks the current user has not acknowledged yet (either alias counts as acknowledged). */
export function pendingAcknowledgementCount(tasks: { archived?: boolean; acknowledgedBy?: string[] }[]): number {
  return tasks.filter(task => !task.archived && !(task.acknowledgedBy || []).some(isCurrentUser)).length;
}
