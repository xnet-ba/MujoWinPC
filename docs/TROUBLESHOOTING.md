# Rješavanje problema

> Prije svega: `./scripts/mujowin doctor` i `./scripts/mujowin logs`.

## VM se ne diže / crn ekran na :8006

1. Sačekaj — prvi boot skida Windows image (traje; neprekidaj).
2. `mujowin logs | tail -50` — gledaj greške QEMU-a / downloada.
3. Nema `/dev/kvm` → emulacija bez akceleracije; na slabom hostu praktično
   neupotrebljivo. Treba ti host s KVM-om (lokalni Linux, ne Codespaces free).

## `up` se odbija

- "WINDOWS_PASSWORD nije postavljena" → `cp .env.example .env`, upiši jaku
  lozinku. Compose `${VAR:?}` daje istu zaštitu na compose nivou.
- "je defaultna" → promijeni `admin`/`password`/slično u nešto svoje.

## Port je zauzet

`doctor` prijavljuje zauzet 8006/3389. Promijeni `WEB_PORT` / `RDP_PORT` u `.env`.

## Nestalo diska

Windows image + volumen rastu na desetine GB. `df -h`; o počisti Docker
(`docker system prune`), o manji profil **prije prvog starta**
(`DISK_SIZE` ne smanjuje postojeći volumen).

## Backup/restore

- Backup dok VM radi = rizik nekonzistentnosti; CLI upozorava i traži potvrdu.
- Restore radi samo dok je VM zaustavljen i briše trenutno stanje volumena.
- Restore na drugu `DISK_SIZE` vrijednost: radi, ali particiju eventualno
  proširi ručno u Windows Disk Managementu (dockur napomena).

## API problemi

- **401 na sve** → loš token ili ga nema. Token iz `.env` (`MUJO_API_TOKEN`)
  mora tačno odgovarati onom s kojim je server startan; ploča ga drži samo
  u `sessionStorage` pa ga nakon zatvaranja taba upiši ponovo.
- **Server se odmah gasi** → nema `MUJO_API_TOKEN` (non-mock). Generiši:
  `openssl rand -hex 32`.
- **Ploča ne vidi API** → API sluša na 127.0.0.1:3001; ploča gađa
  `?api=http://HOST:3001` ako je host drugi (npr. forwarded Codespaces port).
- **Boot faza "unknown"** → kontejner radi ali heuristika ne prepoznaje logove;
  to je best-effort prikaz, mjerodavno je `mujowin logs`.

## Codespaces specifično (djelimično neprovjereno — vidi README Ograničenja)

- KVM u Codespacesu tipično ne postoji → očekuj sporo ili neuspješno dizanje.
- Portovi 8006/3389 moraju biti vidljivi (Port Visibility: Public) da im
  pristupiš iz browsera.
- Zaustavljen Codespace čuva volume (neprovjereno na Codespacesu — redovno
  radi `mujowin backup`).
