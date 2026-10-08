#!/usr/bin/env bash
# Testovi za health / profile auto / idle-stop. Bez frameworka, bez dockera.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT/scripts/mujowin"
IDLE="$ROOT/scripts/idle-stop.sh"
PASS=0; FAIL=0

BACKUP_SUFFIX=".test-bak-$$"
for f in .env .mujowin-profile; do [ -e "$ROOT/$f" ] && mv "$ROOT/$f" "$ROOT/$f$BACKUP_SUFFIX"; done
cleanup() { rm -f "$ROOT/.env" "$ROOT/.mujowin-profile"
  for f in .env .mujowin-profile; do [ -e "$ROOT/$f$BACKUP_SUFFIX" ] && mv "$ROOT/$f$BACKUP_SUFFIX" "$ROOT/$f"; done; }
trap cleanup EXIT

export MUJO_MOCK=1
unset WINDOWS_PASSWORD MUJO_PROFILE WINDOWS_VERSION WEB_PORT RDP_PORT

ok()   { PASS=$((PASS+1)); echo "ok   $1"; }
fail() { FAIL=$((FAIL+1)); echo "NEUSPJEH  $1${2:+: $2}"; }

# 1. health u mocku (portovi zatvoreni → rc!=0, ali mock linija postoji)
out="$("$CLI" health 2>&1 || true)"
case "$out" in *"[mock]"*) ok "health mock";; *) fail "health mock" "$out";; esac

# 2. health protiv živog porta (python http.server)
P=18765
python3 -m http.server "$P" >/dev/null 2>&1 &
SRV=$!
sleep 1
out2="$(WEB_PORT=$P RDP_PORT=18766 MUJO_MOCK=1 "$CLI" health 2>&1 || true)"
case "$out2" in *"noVNC :$P odgovara"*) ok "health vidi živ port";; *) fail "health vidi živ port" "$out2";; esac
kill $SRV 2>/dev/null; wait 2>/dev/null || true

# 3. profile auto bira nešto validno
"$CLI" profile auto >/dev/null 2>&1
got="$("$CLI" profile 2>&1 | head -1)"
case "$got" in *lite*|*standard*|*dev*|*heavy*) ok "profile auto ($got)";; *) fail "profile auto" "$got";; esac

# 4. idle --check: aktivno dok je konekcija otvorena
P2=18767
python3 -m http.server "$P2" >/dev/null 2>&1 &
SRV2=$!
sleep 1
(exec 3<>"/dev/tcp/127.0.0.1/$P2"; sleep 5) &
HOLDER=$!
sleep 1
if WEB_PORT=$P2 RDP_PORT=18766 "$IDLE" --check >/dev/null 2>&1; then ok "idle vidi konekciju"; else fail "idle vidi konekciju"; fi
wait $HOLDER 2>/dev/null || true
# 5. idle --check: nema konekcija → exit 2
WEB_PORT=$P2 RDP_PORT=18766 "$IDLE" --check >/dev/null 2>&1
rc=$?
if [ "$rc" = 2 ]; then ok "idle bez konekcije"; else fail "idle bez konekcije" "exit=$rc"; fi
kill $SRV2 2>/dev/null; wait 2>/dev/null || true

# 6. idle bez --check u mocku zove down
TROOT="$(mktemp -d)"
if MUJO_MOCK=1 MUJO_ROOT_OVERRIDE="$TROOT" WEB_PORT=18768 RDP_PORT=18769 WINDOWS_PASSWORD=x "$IDLE" 2>&1 | grep -q mock; then ok "idle down mock"; else fail "idle down mock"; fi
rm -rf "$TROOT"

echo "---"
echo "prošlo: $PASS, palo: $FAIL"
[ "$FAIL" = 0 ]
