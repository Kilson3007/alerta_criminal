# 🚀 Deploy no Render com PostgreSQL Gratuito

## Passo 1: Criar Conta no Render
1. Acesse: https://render.com
2. Clique em "Get Started for Free"
3. Crie conta com GitHub ou Email

## Passo 2: Criar Banco PostgreSQL
1. No dashboard, clique em "New +"
2. Selecione "PostgreSQL"
3. Configure:
   - Name: `alerta-criminal-db`
   - Database: `alerta_criminal`
   - User: (gerado automaticamente)
   - Region: Frankfurt (EU) ou Oregon (US)
   - Instance Type: **Free**
4. Clique em "Create Database"
5. Aguarde criação (2-3 minutos)
6. Copie a "Internal Database URL"

## Passo 3: Criar Web Service
1. Clique em "New +" → "Web Service"
2. Conecte seu GitHub (se ainda não conectou)
3. Ou use "Public Git repository"
4. Configure:
   - Name: `alerta-criminal-api`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**

## Passo 4: Configurar Variáveis de Ambiente
No painel do Web Service, vá em "Environment":
```
DATABASE_URL=postgresql://... (cole a URL do passo 2)
JWT_SECRET=sistema_alerta_criminal_luanda_2024
GOOGLE_MAPS_API_KEY=AIzaSyDXtsqDFUtTooM-ZRxJqRms4cbOFkiXcDc
NODE_ENV=production
PORT=3000
```

## Passo 5: Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos)
3. Quando ficar verde, acesse a URL fornecida!

## 📱 URLs Finais
- API: https://alerta-criminal-api.onrender.com
- Teste: https://alerta-criminal-api.onrender.com/api/health

## ⚠️ Limitações do Plano Gratuito
- PostgreSQL: 1GB storage, 90 dias de inatividade
- Web Service: Dorme após 15min sem uso
- Primeiro acesso após dormir: 30-50 segundos

## 🎯 Para Apresentação
- Acesse o site 5 minutos antes para "acordar"
- Dados persistem entre sessões
- Perfeito para demonstração acadêmica! 