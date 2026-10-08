#!/usr/bin/env bash
# Testovi za mujowin CLI. Bez frameworka: assert-funkcije + MUJO_MOCK=1.
# Pokretanje:  make test  (ili bash tests/test_cli.sh)
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT/scripts/mujowin"
PASS=0; FAIL=0

# Izolacija: privremeno skloni pravi .env / .mujowin-profile.
BACKUP_SUFFIX=".test-bak-$$"
for f in .env .mujowin-profile; do [ -e "$ROOT/$f" ] && mv "$ROOT/$f" "$ROOT/$f$BACKUP_SUFFIX"; done
cleanup() { rm -f "$ROOT/.env" "$ROOT/.mujowin-profile"
  for f in .env .mujowin-profile; do [ -e "$ROOT/$f$BACKUP_SUFFIX" ] && mv "$ROOT/$f$BACKUP_SUFFIX" "$ROOT/$f"; done; }
trap cleanup EXIT

export MUJO_MOCK=1
unset WINDOWS_PASSWORD MUJO_PROFILE WINDOWS_VERSION

ok()   { PASS=$((PASS+1)); echo "ok   $1"; }
fail() { FAIL=$((FAIL+1)); echo "NEUSPJEH  $1${2:+: $2}"; }
assert_contains() { # haystack needle name
  case "$1" in *"$2"*) ok "$3" ;; *) fail "$3" "očekivano '$2' u: $(printf '%s' "$1" | head -3)" ;; esac
}
assert_fails() { # name cmd...
  if "$@" >/dev/null 2>&1; then fail "$1" "(trebalo je pasti, prošlo je)"; else ok "$1"; fi
}

# 1. help radi
assert_contains "$("$CLI" help 2>&1)" "mujowin <komanda>" "help ispis"

# 2. nepoznata komanda pada
assert_fails "nepoznata komanda pada" "$CLI" nepostojeca

# 3. up se odbija bez lozinke
assert_fails "up bez lozinke se odbija" "$CLI" up

# 4. up s lozinkom prolazi u mocku
export WINDOWS_PASSWORD="jaka-lozinka-123"
assert_contains "$("$CLI" up 2>&1)" "[mock]" "up mock s lozinkom"

# 5. up odbija defaultnu lozinku
export WINDOWS_PASSWORD="admin"
assert_fails "up s default lozinkom se odbija" "$CLI" up
export WINDOWS_PASSWORD="jaka-lozinka-123"

# 6. profile: postavi, prikaži, nepoznat pada
"$CLI" profile lite >/dev/null
assert_contains "$("$CLI" profile 2>&1)" "lite" "profile pamti izbor"
assert_fails "nepoznat profil pada" "$CLI" profile nepostojeci

# 7. status/logs mock
assert_contains "$("$CLI" status 2>&1)" "[mock]" "status mock"
assert_contains "$("$CLI" status --json 2>&1)" '"State":"running"' "status --json mock"
assert_contains "$("$CLI" logs 2>&1)" "[mock]" "logs mock"

# 8. reset bez potvrde pada (daj NE na stdin)
assert_fails "reset bez potvrde pada" sh -c "echo NE | $CLI reset"

# 9. backup mock (VM nije pokrenut u mocku)
assert_contains "$(printf '' | "$CLI" backup test-backup.tar.gz 2>&1)" "[mock]" "backup mock"

# 9b. rotacija: izolovan MUJO_ROOT s lažnim starim backupima
TROOT="$(mktemp -d)"
mkdir -p "$TROOT/backups"
touch -d '10 days ago' "$TROOT/backups/mujowin-backup-star1.tar.gz"
touch -d '9 days ago' "$TROOT/backups/mujowin-backup-star2.tar.gz"
touch -d '8 days ago' "$TROOT/backups/mujowin-backup-star3.tar.gz"
MUJO_ROOT_OVERRIDE="$TROOT" WINDOWS_PASSWORD="jaka-lozinka-123" "$CLI" backup --keep 2 >/dev/null 2>&1
left="$(ls "$TROOT/backups" | wc -l)"
[ "$left" = 2 ] && ok "rotacija --keep 2" || fail "rotacija --keep 2" "ostalo $left fajlova"
[ -e "$TROOT/backups/mujowin-backup-star3.tar.gz" ] && ok "rotacija čuva najnoviji" || fail "rotacija čuva najnoviji"
assert_fails "rotacija --keep bez broja pada" sh -c "MUJO_ROOT_OVERRIDE=$TROOT $CLI backup --keep"
rm -rf "$TROOT"

# 10. restore bez fajla pada
assert_fails "restore nepostojećeg pada" "$CLI" restore nema-ovog.tar.gz

# 11. doctor radi i daje preporuku (ne mora proći na 0 — KVM možda ne postoji)
doc_out="$("$CLI" doctor 2>&1 || true)"
assert_contains "$doc_out" "Preporuka" "doctor daje preporuku profila"
assert_contains "$doc_out" "/dev/kvm" "doctor provjerava KVM"

echo "---"
echo "prošlo: $PASS, palo: $FAIL"
[ "$FAIL" = 0 ]
