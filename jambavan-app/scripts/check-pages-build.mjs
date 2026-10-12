import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    base: { type: "string", default: "/" },
    dir: { type: "string", default: "dist/pages" },
  },
});
const base = values.base;
const directory = path.resolve(values.dir);
assert(
  base.startsWith("/") && base.endsWith("/"),
  "Base must start and end with a slash."
);
const html = readFileSync(path.join(directory, "index.html"), "utf8");
assert.equal(readFileSync(path.join(directory, "404.html"), "utf8"), html);
assert(existsSync(path.join(directory, ".nojekyll")));
assert(
  !html.includes("/__manus__/"),
  "Development scripts must not be published."
);

let checked = 0;
function checkUrl(url) {
  if (!url.startsWith("/")) return;
  assert(url.startsWith(base), `Asset does not use deployment base: ${url}`);
  const file = path.resolve(directory, url.slice(base.length));
  assert(
    file.startsWith(directory + path.sep),
    `Asset is outside the output directory: ${url}`
  );
  assert(existsSync(file), `Missing built asset: ${url}`);
  checked++;
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g))
  checkUrl(match[1]);
for (const match of html.matchAll(/href="([^"]+\.css)"/g)) {
  const css = readFileSync(
    path.join(directory, match[1].slice(base.length)),
    "utf8"
  );
  for (const font of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g))
    checkUrl(font[1]);
}
const artwork = JSON.parse(readFileSync("docs/design/assets.json", "utf8"));
for (const asset of artwork) {
  const bytes = readFileSync(path.join(directory, asset.file));
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  checked++;
}
assert(
  html.includes(`src="${base}api/platform/config.js"`),
  "Public config script must use deployment base."
);
const config = readFileSync(
  path.join(directory, "api/platform/config.js"),
  "utf8"
);
const match = /^window\.__MANUS_CONFIG__=(\{.*\});$/.exec(config);
assert(match, "Public config script has an unexpected format.");
assert.deepEqual(Object.keys(JSON.parse(match[1])).sort(), [
  "apiBrowserKey",
  "apiUrl",
  "oauthPortalUrl",
  "projectId",
]);
console.log(
  `Pages build checks passed for ${base}: ${checked} assets, public config and 404 fallback.`
);
