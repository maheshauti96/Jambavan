# GitHub Pages preview

The frontend supports a repository path through `JAMBAVAN_BASE_PATH`. The router, generated JavaScript and CSS, artwork, favicon and public configuration script use that path.

```sh
JAMBAVAN_BASE_PATH=/Jambavan/ pnpm build:pages
pnpm check:pages --base /Jambavan/
```

The deployable files are in `dist/pages/`. This directory contains only the compiled frontend and its public assets. The build creates `404.html` for recovery links and `.nojekyll` for static branch publishing. The normal local and Express frontend builds use `dist/public/` and remain independent.

## Publishing routes

GitHub's Pages settings currently require a public repository or an eligible account plan for the private `maheshauti96/Jambavan` repository.

- A separate public preview repository can contain the compiled files from `dist/pages/`. The source repository and its history stay private. Set the base to the preview repository's name before building.
- Publishing directly from `Jambavan` requires making that source repository public or upgrading the account plan.

Changing repository visibility exposes source and Git history. Choose the publishing route before changing visibility or creating the public deployment repository.

For a repository containing compiled files, enable Pages from the `main` branch and the root folder. A source repository can instead use GitHub Actions to build and publish `dist/pages/`.

## Verification

The initial `/Jambavan/` build passed TypeScript, the design guard and all 158 tests. `check:pages` verified 22 asset references, the configuration script's public keys and the 404 fallback. In Brave, all 14 views rendered under the repository path and their artwork URLs used the same prefix. The 404 recovery button returned to the workspace under that path, and task validation worked. The production preview reported no browser errors or warnings.

Local evidence is in `/Users/maheshauti/Documents/Jambavan-design-review-2026-10-12/github-pages/`.

The preview retains in-memory example data. GitHub Pages does not provide the Express API, database or persistent shared task storage.
