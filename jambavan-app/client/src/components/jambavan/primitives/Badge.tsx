// Badge family (§3.5): 28 px pills, 13/600, icon plus text, so colour is never the only signal.
// PriorityBadge is deliberately a different shape (review N10): a 26 px square-cornered outline chip with signal bars.
import { AlertCircle, CircleDashed, Clock3 } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AngadFoot, Gada, MissionArrow, SignalBars, SquirrelStone, StrategyScroll, SugrivPennant, TargetHit } from "../icons/RamayanaIcons";
import { sourceLabel } from "../state/selectors";
import type { Status, Task, TaskCategory } from "../state/types";

export function Badge({ className, icon, children, ...props }: { className?: string; icon?: ReactNode; children: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-jb-pill px-2.5 text-[13px] font-semibold leading-none [&_svg]:size-[15px] [&_svg]:shrink-0", className)} {...props}>
      {icon && <span aria-hidden="true" className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}

const family: Record<TaskCategory, { className: string; icon: ReactNode }> = {
  Squirrel: { className: "bg-jb-forest-100 text-jb-forest-700", icon: <SquirrelStone /> },
  Angad: { className: "bg-jb-blue-100 text-jb-blue-700", icon: <AngadFoot /> },
  Sugriv: { className: "bg-jb-saffron-100 text-jb-saffron-700", icon: <SugrivPennant /> },
  HANUMAN: { className: "bg-jb-maroon-700 text-jb-cream-50 tracking-[0.04em]", icon: <Gada /> },
};

/** Task Family: emblem plus name; HANUMAN is a filled maroon pill. */
export function FamilyBadge({ category, className }: { category: TaskCategory; className?: string }) {
  const f = family[category];
  return <Badge className={cn(f.className, className)} icon={f.icon}>{category}</Badge>;
}

/** Task Source: the label always comes from sourceLabel(task) (F13), never an inline ternary. */
export function SourceBadge({ task, suffix, className }: { task: Task; suffix?: string; className?: string }) {
  const label = sourceLabel(task);
  const icon = label === "MOM task" ? <StrategyScroll /> : label === "HANUMAN mission" ? <Gada /> : <MissionArrow />;
  return <Badge className={cn("bg-jb-cream-200 text-jb-earth-700", className)} icon={icon}>{label}{suffix ? ` · ${suffix}` : ""}</Badge>;
}

const status: Record<Status, { label: string; className: string; icon: ReactNode }> = {
  todo: { label: "Not started", className: "bg-jb-cream-200 text-jb-earth-700", icon: <CircleDashed /> },
  progress: { label: "In progress", className: "bg-jb-blue-100 text-jb-blue-700", icon: <Clock3 /> },
  blocked: { label: "Blocked", className: "bg-jb-danger-100 text-jb-danger-700", icon: <AlertCircle /> },
  done: { label: "Completed", className: "bg-jb-forest-100 text-jb-forest-700", icon: <TargetHit /> },
};

/** Status (F7): Not started, In progress, Blocked, Completed, each with its own icon. */
export function StatusBadge({ value, className }: { value: Status; className?: string }) {
  const s = status[value];
  return <Badge className={cn(s.className, className)} icon={s.icon}>{s.label}</Badge>;
}

const priorityBars = { High: 3, Medium: 2, Low: 1 } as const;

/** Priority: outline chip (6 px radius, white fill), signal bars and the word; not a family colour. */
export function PriorityBadge({ value, className }: { value: Task["priority"]; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Priority: ${value}`}
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-jb-sm border bg-jb-white px-2 text-[13px] font-semibold leading-none",
        value === "High" ? "border-jb-danger-700 text-jb-danger-700" : value === "Medium" ? "border-jb-stone-500 text-jb-earth-700" : "border-jb-stone-500 text-jb-stone-600",
        className,
      )}
    >
      <SignalBars bars={priorityBars[value]} />
      <span aria-hidden="true">{value}</span>
    </span>
  );
}
