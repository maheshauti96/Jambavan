# GitHub Pages preview

The frontend supports a repository path through `JAMBAVAN_BASE_PATH`. The router, generated JavaScript and CSS, artwork, favicon and public configuration script use that path.

```sh
JAMBAVAN_BASE_PATH=/Jambavan/ pnpm build:pages
pnpm check:pages --base /Jambavan/
```

The deployable files are in `dist/pages/`. This directory contains only the compiled frontend and its public assets. The build creates `404.html` for recovery links and `.nojekyll` for static branch publishing. The normal local and Express frontend builds use `dist/public/` and remain independent.

## Deployment

The source repository `maheshauti96/Jambavan` is public with the user's approval. GitHub Pages uses GitHub Actions as its publishing source.

`.github/workflows/pages.yml` runs when application files or the workflow change on `main`. It can also run manually from the Actions tab. It installs the locked dependencies, checks types and design, runs tests, builds the Pages files and verifies their paths before deploying.

The deployment base comes from GitHub's Pages configuration. The build job reads source and Pages metadata; the deploy job can publish Pages and obtain its deployment identity. Actions are pinned to verified commit references. No personal access token or additional secret is required.

Site URL: [Jambavan](https://maheshauti96.github.io/Jambavan/).

## Verification

The initial `/Jambavan/` build passed TypeScript, the design guard and all 158 tests. `check:pages` verified 22 asset references, the configuration script's public keys and the 404 fallback. In Brave, all 14 views rendered under the repository path and their artwork URLs used the same prefix. The 404 recovery button returned to the workspace under that path, and task validation worked. The production preview reported no browser errors or warnings.

Local evidence is in `/Users/maheshauti/Documents/Jambavan-design-review-2026-10-12/github-pages/`.

The preview retains in-memory example data. GitHub Pages does not provide the Express API, database or persistent shared task storage.
