#!/bin/bash

# 🚀 Script de Deploy Automatizado - Mapa Inteligência
# Este script automatiza o processo de deploy

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do Mapa Inteligência..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ] || [ ! -d "server" ]; then
    error "Execute este script na raiz do projeto!"
    exit 1
fi

# Verificar se o git está configurado
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Este diretório não é um repositório Git!"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas. Deseja continuar? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Deploy cancelado."
        exit 0
    fi
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado!"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

log "Node.js $(node -v) detectado ✓"

# Build do Frontend
log "Construindo frontend..."
npm install
npm run build

if [ $? -eq 0 ]; then
    log "Frontend construído com sucesso ✓"
else
    error "Erro ao construir frontend!"
    exit 1
fi

# Build do Backend
log "Construindo backend..."
cd server
npm install
npm run build

if [ $? -eq 0 ]; then
    log "Backend construído com sucesso ✓"
else
    error "Erro ao construir backend!"
    exit 1
fi

cd ..

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    warn "Railway CLI não encontrado. Instalando..."
    npm install -g @railway/cli
fi

# Deploy do Backend (Railway)
log "Fazendo deploy do backend no Railway..."
cd server

# Verificar se está logado no Railway
if ! railway whoami &> /dev/null; then
    warn "Faça login no Railway primeiro:"
    railway login
fi

# Deploy
railway up

if [ $? -eq 0 ]; then
    log "Backend deployado com sucesso ✓"
    
    # Obter URL do backend
    BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$BACKEND_URL" ]; then
        log "Backend URL: $BACKEND_URL"
    fi
else
    error "Erro no deploy do backend!"
    exit 1
fi

cd ..

# Deploy do Frontend (Vercel)
log "Fazendo deploy do frontend no Vercel..."

# Verificar se está logado no Vercel
if ! vercel whoami &> /dev/null; then
    warn "Faça login no Vercel primeiro:"
    vercel login
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    log "Frontend deployado com sucesso ✓"
    
    # Obter URL do frontend
    FRONTEND_URL=$(vercel ls --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4 | head -1)
    if [ -n "$FRONTEND_URL" ]; then
        log "Frontend URL: $FRONTEND_URL"
    fi
else
    error "Erro no deploy do frontend!"
    exit 1
fi

# Resumo final
echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
echo "🔧 Próximos passos:"
echo "  1. Configure as variáveis de ambiente no Railway"
echo "  2. Configure as variáveis de ambiente no Vercel"
echo "  3. Teste a aplicação"
echo "  4. Configure domínio personalizado (opcional)"
echo ""
echo "📖 Para mais informações, consulte DEPLOY.md" 