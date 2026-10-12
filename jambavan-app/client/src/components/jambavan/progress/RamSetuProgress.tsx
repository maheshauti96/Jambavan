// RamSetuProgress (§10.2): 20 stones on a gentle arch between the Kishkindha shore (trees, left) and the Lanka cliff
// (spires, right), over a water band. Placed stones are sandstone with a gold highlight; unplaced ones are dashed
// stone-500. At 100% a gold deck joins the shores and the far-shore diya lights. The numeric % is always visible as
// text, and the wrapper is role="img" with a full description (AC-7.2). With `from`, the stones placed since `from`
// get a gold edge and settle in (30 ms stagger, none under reduced motion) and the text reads "34% → 50%".
import "../styles/progress.css";
import { cn } from "@/lib/utils";
import { clampPct, setuAriaLabel, setuStage, setuStones, SETU_STONES } from "@/theme/setu";

export type RamSetuProgressProps = {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
  showStage?: boolean;
  from?: number;
  animate?: boolean;
  className?: string;
};

const heights = { sm: "h-10", md: "h-[72px]", lg: "h-24" } as const;

export function RamSetuProgress({ value, label, size = "md", showStage = size !== "sm", from, animate = true, className }: RamSetuProgressProps) {
  const pct = Math.round(clampPct(value));
  const fromPct = from === undefined ? pct : Math.round(clampPct(from));
  const placed = setuStones(pct);
  const before = fromPct < pct ? setuStones(fromPct) : placed;
  const complete = pct === 100;
  const stage = setuStage(pct);
  return (
    <div role="img" aria-label={setuAriaLabel(label, pct)} className={cn("jb-setu", className)} data-setu={pct}>
      <svg viewBox="0 0 320 72" preserveAspectRatio={size === "sm" ? "xMinYMid meet" : "xMidYMid meet"} className={cn("block w-full", heights[size])} aria-hidden="true" focusable="false">
        <rect y="44" width="320" height="28" fill="var(--jb-blue-100)" />
        <path d="M60 58h22M130 64h30M200 57h18M248 65h24" stroke="var(--jb-blue-700)" strokeWidth="1.2" opacity=".3" strokeLinecap="round" />
        <path d="M0 72V34q16-9 32-5l12 13v30z" fill="#4E3A2A" />
        <circle cx="12" cy="24" r="6" fill="var(--jb-forest-700)" />
        <circle cx="24" cy="21" r="7" fill="var(--jb-forest-700)" />
        <path d="M320 72V30h-6l-2-12-3 12h-5l-2-8-2 8h-6q-8 4-16 14v28z" fill={complete ? "var(--jb-maroon-700)" : "var(--jb-maroon-800)"} />
        {complete && (
          <>
            <path d="M44 42Q160 24 278 42" stroke="var(--jb-gold-500)" strokeWidth="2.5" fill="none" opacity=".9" />
            <circle cx="298" cy="24" r="10" fill="#F7C873" opacity=".45" />
            <path d="M298 15c2.4 2.8 2.6 5 0 7.6-2.6-2.6-2.4-4.8 0-7.6z" fill="var(--jb-saffron-500)" />
          </>
        )}
        {Array.from({ length: SETU_STONES }, (_, i) => {
          const t = i / (SETU_STONES - 1);
          const x = 46 + t * 228;
          const y = 41 - Math.sin(t * Math.PI) * 7;
          if (i >= placed) return <rect key={i} x={x} y={y} width="10.5" height="8" rx="3" fill="none" stroke="var(--jb-stone-500)" strokeWidth=".9" strokeDasharray="2 2" opacity=".7" />;
          const fresh = i >= before;
          return (
            <g key={i} className={fresh && animate ? "jb-setu-fresh" : undefined} style={fresh && animate ? { animationDelay: `${(i - before) * 30}ms` } : undefined}>
              <rect x={x} y={y} width="10.5" height="8" rx="3" fill={fresh ? "#E9C97E" : "#C9A97E"} stroke={fresh ? "var(--jb-gold-600)" : "#7A5A36"} strokeWidth={fresh ? 1.3 : 0.9} />
              <path d={`M${x + 2} ${y + 1.6}h6.5`} stroke="var(--jb-gold-100)" strokeWidth="1" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      <div aria-hidden="true" className={cn("mt-1 flex items-baseline justify-between gap-3", size === "sm" && "mt-0")}>
        <strong className="text-[15px] font-semibold text-jb-ink">{fromPct < pct ? `${fromPct}% → ${pct}%` : `${pct}%`}</strong>
        {showStage && <span className="text-[13px] leading-[18px] text-jb-earth-600">{stage.label}</span>}
      </div>
    </div>
  );
}
