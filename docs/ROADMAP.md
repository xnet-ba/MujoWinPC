# Roadmap

Legenda statusa: `planirano` · `u radu` · `gotovo`. Težina: S / M / L.

## 1. Core — gotovo (Faza 1)

- [x] Stabilan start/stop preko CLI-ja (S)
- [x] Windows 10 i 11 kao compose overridei (S)
- [x] Profili resursa lite/standard/dev/heavy (S)
- [ ] Health check kontejnera (S) — planirano (Faza 2)
- [x] Node/Express API: start/stop/status/logs (M)
- [x] Resursi (CPU/RAM/disk) i boot faza u ploči (M)
- [x] Mock mode bez VM-a + testovi CLI-ja i API-ja (M)
- [x] OEM paketi (winget liste: default/dev/office) (S)

## 2. Razvojno iskustvo — gotovo/u radu

- [x] CLI + Makefile (M)
- [x] Mock mode sjeme za razvoj bez KVM-a (S)
- [x] Testovi CLI-ja (S)
- [x] Devcontainer (S)
- [ ] API testovi (S) — Faza 2

## 3. Sigurnost — u radu

- [x] Lozinke samo iz `.env`, odbijanje defaulta (S)
- [x] SECURITY.md + RDP savjeti (S)
- [ ] Privatni portovi po defaultu, dokumentovano (S) — Faza 2
- [x] Autentifikacija ploče/API-ja tokenom (M)
- [ ] Release tagovi (S)
- [ ] Skeniranje image-a u CI-ju (S) — Faza 3 (čeka odobrenje)

## 4. Performanse i resursi — planirano

- [ ] Auto-profil u `doctor` (postoji preporuka; puna automatika) (S) — Faza 2
- [ ] Upozorenja o resursima uživo (M) — Faza 2
- [ ] Idle auto-stop radi štednje Codespaces sati (M) — Faza 3, **treba provjeriti
  stvarna GitHub pravila o idle timeoutu i limitima** (čeka odobrenje)

## 5. Persistencija i backup — gotovo/djelimično

- [x] Backup/restore volumena u tar (M)
- [x] Rotacija backupa (`backup --keep N`) (S)
- [ ] Rotacija backupa (S) — Faza 2
- [ ] Dokumentovano šta preživljava restart/stop/brisanje Codespacea (S) —
  **treba provjeriti na pravom Codespacesu** (čeka odobrenje)

## 6. Automatizacija — planirano

- [x] OEM kostur (`oem/install.bat` se izvršava na svježoj instalaciji) (S)
- [ ] Winget/choco liste aplikacija (S) — Faza 2
- [ ] "Gotova okruženja" (dev, office, testiranje) (M) — Faza 3 (čeka odobrenje)

## 7. UX i frontend — gotovo/djelimično

- [x] Ploča: status, noVNC link, profili, FAQ (M)
- [x] Live kontrola (start/stop/logovi/resursi/boot) preko API-ja (M)
- [x] Vodič kroz prvi start (`docs/FIRST_START.md`) (S)
- [x] bs/en, tamna/svijetla tema, mobilni prikaz (S)
- [x] Boot progress + resursi uživo (M)

## 8. Kompatibilnost i hostovi — planirano

- [ ] Codespaces (primarno): vodič + provjerene razlike (M) — treba pravi test
- [ ] Lokalni Linux s KVM-om: vodič (S) — treba pravi test
- [ ] VPS: ograničenja (S) — Faza 3 (čeka odobrenje)

## 9. Dokumentacija i zajednica — gotovo

- [x] README, TROUBLESHOOTING, FAQ, CONTRIBUTING, CHANGELOG (M)
- [x] Issue/PR šabloni (S)
- [ ] Primjeri i snimci ekrana sa stvarnog rada (S) — kad se testira na KVM-u

## 10. CI/CD i kvalitet — gotovo/djelimično

- [x] GitHub Actions: shellcheck, compose validacija, HTML check, testovi (S)
- [x] API testovi u CI-ju (S)
- [ ] Release tagovi (S) — Faza 2
- [ ] Release tagovi (S) — Faza 2
