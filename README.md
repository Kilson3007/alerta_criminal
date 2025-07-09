# 🚨 Sistema Inteligente de Alerta Criminal - Luanda

Sistema de alerta criminal em tempo real para a cidade de Luanda, Angola. Este projeto foi desenvolvido como trabalho de fim de curso e visa conectar cidadãos, agentes da polícia e unidades policiais através de uma plataforma integrada de alertas e resposta rápida.

## 📋 Funcionalidades Principais

### Para Cidadãos
- ✅ Registro e autenticação com NIP e Bilhete de Identidade
- 🔄 Alertas de emergência em tempo real
- 📱 Detecção automática por gestos (3-4 cliques no botão desligar)
- 📹 Gravação automática de áudio/vídeo em background
- 📍 Compartilhamento de localização em tempo real
- 🆘 Botão de pânico integrado

### Para Polícia
- 👮 Registro específico para agentes
- 📱 Recebimento de alertas em tempo real
- 🗺️ Visualização de localização dos alertas
- 📺 Acesso a transmissão ao vivo (áudio/vídeo)
- ✅ Sistema de resposta e confirmação
- 📊 Dashboard de status e disponibilidade

### Para Unidades Policiais
- 🖥️ Sistema desktop para monitoramento
- 📊 Dashboard centralizado com mapa interativo
- 👥 Gestão de agentes e distribuição de ocorrências
- ⏱️ Sistema de escalonamento automático (3 minutos)
- 📈 Relatórios e estatísticas
- 🎥 Controle de gravações e evidências

## 🏗️ Arquitetura do Sistema

```
├── 📱 Apps Mobile (React Native)
│   ├── App Cidadãos
│   └── App Polícia
├── 🖥️ Desktop (Electron)
│   └── Sistema Unidades
├── ⚡ Backend (Node.js + Express)
│   ├── API REST
│   ├── Socket.io (Tempo Real)
│   └── Autenticação JWT
├── 🗄️ Banco de Dados (PostgreSQL)
└── 🗺️ Integração Google Maps
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express, Socket.io
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT + bcrypt
- **Tempo Real**: Socket.io
- **Mapas**: Google Maps API
- **Mobile**: React Native (iOS/Android)
- **Desktop**: Electron + React
- **Hospedagem**: Render (gratuito)

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js >= 18.0.0
- PostgreSQL >= 13
- Git

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd sistema-alerta-criminal
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
cp config.env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/alerta_criminal
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
GOOGLE_MAPS_API_KEY=AIzaSyDXtsqDFUtTooM-ZRxJqRms4cbOFkiXcDc
BCRYPT_ROUNDS=12
```

### 4. Configurar Banco de Dados

#### Opção A: PostgreSQL Local
```bash
# Criar banco de dados
createdb alerta_criminal

# O sistema criará as tabelas automaticamente na primeira execução
```

#### Opção B: Render PostgreSQL (Gratuito)
1. Acesse [render.com](https://render.com)
2. Crie uma conta gratuita
3. Crie um novo PostgreSQL database
4. Copie a URL de conexão para o `.env`

### 5. Executar o Sistema
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 🗺️ API Endpoints

### Autenticação
```
POST /api/auth/register    # Registrar usuário
POST /api/auth/login       # Login
POST /api/auth/logout      # Logout
GET  /api/auth/verify      # Verificar token
```

### Usuários
```
GET  /api/users/profile           # Obter perfil
PUT  /api/users/profile           # Atualizar perfil
PUT  /api/users/location          # Atualizar localização
GET  /api/users/nearby-units      # Unidades próximas
GET  /api/users/nearby-agents     # Agentes próximos
```

### Alertas
```
GET  /api/alerts/status    # Status do sistema
GET  /api/alerts/stats     # Estatísticas (operacionais)
```

### Sistema
```
GET  /api/health          # Status da API
```

## 📊 Estrutura do Banco de Dados

### Tabela: usuarios
- `id` - ID único
- `nip` - Número de Identificação Pessoal (14 dígitos)
- `bilhete_identidade` - Bilhete de Identidade
- `nome_completo` - Nome completo
- `telefone` - Telefone angolano
- `email` - Email (opcional)
- `tipo_usuario` - cidadao/policia/unidade
- `senha_hash` - Senha criptografada
- `localizacao_lat/lng` - Coordenadas GPS
- `endereco` - Endereço textual
- `ativo` - Status da conta

### Tabela: unidades_policiais
- `id` - ID único
- `nome` - Nome da unidade
- `codigo_unidade` - Código único (ex: CPL001)
- `endereco` - Endereço completo
- `telefone` - Telefone da unidade
- `localizacao_lat/lng` - Coordenadas GPS
- `ativa` - Status da unidade

### Tabela: sessoes_usuario
- `id` - ID único
- `usuario_id` - Referência ao usuário
- `token_hash` - Hash do JWT
- `dispositivo` - Informações do dispositivo
- `ip_address` - IP da conexão
- `ativo` - Status da sessão
- `expira_em` - Data de expiração

## 🔐 Validações Específicas para Angola

### NIP (Número de Identificação Pessoal)
- Formato: 14 dígitos (AAAAMMDDSSSSSC)
- Validação de data de nascimento
- Cálculo do dígito de controle
- Verificação de idade mínima

### Bilhete de Identidade
- Múltiplos formatos aceitos
- Validação de padrões angolanos
- Verificação de sequências inválidas

### Telefone
- Formatos: +244 9XX XXX XXX
- Validação para operadoras angolanas
- Suporte a números fixos de Luanda

### Coordenadas GPS
- Validação específica para Luanda
- Limites: Lat(-9.8 a -8.3), Lng(12.5 a 14.0)
- Verificação de área de cobertura

## 🚀 Fases de Desenvolvimento

### ✅ FASE 1: Infraestrutura Base (Concluída)
- [x] Backend Node.js com Express
- [x] Banco PostgreSQL configurado
- [x] Sistema de autenticação com NIP/BI
- [x] API básica de usuários
- [x] Socket.io para tempo real
- [x] Validadores angolanos
- [x] Middleware de segurança

### 🔄 FASE 2: Geolocalização e Mapas
- [ ] Integração Google Maps API
- [ ] Sistema de tracking em tempo real
- [ ] Cálculo de distâncias
- [ ] Detecção de área de cobertura

### 🔄 FASE 3: App Mobile Cidadãos
- [ ] Interface React Native
- [ ] Botão de pânico
- [ ] Detecção de gestos
- [ ] Gravação automática
- [ ] Transmissão em tempo real

### 🔄 FASE 4: Sistema Tempo Real
- [ ] Comunicação Socket.io avançada
- [ ] Sistema de escalonamento
- [ ] Transmissão áudio/vídeo
- [ ] Notificações push

### 🔄 FASE 5: App Mobile Polícia
- [ ] Interface para agentes
- [ ] Recebimento de alertas
- [ ] Resposta a ocorrências
- [ ] Status de disponibilidade

### 🔄 FASE 6: Desktop Unidades
- [ ] Aplicação Electron
- [ ] Dashboard com mapas
- [ ] Gestão de agentes
- [ ] Controle de gravações

## 🧪 Testando o Sistema

### 1. Testar API
```bash
# Verificar status
curl http://localhost:3000/api/health

# Registrar usuário cidadão
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "20001231123451",
    "bilhete_identidade": "123456789LA22",
    "nome_completo": "João Silva",
    "telefone": "244912345678",
    "tipo_usuario": "cidadao",
    "senha": "senha123"
  }'
```

### 2. Testar WebSocket
```javascript
// Conectar via browser console
const socket = io('http://localhost:3000', {
  auth: { token: 'seu_jwt_token_aqui' }
});

socket.on('connect', () => console.log('Conectado!'));
socket.emit('ping', (response) => console.log(response));
```

## 📱 Dados de Teste

### Unidades Policiais (Pré-carregadas)
1. **Comando Provincial de Luanda** - CPL001
2. **1ª Esquadra - Ingombota** - EP001  
3. **2ª Esquadra - Maianga** - EP002
4. **3ª Esquadra - Rangel** - EP003

### Usuários de Teste
```json
{
  "cidadao": {
    "nip": "19901215123456",
    "bi": "987654321LA22",
    "nome": "Maria Santos",
    "telefone": "244923456789"
  },
  "policia": {
    "nip": "19850601234567",
    "bi": "555666777LA22", 
    "nome": "Agente Carlos",
    "telefone": "244934567890"
  }
}
```

## 🔒 Segurança

- **Autenticação**: JWT com expiração de 7 dias
- **Senhas**: bcrypt com 12 rounds
- **Rate Limiting**: 100 requests por 15 minutos
- **Validação**: Sanitização de todos os inputs
- **CORS**: Configurado para origins específicos
- **Helmet**: Headers de segurança
- **SQL Injection**: Queries parametrizadas

## 📈 Monitoramento

- Logs estruturados com timestamps
- Métricas de performance de queries
- Status de conexões Socket.io
- Estatísticas de usuários por tipo

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro de conexão com banco**
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Verificar URL no .env
echo $DATABASE_URL
```

**2. Erro de validação de NIP**
- Verificar formato: 14 dígitos
- Data válida nos primeiros 8 dígitos
- Não usar NIPs de teste inválidos

**3. Socket.io não conecta**
- Verificar token JWT válido
- Confirmar origin no CORS
- Verificar porta no frontend

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome]
- **Orientador**: [Nome do Orientador]
- **Instituição**: [Nome da Universidade]

## 📞 Suporte

- **Email**: suporte@alertacriminal.ao
- **Telefone**: +244 XXX XXX XXX
- **Issues**: [GitHub Issues](link-para-issues)

---

**🚨 Sistema de Alerta Criminal Luanda - Protegendo nossa cidade com tecnologia!** 