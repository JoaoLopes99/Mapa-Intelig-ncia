# 🚀 Guia de Deploy - Mapa Inteligência

Este guia te ajudará a publicar seu projeto com frontend e backend funcionais.

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [Railway](https://railway.app) (gratuita)
- Git configurado
- Node.js 18+ instalado

## 🎯 Estratégia de Deploy

### Frontend (Vercel)
- React + Vite
- Deploy automático via Git
- CDN global
- SSL automático

### Backend (Railway)
- Node.js + Express
- SQLite (pode migrar para PostgreSQL)
- Deploy automático via Git
- SSL automático

## 🚀 Deploy do Backend (Railway)

### 1. Preparar o Backend

```bash
# Navegar para a pasta do servidor
cd server

# Instalar dependências
npm install

# Testar localmente
npm run dev
```

### 2. Deploy no Railway

1. **Acesse [Railway.app](https://railway.app)**
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório**
6. **Configure o deploy:**
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 3. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-frontend.vercel.app
JWT_SECRET=sua-chave-secreta-muito-segura
```

### 4. Obter URL do Backend

Após o deploy, Railway fornecerá uma URL como:
`https://seu-backend.railway.app`

## 🌐 Deploy do Frontend (Vercel)

### 1. Preparar o Frontend

```bash
# Voltar para a pasta raiz
cd ..

# Instalar dependências
npm install

# Testar build
npm run build
```

### 2. Deploy no Vercel

1. **Acesse [Vercel.com](https://vercel.com)**
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Importe seu repositório**
5. **Configure o projeto:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Configurar Variáveis de Ambiente

No Vercel, vá em **Settings > Environment Variables** e adicione:

```env
REACT_APP_API_URL=https://seu-backend.railway.app
```

### 4. Configurar Domínio

O Vercel fornecerá uma URL como:
`https://seu-projeto.vercel.app`

## 🔧 Configurações Adicionais

### CORS Configuration

O backend já está configurado para aceitar requisições do frontend. Se necessário, ajuste em `server/src/server.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Database Migration (Opcional)

Para migrar do SQLite para PostgreSQL no Railway:

1. **Adicione PostgreSQL no Railway**
2. **Configure a variável `DATABASE_URL`**
3. **Atualize o código para usar PostgreSQL**

## 🐳 Deploy com Docker (Alternativa)

### Local Development

```bash
# Build e executar com Docker Compose
docker-compose up --build
```

### Deploy em Produção

```bash
# Build das imagens
docker build -t mapa-inteligencia-frontend .
docker build -t mapa-inteligencia-backend ./server

# Executar containers
docker run -d -p 3000:80 mapa-inteligencia-frontend
docker run -d -p 3001:3001 mapa-inteligencia-backend
```

## 🔍 Verificação do Deploy

### Testar Backend

```bash
curl https://seu-backend.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "Server is running",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Testar Frontend

1. Acesse `https://seu-projeto.vercel.app`
2. Verifique se a aplicação carrega
3. Teste o login e funcionalidades

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Errors**
   - Verifique se `FRONTEND_URL` está configurado corretamente
   - Confirme se o backend está aceitando requisições

2. **Build Failures**
   - Verifique logs no Railway/Vercel
   - Teste build localmente primeiro

3. **Database Issues**
   - Verifique se o SQLite está sendo criado
   - Confirme permissões de escrita

### Logs e Debug

- **Railway**: Dashboard > Deployments > Logs
- **Vercel**: Dashboard > Functions > Logs

## 📈 Monitoramento

### Railway
- Uptime monitoring automático
- Logs em tempo real
- Métricas de performance

### Vercel
- Analytics automático
- Performance monitoring
- Error tracking

## 🔄 Deploy Automático

Ambas as plataformas fazem deploy automático quando você faz push para o branch principal:

```bash
git add .
git commit -m "Update for production"
git push origin main
```

## 🎉 Próximos Passos

1. **Configurar domínio personalizado**
2. **Implementar CI/CD mais robusto**
3. **Adicionar monitoramento**
4. **Configurar backup do banco**
5. **Implementar rate limiting**

---

**🎯 Seu site está pronto!** Acesse a URL do Vercel para ver sua aplicação funcionando. 