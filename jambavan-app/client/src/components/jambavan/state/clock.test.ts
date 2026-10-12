import { describe, expect, it } from "vitest";
import { NOW_LABEL, TODAY_ISO, TODAY_LABEL, TODAY_LONG, todayIso } from "./clock";

describe("seed clock (F21)", () => {
  it("has one consistent today", () => {
    expect(todayIso()).toBe(TODAY_ISO);
    expect(NOW_LABEL.startsWith(TODAY_LABEL)).toBe(true);
    const d = new Date(`${TODAY_ISO}T12:00:00`);
    expect(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(",", "")).toBe(TODAY_LONG.replace(",", ""));
    expect(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })).toBe(TODAY_LABEL);
  });
});
