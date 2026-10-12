# Website route manifest

For every web project, prepare a complete route manifest from the current source before the
first dev server start. Keep it synchronized with every route addition, change, or removal,
including when taking over an existing project.

Serve a static JSON file at **`GET /manus-routes.json` on the website's origin**. Use
the project's existing static-file serving, for example `public/manus-routes.json` when that
directory maps to the origin root. The manifest stays at the origin root, regardless
of the application's page paths.

## File contract

```json
{
  "routes": [
    { "path": "/", "title": "Home" },
    { "path": "/todo/:id", "title": "Todo" }
  ]
}
```

- The top-level object contains only `routes`; each entry allows only `path` and `title`.
  Unknown fields, including `version`, are rejected.
- Each entry requires a string `path`; `title` is an optional human-readable page name.
  The path must start with `/` and identify a path on this site. Query strings and
  hashes are allowed. Absolute URLs, `//` cross-site paths, credentials, raw whitespace,
  and control characters are forbidden.
- The entire JSON is at most **1 MiB**, with at most **1,000 routes**. Each `path`
  is at most **2,048 characters**, including after URL encoding;
  `title` is at most **256 characters**.
  A malformed or oversized manifest is rejected as a whole. Never truncate it into a
  partial list or silently drop invalid entries to fit these limits.

Derive the full list from the current source, including nested routes, lazy-loaded routes,
and dynamic route patterns. Exclude APIs, assets, system endpoints, and 404-only routes.
For a newly scaffolded project, list all routes that exist now and expand the file with the
implementation; do not wait until the site is finished to create it.

Declare dynamic patterns exactly as they appear in source, such as `/todo/:id`.
Do not enumerate or guess entity IDs to replace route parameters.

## Verify the declaration

After starting the application or changing routes, request `/manus-routes.json` and confirm
that it returns **HTTP 200 and JSON matching this contract**, rather than an HTML SPA fallback.
Compare the served declaration with the current source to check for missing, obsolete, or
incorrect routes. If the running application cannot be checked, report that verification gap.

This file declares application pages. The published site's [routing rules](../deployment/references/routing-and-responses.md#published-routes)
configure server/static request dispatch separately.
