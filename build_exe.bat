@echo off
setlocal

where pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
  echo [INFO] Installation de PyInstaller...
  py -m pip install pyinstaller
)

echo [INFO] Build de l'executable...
py -m PyInstaller --clean planning.spec

if %errorlevel% neq 0 (
  echo [ERREUR] Build echoue.
  exit /b 1
)

echo [OK] Exe genere: dist\PlanningDPR45\PlanningDPR45.exe
