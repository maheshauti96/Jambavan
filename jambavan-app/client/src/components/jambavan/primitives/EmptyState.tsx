// EmptyState (§3.5, copy in §9.2): a 96 px symbolic SVG (Setu stone, path, diya, bow, Sanjeevani), a display
// title (24), a 15 px body and an optional action.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Bow,
  Diya,
  JourneyPath,
  Sanjeevani,
  SetuBridge,
} from "../icons/RamayanaIcons";

const symbols = {
  setu: SetuBridge,
  path: JourneyPath,
  diya: Diya,
  bow: Bow,
  sanjeevani: Sanjeevani,
} as const;
export type EmptySymbol = keyof typeof symbols;

export function EmptyState({
  symbol = "setu",
  title,
  children,
  action,
  className,
  headingLevel = 3,
}: {
  symbol?: EmptySymbol;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const Symbol = symbols[symbol];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      className={cn(
        "jb-empty-state flex flex-col items-center gap-2 px-4 py-8 text-center",
        className
      )}
    >
      <span className="mb-1 grid size-24 place-items-center rounded-full bg-jb-cream-100 text-jb-gold-600">
        <Symbol size={48} />
      </span>
      <Heading className="m-0 font-display text-2xl font-semibold leading-7 text-jb-ink">
        {title}
      </Heading>
      {children && (
        <p className="m-0 max-w-md text-[15px] leading-[22px] text-jb-earth-600">
          {children}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
