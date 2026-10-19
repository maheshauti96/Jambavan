# Jambavan

Jambavan is an execution workspace for coaching institutes. It connects tasks, meeting decisions, event plans and department responsibilities.

The runnable application is in `jambavan-app/`. The loose files at this repository's root and the `.agents/` snapshots are earlier exports and design references.

## Run the application

```sh
cd jambavan-app
pnpm install
pnpm dev:static
```

The static preview uses port 3000. For the Express development server, run `pnpm dev` from the same directory.

## Check the application

```sh
pnpm check
pnpm check:design
pnpm test
pnpm build
```

The current UI uses example institute data in memory. My day keeps a separate personal plan by date during the current session. Reloading resets the example data. Authentication, durable institute data and production authorization still need deployment configuration and backend integration. [The platform architecture draft](jambavan-app/docs/architecture/README.md) designs the database, authentication and multi-tenant model.

See [the application README](jambavan-app/README.md) for production commands and [the design notes](jambavan-app/docs/design/redesign.md) for the UI structure and verification workflow.
