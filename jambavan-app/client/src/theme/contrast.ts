// WCAG 2.x contrast helper and the approved text/background pairs (§3.2). Used by contrast.test.ts; the browser
// audit is what enforces contrast on rendered pages (§14.3).

export const palette = {
  "cream-50": "#FFFBF3",
  "cream-100": "#FBF3E4",
  "cream-200": "#F3E6CF",
  "sand-300": "#E3D3B5",
  white: "#FFFFFF",
  ink: "#2B1D14",
  "earth-700": "#5A3F2E",
  "earth-600": "#6B5344",
  "stone-600": "#6E675E",
  "stone-500": "#8A8378",
  "maroon-700": "#7A1E2C",
  "maroon-800": "#5E1622",
  "maroon-50": "#F8E9E7",
  "saffron-500": "#E8862A",
  "saffron-700": "#9A4A12",
  "saffron-100": "#FCE9D2",
  "gold-500": "#C9A227",
  "gold-600": "#A88414",
  "gold-100": "#F7EDCC",
  "forest-700": "#2F5D3A",
  "forest-100": "#E2EEDF",
  "blue-700": "#1E3A5F",
  "blue-100": "#E1E9F2",
  "danger-700": "#A8261B",
  "danger-100": "#FBE4E0",
  "night-900": "#1C1512",
} as const;

export type TokenName = keyof typeof palette;

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** `min` is 4.5 for body text, 3 for UI strokes (input borders, focus ring); `note` records a size restriction. */
export type ApprovedPair = { fg: TokenName; bg: TokenName; min: number; note?: string };

const text = (fg: TokenName, bgs: TokenName[], note?: string): ApprovedPair[] => bgs.map(bg => ({ fg, bg, min: 4.5, note }));
const ui = (fg: TokenName, bgs: TokenName[]): ApprovedPair[] => bgs.map(bg => ({ fg, bg, min: 3, note: "UI only, never text" }));

/** §3.2 allowlist: both tables (round 1 and the round 2 additions). */
export const approvedPairs: ApprovedPair[] = [
  ...text("ink", ["cream-50", "white"]),
  ...text("earth-700", ["cream-50"]),
  ...text("earth-600", ["cream-50", "cream-100", "white"]),
  ...text("stone-600", ["cream-50", "cream-100"]),
  ...text("cream-50", ["maroon-700", "maroon-800"]),
  ...text("maroon-700", ["cream-50", "maroon-50"]),
  ...text("saffron-700", ["cream-50", "saffron-100"]),
  ...text("ink", ["saffron-500"]),
  ...text("forest-700", ["forest-100", "cream-50"]),
  ...text("blue-700", ["blue-100", "cream-50"]),
  ...text("danger-700", ["danger-100", "cream-50"]),
  ...text("gold-500", ["night-900", "maroon-800"], "gold text on dark only"),
  ...text("cream-50", ["night-900"]),
  ...ui("stone-500", ["cream-50", "white"]),
  // round 2 (review M5)
  ...text("cream-50", ["danger-700"]),
  ...text("ink", ["gold-100", "maroon-50", "blue-100", "forest-100", "saffron-100"]),
  ...text("stone-600", ["white"]),
  ...text("earth-700", ["cream-200", "white"]),
  ...text("maroon-700", ["white"]),
  ...text("saffron-700", ["white"]),
  ...text("forest-700", ["white"]),
  ...text("blue-700", ["white"]),
  ...text("danger-700", ["white"]),
  ...text("ink", ["cream-100", "cream-200"]),
  ...text("maroon-700", ["cream-100"]),
  ...text("earth-600", ["maroon-50", "gold-100"]),
  ...text("forest-700", ["gold-100"]),
  ...text("cream-100", ["night-900"]),
  ...text("gold-100", ["night-900"]),
  ...text("stone-600", ["cream-200", "maroon-50"], "allowed only at >= 14 px"),
  // round 4 component pairs (design review R4-N4): BlockerLine and HandoverLine
  ...text("earth-700", ["danger-100", "cream-100"]),
  ...text("ink", ["danger-100"]),
];

/** Pairs a test asserts FAIL, so nobody "fixes" the test by adding them to the allowlist. */
export const forbiddenPairs: { fg: TokenName; bg: TokenName; min: number; why: string }[] = [
  { fg: "saffron-500", bg: "cream-50", min: 4.5, why: "saffron-500 is a fill only, never text on light" },
  { fg: "gold-500", bg: "cream-50", min: 4.5, why: "gold-500 text on light" },
  { fg: "gold-600", bg: "cream-50", min: 4.5, why: "gold-600 is ornament only on light" },
  { fg: "gold-600", bg: "white", min: 4.5, why: "gold-600 is ornament only on light" },
  { fg: "sand-300", bg: "cream-50", min: 3, why: "sand-300 is never an input or control border" },
  { fg: "blue-700", bg: "maroon-700", min: 3, why: "the focus ring is never drawn directly against maroon-700" },
];
