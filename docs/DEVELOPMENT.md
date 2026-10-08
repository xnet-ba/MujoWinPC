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
