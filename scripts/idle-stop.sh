#!/usr/bin/env bash
# idle-stop: zaustavi VM kad niko nije spojen na noVNC/RDP portove.
# Štednja Codespaces sati povrh GitHub idle timeouta (default 30 min,
# raspon 5-240 min — provjereno u GitHub docsima).
# Bez zavisnosti: aktivnost se čita iz /proc/net/tcp*.
# Cron primjer (samo dok Codespace postoji):
#   */15 * * * * /put/do/MujoWinPC/scripts/idle-stop.sh >> ~/.mujowin-idle.log 2>&1
# Opcije: --check (samo provjeri: 0 = aktivno, 2 = idle, drugo = greška)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source-path=SCRIPTDIR
# shellcheck source=lib/common.sh
# shellcheck disable=SC1091 # provjerava se odvojeno
. "$SCRIPT_DIR/lib/common.sh"

load_env
PORTS=("${WEB_PORT:-8006}" "${RDP_PORT:-3389}")

# 0 = ima ESTABLISHED konekcija na naše portove, 1 = nema
has_connections() {
  local hex f
  for p in "${PORTS[@]}"; do
    hex="$(printf '%04X' "$p")"
    for f in /proc/net/tcp /proc/net/tcp6; do
      [ -r "$f" ] || continue
      if awk -v port=":$hex" 'NR>1 && $4=="01" && (substr($2,length($2)-4)==port || substr($3,length($3)-4)==port){found=1; exit} END{exit !found}' "$f" 2>/dev/null; then
        return 0
      fi
    done
  done
  return 1
}

if has_connections; then
  log "aktivno — ima konekcija na ${PORTS[*]}, ne diram."
  exit 0
fi
log "idle — nema konekcija na ${PORTS[*]}."
[ "${1:-}" = "--check" ] && exit 2
exec "$SCRIPT_DIR/mujowin" down
