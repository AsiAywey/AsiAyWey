@echo off
REM Script para instalar json-server y levantar servidor

echo ====================================
echo  MatchFlow - Setup y Inicio
echo ====================================
echo.

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no está instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Instalando json-server globalmente...
npm install -g json-server
if %ERRORLEVEL% NEQ 0 (
    echo ERROR al instalar json-server
    pause
    exit /b 1
)

echo.
echo [2/3] json-server instalado correctamente
echo.

echo [3/3] Levantando servidor en puerto 3001...
echo.
echo SERVIDOR INICIADO: http://localhost:3001
echo.
echo Presiona CTRL+C para detener el servidor
echo.

json-server --watch general/db.json --port 3001

pause
