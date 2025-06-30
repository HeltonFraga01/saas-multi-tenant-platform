# @saasmaster/lib-api

SDK TypeScript para APIs SaaS (Supabase, Payments, Evo AI)

## Instalação

```bash
npm install @saasmaster/lib-api
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENPIX_APP_ID=your_openpix_app_id
VITE_ASAAS_API_KEY=your_asaas_api_key
VITE_EVO_AGENT_URL=your_evo_agent_url
VITE_APP_URL=http://localhost:5173
```

### Inicialização

```typescript
import { createClient, validateEnv } from '@saasmaster/lib-api';

// Validar variáveis de ambiente
validateEnv();

// Inicializar cliente Supabase
createClient();
```

## Uso

### Autenticação

```typescript
import { authService, useAuthStore } from '@saasmaster/lib-api';

// Fazer login
const user = await authService.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Usar store Zustand
const { user, signIn, signOut } = useAuthStore();
```

### Empresas

```typescript
import { companyService } from '@saasmaster/lib-api';

// Criar empresa
const company = await companyService.create({
  name: 'Minha Empresa',
  email: 'contato@empresa.com'
});

// Listar empresas
const companies = await companyService.getAll({
  page: 1,
  limit: 10
});
```

### Usuários

```typescript
import { userService } from '@saasmaster/lib-api';

// Criar usuário
const user = await userService.create({
  email: 'user@example.com',
  name: 'João Silva',
  company_id: 'company-id',
  role: 'user'
});

// Obter perfil com empresa
const profile = await userService.getProfile('user-id');
```

### Planos

```typescript
import { planService } from '@saasmaster/lib-api';

// Listar planos ativos
const plans = await planService.getAllActive();

// Obter planos para comparação
const comparison = await planService.getForComparison();
```

### Pagamentos

```typescript
import { paymentService } from '@saasmaster/lib-api';

// Criar pagamento PIX
const pixPayment = await paymentService.createPixPayment({
  company_id: 'company-id',
  plan_id: 'plan-id',
  amount: 99.90,
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '12345678901'
  }
});

// Criar pagamento cartão
const cardPayment = await paymentService.createCreditCardPayment({
  company_id: 'company-id',
  plan_id: 'plan-id',
  amount: 99.90,
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '12345678901'
  },
  card: {
    number: '4111111111111111',
    expiry_month: '12',
    expiry_year: '2025',
    cvv: '123',
    holder_name: 'JOAO SILVA'
  }
});
```

### Agentes

```typescript
import { agentService } from '@saasmaster/lib-api';

// Criar agente
const agent = await agentService.create({
  name: 'Agente Suporte',
  description: 'Agente para atendimento ao cliente',
  evo_agent_id: 'evo-agent-123',
  evo_instance_url: 'https://evo.example.com'
});

// Atribuir agente à empresa
const assignment = await agentService.assignToCompany({
  agent_id: 'agent-id',
  company_id: 'company-id',
  assigned_by: 'user-id'
});

// Obter agentes da empresa
const companyAgents = await agentService.getByCompany('company-id');
```

### Chat

```typescript
import { chatService } from '@saasmaster/lib-api';

// Configurar Evo AI
chatService.setEvoConfig({
  instanceName: 'my-instance',
  token: 'evo-token',
  serverUrl: 'https://evo.example.com',
  webhook: 'https://myapp.com/webhook/evo'
});

// Criar sessão de chat
const session = await chatService.createSession({
  company_id: 'company-id',
  agent_id: 'agent-id',
  user_phone: '+5511999999999',
  user_name: 'Cliente'
});

// Enviar mensagem
const message = await chatService.sendMessage({
  session_id: 'session-id',
  content: 'Olá, preciso de ajuda'
});

// Obter sessão com mensagens
const sessionWithMessages = await chatService.getSessionWithMessages('session-id');
```

## Tratamento de Erros

```typescript
import { ApiError, handleApiError } from '@saasmaster/lib-api';

try {
  const user = await authService.signIn(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Tipos

Todos os tipos TypeScript estão disponíveis:

```typescript
import type {
  // API
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  
  // Auth
  AuthUser,
  LoginCredentials,
  RegisterData,
  
  // Companies
  Company,
  CreateCompanyData,
  UpdateCompanyData,
  
  // Users
  User,
  CreateUserData,
  UpdateUserData,
  UserRole,
  
  // Plans
  Plan,
  CreatePlanData,
  UpdatePlanData,
  
  // Payments
  Payment,
  PaymentStatus,
  CreatePaymentData,
  
  // Agents
  Agent,
  CreateAgentData,
  UpdateAgentData,
  
  // Chat
  ChatSession,
  ChatMessage,
  SendMessageData,
  
  // Database
  Database
} from '@saasmaster/lib-api';
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

## Estrutura

```
src/
├── auth/           # Serviços de autenticação
├── companies/      # Serviços de empresas
├── users/          # Serviços de usuários
├── plans/          # Serviços de planos
├── payments/       # Serviços de pagamentos
├── agents/         # Serviços de agentes
├── chat/           # Serviços de chat
├── stores/         # Stores Zustand
├── types/          # Tipos TypeScript
├── utils/          # Utilitários
├── client.ts       # Cliente Supabase
└── index.ts        # Exports principais
```

## Roadmap

- ✅ **Fase 1**: Estrutura básica e autenticação
- ✅ **Fase 2**: Serviços CRUD (companies, users, plans, payments, agents, chat)
- 🔄 **Fase 3**: Stores Zustand completas
- ⏳ **Fase 4**: Integração OpenPIX/Asaas
- ⏳ **Fase 10**: Integração Evo AI completa

## Licença

MIT