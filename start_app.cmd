@echo off
setlocal
echo ==========================================
echo    Metalwork Estimator - Launcher
echo ==========================================
cd /d "%~dp0"

if not exist node_modules (
    echo [!] Dependencias no encontradas. Instalando...
    call npm install
)

echo.
echo [1/2] Iniciando servidor de desarrollo...
echo [2/2] Abriendo navegador en http://127.0.0.1:3000...
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

start http://127.0.0.1:3000
call npm run dev

pause
