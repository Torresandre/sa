# SA Salão - Sistema de Agendamento

Sistema de agendamento e controle para salões de beleza.

## Stack

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **Container**: Docker + Docker Compose

## Requisitos

- Node.js 18+
- Docker e Docker Compose (para desenvolvimento com containers)
- PostgreSQL (se preferir instalação local)

## Instalação

### 1. Instalar dependências

```bash
# Instalar todas as dependências
npm run install:all
```

### 2. Configurar banco de dados

```bash
# Copiar arquivo de ambiente
cd backend
copy .env.example .env

# Gerar cliente Prisma
npx prisma generate

# Criar tabelas
npx prisma migrate dev --name init

# Popular dados iniciais
node prisma/seed.js
```

### 3. Iniciar aplicação

```bash
# Backend (porta 4000)
cd backend
npm run dev

# Frontend (porta 3000) - em outro terminal
cd frontend
npm run dev
```

### Com Docker

```bash
npm run docker:up
```

## Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

### Usuários Padrão

| Email | Senha | Role |
|-------|-------|------|
| admin@salon.com | admin123 | ADMIN |
| ana@salon.com | stylist123 | STYLIST |
| recep@salon.com | recep123 | RECEPTIONIST |

## Estrutura do Projeto

```
sa/
├── frontend/           # React + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
├── backend/           # Express + Prisma
│   ├── src/
│   │   └── main.js
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
├── infra/             # Docker
└── README.md
```

## Funcionalidades

- [x] Autenticação (JWT)
- [x] Gestão de clientes
- [x] Catálogo de serviços
- [x] Marcação de atendimentos
- [x] Agenda de profissionais
- [x] Relatórios básicos
- [ ] Envio de confirmações
- [ ] Aplicativo mobile
- [ ] Multi-tenant

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço

### Atendimentos
- `GET /api/appointments` - Listar atendimentos
- `POST /api/appointments` - Criar atendimento

### Profissionais
- `GET /api/staff` - Listar profissionais

### Relatórios
- `GET /api/reports/dashboard` - Dados do dashboard

## Licença

MIT
