# MujoWinPC — razvojne mete. Opcije: make up PROFILE=standard WIN=11
PROFILE ?= standard
WIN ?= 11

.PHONY: dev lint test doctor up config down status logs health
.PHONY: api help

help:
	@echo "dev | lint | test | doctor | health | up [PROFILE=.. WIN=..] | config | down | status | logs | api"

dev:
	@echo "Mock mode (bez KVM-a): API s reloadom + ploča na http://localhost:8080"
	@echo "  1) cd server && npm install && MUJO_MOCK=1 npm run dev   (token se ispiše)"
	@echo "  2) cd web && python3 -m http.server 8080"
	@echo "     (ploča sama nudi API bazu; ili ?api=http://HOST:3001)"

api:
	cd server && npm install && node index.js

lint:
	@if command -v shellcheck >/dev/null; then shellcheck scripts/mujowin scripts/lib/*.sh tests/*.sh; else echo "shellcheck nije instaliran (CI ga ima); radim bash -n"; bash -n scripts/mujowin && bash -n scripts/lib/common.sh && bash -n tests/test_cli.sh; fi

test:
	bash tests/test_cli.sh && bash tests/test_idle.sh && node --test tests/test_api.mjs

doctor:
	./scripts/mujowin doctor

health:
	./scripts/mujowin health

config:
	@test -f .env || (echo "Nema .env — kopiram primjer (samo za validaciju, lozinka prazna)"; cp .env.example .env)
	WINDOWS_VERSION=$(WIN) MUJO_PROFILE=$(PROFILE) ./scripts/mujowin status >/dev/null 2>&1 || true
	docker compose --env-file .env -f compose/base.yml -f compose/win$(WIN).yml -f compose/profile-$(PROFILE).yml config >/dev/null && echo "config OK: win$(WIN) + $(PROFILE)"

up: config
	WINDOWS_VERSION=$(WIN) MUJO_PROFILE=$(PROFILE) ./scripts/mujowin up

down:
	./scripts/mujowin down

status:
	./scripts/mujowin status

logs:
	./scripts/mujowin logs
