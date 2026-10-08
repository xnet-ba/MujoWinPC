# Roadmap

Legenda statusa: `planirano` · `u radu` · `gotovo`. Težina: S / M / L.

## 1. Core — gotovo (Faza 1)

- [x] Stabilan start/stop preko CLI-ja (S)
- [x] Windows 10 i 11 kao compose overridei (S)
- [x] Profili resursa lite/standard/dev/heavy (S)
- [x] Health check: `mujowin health` host-side (kontejner + TCP probe).
  In-container healthcheck namjerno izostavljen: dockur image je minimalni
  rootfs bez garantovanog HTTP klijenta (provjeren Dockerfile) — pogrešan
  test bi flappingovao zdrave VM-ove. (S)
- [x] Node/Express API: start/stop/status/logs (M)
- [x] Resursi (CPU/RAM/disk) i boot faza u ploči (M)
- [x] Mock mode bez VM-a + testovi CLI-ja i API-ja (M)
- [x] OEM paketi (winget liste: default/dev/office) (S)

## 2. Razvojno iskustvo — gotovo/u radu

- [x] CLI + Makefile (M)
- [x] Mock mode sjeme za razvoj bez KVM-a (S)
- [x] Testovi CLI-ja (S)
- [x] API testovi (8, node:test + CI) (S)
- [x] Devcontainer (S)

## 3. Sigurnost — u radu

- [x] Lozinke samo iz `.env`, odbijanje defaulta (S)
- [x] SECURITY.md + RDP savjeti (S)
- [x] Privatni portovi dokumentovani (SECURITY + HOSTS) (S)
- [x] Autentifikacija ploče/API-ja tokenom (M)
- [x] Throttling (120/min/IP) + audit trag poziva (S)
- [ ] TLS završetak, rotacija tajni (M) — otvoreno

## 4. Performanse i resursi — gotovo

- [x] Auto-profil: `mujowin profile auto` (S)
- [x] Idle auto-stop skripta (`scripts/idle-stop.sh`, cron primjer) (M).
  GitHub pravila provjerena u docsima (default 30 min, 5–240 min).

## 5. Persistencija i backup — gotovo/djelimično

- [x] Backup/restore volumena u tar (M) — **ciklus dokazan**: desktop →
  tar (5.3 GB, ~15 min) → novi volumen → boot → login → desktop (smoke test)
- [x] Rotacija backupa (`backup --keep N`) (S)
- [x] Dokumentovano šta preživljava restart/stop/brisanje (README +
  web FAQ + HOSTS; brisanje Codespacea ostaje neprovjereno) (S)

## 6. Automatizacija — gotovo

- [x] OEM kostur (`oem/install.bat` se izvršava na svježoj instalaciji) (S)
- [x] Winget liste aplikacija (default/dev/office) (S)
- [x] "Gotova okruženja" kao paket-liste (dev, office) (M)

## 7. UX i frontend — gotovo/djelimično

- [x] Ploča: status, noVNC link, profili, FAQ (M)
- [x] Live kontrola (start/stop/logovi/resursi/boot) preko API-ja (M)
- [x] Vodič kroz prvi start (`docs/FIRST_START.md`) (S)
- [x] bs/en, tamna/svijetla tema, mobilni prikaz (S)
- [x] Boot progress + resursi uživo (M)

## 8. Kompatibilnost i hostovi — gotovo (test na pravom KVM-u čeka autora)

- [x] Codespaces / lokalni Linux / VPS: `docs/HOSTS.md` (M).
  Stvarni test na Codespacesu i dalje treba autora (nema KVM-a ovdje).

## 9. Dokumentacija i zajednica — gotovo

- [x] README, TROUBLESHOOTING, FAQ, CONTRIBUTING, CHANGELOG (M)
- [x] Issue/PR šabloni (S)
- [x] Snimci ekrana sa stvarnog rada (S) — setup kadrovi iz TCG smoke
  testa su u README-ju; desktop kadar čeka KVM host ili dovršetak emulirane
  instalacije

## 10. CI/CD i kvalitet — gotovo/djelimično

- [x] GitHub Actions: shellcheck, compose validacija, HTML check, testovi (S)
- [x] API testovi u CI-ju (S)
- [x] Trivy sken image-a (HIGH/CRITICAL, neblokirajuće — image je uzvodni) (S)
- [x] Release workflow (`v*` tag → GitHub Release) (S)
