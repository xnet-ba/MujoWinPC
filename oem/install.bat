@echo off
REM MujoWinPC post-install. dockur kopira /oem u C:\OEM i izvrsi install.bat
REM na kraju automatske instalacije (samo SVJEZA instalacija). LOG=1 daje log.
echo [mujowin] Post-install start: %DATE% %TIME%
if not exist C:\OEM\packages.txt goto end
for /f "eol=# tokens=*" %%p in (C:\OEM\packages.txt) do (
  echo [mujowin] winget: %%p
  winget install --accept-package-agreements --accept-source-agreements %%p
  if errorlevel 1 echo [mujowin] UPOZORENJE: %%p nije instaliran, nastavljam.
)
:end
echo [mujowin] Post-install gotov: %DATE% %TIME%
