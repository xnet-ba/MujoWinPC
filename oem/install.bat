@echo off
REM MujoWinPC post-install skripta.
REM dockur/windows kopira cijeli /oem sadržaj u C:\OEM i izvrši install.bat
REM na kraju automatske instalacije (samo na SVJEŽOJ instalaciji, ne svaki boot).
REM Provjereno u dockur README-u. LOG=1 u compose daje C:\OEM\install.log.

echo [mujowin] Post-install start: %DATE% %TIME%

REM --- Osnovni alati (primjeri; odkomentariši šta trebaš) ---
REM winget install --accept-package-agreements --accept-source-agreements 7zip.7zip
REM winget install --accept-package-agreements --accept-source-agreements Mozilla.Firefox
REM winget install --accept-package-agreements --accept-source-agreements Microsoft.VisualStudioCode

echo [mujowin] Post-install gotov: %DATE% %TIME%
