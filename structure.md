Arquitetura Geral do SaaS

Este projeto é uma aplicação SaaS multi-tenant com três níveis de usuário: Super Admin (controle total da plataforma), Admin de empresa (gerencia usuários da empresa) e Usuários (membros de cada empresa). A aplicação terá front-end estático (landing page) e painéis protegidos para login/admin. Para facilitar a implantação, adotaremos uma arquitetura sem servidor tradicional, usando ferramentas headless como Supabase ou NocoDB (banco de dados via API) sempre que possível. Em vez de montar um back-end próprio, usaremos serviços gerenciados: por exemplo, Supabase (PostgreSQL, Auth, API automática) ou NocoDB conectado a um PostgreSQL. Supabase oferece autenticação JWT integrada ao Postgres com Row Level Security ￼, expondo o banco via REST/GraphQL ￼. Assim, podemos manter a home estática (HTML/CSS/JS) e, no back-end, simplesmente chamar APIs externas (Supabase, Asaas, OpenPix, EvoAI).

Front-end (Landing Page e UI)

A home page terá várias seções dispostas em “camadas” lógicas: banner hero, descrição do serviço, lista de itens/características, vantagens, prova social (depoimentos), tabela de planos (preços) e CTA final. Também haverá menu fixo e rodapé. Usaremos um builder leve (“Invite”) com tema “Thailand” (cores/estilo) e o framework de UI Magic UI para efeitos animados e componentes prontos via CDN. Magic UI é uma biblioteca React/Tailwind com 150+ componentes e animações livres ￼. Por exemplo, podemos importar via CDN os scripts do Magic UI (e Tailwind CDN) para criar facilmente cabeçalhos animados, botões chamativos e fundos dinâmicos. Todo o layout será responsivo e componível, facilitando atualizações.
	•	Componentes e temas: Magic UI (via CDN) fornece efeitos visuais (gradientes, animações de texto, transições em botões, etc.) sem código manual. Usaremos classes do Tailwind (via <script src="https://cdn.tailwindcss.com">) junto com scripts do Magic UI hospedados em CDN (por exemplo magicuicore) para estilizar a página.
	•	Seções da página: Estruturaremos o HTML de acordo com as  “5 camadas” solicitadas. Cada seção (hero, descrição, itens, vantagens, depoimentos, planos, CTA) será um componente/componentização para fácil manutenção. Podem ser simples seções de <div> estilizadas, ou componentes React estáticos se adotarmos Next.js/React.

Autenticação e Controle de Acesso

Adotaremos um modelo multi-tenant baseado em organizações (empresas) ￼. Cada empresa é uma organização, com vários usuários vinculados. Os usuários possuem papéis: SuperAdmin (uma só conta geral), Admin da Empresa (criado automaticamente como primeiro usuário da empresa ￼), e Usuário Comum.
	•	Fluxo de Signup/Login: O SuperAdmin já existe no sistema (criado manualmente ou via seed). Cada empresa se registra por um formulário (ou o SuperAdmin cria a empresa e indica um Admin). O primeiro usuário de cada empresa recebe automaticamente o papel de Admin ￼. Os demais são “membros” da empresa (role user).
	•	Controle de acesso: Usaremos o Row Level Security do banco para isolar dados por empresa. Por exemplo, cada tabela terá company_id, e o Supabase habilita RLS no esquema, garantindo que um admin só veja dados de sua empresa e o SuperAdmin veja tudo ￼.
	•	Papéis e permissões: De forma padrão, todo novo usuário em uma empresa recebe o papel “usuário” (member) automaticamente ￼. Podemos mapear permissões globais (ex.: acesso de leitura/escrita) e refiná-las por função. O SuperAdmin gerencia configurações globais, enquanto os Admins gerenciam apenas seu tenant. Cada usuário tem login (e-mail + senha simples) e tokens JWT via Supabase Auth.

Modelo de Dados (Banco de Dados)

O banco de dados relacional (PostgreSQL) conterá tabelas para suportar usuários, empresas e recursos. Por exemplo:
	•	users: armazena usuário (id, nome, e-mail, senha_hash, role (superadmin/admin/user), company_id).
	•	companies (ou organizations): (id, nome, informações, plan_id, dados de pagamento como API keys Pix/ASAS).
	•	memberships (ou podemos ter company_id no users): opcional para relacionamento N:N, caso um usuário pertença a várias empresas (não obrigatório aqui).
	•	plans: (id, nome, preço, recursos permitidos). O SuperAdmin configura planos (nome, valor, funções).
	•	payments: controla pagamentos e assinaturas (id, company_id, plan_id, valor, status, data). Integrações com PIX/ASAS atualizam essa tabela.
	•	agents: (id, company_id, nome, url, chave_api). Guarda configurações dos agentes Evo AI que cada empresa pode usar.
	•	agent_assignments: (id, agent_id, admin_user_id) – relaciona quais administradores têm acesso a quais agentes.
	•	chat_sessions (opcional): (id, user_id, agent_id, data_inicio) – sessão de chat.
	•	messages (opcional): (id, session_id, remetente, mensagem, data). Poderíamos registrar localmente o histórico se quisermos.

Todas essas tabelas são acessíveis via API automática do Supabase (PostgREST) ￼, e podemos usar views ou RLS para isolar dados por company_id. O esquema deve refletir os níveis: o SuperAdmin (sem company_id), o Admin/Usuário (cada um com company_id da empresa).

Integrações de Pagamento (OpenPIX/Asaas)

Para permitir assinatura dos planos, integraremos APIs de pagamento brasileiras (OpenPIX ou Asaas). Ambas oferecem soluções completas de PIX e QR Code. Por exemplo, a documentação Asaas afirma: “Nossa API oferece controle completo das funcionalidades do Pix, como geração de chave Pix, recebimento via QR Codes dinâmicos e estáticos, e envio de dinheiro” ￼. Em prática:
	•	O SuperAdmin insere as credenciais da API de pagamentos (chave de API OpenPix/Asaas) no painel.
	•	Na página de checkout, o cliente (empresa) escolhe um plano. Ao confirmar, a aplicação usa a API (via JavaScript ou chamada de Edge Function) para gerar um pagamento Pix/QrCode ou link de pagamento.
	•	Ao concluir o pagamento, o serviço (Asaas/OpenPix) notifica via webhook ou callback. O backend (via Supabase Edge Function ou servidor leve) recebe essa notificação e atualiza o status em payments (ex.: pago, pendente).
	•	Após pagamento aprovado, o sistema libera os recursos do plano para aquela empresa.

Toda lógica de cobrança (criação de cobranças, webhooks) pode ser tratada via funções sem servidor. Por exemplo, Supabase Edge Functions podem receber o webhook do Asaas e atualizar o banco. Assim, não há complexidade adicional no deploy. As tabelas payments e plans garantem o rastreamento das assinaturas.

Integração de Chat com Evo AI (A2A)

Para o chat interno, usaremos Evo AI, uma plataforma open-source de agentes de IA que suporta o protocolo Agent-to-Agent (A2A) do Google ￼. Isso permite que agentes de IA conversacionais sejam configurados e usados pela empresa. A ideia:
	•	No painel do SuperAdmin (ou painel mestre), haverá uma seção “Agentes de IA”. O SuperAdmin cadastra novos agentes indicando URL do agente, chave da API e atribuições.
	•	Ao criar um agente, escolhemos quais Admins de empresa terão acesso a ele (registro em agent_assignments). Por exemplo, “Ativar Agente X para Admin da Empresa Y”.
	•	Cada Admin que tenha agentes habilitados verá, em seu dashboard, botões/ícones correspondentes a esses agentes. Clicando neles, abre-se um chat (bolhas de mensagem) integrado via API Evo AI. O chat funciona usando o protocolo A2A – entre o usuário e o agente Evo AI – mas é transparente para o usuário.
	•	A Evo AI suporta vários tipos de agentes (LLM, fluxo de trabalho, etc.), mas no mínimo oferece chat baseado em GPT/Claude com contexto ￼ ￼. O frontend chat simplesmente manda requisições HTTP à API do Evo (ou ao nosso backend que faz proxy) e exibe respostas em tempo real.

Em suma, a plataforma de chat é apenas uma interface de conversação; a lógica e contexto ficam no Evo AI. A documentação oficial do Evo AI destaca que “Evo AI implementa o protocolo A2A do Google, permitindo comunicação e interoperabilidade entre agentes de IA” ￼. Usaremos essa funcionalidade para que cada empresa tenha seus agentes independentes, configurados pelo SuperAdmin, e acessíveis via seus Admins/usuários.

Estrutura de Pastas (Scaffold) e Deploy
	•	Frontend: um projeto estático (por exemplo, Next.js em modo SSG/CSR ou mesmo HTML/Tailwind/JS vanilla). Sugestão: /frontend com subpastas /src/components, /pages (home, login, dashboard_superadmin, dashboard_admin, dashboard_user, checkout, etc.), /public (imagens). As dependências incluem TailwindCSS, MagicUI scripts, e bibliotecas JS para supabase e calls de API (Evo, Pagamentos). O arquivo de configuração definirá variáveis de ambiente (URLs do Supabase, chaves públicas).
	•	Backend/API: idealmente sem servidor próprio: usaríamos o Supabase como backend. Não precisaríamos de pasta separada de backend: apenas funções serverless (Edge Functions), mapeadas no Supabase ou em Vercel. Se optarmos por Node.js tradicional, criaríamos /backend com Express + Prisma (PostgreSQL) e endpoints para login, dados de usuário, pagamentos, agentes, seguindo um padrão MVC. Porém, dado o requisito de deploy simples, preferimos depender do Supabase.
	•	Banco de Dados: Tabelas e migrations (Se usarmos Prisma ou Supabase SQL). Ex.: /db/schema.prisma ou SQL de criação de tabelas. Se Supabase, definimos o schema pelo console ou arquivo SQL.
	•	Autenticação: Configurar Supabase Auth (GoTrue) com e-mail/senha. Usar RLS para separar dados (cada query já filtra pelo company_id). Para deploy fácil, hospedamos o front-end no Cloud Panel como site estático (basta copiar arquivos HTML/JS/CSS). O Supabase roda no cloud. Se usássemos NocoDB, faríamos deploy num subdomínio do mesmo servidor (NocoDB via Docker ou cPanel) e acessaríamos sua API por JS.

Estrutura Exemplar de Pastas (modelo)

/frontend
  /src
    /components   # React/Vue components ou arquivos HTML parciais
    /pages        # HTML/JSX das páginas (home, login, dashboard, etc.)
    /styles       # CSS/Tailwind config
  /public         # Imagens, ícones, favicon
  package.json
/backend (opcional: apenas se não usar Supabase)
  /src
    /controllers  # lógica dos endpoints
    /models       # esquemas do ORM (Prisma)
    /routes
  package.json
/db
  schema.sql       # ou prisma/schema.prisma
/.env.example      # variáveis de ambiente (APIs keys, DB URL, etc.)

Considerações de Deploy
	•	Hospedagem Front-end: como a home é estática, basta fazer upload no Cloud Panel (cPanel/Plesk) ou serviço de hospedagem web (mesmo subdomínio do SaaS). As chamadas de API (login, dados, pagamentos, Evo) serão feitas diretamente dos navegadores usando JS/fetch.
	•	Sem Back-end Dedicado: favorece Deploy “um clique”. Se usamos Supabase, não há servidor para manter; apenas configurações do projeto no console Supabase. Em cada atualização, atualizamos os arquivos estáticos e publicamos.
	•	CI/CD (opcional): poderíamos usar GitHub + Netlify/Vercel para build automático, mas o Cloud Panel exige talvez fazer upload manual ou configurar FTP/Git. É mais fácil se mantivermos tudo “serverless” e pusharmos o /public.

Resumo dos Pontos Principais
	•	Sistema SaaS multi-tenant (empresa com admin/usuários) ￼ ￼.
	•	Home page estática (HTML/CSS/Tailwind) com componentes animados (Magic UI via CDN) ￼.
	•	Login/Cadastro integrado ao Supabase ou NocoDB para contas e controle de acesso seguro (JWT + RLS) ￼ ￼.
	•	Painéis/admin com CRUD de empresas, usuários, planos, com segregação por organização.
	•	Pagamentos via API Pix (OpenPix/Asaas) integrados ao fluxo de planos (criando cobranças e atualizando status) ￼.
	•	Chat interno usando Evo AI: SuperAdmin cadastra agentes e atribui a Admins/usuários; cada um conversa com o bot via A2A ￼.
	•	Arquitetura leve: front-end estático + APIs externas (minimizando código servidor).

Este detalhamento e a modelagem orientam o desenvolvedor sobre tecnologias, pastas e responsabilidades de cada parte. Com isso, ele poderá implementar as páginas (home, checkout, login, dashboards) e ligar tudo às APIs (Supabase, OpenPix/Asaas, Evo AI) conforme especificado. Cada camada (UI, back-end, DB) foi pensada para ser modular e facilmente atualizável conforme as instruções acima.

Fontes: Documentação e posts técnicos sobre multi-tenancy e ferramentas mencionadas ￼ ￼ ￼ ￼ ￼ ￼.