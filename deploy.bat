@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando deploy do Mapa Inteligência...

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo [ERROR] Execute este script na raiz do projeto!
    pause
    exit /b 1
)

if not exist "server" (
    echo [ERROR] Pasta server não encontrada!
    pause
    exit /b 1
)

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js não está instalado!
    pause
    exit /b 1
)

echo Node.js versão: 
node --version

REM Build do Frontend
echo [INFO] Construindo frontend...
call npm install
if errorlevel 1 (
    echo [ERROR] Erro ao instalar dependências do frontend!
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo [ERROR] Erro ao construir frontend!
    pause
    exit /b 1
)
echo [INFO] Frontend construído com sucesso ✓

REM Build do Backend
echo [INFO] Construindo backend...
cd server
call npm install
if errorlevel 1 (
    echo [ERROR] Erro ao instalar dependências do backend!
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo [ERROR] Erro ao construir backend!
    pause
    exit /b 1
)
echo [INFO] Backend construído com sucesso ✓
cd ..

REM Verificar se o Vercel CLI está instalado
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Vercel CLI não encontrado. Instalando...
    call npm install -g vercel
)

REM Verificar se o Railway CLI está instalado
railway --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Railway CLI não encontrado. Instalando...
    call npm install -g @railway/cli
)

echo.
echo 🎉 Build concluído com sucesso!
echo.
echo 📋 Próximos passos:
echo   1. Faça login no Railway: railway login
echo   2. Faça login no Vercel: vercel login
echo   3. Execute o deploy manualmente ou use o script bash no WSL
echo.
echo 📖 Para mais informações, consulte DEPLOY.md
echo.
pause 