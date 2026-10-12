// Card (§3.5): white, 1 px sand-300 border, e1, radius 14, padding 20 (16 on mobile). Optional temple-border ornament
// (§3.4), used only on feature cards: Today's Mission, project cards, Guide family cards and celebration.
import "../styles/primitives.css";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  ornament,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & { ornament?: boolean; children: ReactNode }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-jb-lg border border-jb-sand-300 bg-jb-white p-4 shadow-jb-e1 md:p-5",
        className
      )}
      {...props}
    >
      {ornament && <span aria-hidden="true" className="jb-ornament-top" />}
      {children}
    </section>
  );
}

/** Card header slot: eyebrow plus an h2/h3 and an optional action on the right. */
export function CardHeader({
  eyebrow,
  title,
  as: Heading = "h3",
  action,
  id,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  as?: "h2" | "h3";
  action?: ReactNode;
  id?: string;
}) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="jb-eyebrow mb-1">{eyebrow}</p>}
        <Heading
          id={id}
          className={
            Heading === "h2"
              ? "m-0 font-display text-[26px] font-semibold leading-[30px] text-jb-ink"
              : "m-0 text-lg font-semibold leading-6 text-jb-ink"
          }
        >
          {title}
        </Heading>
      </div>
      {action}
    </header>
  );
}
