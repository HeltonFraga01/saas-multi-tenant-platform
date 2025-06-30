# SaaS Multi-Tenant Platform

Uma plataforma SaaS multi-tenant moderna construída com React, Supabase, e tecnologias serverless.

## 🚀 Stack Tecnológica

- **Frontend**: Vite + React 18, TypeScript, Tailwind CSS, MagicUI
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Estado**: Zustand
- **Pagamentos**: OpenPIX & Asaas
- **Chat**: Evo AI
- **Testes**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions
- **Deploy**: Cloud Panel + Supabase CLI

## 📁 Estrutura do Projeto

```
├── apps/
│   ├── web/              # Aplicação React (landing + dashboards)
│   ├── functions/         # Supabase Edge Functions
│   └── scripts/           # Scripts de migração e seeds
├── packages/
│   ├── ui/                # Componentes MagicUI wrappers
│   └── lib-api/           # SDK TypeScript (Supabase, Payments, Evo)
├── docs/                  # Documentação e ADRs
├── tests/                 # Testes E2E
└── __mocks__/             # Mocks para testes
```

## 🛠️ Setup do Desenvolvimento

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Contas nos provedores de pagamento (OpenPIX/Asaas)
- Instância do Evo AI

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd agoraVai
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Configure o Supabase**
   ```bash
   npx supabase init
   npx supabase start
   npx supabase db reset
   ```

5. **Inicie o desenvolvimento**
   ```bash
   npm run dev
   ```

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build de produção
- `npm run test` - Executa testes unitários
- `npm run test:e2e` - Executa testes E2E
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código
- `npm run type-check` - Verifica tipos TypeScript

## 🏗️ Arquitetura

### Entidades Principais

- **Companies**: Empresas/tenants
- **Users**: Usuários do sistema
- **Plans**: Planos de assinatura
- **Payments**: Pagamentos e faturas
- **Agents**: Agentes de IA
- **Agent Assignments**: Atribuições de agentes

### Papéis e Permissões

- **Super Admin**: Acesso total ao sistema
- **Company Admin**: Gerencia sua empresa
- **User**: Usuário final com acesso limitado

### Row Level Security (RLS)

Todos os dados são isolados por `company_id`, exceto para Super Admins que têm acesso global.

## 🔐 Autenticação

Utilizamos Supabase Auth com:
- Login por email/senha
- Recuperação de senha
- Verificação de email
- Sessões seguras

## 💳 Pagamentos

Integração com múltiplos provedores:
- **OpenPIX**: PIX e cartão
- **Asaas**: Boleto, cartão e PIX

Webhooks configurados para sincronização automática.

## 🤖 Chat IA

Integração com Evo AI para:
- Chat interno entre usuários
- Suporte automatizado
- Notificações em tempo real

## 🧪 Testes

### Testes Unitários
```bash
npm run test
```

### Testes E2E
```bash
npm run test:e2e
```

### Cobertura
Mantemos cobertura mínima de 80% em:
- Branches
- Functions
- Lines
- Statements

## 🚀 Deploy

### Staging
Deploy automático via GitHub Actions em PRs.

### Produção
1. Merge na branch `main`
2. GitHub Actions executa:
   - Build da aplicação
   - Deploy no Cloud Panel
   - Deploy das Edge Functions
   - Execução de migrações

## 📊 Monitoramento

- **Logs**: Supabase Logflare
- **Erros**: Sentry
- **Analytics**: Google Analytics
- **Uptime**: Monitoramento customizado

## 🔧 Desenvolvimento

### Convenções

- **Arquivos**: kebab-case
- **Componentes**: PascalCase
- **Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Git Flow

1. Feature branches: `feature/nome-da-feature`
2. Pull Request com review obrigatório
3. Testes passando obrigatório
4. Deploy automático após merge

### Qualidade

- ESLint + Prettier configurados
- Husky para pre-commit hooks
- Conventional Commits
- Cobertura de testes obrigatória

## 📚 Documentação

- [Plano de Implementação](./docs/implementation_plan.md)
- [Estrutura do Projeto](./docs/structure.md)
- [ADRs](./docs/adrs/)
- [API Documentation](./docs/api/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

---

**SaaSMaster Dev** - Construindo o futuro das aplicações SaaS 🚀