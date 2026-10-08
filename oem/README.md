# OEM / post-install

`oem/` se montira kao `/oem` (read-only) u kontejner. dockur/windows kopira
sadržaj u `C:\OEM` i izvrši `install.bat` na kraju automatske instalacije —
provjereno u njihovom README-u.

Pravila:

- Radi **samo na svježoj instalaciji** (prazan volumen), ne na svakom bootu.
- Skripta se izvršava s visokim privilegijama — svaku liniju reviewaj.
- Za debug dodaj `LOG: "1"` u environment (piše `C:\OEM\install.log`) ili
  `COMMAND` varijablu za jednokratnu komandu umjesto cijelog fajla.
- `packages.txt` je default lista (7-Zip + Firefox). Za gotovo okruženje
  **prije prvog starta** kopiraj `packages-dev.txt` ili `packages-office.txt`
  na ime `packages.txt`. Linije s `#` se preskaču; neuspjela instalacija ne
  zaustavlja ostale (best-effort, treba mrežu u VM-u).
