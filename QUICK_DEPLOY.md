# ⚡ Deploy Rápido - 5 Minutos

Este guia te ajudará a publicar seu site em **5 minutos**!

## 🎯 Opção Mais Fácil: Vercel + Railway

### Passo 1: Preparar o Código (2 min)

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparando para deploy"
git push origin main
```

### Passo 2: Deploy do Backend - Railway (2 min)

1. **Acesse [Railway.app](https://railway.app)**
2. **Faça login com GitHub**
3. **Clique "New Project"**
4. **Escolha "Deploy from GitHub repo"**
5. **Selecione seu repositório**
6. **Configure:**
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Passo 3: Deploy do Frontend - Vercel (1 min)

1. **Acesse [Vercel.com](https://vercel.com)**
2. **Faça login com GitHub**
3. **Clique "New Project"**
4. **Importe seu repositório**
5. **Configure:**
   - **Framework**: Vite
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Passo 4: Conectar Frontend e Backend

1. **Copie a URL do Railway** (ex: `https://seu-backend.railway.app`)
2. **No Vercel, vá em Settings > Environment Variables**
3. **Adicione:**
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://seu-backend.railway.app`
4. **Redeploy o projeto**

## 🎉 Pronto!

Seu site está no ar! Acesse a URL do Vercel.

---

## 🔧 Alternativas Rápidas

### Opção 2: Render (Tudo em um lugar)

1. **Acesse [Render.com](https://render.com)**
2. **Faça login com GitHub**
3. **Clique "New +" > "Blueprint"**
4. **Cole a URL do seu repositório**
5. **Render detectará automaticamente a configuração**

### Opção 3: Netlify + Railway

- **Frontend**: [Netlify](https://netlify.com) (similar ao Vercel)
- **Backend**: Railway (mesmo processo)

### Opção 4: Heroku (Pago)

- **Frontend**: Heroku Static Sites
- **Backend**: Heroku Node.js

---

## 🚨 Problemas Comuns

### "Build Failed"
- Verifique se o Node.js está na versão 18+
- Confirme se todas as dependências estão no `package.json`

### "CORS Error"
- Configure `FRONTEND_URL` no Railway
- Verifique se a URL do backend está correta no Vercel

### "Database Error"
- O SQLite será criado automaticamente
- Para produção, considere PostgreSQL

---

## 📞 Suporte

- **Railway**: [Discord](https://discord.gg/railway)
- **Vercel**: [Discord](https://discord.gg/vercel)
- **Render**: [Discord](https://discord.gg/render)

---

**⚡ Seu site está pronto em 5 minutos!** 