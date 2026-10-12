import { copyFileSync, writeFileSync } from "node:fs";

copyFileSync("dist/pages/index.html", "dist/pages/404.html");
writeFileSync("dist/pages/.nojekyll", "");
console.log("Prepared index, 404 fallback and static assets for GitHub Pages.");
