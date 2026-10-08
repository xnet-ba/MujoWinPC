# Changelog

Format: Keep a Changelog (opušteno) + SemVer kad krenu tagovi.

## [0.4.0] — 2026-10-08

- API throttling (120/min) + audit trag, Dependabot, shellcheck pin v0.10.0.
- Dependabot mergeano: setup-node v6, setup-python v7, checkout v7, express 5.2.1
  (API testovi 9/9 prolaze na express 5).

## [0.3.0] — 2026-10-08

- `mujowin health`, `profile auto`, `scripts/idle-stop.sh`, `docs/HOSTS.md`.
- CI: Trivy sken (neblokirajući), Release workflow.

## [0.2.0] — 2026-10-08

- Faza 1 (CLI, compose, profili, ploča, docs) + Faza 2 (API, live ploča,
  mock mode, OEM paketi).

## [Unreleased]

### Dodano (Faza 2)

- `server/` Express API (jedina zavisnost: express): health, status, up/down/
  restart, logs, resources, boot. Bearer token obavezan, sluša 127.0.0.1.
- Live dio ploče: token konekcija, start/stop/restart, logovi (poll),
  resursi hosta + profil, boot faza (best-effort heuristika).
- Mock mode API-ja (`MUJO_MOCK=1`, ephemeral token) + 8 API testova.
- OEM winget liste: `packages.txt` (default), `-dev`, `-office`.
- `mujowin status --json` za mašinsko čitanje.
- Rotacija backupa (`backup --keep N`), `docs/FIRST_START.md`,
  privatni portovi dokumentovani, shellcheck čist (0 upozorenja).

### Dodano (Faza 3)

- `mujowin health` (host-side kontejner + TCP probe), `profile auto`,
  `scripts/idle-stop.sh` (cron primjer), `docs/HOSTS.md`.
- CI: Trivy sken (neblokirajući), Release workflow na `v*` tagove.

### Dodano (zatvaranje gapova, bez verzije)

- API throttling (120/min) + audit trag, Dependabot (npm + actions),
  shellcheck pin v0.10.0 u CI-ju, docs tense usklađen.

### Dokazano (smoke test bez KVM-a)

- Pun ciklus: ISO → Setup → desktop → backup (5.3 GB) → restore → login →
  desktop. 6 screenshotova u README galeriji. Boot heuristika uzemljena
  na stvarni dockur v6.06 log (uključujući OEM dokaz).

### Dodano (Faza 1)

- CLI `mujowin`: doctor, up, down, status, logs, restart, reset, backup,
  restore, profile (+ mock mode sjeme).
- Compose: baza + Windows 10/11 overridei + 4 profila; zabrana default lozinki.
- Profili resursa lite/standard/dev/heavy.
- Statična kontrolna ploča (bs/en, tamna/svijetla tema, bez CDN-a).
- OEM kostur (`oem/install.bat`), docs (5 fajlova), CI, devcontainer, Makefile.
