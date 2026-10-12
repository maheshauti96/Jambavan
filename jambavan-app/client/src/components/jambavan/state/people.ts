// F6 (A7, §12.3): people lifecycle without hard deletes. Deactivate/Reactivate keep the stored "Suspended" value;
// Remove profile is a soft removal ("Removed") that People hides until "Show removed" is on.
import type { EmployeeProfile } from "./types";
import { isCurrentUser } from "./identity";

export type AccessAction = "deactivate" | "reactivate" | "remove" | "restore";

export const SELF_GUARD_MESSAGE = "You cannot deactivate or remove your own profile.";

/** Returns the new list, or null when refused (unknown name, or the current user's own profile). */
export function applyAccessAction(profiles: EmployeeProfile[], name: string, action: AccessAction): EmployeeProfile[] | null {
  if (isCurrentUser(name) || !profiles.some(profile => profile.name === name)) return null;
  const access: EmployeeProfile["access"] = action === "deactivate" ? "Suspended" : action === "remove" ? "Removed" : "Active";
  return profiles.map(profile => (profile.name === name ? { ...profile, access } : profile));
}

/** Attendance exports leave Removed people out (as when the row was deleted); Deactivated people stay. */
export const reportableProfiles = (profiles: EmployeeProfile[]) => profiles.filter(profile => profile.access !== "Removed");

/** Add employee: a trimmed, case-insensitive name match is a duplicate, Removed profiles included. */
export function duplicateProfileMessage(name: string, profiles: EmployeeProfile[]): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const match = profiles.find(profile => profile.name.trim().toLowerCase() === key);
  if (!match) return null;
  return match.access === "Removed" ? `A profile for ${match.name} already exists. Restore it from Show removed.` : "A profile with this name already exists.";
}
