# Prvi start (checklista)

1. `cp .env.example .env` — upiši **jaku, jedinstvenu** `WINDOWS_PASSWORD`
   (20+ znakova iz generatora). Bez nje `up` staje — to je namjerno.
2. `./scripts/mujowin doctor` — pročitaj cijeli izlaz, ne samo zadnju liniju.
3. Nema `/dev/kvm`? Stani ovdje: treba ti drugi host (vidi TROUBLESHOOTING).
4. `./scripts/mujowin profile <preporuka-iz-doctora>`.
5. Hoćeš gotove aplikacije u VM-u? **Prije prvog starta** kopiraj
   `oem/packages-dev.txt` ili `packages-office.txt` na `oem/packages.txt`
   (radi samo na svježoj instalaciji).
6. `./scripts/mujowin up` — prvi boot skida image, ostavi da radi.
7. Otvori noVNC (port 8006, na Codespacesu ga postavi na Public).
8. Prijavi se podacima iz `.env`. RDP (3389) pali samo kad ti treba.
9. Kad sve radi: `./scripts/mujowin backup` — prvi backup dok je sve svježe.
10. Kad ne koristiš: `mujowin down`; RDP port nazad na Private.

Zapelo? `mujowin logs`, pa `docs/TROUBLESHOOTING.md`.
