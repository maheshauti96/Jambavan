// Moved verbatim from pages/Home.tsx (checkpoint 5f248af) in increment 0 (§13). Do not change behaviour here.
import type { Status } from "./types";

export function initials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function statusLabel(status: Status) {
  return { todo: "Not started", progress: "In progress", done: "Completed", blocked: "Blocked" }[status];
}
