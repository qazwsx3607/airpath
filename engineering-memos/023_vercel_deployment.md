# Engineering Memo: Vercel Deployment

Version: v0.4 deployment  
Date: 2026-05-15  
Author: Codex  
Area: Deployment / Vercel

## 1. Summary

Status: Ready.

AirPath has been deployed successfully to Vercel through the Vercel dashboard using a GitHub import from the `main` branch.

Production URL:

```txt
https://airpath-ten.vercel.app
```

The previous authentication blocker was resolved manually through the Vercel dashboard. No secrets were printed, stored, or committed.

## 2. Deployment Method Used

Deployment method:

- Vercel dashboard import from GitHub.

Project name:

- `airpath`

Source branch:

- `main`

## 3. CLI and Auth

| Item | Result |
|---|---|
| Vercel CLI already installed during original automation attempt | No |
| Vercel CLI install action during original automation attempt | Installed with `npm.cmd i -g vercel` |
| Vercel CLI version after install | `54.0.0` |
| Auth mode used for successful deployment | Vercel dashboard / manual GitHub import |
| Previous auth blocker | Resolved manually through Vercel dashboard |
| Secrets stored or committed | No |

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

Required checks were run before the original deployment attempt:

| Command | Result |
|---|---|
| `npm run test` | Pass, 18 tests |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run acceptance` | Pass, 2 Playwright tests |

## 6. Deployment URLs

| URL Type | Result |
|---|---|
| Preview URL | Not recorded; deployment was completed through dashboard |
| Production URL | `https://airpath-ten.vercel.app` |

## 7. Verification Result

Production URL verification:

- `curl.exe -I https://airpath-ten.vercel.app`
- Result: HTTP `200 OK`
- Server: Vercel

## 8. Known Limitations

- Preview deployment URL was not captured because the deployment was completed manually through the Vercel dashboard.
- Deployment is public and suitable for demo review, but AirPath remains a conceptual pre-sales thermal risk review tool and not certified CFD.

## 9. Config Changes

Vercel config files added or changed:

- No `vercel.json` changes were made.

Repository safety changes:

- `.gitignore` ignores `.vercel/`.

`.vercel/` handling:

- `.vercel/` was kept out of git.
- No local Vercel credential artifacts were committed.

## 10. Handoff

Status: Ready.

Production URL:

```txt
https://airpath-ten.vercel.app
```
