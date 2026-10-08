# Sigurnost

## Pravila (Faza 1)

1. **Lozinke samo u `.env`** (nikad u gitu — `.gitignore` ga pokriva).
   `mujowin up` odbija prazne i defaultne (`admin`, `password`, `123456`, `docker`).
2. **RDP (3389) ne izlaži javno bez potrebe.** Na Codespacesu drži port Private
   osim kad aktivno pristupaš; jaka lozinka je obavezna, ne opciona.
   Isto vrijedi za noVNC port (8006): Public samo dok se spajaš, inače Private.
   Pravilo: nijedan port ne stoji javno duže nego što mora.
3. **noVNC (8006) nema svoju autentifikaciju** u Fazi 1 (dockur `PROTECT`
   varijanta nije uključena — namjerno, da se ne lažira sigurnost).
   Zaštita = vidljivost porta + Codespaces auth. Autentifikacija ploče dolazi
   u Fazi 2 s API-jem.
4. **Docker socket se nigdje ne mounta** u kontejnere i ne izlaže mrežno.
5. **API token** (`MUJO_API_TOKEN`, 32+ hex znaka): server se bez njega odbija
   startati (non-mock). Poređenje je timing-safe. Samo `/api/health` je bez
   auth-a. Token pripada u `.env`, nikad u git/logove; ploča ga drži u
   `sessionStorage` (nestaje zatvaranjem taba), ne u `localStorage`.
6. **API sluša na 127.0.0.1** po defaultu. Za udaljeni pristup koristi
   SSH ili Codespaces port-forward, ne `MUJO_API_BIND=0.0.0.0` bez TLS-a.
5. **OEM skripte** (`oem/`) izvršavaju se kao SYSTEM tokom instalacije —
   reviewaj svaku liniju prije prvog starta, kao i svaki kod koji se izvršava
   s privilegijama.

## Savjeti za RDP

- Jaka, jedinstvena lozinka (20+ znakova iz generatora).
- Poslije korištenja: port nazad na Private, `mujowin down` kad VM ne treba.
- Nikad istu lozinku kao za GitHub/Microsoft nalog.

## Šta NIJE pokriveno u Fazi 1 (vidi ROADMAP → Sigurnost)

Autentifikacija web ploče, TLS završetak, audit log, rotacija tajni,
skeniranje image-a, rate limiting API-ja. Nemoj koristiti za osjetljive podatke dok to ne postoji.
