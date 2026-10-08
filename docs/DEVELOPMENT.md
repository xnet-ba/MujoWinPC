# Razvoj (DEVELOPMENT)

## Brzi početak za razvoj samog projekta

```bash
git clone <repo> && cd MujoWinPC
cp .env.example .env        # lozinka može ostati prazna za mock rad
make doctor                 # stvarne provjere hosta
make test                   # testovi CLI-ja (mock, bez KVM-a)
make lint                   # shellcheck ako postoji, inače bash -n
```

## Make mete

| Meta | Šta radi |
|---|---|
| `make dev` | mock mode + upute za serviranje `web/` (`python3 -m http.server`) |
| `make lint` | shellcheck (ako instaliran) + `bash -n` za sve skripte |
| `make test` | CLI (18) + health/idle (6) + API (8) testovi |
| `make doctor` / `make health` | `./scripts/mujowin doctor` / `health` |
| `make down/status/logs` | svakodnevno upravljanje kroz CLI |
| `make api` | API server (traži token) |
| `make up PROFILE=standard` | validira compose config pa diže VM |
| `make config PROFILE=x WIN=11` | samo `docker compose config` (bez dizanja) |

## Mock mode

`MUJO_MOCK=1 ./scripts/mujowin status|logs|up|...` — lažira docker pozive.
Služi razvoju ploče/API-ja na mašini bez KVM-a (sjeme Faza-2 mock moda).
`doctor` uvijek radi stvarne provjere — to je poenta.

## Smoke test bez KVM-a (samo stack, ne performanse)

Na mašini bez `/dev/kvm` možeš dignuti pravi dockur kontejner u čistoj
emulaciji (`KVM: "N"`) da provjeriš compose, boot, ISO download i noVNC.
Ekstremno sporo (dockur upozorava ~10×), ali dokazuje da stack radi end-to-end.
Fajl je lokalan i gitignorean (`compose/*.local.yml`):

```yaml
# compose/smoke.local.yml — NE COMMITATI
services:
  windows:
    image: dockurr/windows
    container_name: mujowin-smoke
    environment:
      VERSION: "10"
      USERNAME: Docker
      PASSWORD: <jaka-lozinka>
      RAM_SIZE: 4G
      CPU_CORES: "2"
      DISK_SIZE: 32G
      KVM: "N"
    devices:
      - /dev/net/tun
    cap_add: [NET_ADMIN]
    ports: ["8006:8006", "3389:3389/tcp", "3389:3389/udp"]
    volumes:
      - mujowin-smoke:/storage
      - ./oem:/oem:ro
    stop_grace_period: 2m
    restart: "no"
volumes:
  mujowin-smoke:
```

```bash
docker compose -f compose/smoke.local.yml up -d
docker logs mujowin-smoke --tail 5   # prati ISO download + boot
curl -s -o /dev/null -w "%{http_code}\n" localhost:8006   # 200 = noVNC živ
docker compose -f compose/smoke.local.yml down -v        # čisti sve
```

## noVNC automatizacija (Playwright, naučeno u smoke testu)

- Miš ulazi u gosta samo **pravim klikovima** (`page.mouse`), ne sintetičkim
  eventima; tastatura se kroz noVNC ne prosljeđuje pouzdano.
- Control-bar ručica prekriva lijevi rub ekrana — Start dugme gađaj **desno
  od nje** (npr. x≈28 u viewportu od 780px).
- Otvoreni extra-keys panel prekriva Start dugme; navigacija ga resetuje.
- Pod emulacijom svaki korak čekaj 6–10 s (render kasni).

Dokazano radi: Windows 10 ISO + Setup do 86% na 12-jezgrenom hostu bez KVM-a
(vidi `docs/screenshots/`). Izmjereno: ~200% CPU (2 emulirana jezgra),
~1.4 MB/s upisa na disk, faza "Getting files ready" ide desecima minuta —
ostavi da radi satima i povremeno provjeri noVNC.

## API server

```bash
cd server && npm install
openssl rand -hex 32          # → MUJO_API_TOKEN u .env (ili env)
MUJO_MOCK=1 npm run dev      # mock + reload (token se ispiše ako ga nema)
node index.js                # pravi rad (traži MUJO_API_TOKEN)
node --test ../tests/test_api.mjs
```

Token ide kao `Authorization: Bearer …`. Bez njega: 401 (osim `/api/health`).

## Devcontainer

`.devcontainer/devcontainer.json` je za razvoj **projekta** (lint, testovi,
docs), ne pokreće Windows VM (nema KVM-a u devcontaineru).

## Konvencije

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …).
- `shellcheck` čist — svaki novi `.sh` mora proći.
- Bez novih zavisnosti bez obrazloženja u PR-u (web: nula zavisnosti, tačka).
- Prije PR-a: `make lint && make test && make config`.
- Vidi `CONTRIBUTING.md` za PR korake.
