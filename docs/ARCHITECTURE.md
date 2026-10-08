# Arhitektura MujoWinPC

## Dijagram (tekstualni)

```
browser ──:8006──▶ [dockurr/windows kontejner] ── QEMU/KVM ──▶ Windows 10/11
   │                    │  /storage = named volume mujowin-storage
   │                    │  /oem (ro) = post-install skripte
   └ RDP :3389 ─────────┘
mujowin CLI ──▶ docker compose (base + winXX + profil) ──▶ isti kontejner
web/ ploča ── statična (Faza 1); API + live status tek u Fazi 2
```

## Slojevi

1. **Compose** (`compose/`): `base.yml` drži sve zajedničko (slika, device-ovi,
   portovi, volume, `stop_grace_period: 2m`). `win10.yml` / `win11.yml` mijenjaju
   samo `VERSION`. `profile-*.yml` mijenjaju samo `RAM_SIZE` / `CPU_CORES` /
   `DISK_SIZE`. CLI uvijek slaže tačno 3 fajla — nema ručnog `-f` slaganja.
2. **Profili** (`profiles/*.env`): ljudski čitljive vrijednosti; compose override
   je izvor istine za VM, `.env` fajl je dokumentacija izborâ.
3. **CLI** (`scripts/mujowin` + `lib/common.sh`): jedini način upravljanja.
   Odbija start bez lozinke, upozorava bez KVM-a, traži kucanu potvrdu za
   destruktivne operacije (`reset`, `restore`).
4. **Podaci**: jedan named volume (`mujowin-storage:/storage`, prefiksiran
   projektom `mujowin`). Backup/restore = tar cijelog volumena dok VM stoji.
   `DISK_SIZE` vrijedi samo za novi volumen — promjena profila ne resizea disk.
5. **Web** (`web/`): statična ploča, nula zavisnosti. U Fazi 1 ne priča ni s kim
   (osim best-effort fetch-a noVNC porta); API dolazi u Fazi 2.
6. **OEM** (`oem/`): montira se na `/oem` (read-only). dockur kopira sadržaj u
   `C:\OEM` i izvrši `install.bat` na kraju automatske instalacije (provjereno
   u dockur README-u). Radi samo na svježoj instalaciji, ne na svakom bootu.

## Odluke (zašto ovako)

- Named volume umjesto bind-mounta: radi i na Codespacesu i lokalno, backup je
  jedan tar; cijena je što fajlovima ne pristupaš direktno s hosta (za to služi
  `/shared` — neimplementirano u Fazi 1, vidi ROADMAP).
- Compose overridei umjesto generisanja fajla: `docker compose config` uvijek
  validira konačnu konfiguraciju, nema template logike.
- Lozinka: nikad default u repou; compose `${VAR:?poruka}` + CLI provjera =
  dvostruka zaštita.
