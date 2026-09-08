---
name: startup-triage
description: "Use when: the app will not start, the backend crashes on boot, or local services like MySQL or env files are missing. Diagnose missing dependencies, environment variables, docker services, and Node.js startup errors quickly."
---

# Startup Triage

## Goal
Restore a local project to a working startup state with the fewest iterations.

## Workflow
1. Confirm the expected command for the project and run it from the correct directory.
2. Install all dependencies before troubleshooting runtime issues.
3. Check whether required environment files are present and copy examples when missing.
4. Verify required services such as MySQL or Redis are running.
5. Confirm required secrets and connection variables are set, especially `JWT_SECRET` and database values.
6. Start the app again and read the first real error.
7. Fix only the root cause, then re-run the app and verify the health endpoint or startup log.

## Decision Points
- If `npm install` fails: fix package manager or dependency issues before debugging runtime code.
- If the backend exits with `JWT_SECRET must be configured.`: create or populate `backend/.env`.
- If the database rejects the connection: start the required MySQL container or point `DB_*` to a reachable server.
- If the app starts but the frontend is blank: verify the frontend dev server and API URL configuration.
- If the app is listening but still unhealthy: call the health route and inspect network or port conflicts.

## Completion Checks
- Required `.env` files exist and contain the needed values.
- Supporting services such as MySQL are running.
- The backend starts without crashing.
- The API health endpoint returns a successful response.
- The frontend dev server is reachable at the configured local URL.

## Typical Root Causes for This Project
- Missing `backend/.env` file after cloning.
- MySQL not started with Docker Compose.
- Missing `JWT_SECRET`.
- Wrong database credentials or host.
- Port conflicts on `4000` or `5173`.

## Quick Example

```bash
npm install
cp backend/.env.example backend/.env
docker compose up -d mysql
npm run dev
```

If startup still fails, read the first error message rather than guessing. Fix the direct blocker, then re-run the same command.
