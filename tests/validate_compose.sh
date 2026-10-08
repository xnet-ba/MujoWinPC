#!/usr/bin/env bash
# Privremena validacija svih win x profil kombinacija.
set -u
cd "$(dirname "$0")/.."
fail=0
for win in 10 11; do
  for prof in lite standard dev heavy; do
    if WINDOWS_PASSWORD=ci-dummy-16chars docker compose --env-file .env \
      -f compose/base.yml -f "compose/win${win}.yml" -f "compose/profile-${prof}.yml" \
      config >/dev/null 2>&1; then
      echo "OK win${win}+${prof}"
    else
      echo "FAIL win${win}+${prof}"; fail=1
    fi
  done
done
# negativan test: prazna lozinka mora pasti
if WINDOWS_PASSWORD= docker compose --env-file .env \
  -f compose/base.yml -f compose/win11.yml -f compose/profile-standard.yml \
  config >/dev/null 2>&1; then
  echo "FAIL prazna-lozinka-prosla"; fail=1
else
  echo "OK prazna-lozinka-odbijena"
fi
exit "$fail"
