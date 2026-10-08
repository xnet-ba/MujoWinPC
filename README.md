# MujoWinPC

Windows 10/11 desktop u browseru — Docker + Codespaces, s CLI-jem, profilima resursa i kontrolnom pločom.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/xnet-ba/MujoWinPC/actions/workflows/ci.yml/badge.svg)](https://github.com/xnet-ba/MujoWinPC/actions/workflows/ci.yml)

## Šta je / šta NIJE

**Jeste:** kompletan, održiv projekat oko slike `dockurr/windows` — profili
resursa, `mujowin` CLI, provjera okruženja (`doctor`), backup/restore,
statična kontrolna ploča, CI i dokumentacija.

**Nije:** fork s jednom compose datotekom; ne distribuira Windows; ne tvrdi
da radi bez KVM-a; ne traži praćenje ičijeg naloga (follow-gate iz uzora je
uklonjen).

## Ključne mogućnosti

- `mujowin` CLI: `doctor`, `up/down/status/logs/restart`, `reset` (uz potvrdu),
  `backup/restore`, `profile`
- Profili `lite/standard/dev/heavy` + Windows 10/11 overridei
- Start se **odbija** bez prave lozinke (nema defaulta u repou)
- Statična ploča `web/` (bs/en, tamna/svijetla, bez CDN-a i trackera)
- OEM kostur za post-install, named volume + tar backup, CI

## Brzi start (Codespaces)

> Uslov: GitHub nalog. KVM u Codespacesu tipično **ne postoji**
> (neprovjereno na svim tipovima mašina) — očekuj spor rad ili neuspjeh bez
> KVM-capable hosta; `doctor` to jasno prijavljuje.

1. Forkuj repo → **Code → Create codespace** (ili `gh codespace create -r xnet-ba/MujoWinPC`).
2. `cp .env.example .env` i upiši **jaku** `WINDOWS_PASSWORD`.
3. `./scripts/mujowin doctor` — pročitaj preporuku profila.
4. `./scripts/mujowin profile standard` (ili preporučeni).
5. `./scripts/mujowin up` → otvori forwarded port **8006** (noVNC).
6. Prijavi se podacima iz `.env`. RDP: port 3389.

Lokalni Linux s KVM-om: isto, samo radi `make doctor` prije `up`-a.

## CLI komande

| Komanda | Šta radi |
|---|---|
| `mujowin doctor` | /dev/kvm, /dev/net/tun, Docker, RAM/CPU/disk, lozinka, portovi + preporuka profila |
| `mujowin up` | start (odbija bez lozinke; upozorava bez KVM-a) |
| `mujowin down / restart / status / logs [-f]` | svakodnevno upravljanje |
| `mujowin reset` | **briše volumen** — traži ukucanu potvrdu |
| `mujowin backup [ime]` / `restore <tar>` | tar volumena; VM treba biti zaustavljen |
| `mujowin profile <ime>` | postavi profil |

## Profili

| Profil | RAM | CPU | Disk | Za koga |
|---|---|---|---|---|
| `lite` | 4G | 2 | 32G | slabi hostovi, proba |
| `standard` | 8G | 4 | 64G | svakodnevni rad |
| `dev` | 12G | 4 | 80G | razvoj u VM-u |
| `heavy` | 16G | 8 | 128G | samo jaki hostovi |

`DISK_SIZE` vrijedi za novi volumen — ne resizea postojeći.

## Konfiguracija (.env)

`WINDOWS_VERSION` (10/11), `MUJO_PROFILE`, `WINDOWS_USERNAME`,
`WINDOWS_PASSWORD` (obavezna, ne defaultna), `WEB_PORT`/`RDP_PORT`.
`.env` je u `.gitignore` — nikad ga ne commitaj s pravom lozinkom.

## Sigurnost (sažetak)

Lozinke samo iz `.env`; RDP ne izlaži javno bez potrebe; noVNC u Fazi 1 nema
svoju lozinku (zaštita = vidljivost porta); Docker socket se ne mounta.
Detalji: `docs/SECURITY.md`. Ploča dobija autentifikaciju tek u Fazi 2 —
do tada ne koristi za osjetljive podatke.

## Ograničenja

- **Nema GPU-a** za VM na Codespacesu/tipičnim VPS-ovima; grafika preko noVNC-a.
- Bez `/dev/kvm` praktično neupotrebljivo (softverska emulacija).
- Brojke o Codespaces satima, idle timeoutu, veličini image-a i vremenima
  boot-a **namjerno ne navodimo** — mijenjaju se; provjeri u zvaničnoj
  GitHub/dockur dokumentaciji.
- Šta preživljava stop/brisanje Codespacea: djelimično neprovjereno —
  redovno radi `mujowin backup`.

## Roadmap (sažetak)

Core ✅ · DX ✅/🔄 · Sigurnost 🔄 · Performanse 📋 · Backup ✅/🔄 ·
Automatizacija 📋 · UX ✅/🔄 · Hostovi 📋 · Docs ✅ · CI ✅/🔄.
Pojedinačno s težinama S/M/L: `docs/ROADMAP.md`. Faza 3 samo uz eksplicitno
odobrenje.

## Doprinos

Vidi `CONTRIBUTING.md` + `docs/DEVELOPMENT.md` (`make lint test config` prije PR-a).

## Licenca

MIT — `LICENSE` (© 2026 xnet-ba). Izvorni pc-free repoui nemaju LICENSE fajl
(provjereno), pa se ne prenosi tuđi copyright notice.

## Acknowledgments

- [jephersonRD/PC-Free](https://github.com/jephersonRD/PC-Free) — originalna ideja
- [Chieji/pc-free](https://github.com/Chieji/pc-free) — fork kao polazna tačka
- [dockurr/windows](https://github.com/dockur/windows) — Docker Windows slika

**Pravna napomena:** ti sam odgovaraš za valjanu Windows licencu i poštovanje
Microsoftovih uslova i uslova dockurr/windows. Ključevi u dockur kodu su
generički instalacijski i nisu aktivacija.

---

## English (short version)

MujoWinPC runs a Windows 10/11 desktop in the browser using the
`dockurr/windows` Docker image on GitHub Codespaces (or any KVM host).
Manage it with `./scripts/mujowin` (`doctor`, `up`, `down`, `backup`, …),
pick a resource profile (`lite/standard/dev/heavy`), and use `web/` as a
static, tracker-free dashboard (BS/EN, dark/light). No default passwords:
`up` refuses to start without a real `WINDOWS_PASSWORD` in `.env`.
No GPU; without `/dev/kvm` the VM is emulated and practically unusable.
You are responsible for a valid Windows license and Microsoft's terms.
MIT licensed. Full docs in `docs/`, roadmap in `docs/ROADMAP.md`.
