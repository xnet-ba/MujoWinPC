# OEM / post-install

`oem/` se montira kao `/oem` (read-only) u kontejner. dockur/windows kopira
sadržaj u `C:\OEM` i izvrši `install.bat` na kraju automatske instalacije —
provjereno u njihovom README-u.

Pravila:

- Radi **samo na svježoj instalaciji** (prazan volumen), ne na svakom bootu.
- Skripta se izvršava s visokim privilegijama — svaku liniju reviewaj.
- Za debug dodaj `LOG: "1"` u environment (piše `C:\OEM\install.log`) ili
  `COMMAND` varijablu za jednokratnu komandu umjesto cijelog fajla.
- Pune "gotova okruženja" (dev/office/test) su Faza 2/3 — ovdje samo kostur.
