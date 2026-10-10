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

## Windows 11 + WSL2 (terenski nalazi, Zephyrus G16)

- **Nested KVM radi out-of-the-box**: `/dev/kvm` postoji u Ubuntu-24.04 WSL2
  (nikakav setup nije trebao). `wsl --list --verbose` pokazuje verziju 2.
- **WSL memorija**: default je bila 3 GB (premalo i za lite) —
  `%USERPROFILE%\.wslconfig` s `[wsl2]` + `memory=8GB`, pa `wsl --shutdown`.
- **Docker**: ako je Docker Desktop ugašen, treba nativni dockerd
  (ovdje je već postojao `/usr/bin/dockerd` kao systemd unit).
  Korisnik mora biti u `docker` grupi (`usermod -aG docker <user>`).
- **Portovi**: nativni dockerd objavljuje portove samo unutar WSL netns-a —
  Windows `localhost:8006` ih ne vidi. Workaround (treba admin):
  `netsh interface portproxy add v4tov4 listenport=8006
  listenaddress=127.0.0.1 connectport=8006 connectaddress=<WSL-IP>`,
  briše se s `netsh interface portproxy delete v4tov4 listenport=8006`.
  WSL IP se mijenja (`hostname -I` u WSL-u); stabilnije rješenje je
  Docker Desktop (sam prosljeđuje portove na Windows).
- **Sleep ubija duge instalacije**: svaki sleep/wake rebootuje WSL, a time i
  kontejnere. Za instalaciju treba najmanje ~1 h neprekidnog awake stanja
  (punjač + isključen sleep ili aktivno korištenje).
- **CRLF zamka**: `.env` pisan Windows alatima (Notepad, cmd `echo`)
  dobije `\r` — dockur odbija lozinku (`control characters`) i jede zadnja
  slova. `.env` mora biti LF; `mujowin doctor` upozorava na CRLF.

## Lokalni Linux s KVM-om (preporučeno za stvarni rad) CPU s VT-x/AMD-V uključenim u BIOS-u, `kvm` modul
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
