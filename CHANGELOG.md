# Changelog

Format: Keep a Changelog (opušteno) + SemVer kad krenu tagovi.

## [Unreleased]

### Dodano (Faza 2)

- `server/` Express API (jedina zavisnost: express): health, status, up/down/
  restart, logs, resources, boot. Bearer token obavezan, sluša 127.0.0.1.
- Live dio ploče: token konekcija, start/stop/restart, logovi (poll),
  resursi hosta + profil, boot faza (best-effort heuristika).
- Mock mode API-ja (`MUJO_MOCK=1`, ephemeral token) + 8 API testova.
- OEM winget liste: `packages.txt` (default), `-dev`, `-office`.
- `mujowin status --json` za mašinsko čitanje.

### Dodano (Faza 1)

- CLI `mujowin`: doctor, up, down, status, logs, restart, reset, backup,
  restore, profile (+ mock mode sjeme).
- Compose: baza + Windows 10/11 overridei + 4 profila; zabrana default lozinki.
- Profili resursa lite/standard/dev/heavy.
- Statična kontrolna ploča (bs/en, tamna/svijetla tema, bez CDN-a).
- OEM kostur (`oem/install.bat`), docs (5 fajlova), CI, devcontainer, Makefile.
