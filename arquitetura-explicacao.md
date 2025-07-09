# 🏗️ Arquitetura do Sistema - Demo vs Produção

## 📁 Estrutura de Arquivos

### **1. Servidor Principal (Produção)**
```
server.js          → Usa PostgreSQL real
  ↓
  └── routes/      → Mesmas rotas compartilhadas
      ├── auth.js  → Autenticação
      ├── users.js → Usuários
      └── alerts.js → Alertas
```

### **2. Servidor Demo (Desenvolvimento)**
```
server-demo.js     → Usa memória (sem banco)
  ↓
  └── Implementa as MESMAS rotas internamente
      ├── /api/auth/*   → Mesma lógica
      ├── /api/users/*  → Mesma lógica
      └── /api/alerts/* → Mesma lógica
```

## 🔄 Como Funciona a Sincronização

### **TUDO que é implementado é usado em AMBOS:**

1. **Rotas API** ✅
   - `/api/auth/register` - Registro
   - `/api/auth/login` - Login
   - `/api/users/profile` - Perfil
   - `/api/users/location` - Localização
   - `/api/alerts/*` - Alertas
   - **TODAS funcionam igualmente nos dois servidores**

2. **Frontend (public/)** ✅
   - `test.html` - Página de teste
   - `dashboard.html` - Dashboard com mapa
   - `demo.html` - Página de demonstração
   - **Policia.jpg** - Logo
   - **TODOS arquivos são servidos por AMBOS servidores**

3. **Validações** ✅
   - `utils/validators.js` - Validações angolanas
   - NIP, BI, Telefone
   - **Mesmas regras em ambos**

4. **Autenticação** ✅
   - JWT tokens
   - Mesma duração (7 dias)
   - Mesma lógica de permissões
   - **Idêntico em ambos**

5. **Socket.io** ✅
   - Tempo real
   - Salas por tipo de usuário
   - Eventos de emergência
   - **Mesma implementação**

## 🎯 Única Diferença: Armazenamento

### **server.js (Produção)**
```javascript
// Usa PostgreSQL real
const db = require('./config/database');
const result = await db.query('SELECT * FROM usuarios WHERE...');
```

### **server-demo.js (Demo)**
```javascript
// Usa objeto em memória
const database = {
  usuarios: [],
  alertas: [],
  unidades_policiais: []
};
const result = database.usuarios.find(u => u.id === userId);
```

## ✅ Garantias

1. **Qualquer funcionalidade nova é adicionada em AMBOS**
2. **Mesmas rotas, mesmos endpoints**
3. **Mesma lógica de negócio**
4. **Mesmas validações**
5. **Mesmo comportamento para o usuário**

## 🚀 Vantagens desta Arquitetura

- **Demo funciona SEM banco de dados** (fácil de testar)
- **Produção usa PostgreSQL real** (dados persistentes)
- **Código do frontend é EXATAMENTE o mesmo**
- **APIs têm o mesmo comportamento**
- **Fácil migração demo → produção**

## 📊 Status Atual

### ✅ Implementado em AMBOS:
- Sistema de autenticação completo
- Validações específicas de Angola
- Dashboard com Google Maps
- Rastreamento em tempo real
- Alertas de emergência
- Socket.io para tempo real
- 4 unidades policiais de Luanda

### 🎯 Próximas Implementações (serão em AMBOS):
- FASE 3: App Mobile (React Native)
- FASE 4: Sistema de escalação
- FASE 5: App da Polícia
- FASE 6: Desktop Electron

## 💡 Como Testar

1. **Modo Demo (sem banco):**
   ```bash
   node server-demo.js
   ```

2. **Modo Produção (com PostgreSQL):**
   ```bash
   node server.js
   ```

**AMBOS servem os MESMOS arquivos e têm as MESMAS funcionalidades!** 