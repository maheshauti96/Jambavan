// Ramayana symbol icons (§7): 24 px stroke icons at the lucide stroke width (1.75), so they sit next to lucide.
// Symbols only, never figures: the bow stands for Rama, the gada and the Sanjeevani mountain for Hanuman, the moon
// and cave for Jambavan, pennants for Sugriva and the Sena, the striped stone for the squirrel's seva.
// Paths are the reference shapes from .agents/tasks/mocks/jambavan-mock-art.js.
import type { ReactNode, SVGProps } from "react";

export type RamayanaIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number; title?: string };

type Stroke = { stroke: string; strokeWidth: number; strokeLinecap: "round"; strokeLinejoin: "round"; fill: string };

function make(name: string, body: (stroke: Stroke) => ReactNode) {
  function Icon({ size = 24, title, ...props }: RamayanaIconProps) {
    const stroke: Stroke = { stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
    // Decorative by default (icons next to text are aria-hidden, §7); a `title` makes it a labelled image.
    const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true as const, focusable: "false" as const };
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" data-icon={name} {...a11y} {...props}>
        {body(stroke)}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

/** Task / mission: arrow in flight. */
export const MissionArrow = make("MissionArrow", s => <path {...s} d="M4.5 19.5 19 5M13.5 5H19v5.5M4.5 19.5l-.8-3.6M4.5 19.5l3.6.8" />);
/** Completed: arrow in target. */
export const TargetHit = make("TargetHit", s => (
  <>
    <circle {...s} cx="11" cy="13" r="7.5" />
    <circle {...s} cx="11" cy="13" r="3.5" />
    <path {...s} d="M11 13 20.5 3.5M16.5 3.5h4v4" />
  </>
));
/** Project: arch bridge. */
export const SetuBridge = make("SetuBridge", s => <path {...s} d="M2.5 15.5h19M4 15.5c1.8-3.6 4.8-5.5 8-5.5s6.2 1.9 8 5.5M7 15.5V20M12 15.5V20M17 15.5V20M2.5 20h19" />);
/** Team / Sena: two pennants. */
export const SenaPennants = make("SenaPennants", s => <path {...s} d="M5 20V5M5 6h6l-2 2.5L11 11H5M13 20V8M13 9h6l-2 2.5 2 2.5h-6" />);
/** Planning: palm-leaf scroll. */
export const StrategyScroll = make("StrategyScroll", s => <path {...s} d="M7 4h10.5A2.5 2.5 0 0 1 20 6.5V18a2 2 0 0 0 2 2H9a2 2 0 0 1-2-2V4zM7 4a2.5 2.5 0 0 0-2.5 2.5V8H7M10.5 9h6M10.5 12.5h6M10.5 16h4" />);
/** Energy / HANUMAN: gada. */
export const Gada = make("Gada", s => (
  <>
    <circle {...s} cx="15.2" cy="8.8" r="4.6" />
    <path {...s} d="M12.1 5.6l6.3 6.4M15.2 4.2v9.2M12 11.9 4 20M5.6 16.9l1.6 1.6M18.6 5.4l1.7-1.7" />
  </>
));
/** Leadership: bow (Kodanda). Also the brand mark. */
export const Bow = make("Bow", s => <path {...s} d="M7 3c7.5 3.2 7.5 14.8 0 18M7 3v18M3.5 12h15M16 9.2l2.8 2.8-2.8 2.8" />);
/** Journey: dotted forest path. */
export const JourneyPath = make("JourneyPath", s => <path {...s} strokeDasharray="2.5 3" d="M12 21c-5-2.5 5-5.5 0-9s5-6.5 0-9" />);
/** Achievement: diya. */
export const Diya = make("Diya", s => (
  <>
    <path {...s} d="M3.5 14h17c-.9 3.8-4.2 6-8.5 6s-7.6-2.2-8.5-6z" />
    <path {...s} d="M12 3.5c2.2 2.6 2.6 4.9 0 7.5-2.6-2.6-2.2-4.9 0-7.5z" />
  </>
));
/** Squirrel family: striped stone. */
export const SquirrelStone = make("SquirrelStone", s => (
  <>
    <path {...s} d="M4.5 15.5c0-4.4 3.4-8.5 8-8.5 4.4 0 7.5 3.1 7.5 6.8 0 3.6-3.6 5.7-8 5.7-4.6 0-7.5-1.3-7.5-4z" />
    <path {...s} d="M9 9.8c1.4 1.6 1.9 4.2 1.3 7.3M12.6 8.2c1.3 1.9 1.7 4.8 1 8.4M16.1 9.4c.9 1.6 1.1 3.7.5 6" />
  </>
));
/** Angad family: the planted, immovable foot. */
export const AngadFoot = make("AngadFoot", s => (
  <>
    <ellipse {...s} cx="12" cy="15.3" rx="4.1" ry="5.4" />
    <circle cx="7.9" cy="7.6" r="1.25" fill="currentColor" />
    <circle cx="10.4" cy="5.9" r="1.35" fill="currentColor" />
    <circle cx="13.3" cy="5.6" r="1.35" fill="currentColor" />
    <circle cx="15.9" cy="6.9" r="1.2" fill="currentColor" />
  </>
));
/** Sugriv family: pennant. */
export const SugrivPennant = make("SugrivPennant", s => <path {...s} d="M6 21V3M6 4.5h11.5l-3 3.75 3 3.75H6" />);
/** Rescue / not moving: Sanjeevani mountain. */
export const Sanjeevani = make("Sanjeevani", s => (
  <>
    <path {...s} d="M2.5 20 9 9l3.5 5 2.5-3.5L21.5 20z" />
    <path {...s} d="M14.5 6.5c1.6-2.4 4-3 6-2.6-.3 2.2-1.9 4-4.4 4.3M14.5 6.5c.4 1.1.4 2.2.1 3.3" />
  </>
));
/** Mission handed over: a relay arrow passing from one open hand-curve to another. */
export const HandoverArrow = make("HandoverArrow", s => (
  <>
    <path {...s} d="M3 15.5c2.5 0 4-1.5 5.5-1.5H12a1.5 1.5 0 0 1 0 3H9.5M3 20h9.5l6.5-3.2a1.6 1.6 0 0 0-1.4-2.9L14 15.5" />
    <path {...s} d="M9 8.5h11M16.5 5l3.5 3.5L16.5 12" />
  </>
));
/** Jambavan's wisdom: the moon over the cave. */
export const MoonCave = make("MoonCave", s => (
  <>
    <path {...s} d="M15.5 3.5a4.5 4.5 0 1 0 4 6.5 3.6 3.6 0 1 1-4-6.5z" />
    <path {...s} d="M2.5 21c2-5 5.5-8 9.5-8s7.5 3 9.5 8M9 21v-2.5a3 3 0 0 1 6 0V21" />
  </>
));

/** PriorityBadge signal bars: 3 (High), 2 (Medium), 1 (Low). */
export function SignalBars({ bars, size = 15 }: { bars: 1 | 2 | 3; size?: number }) {
  const s = { stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, fill: "none" };
  const d = ["M5 19v-3", "M10 19v-7", "M15 19V8", "M20 19V4"];
  const lit = bars + 1; // Low lights 2 of 4 strokes, Medium 3, High 4
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {d.map((path, i) => <path key={path} {...s} d={path} opacity={i < lit ? 1 : 0.3} />)}
    </svg>
  );
}
