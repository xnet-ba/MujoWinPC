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
  local k v pre
  pre=" $(export -p | sed -n 's/^declare -x \([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' | tr '\n' ' ') "
  while IFS='=' read -r k v; do
    case "$k" in ''|\#*) continue ;; esac
    k="$(printf '%s' "$k" | tr -d '[:space:]')"
    v="$(printf '%s' "$v" | tr -d '\r' | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
    case "$k" in WINDOWS_*|MUJO_*|WEB_PORT|RDP_PORT) : ;; *) continue ;; esac
    case "$pre" in *" $k "*) continue ;; esac  # pravi env ostaje, fajl ne gazi
    export "$k=$v"  # unutar fajla zadnja linija pobjeđuje
  done < "$ENV_FILE"
}

active_profile() {
  if [ -n "${MUJO_PROFILE:-}" ]; then printf '%s' "$MUJO_PROFILE"; return; fi
  if [ -f "$PROFILE_FILE" ]; then cat "$PROFILE_FILE"; return; fi
  printf 'standard'
}

windows_version() { printf '%s' "${WINDOWS_VERSION:-11}"; }

# compose -f lista: base + win-verzija + profil (+ custom-iso override ako postoji).
# custom-iso.local.yml (gitignorean): npr. "- ./win11.iso:/custom.iso:ro"
# za hostove kojima Microsoft blokira automated download (dokazano na terenu).
compose_files() {
  local ver prof out
  ver="$(windows_version)"; prof="$(active_profile)"
  out="-f compose/base.yml -f compose/win${ver}.yml -f compose/profile-${prof}.yml"
  [ -f "$MUJO_ROOT/compose/custom-iso.local.yml" ] && out="$out -f compose/custom-iso.local.yml"
  printf '%s' "$out"
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
