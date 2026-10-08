#!/usr/bin/env bash
# Zajedničke funkcije za mujowin skripte. Bez vanjskih zavisnosti.
# shellcheck disable=SC2034
set -euo pipefail

MUJO_ROOT="${MUJO_ROOT_OVERRIDE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
ENV_FILE="$MUJO_ROOT/.env"
PROFILE_FILE="$MUJO_ROOT/.mujowin-profile"

log()  { printf '[mujowin] %s\n' "$*"; }
warn() { printf '[mujowin][UPOZORENJE] %s\n' "$*" >&2; }
die()  { printf '[mujowin][GREŠKA] %s\n' "$*" >&2; exit 1; }

# Učitaj .env ako postoji (bez izvršavanja nepoznatog koda: samo KEY=VALUE linije).
load_env() {
  [ -f "$ENV_FILE" ] || return 0
  while IFS='=' read -r k v; do
    case "$k" in ''|\#*) continue ;; esac
    k="$(printf '%s' "$k" | tr -d '[:space:]')"
    v="$(printf '%s' "$v" | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
    case "$k" in WINDOWS_*|MUJO_*|WEB_PORT|RDP_PORT) : ;; *) continue ;; esac
    if [ -z "${!k+x}" ]; then export "$k=$v"; fi  # eksplicitni env pobjeđuje .env
  done < "$ENV_FILE"
}

active_profile() {
  if [ -n "${MUJO_PROFILE:-}" ]; then printf '%s' "$MUJO_PROFILE"; return; fi
  if [ -f "$PROFILE_FILE" ]; then cat "$PROFILE_FILE"; return; fi
  printf 'standard'
}

windows_version() { printf '%s' "${WINDOWS_VERSION:-11}"; }

# compose -f lista: base + win-verzija + profil
compose_files() {
  local ver prof
  ver="$(windows_version)"; prof="$(active_profile)"
  printf -- '-f compose/base.yml -f compose/win%s.yml -f compose/profile-%s.yml' "$ver" "$prof"
}

# Mock mode za razvoj bez KVM-a (Faza 2 ga širi; ovdje minimalno za testove).
mock_on() { [ "${MUJO_MOCK:-0}" = "1" ]; }

require_docker() {
  mock_on && return 0
  command -v docker >/dev/null 2>&1 || die "Docker nije instaliran. Vidi docs/TROUBLESHOOTING.md."
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 nije dostupan."
}

# Odbij start ako lozinka nije postavljena ili je defaultna.
require_password() {
  load_env
  local pw="${WINDOWS_PASSWORD:-}"
  [ -z "$pw" ] && die "WINDOWS_PASSWORD nije postavljena. Postavi je u .env (cp .env.example .env)."
  case "$pw" in admin|password|123456|docker) die "WINDOWS_PASSWORD je defaultna/vrijednost za primjer. Postavi pravu lozinku u .env." ;; esac
}
