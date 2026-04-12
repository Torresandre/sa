<system-reminder>Your operational mode has changed from plan to build. You are no longer in read-only mode.</system-reminder>

Task Backlog — MVP Salão Único (mobile-first com TailwindCSS)

1) Preparar ambiente do repositório
- Descrição: configurar repositório, dependências e scripts básicos (frontend + backend) para iniciar o MVP.
- Critérios de aceitação:
  - Repositório com pastas src/frontend e src/backend; setup básico de TS/tsconfig
  - Scripts de build/run para frontend e backend
- Estimativa: 4h
- Dependências: nenhuma

2) Configurar Tailwind no frontend
- Descrição: instalar TailwindCSS, configurar postcss, purge/presence de conteúdo, e criar estilo base com tokens de design
- Critérios de aceitação:
  - Tailwind funcionando com classes utilitárias disponíveis
  - Tema/modo mobile-first aplicado ao layout base
- Estimativa: 6h
- Dependências: Preparar estrutura de pastas de styles

3) Estruturar frontend com routing
- Descrição: criar estrutura de React com rotas simples (Login, Dashboard, Clientes, Serviços, Agenda)
- Critérios de aceitação:
  - Roteamento funcional entre páginas
  - Proteção de rotas via autenticação básica (placeholder)
- Estimativa: 6h
- Dependências: Tailwind configurado

4) Configurar DB local com Postgres e Prisma
- Descrição: levantar Postgres local (docker-compose opcional), configurar Prisma para conexão
- Critérios de aceitação:
  - Conexão Prisma estabelecida com o DB local
  - Prisma Client gerado
- Estimativa: 6h
- Dependências: acesso a DB local

5) Definir modelo Prisma (esquema inicial)
- Descrição: criar esquema inicial com Salon, Staff, Customer, Service, Appointment, Schedule
- Critérios de aceitação:
  - Schema refletindo entidades do MVP
  - FKs entre tabelas definidas
- Estimativa: 6h
- Dependências: DB e Prisma prontos

6) Gerar migrations e aplicar
- Descrição: criar e aplicar migrations do Prisma no DB local
- Critérios de aceitação:
  - Migrations geradas e aplicadas com sucesso
- Estimativa: 2h
- Dependências: Esquema Prisma pronto

7) Implementar autenticação (Auth)
- Descrição: fluxo de login/logout, JWT com refresh token
- Critérios de aceitação:
  - Endpoints de login/refresh funcionando; tokens válidos
- Estimativa: 12h
- Dependências: Prisma models (User, Salon) e RBAC

8) Implementar RBAC (roles)
- Descrição: definir papéis admin, receptionist, stylist com permissões básicas
- Critérios de aceitação:
  - Middleware/guards para autorização
  - Diferentes acessos conforme o papel
- Estimativa: 8h
- Dependências: Auth

9) Serviço de Clientes (CRUD)
- Descrição: CRUD de clientes, histórico de atendimentos
- Critérios de aceitação:
  - Endpoints create/read/update/delete; validações
  - Associação de atendimentos ao cliente
- Estimativa: 12h
- Dependências: Prisma models (Customer, Appointment)

10) Catálogo de Serviços (CRUD)
- Descrição: CRUD de serviços (nome, duração, preço, categoria)
- Critérios de aceitação:
  - Endpoints CRUD; validações de duração/preço
- Estimativa: 12h
- Dependências: Service

11) Agenda de Staff (horários)
- Descrição: horários de trabalho por profissional; disponibilidade
- Critérios de aceitação:
  - CRUD de Schedule; associação com Staff
- Estimativa: 10h
- Dependências: Staff

12) Marcação de Atendimentos
- Descrição: criar reserva associando cliente, serviço, staff, horário
- Critérios de aceitação:
  - Reserva válida com conflitos de horário evitados
- Estimativa: 12h
- Dependências: Cliente, Service, Staff, Schedule

13) Confirmações por e-mail (módulo básico)
- Descrição: envio de confirmação por e-mail via serviço externo
- Critérios de aceitação:
  - E-mail de confirmação disparado após criação de atendimento
- Estimativa: 8h
- Dependências: Vínculo com serviço de envio (Mailgun/SendGrid)

14) Painel da Recepcionista
- Descrição: dashboard com agenda, clientes, serviços e staff
- Critérios de aceitação:
  - Visualização clara da agenda do dia; ações rápidas (confirmação, remarcação)
- Estimativa: 12h
- Dependências: Frontend routing, Tailwind

15) Relatórios básicos
- Descrição: geração de relatório diário (faturamento, serviços mais pedidos, agenda)
- Critérios de aceitação:
  - Endpoints/UI para visualizar dados diários
- Estimativa: 8h
- Dependências: Data models, queries agregadas

16) Painel Administrativo
- Descrição: acesso a gestão de clientes, serviços, staff, horários e relatórios
- Critérios de aceitação:
  - Acesso completo a CRUDs existentes; exportação de dados básica
- Estimativa: 12h
- Dependências: RBAC, UI

17) Testes manuais e validação de fluxo
- Descrição: validar fluxo de reserva, edição, cancelamento e relatórios
- Critérios de aceitação:
  - Fluxos sem erros críticos
- Estimativa: 6h
- Dependências: MVP funcional

18) Dockerização (frontend/backend)
- Descrição: criar imagens Docker para frontend e backend
- Critérios de aceitação:
  - Builds separadas com Dockerfiles
- Estimativa: 6h
- Dependências: infra

19) Orquestração com Docker Compose
- Descrição: orquestrar frontend, backend e DB com compose
- Critérios de aceitação:
  - Compose up rodando localmente com dados de seed
- Estimativa: 4h
- Dependências: Dockerization

20) CI/CD
- Descrição: configurar pipeline de CI/CD (lint, test, build, deploy)
- Critérios de aceitação:
  - GitHub Actions runs com sucesso; artefatos gerados
- Estimativa: 4h
- Dependências: Compose

21) Seed de dados inicial
- Descrição: seed básico de salão, staff, serviços para ambiente local
- Critérios de aceitação:
  - DB populado com dados de exemplo
- Estimativa: 6h
- Dependências: DB

22) Documentação básica
- Descrição: README + notas de arquitetura e setup
- Critérios de aceitação:
  - Guia de instalação e run completo
- Estimativa: 4h
- Dependências: Todas

23) Planejamento multi-tenant (futuro)
- Descrição: documento de visão/mudanças para migrar para multi-tenant
- Critérios de aceitação:
  - Cenários de tenant isolation mapeados; plano de migração
- Estimativa: 4h
- Dependências: MVP estável

Observações
- As estimativas são aproximadas e podem ser ajustadas conforme a prioridade e a disponibilidade da equipe.
- O foco inicial é MVP Salão Único com base nas decisões de arquitetura discutidas.
