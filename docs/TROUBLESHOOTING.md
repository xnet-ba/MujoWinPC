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

## Backup/restore (dokazano u smoke testu)

- Pun ciklus provjeren: zaustavljen VM → `tar czf` (32 GB sparse volumen →
  **5.3 GB tar.gz za ~15 min** na brzom hostu) → extract u novi volumen →
  boot s vraćenog diska (bez re-downloada i Setup-a) → login → desktop.
- Greška izbjegnuta jednom: compose pravi volumen po svom imenu
  (`<projekt>_<ime>`); restore mora ići u **isti volumen koji compose
  koristi** (ili `external: name:` mapiranje), inače se diže prazan disk
  i kreće svježa instalacija.

- Backup dok VM radi = rizik nekonzistentnosti; CLI upozorava i traži potvrdu.
- Restore radi samo dok je VM zaustavljen i briše trenutno stanje volumena.
- Restore na drugu `DISK_SIZE` vrijednost: radi, ali particiju eventualno
  proširi ručno u Windows Disk Managementu (dockur napomena).

## Sleep/restart usred instalacije = počni ispočetka (dokazano iz sourcea)

Provjereno čitanjem dockur `install.sh`/`disk.sh`: dok instalacija nije
završena (nema boot markera), **svaki restart kontejnera briše nedovršeni
disk** (`cleanupStorage` → `discardPrevious`) i kreće ispočetka. Završena
instalacija preživljava reboot normalno (dokazano restore testom).
Posljedica: host koji spava svakih par minuta (sleep/wake loop) NIKAD neće
završiti instalaciju — svaki wake je novi ciklus od nule. Za instalaciju
treba ~1 h neprekidnog awake stanja (punjač, isključen sleep). Znak da si
u petlji: `Creating a 32 GB growable disk image` + `Booting ... DVD-ROM`
se ponavljaju u `docker logs`, a `data.img` se ne povećava trajno.

## Kako izgleda zdrav boot (stvarni log, dockur v6.06)```
❯ Adding win10x64.xml for automatic installation...
❯ Requesting Windows 10 from the Microsoft servers...
❯ Downloading Windows 10...
10% → 20% → ... → 100%
❯ Adding drivers to image...
❯ Adding OEM files to image...     ← dokaz da je /oem mount radio
❯ Starting Windows for Docker v6.06...
❯ Booting Windows using QEMU v11.1.1...
❯ Windows started successfully, visit http://:8006/ ...
```

"started successfully" znači da je kontejner digao VM — Windows Setup
unutra još traje (prati kroz noVNC). Ako log stane na `Downloading`
duže vrijeme: spora mreža, pusti ga. Ako se vrti `BdsDxe ... DVD-ROM`:
boot s instalacijskog medija je u toku, to je normalno.

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
