@echo off
color 0E
title Encontro Certo MG - Servidor Local
echo ========================================================
echo    ENCONTRO CERTO MG - Onde o coracao mineiro bate forte 💛
echo ========================================================
echo.
echo Verificando dependencias e iniciando o servidor de desenvolvimento...
echo.

if not exist node_modules (
    echo Instalando dependencias pela primeira vez...
    call npm install
)

echo.
echo Iniciando aplicacao em http://localhost:3000 ...
call npm run dev
pause
