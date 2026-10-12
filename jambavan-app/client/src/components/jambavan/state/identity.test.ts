import { describe, expect, it } from "vitest";
import { CURRENT_USER, currentUserOptionValue, displayName, isCurrentUser, ownerOptions, pendingAcknowledgementCount } from "./identity";

describe("identity (§12.2, F4)", () => {
  it("isCurrentUser accepts both aliases and nobody else", () => {
    expect(isCurrentUser("You")).toBe(true);
    expect(isCurrentUser("Arjun Mehta")).toBe(true);
    expect(isCurrentUser("Neha Kapoor")).toBe(false);
    expect(isCurrentUser(undefined)).toBe(false);
  });

  it("displayName marks the current user", () => {
    expect(displayName("You")).toBe("Arjun Mehta (you)");
    expect(displayName("Arjun Mehta")).toBe("Arjun Mehta (you)");
    expect(displayName("Neha Kapoor")).toBe("Neha Kapoor");
  });

  it("ownerOptions has 11 entries and no person twice, whichever alias is stored (F15)", () => {
    for (const stored of ["Arjun Mehta", "You", "Neha Kapoor"]) {
      const options = ownerOptions(stored);
      expect(options).toHaveLength(11);
      expect(new Set(options.map(o => o.value)).size).toBe(11);
      expect(options.filter(o => isCurrentUser(o.value))).toHaveLength(1);
      expect(options[0].label).toBe("You (Arjun Mehta)");
      expect(options.some(o => o.value === stored)).toBe(true);
    }
  });

  it("the current-user option value follows the draft", () => {
    expect(currentUserOptionValue("Arjun Mehta")).toBe("Arjun Mehta"); // edit task 1, assign from the Academic Huddle MOM
    expect(currentUserOptionValue("You")).toBe("You"); // edit task 4, a fresh draft
    expect(currentUserOptionValue("Neha Kapoor")).toBe(CURRENT_USER.alias);
  });

  it("pendingAcknowledgementCount treats both aliases the same", () => {
    const tasks = [{ acknowledgedBy: ["You"] }, { acknowledgedBy: ["Arjun Mehta"] }, { acknowledgedBy: [] }, { archived: true }];
    expect(pendingAcknowledgementCount(tasks)).toBe(1);
  });
});
