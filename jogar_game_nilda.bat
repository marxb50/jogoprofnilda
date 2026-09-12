@echo off
setlocal
chcp 65001 >nul
title Game Nilda - As Obras de Parnamirim

echo =======================================================================
echo   GAME NILDA - AS OBRAS DE PARNAMIRIM
echo   Edicao Super Nintendo 16-Bit - Teste Local
echo =======================================================================
echo.

cd /d "%~dp0"

:: 1. Detectar Python
set "PY_CMD="
where python >nul 2>&1 && set "PY_CMD=python"
if not defined PY_CMD where py >nul 2>&1 && set "PY_CMD=py"

if not defined PY_CMD (
    echo [Aviso] Python nao encontrado no PATH do sistema.
    echo Abrindo index.html diretamente...
    start "" "%~dp0index.html"
    ping 127.0.0.1 -n 3 >nul
    exit /b 0
)

:: 2. Verificar porta 8775
netstat -ano | findstr :8775 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [Game Nilda] Iniciando servidor web local na porta 8775...
    start "Servidor Game Nilda" /min cmd /c "cd /d ""%~dp0"" && %PY_CMD% server.py"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [Game Nilda] Servidor local ja esta ativo na porta 8775.
)

:: 3. Abrir o jogo no navegador
echo.
echo [Game Nilda] Abrindo o jogo no navegador: http://127.0.0.1:8775/index.html
start "" "http://127.0.0.1:8775/index.html"

ping 127.0.0.1 -n 2 >nul
exit /b 0
