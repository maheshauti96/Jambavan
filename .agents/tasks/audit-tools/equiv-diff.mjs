// Diff two equiv-<label>.json fingerprints. Usage: node equiv-diff.mjs baseline after
import { readFileSync } from "node:fs";
const load = l => JSON.parse(readFileSync(new URL(`./equiv-${l}.json`, import.meta.url), "utf8"));
const [a, b] = [load(process.argv[2]), load(process.argv[3])];
let diffs = 0;
function firstDiff(x, y) { let i = 0; while (i < x.length && x[i] === y[i]) i++; return i; }
function cmp(path, x, y) {
  if (typeof x === "object" && x && typeof y === "object" && y) {
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (k !== "label" && k !== "console") cmp(`${path}.${k}`, x[k], y[k]);
    return;
  }
  // data-loc is the dev-only source-location attribute from @builder.io/vite-plugin-jsx-loc; it names the file.
  if (typeof x === "string" && typeof y === "string") { x = x.replace(/ data-loc="[^"]*"/g, ""); y = y.replace(/ data-loc="[^"]*"/g, ""); }
  if (x === y) return;
  diffs++;
  if (typeof x === "string" && typeof y === "string") {
    const i = firstDiff(x, y);
    console.log(`DIFF ${path} @${i}\n  A: …${x.slice(Math.max(0, i - 120), i + 200)}\n  B: …${y.slice(Math.max(0, i - 120), i + 200)}`);
  } else console.log(`DIFF ${path}: ${JSON.stringify(x)?.slice(0, 200)} vs ${JSON.stringify(y)?.slice(0, 200)}`);
}
cmp("", a, b);
console.log(`console A: ${JSON.stringify(a.console.map(c => c.label + ":" + c.text.slice(0, 60)))}`);
console.log(`console B: ${JSON.stringify(b.console.map(c => c.label + ":" + c.text.slice(0, 60)))}`);
console.log(diffs ? `${diffs} difference(s)` : "IDENTICAL");
process.exit(diffs ? 1 : 0);
