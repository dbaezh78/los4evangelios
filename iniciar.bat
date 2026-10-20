@echo off
chcp 65001 > nul
echo ========================================================
echo     Iniciando Editor: Los Cuatro Evangelios
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detectado. Iniciando servidor local...
    start http://localhost:3000
    node server.js
) else (
    echo [AVISO] Node.js no encontrado. Abriendo directamente en el navegador...
    start index.html
)
