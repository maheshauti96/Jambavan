// Verify WCAG contrast for proposed JAMBAVAN tokens.
const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
const L = c => { const [r, g, b] = h(c).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const T = {
  cream50: "#FFFBF3", cream100: "#FBF3E4", cream200: "#F3E6CF", sand300: "#E3D3B5", white: "#FFFFFF",
  ink: "#2B1D14", earth700: "#5A3F2E", earth600: "#6B5344", stone600: "#6E675E", stone500: "#8A8378",
  maroon700: "#7A1E2C", maroon800: "#5E1622", maroon50: "#F8E9E7",
  saffron500: "#E8862A", saffron700: "#9A4A12", saffron100: "#FCE9D2",
  gold500: "#C9A227", gold600: "#A88414", gold100: "#F7EDCC",
  forest700: "#2F5D3A", forest100: "#E2EEDF", blue700: "#1E3A5F", blue100: "#E1E9F2",
  danger700: "#A8261B", danger100: "#FBE4E0", night900: "#1C1512",
};
const pairs = [
  ["ink", "cream50"], ["ink", "white"], ["earth700", "cream50"], ["earth600", "cream50"], ["earth600", "cream100"], ["earth600", "white"], ["stone600", "cream50"], ["stone600", "cream100"], ["stone500", "cream50"],
  ["cream50", "maroon700"], ["cream50", "maroon800"], ["maroon700", "cream50"], ["maroon700", "maroon50"], ["maroon700", "cream100"],
  ["saffron700", "cream50"], ["saffron700", "saffron100"], ["ink", "saffron500"], ["saffron500", "cream50"],
  ["gold600", "cream50"], ["gold500", "cream50"], ["ink", "gold100"], ["gold500", "night900"], ["gold500", "maroon800"],
  ["forest700", "forest100"], ["forest700", "cream50"], ["blue700", "blue100"], ["blue700", "cream50"], ["danger700", "danger100"], ["danger700", "cream50"],
  ["cream50", "night900"], ["cream100", "blue700"], ["sand300", "cream50"], ["blue700", "maroon700"],
  // round 2 (review M5 + N10 + H2 dark band)
  ["cream50", "danger700"], ["ink", "maroon50"], ["ink", "blue100"], ["ink", "forest100"], ["ink", "saffron100"],
  ["stone600", "white"], ["earth700", "cream200"], ["maroon700", "white"], ["saffron700", "white"], ["forest700", "white"],
  ["blue700", "white"], ["danger700", "white"], ["ink", "cream100"], ["earth600", "maroon50"], ["stone600", "cream200"],
  ["stone600", "maroon50"], ["earth700", "white"], ["stone500", "white"], ["blue700", "white"], ["gold600", "white"],
  ["ink", "cream200"], ["cream100", "night900"], ["gold100", "night900"], ["earth600", "gold100"], ["forest700", "gold100"],
];
for (const [a, b] of pairs) { const r = cr(T[a], T[b]); console.log(`${a.padEnd(11)} on ${b.padEnd(10)} ${r.toFixed(2).padStart(5)} ${r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA-large/UI" : "FAIL"}`); }
