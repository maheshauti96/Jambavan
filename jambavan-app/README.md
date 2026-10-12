# Jambavan application

React, TypeScript and Vite provide the interface. Express, tRPC and Drizzle provide the existing server foundation.

## Local development

Install dependencies with `pnpm install`. Run `pnpm dev:static` for the frontend preview or `pnpm dev` for the Express development server. Both use port 3000 by default.

## Verification

Run `pnpm check`, `pnpm check:design`, `pnpm test` and `pnpm build` before publishing changes. The design check catches small CSS text, stale promotional copy and missing or oversized artwork.

The browser check source is in `scripts/ui-audit/dom.js`. Evaluate it on the running page to inspect text sizes, control heights, page width, task placement and artwork dimensions. These measurements supplement visual and interaction checks.

## Production build

`pnpm build` creates the frontend in `dist/public/` and the server in `dist/index.js`. `pnpm start` serves the built application and honors `PORT`.

Configure authentication, database and storage through deployment environment variables. Run `pnpm db:migrate` before enabling database-backed features. `/api/health` is the server health endpoint.

The current institute workflows use an in-memory preview model. My day keeps a separate personal plan by date during the current session. Reloading resets the preview model. A frontend build does not enable durable task storage or production role enforcement.

## Design

Shared tokens, fonts and reduced-motion behavior live in `client/src/theme/`. `styles/workspace.css` owns shared layout, typography, controls and task cards. `styles/sections.css` retains the existing screen layouts with larger type and normalized foreground colors.

`layout/viewMeta.ts` connects every view to a title, description and illustration. `public/art/` contains optimized artwork generated with the built-in ImageGen tool. [The artwork manifest](docs/design/assets.json) records prompts, dimensions and sizes.

[The redesign notes](docs/design/redesign.md) describe the component boundaries and the main interaction checks.
