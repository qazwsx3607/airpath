# Engineering Memo: Vercel Deployment Attempt

Version: v0.4 deployment  
Date: 2026-05-15  
Author: Codex  
Area: Deployment / Vercel

## 1. Summary

Status: Blocked - Vercel authentication required.

AirPath passed the required local validation gate, and the repository has an existing Vercel configuration for the monorepo root. Vercel CLI was installed successfully, but deployment could not proceed because no non-interactive Vercel authentication was available.

Required next action:

```txt
Run vercel login on the AI host, or provide VERCEL_TOKEN.
```

## 2. Deployment Method Used

Planned method:

- Vercel CLI from the AirPath repository root.
- Project name: `airpath`.
- Preview deployment first, then production deployment.

Actual method:

- Deployment was not started because authentication was unavailable.

## 3. CLI and Auth

| Item | Result |
|---|---|
| Vercel CLI already installed | No |
| Vercel CLI install action | Installed with `npm.cmd i -g vercel` |
| Vercel CLI version after install | `54.0.0` |
| Auth mode used | Blocked / login required |
| `VERCEL_TOKEN` | Not present |
| Local Vercel login/session | Not available |
| `vercel whoami` | Did not complete in non-interactive mode |

No token values were printed, stored, or committed.

## 4. Project Configuration

Correct web app root:

- `apps/web`

Deployment root:

- Repository root, using root `vercel.json`.

Existing Vercel configuration:

```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/dist"
}
```

Build command:

```txt
npm run build
```

Output directory:

```txt
apps/web/dist
```

## 5. Validation Results

Required checks were run before deployment attempt:

| Command | Result |
|---|---|
| `npm run test` | Pass, 18 tests |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run acceptance` | Pass, 2 Playwright tests |

## 6. Deployment URLs

| URL Type | Result |
|---|---|
| Preview URL | Not created - authentication blocked |
| Production URL | Not created - authentication blocked |

## 7. Verification Result

Production verification was not possible because production deployment was not created.

Local validation succeeded. Vercel deployment is blocked only by authentication.

## 8. Known Limitations

- A public production URL cannot be produced until Vercel authentication is available.
- If Vercel creates `.vercel/` project-link metadata after login/linking, it must remain uncommitted.

## 9. Config Changes

Vercel config files added or changed:

- No `vercel.json` changes were made.

Repository safety changes:

- `.gitignore` was updated to ignore `.vercel/`.

`.vercel/` handling:

- `.vercel/` was not present during this blocked attempt.
- `.vercel/` is now explicitly kept out of git.

## 10. Handoff

Status: Blocked - Vercel authentication required.

Next action for user:

```txt
Run vercel login on the AI host, or provide VERCEL_TOKEN.
```
