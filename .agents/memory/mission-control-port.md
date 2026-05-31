---
name: Mission Control port setup
description: The mission-control artifact uses port 26054; the Replit workflow health-check tool only recognises a limited set of ports so the dev script must include env var defaults.
---

The `artifacts/mission-control` artifact has `localPort = 26054` set in `artifact.toml`.
The `[services.env]` block declares `PORT = "26054"` and `BASE_PATH = "/"`, but those values are NOT automatically injected into the pnpm shell when the workflow runs.

**Fix:** The `dev` script in `artifacts/mission-control/package.json` must include the defaults:

```json
"dev": "PORT=${PORT:-26054} BASE_PATH=${BASE_PATH:-/} vite --config vite.config.ts --host 0.0.0.0"
```

**Why:** `vite.config.ts` throws if PORT or BASE_PATH are missing. The workflow infra injects env vars for the process environment but pnpm script expansion happens before that injection in some cases.

**How to apply:** Any time this artifact's dev script is reset or modified, re-add the env var prefix.
