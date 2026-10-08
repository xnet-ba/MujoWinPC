# Hostovi: razlike i ograničenja

## GitHub Codespaces (primarno)

- **KVM tipično ne postoji** (neprovjereno na svim tipovima mašina) — očekuj
  spor rad ili neuspjeh; `doctor` to prijavljuje. Bez KVM-a ovo nije
  upotrebljivo rješenje, samo proba.
- **Idle timeout** (provjereno u GitHub docsima):
  default **30 minuta** neaktivnosti, podesivo **5–240 minuta**
  (Settings → Codespaces → Default idle timeout); organizacija može
  ograničiti maksimum. `scripts/idle-stop.sh` gasi VM ranije kad niko nije
  spojen — povrh GitHub timeouta, ne umjesto njega.
- Portovi 8006/3389 moraju biti **Public** dok se spajaš, inače **Private**.
- Zaustavljen Codespace čuva volume (neprovjereno na Codespacesu — redovno
  radi `mujowin backup`).
- Cron ne postoji dok je Codespace zaustavljen — `idle-stop.sh` kao cron radi
  samo dok mašina živi.

## Lokalni Linux s KVM-om (preporučeno za stvarni rad)

Uslovi: CPU s VT-x/AMD-V uključenim u BIOS-u, `kvm` modul
(`lsmod | grep kvm`), korisnik u `kvm`/`docker` grupama, 20+ GB slobodno.
Sve ostalo je isto kao Codespaces (`make doctor` → `profile` → `up`).
RDP ostaje na `127.0.0.1` — za LAN pristup koristi SSH tunnel, ne otvaraj
3389 na ruteru bez TLS-a/VPN-a.

## VPS (neprovjereno po provajderima)

Treba: KVM ili nested virtualizacija (pitaj provajdera — mnogi jeftini VPS-ovi
je imaju isključenu), dovoljno RAM-a za izabrani profil + 2G za host,
firewall s otvorenim 8006/3389 samo za tvoju IP adresu. Jeftini OpenVZ/LXC
VPS-ovi **ne rade** (nema KVM-a) — to je ograničenje tehnologije, ne projekta.
Specifična imena provajdera i cijene namjerno ne navodimo (mijenjaju se).
