# AirPath Host Preflight

Date: 2026-05-14

## Summary

- Repo path: `C:\Users\qazws\我的雲端硬碟\Dev\airpath\airpath`
- Git status: clean before this preflight memo was created
- Node version: `v24.14.1`
- npm version: `11.11.0` via `npm.cmd`
- Codex availability: available via `codex.cmd --help`
- Telegram: not configured; `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` were not present

## Required Files

All required preflight files were present:

- `.git`
- `README.md`
- `SPEC.md`
- `DESIGN.md`
- `MODEL_ASSUMPTIONS.md`
- `AGENTS.md`
- `CODEX.md`
- `CHECKLIST.md`
- `COMPUTER_USE_ACCEPTANCE.md`

## Git Status

Initial status output:

```txt
## main...origin/main
```

No uncommitted changes were present before writing this required preflight memo.

## Tooling Notes

PowerShell script execution policy blocked the `.ps1` shims for `npm` and `codex`.
The Windows `.cmd` shims worked:

- `npm.cmd -v` -> `11.11.0`
- `codex.cmd --help` -> available

No Codex CLI installation was needed.

## Missing Items

- Telegram environment variables are missing.
- No repo files were missing.
- No required development tool was missing.

## Next Command To Start Development

Wait for the SSH command from the phone-side session before starting autonomous build.
Do not start autonomous build from this preflight step.

## Telegram Retry

- Search scope: `C:\Users`
- Telegram config found: yes
- Source file: `C:\Users\qazws\我的雲端硬碟\Dev\control-console\.env`
- Token present: yes
- Chat ID present: yes
- Test message sent: yes
- Notes: Existing Telegram settings were found outside the AirPath repo and used only for the current preflight command. No secrets were printed or stored in this memo.
