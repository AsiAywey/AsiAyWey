# Script para instalar json-server y levantar servidor
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  MatchFlow - Setup y Inicio" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si npm está instalado
$npmExists = (Get-Command npm -ErrorAction SilentlyContinue) -ne $null

if (-not $npmExists) {
    Write-Host "ERROR: npm no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "[1/3] Instalando json-server globalmente..." -ForegroundColor Green
npm install -g json-server

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al instalar json-server" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "[2/3] json-server instalado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "[3/3] Levantando servidor en puerto 3001..." -ForegroundColor Green
Write-Host ""
Write-Host "SERVIDOR INICIADO: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora abre login.html en tu navegador" -ForegroundColor Yellow
Write-Host "Presiona CTRL+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

json-server --watch general/db.json --port 3001

Read-Host "Presiona Enter para salir"
