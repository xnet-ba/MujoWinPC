# Sigurnost

## Pravila (Faza 1)

1. **Lozinke samo u `.env`** (nikad u gitu — `.gitignore` ga pokriva).
   `mujowin up` odbija prazne i defaultne (`admin`, `password`, `123456`, `docker`).
2. **RDP (3389) ne izlaži javno bez potrebe.** Na Codespacesu drži port Private
   osim kad aktivno pristupaš; jaka lozinka je obavezna, ne opciona.
3. **noVNC (8006) nema svoju autentifikaciju** u Fazi 1 (dockur `PROTECT`
   varijanta nije uključena — namjerno, da se ne lažira sigurnost).
   Zaštita = vidljivost porta + Codespaces auth. Autentifikacija ploče dolazi
   u Fazi 2 s API-jem.
4. **Docker socket se nigdje ne mounta** u kontejnere i ne izlaže mrežno.
5. **OEM skripte** (`oem/`) izvršavaju se kao SYSTEM tokom instalacije —
   reviewaj svaku liniju prije prvog starta, kao i svaki kod koji se izvršava
   s privilegijama.

## Savjeti za RDP

- Jaka, jedinstvena lozinka (20+ znakova iz generatora).
- Poslije korištenja: port nazad na Private, `mujowin down` kad VM ne treba.
- Nikad istu lozinku kao za GitHub/Microsoft nalog.

## Šta NIJE pokriveno u Fazi 1 (vidi ROADMAP → Sigurnost)

Autentifikacija web ploče, TLS završetak, audit log, rotacija tajni,
skeniranje image-a. Nemoj koristiti za osjetljive podatke dok to ne postoji.
