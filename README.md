# Elaine Cabeleireiro - Sistema de Agendamento

Sistema completo de agendamento e gestão para salão de beleza, desenvolvido para Portugal (Lisboa).

## Identidade Visual

| Elemento | Cor | Hex |
|----------|-----|-----|
| **Primária** | Dourado | `#d3ac39` |
| **Fundo** | Preto | `#000000` |
| **Cards** | Cinza Escuro | `#1a1a1a` |
| **Bordas** | Cinza Médio | `#2d2d2d` |
| **Texto Principal** | Branco | `#ffffff` |
| **Texto Secundário** | Cinza Claro | `#9ca3af` |

**Fontes:**
- Títulos: Georgia, serif (elegante)
- Corpo: Inter, system-ui, sans-serif (moderna)

## Funcionalidades

### Autenticação e Segurança
- Login com JWT (access token 15min + refresh token 7d)
- Refresh token em httpOnly cookie
- RBAC: Admin, Recepcionista, Profissional
- Helmet.js, Rate Limiting, CORS, Zod Validation
- Audit log de todas as operações

### Gestão de Clientes
- Cadastro completo (nome, telefone, email, observações)
- Busca e listagem
- Exclusão com confirmação

### Catálogo de Serviços
- Cadastro com nome, descrição, duração, preço, categoria
- Formatação de preços em EUR (€)
- Visualização em cards

### Agendamentos
- Calendário semanal com 7 dias
- Seleção de cliente, serviço, profissional e data/hora
- Detecção de conflitos (não permite sobreposição)
- Status: Aguardando → Confirmado → Concluído/Cancelado
- Profissionais veem apenas seus agendamentos

### Profissionais
- Gestão de profissionais (Admin)
- Ativação/Desativação
- Roles: Administrador, Recepcionista, Profissional

### Relatórios
- Dashboard com estatísticas reais
- Total de atendimentos, faturamento, novos clientes, ticket médio
- Serviços mais solicitados
- Atendimentos por dia

### Administração
- Gestão de usuários do sistema
- Configurações do salão
- Endereço: Estr. de Benfica 749, 1500-110 Lisboa
- Telefone: +351 215 853 396

## Tecnologias

### Frontend
- React 18 + Vite
- TailwindCSS 3.4
- React Router DOM 6
- Axios (com interceptors para refresh token)
- Lucide React (ícones)

### Backend
- Express.js
- Prisma ORM 5.10
- PostgreSQL 15
- JWT (jsonwebtoken)
- bcrypt (12 rounds)
- Zod (validação)
- Helmet, CORS, Rate Limiting
- **Criptografia:** AES-256-CBC via Prisma middleware (colunas Customer.phone, Customer.email, Salon.phone, Salon.email)
- **SSL/TLS:** Conexão PostgreSQL com `sslmode=require` (certificado auto-assinado)

## Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+

### Passos

```bash
# Clonar repositório
git clone <url>
cd sa

# Instalar dependências
npm install

# Configurar banco de dados
cd backend
cp .env.example .env  # Configurar URL do PostgreSQL

# Aplicar schema
npx prisma db push

# Seed de dados
npx prisma db seed

# Iniciar backend (porta 4000)
npm run dev

# Iniciar frontend (porta 3000)
cd ../frontend
npm run dev
```

## Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@salon.com | admin123 |
| Profissional | ana@salon.com | stylist123 |
| Profissional | carlos@salon.com | stylist123 |
| Recepcionista | recep@salon.com | recep123 |

## Estrutura do Projeto

```
sa/
├── frontend/
│   ├── public/
│   │   └── logo.svg          # Logo do salão
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx     # Cabeçalho dourado/preto
│   │   │   ├── Sidebar.tsx    # Menu lateral dourado/preto
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ClientsPage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── AppointmentsPage.tsx
│   │   │   ├── SchedulePage.tsx
│   │   │   ├── ProfessionalsPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── utils/
│   │       └── currency.ts
│   ├── tailwind.config.js    # Paleta gold/salon
│   └── index.html
├── backend/
│   ├── src/
│   │   └── main.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── .env
├── task.md
└── README.md
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Clientes
- `GET /api/clients` - Listar
- `POST /api/clients` - Criar
- `PUT /api/clients/:id` - Atualizar
- `DELETE /api/clients/:id` - Excluir

### Serviços
- `GET /api/services` - Listar
- `POST /api/services` - Criar
- `PUT /api/services/:id` - Atualizar
- `DELETE /api/services/:id` - Excluir

### Atendimentos
- `GET /api/appointments` - Listar (filtro por data)
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar status

### Profissionais
- `GET /api/staff` - Listar
- `POST /api/staff` - Criar
- `PUT /api/staff/:id` - Atualizar (ativar/desativar)

### Relatórios
- `GET /api/reports/dashboard` - Estatísticas do dia
- `GET /api/reports/summary` - Resumo mensal (faturamento, ticket médio, novos clientes)
- `GET /api/reports/top-services` - Serviços mais pedidos (filtro por data)
- `GET /api/reports/staff-history` - Histórico por profissional (filtro por data)
- `GET /api/reports/daily` - Atendimentos por dia (filtro por data)

### Salão
- `GET /api/salon` - Dados do salão
- `PUT /api/salon` - Atualizar salão (ADMIN)

### Horários
- `GET /api/schedules` - Listar horários
- `POST /api/schedules` - Criar horário
- `PUT /api/schedules/:id` - Atualizar horário
- `DELETE /api/schedules/:id` - Excluir horário

### Exportação
- `GET /api/export/clients` - Exportar clientes (CSV)
- `GET /api/export/appointments` - Exportar agendamentos (CSV)

---

## Deploy (Render + Neon) — Gratuito

### Arquitetura

```
Frontend (Render Static)  →  Backend (Render Web Service)  →  Neon PostgreSQL
     React/Vite                    Express/Prisma                 Free 0.5GB
```

### Passo 1 — Criar banco no Neon

1. Acesse https://neon.tech e crie uma conta gratuita
2. Crie um novo projeto (ex: `sa-salon`)
3. Na página do projeto, copie a **connection string**:
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/sa_salao?sslmode=require
   ```
4. Guarde essa URL para usar no Render

### Passo 2 — Criar conta no Render

1. Acesse https://render.com e crie uma conta (pode usar GitHub login)
2. Conecte seu repositório `Torresandre/sa`

### Passo 3 — Deploy via Blueprint

1. No Render, clique em **New +** → **Blueprint**
2. Conecte o repositório GitHub `Torresandre/sa`
3. O Render detectará o `automatic deployment: true` e criará os serviços automaticamente
4. Aguarde o primeiro build (pode demorar alguns minutos)

### Passo 4 — Configurar variáveis de ambiente

#### Backend (`sa-backend`)

No painel do serviço backend, vá em **Environment** e adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | URL do Neon (copiada no Passo 1) |
| `FRONTEND_URL` | `https://sa-frontend.onrender.com` |
| `JWT_SECRET` | Gere um aleatório (ex: `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Gere outro aleatório |
| `ENCRYPTION_KEY` | 32 caracteres (ex: `xK8m2pQ7vN3wR5tY9bC4dF6gH0jL2kM8`) |
| `NODE_ENV` | `production` |

> **Nota:** `JWT_SECRET`, `JWT_REFRESH_SECRET` e `ENCRYPTION_KEY` já terão valores gerados pelo `render.yaml`. Só precisa configurar `DATABASE_URL` e `FRONTEND_URL`.

#### Frontend (`sa-frontend`)

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://sa-backend.onrender.com/api` |

> **Importante:** Configure `VITE_API_URL` **antes** do build. Caso contrário, faça um redeploy manual.

### Passo 5 — Seed de dados (opcional)

Ap o deploy, acesse o console do Render (ou use `psql` via Neon) para rodar o seed:

```bash
# No terminal do Render (Shell do backend)
npx prisma db seed
```

Ou conecte-se diretamente ao Neon e execute o SQL do seed.

### Passo 6 — Verificar

- Frontend: `https://sa-frontend.onrender.com`
- Backend: `https://sa-backend.onrender.com/api/health`
- Login: `admin@salon.com` / `admin123`

### Limitações do Free Tier

| Serviço | Limitação |
|---------|-----------|
| **Render Free** | 750h/mês, spin-down após 15min sem tráfego (~30s cold start) |
| **Neon Free** | 0.5 GB armazenamento, compute 24/7 |

### Variáveis de ambiente (referência)

| Variável | Descrição | Onde usar |
|----------|-----------|-----------|
| `DATABASE_URL` | URL do PostgreSQL (Neon) | Backend |
| `JWT_SECRET` | Segredo para assinatura de tokens | Backend |
| `JWT_REFRESH_SECRET` | Segredo para refresh tokens | Backend |
| `ENCRYPTION_KEY` | Chave AES-256 para criptografia de colunas | Backend |
| `PORT` | Porta do servidor (Render define automaticamente) | Backend |
| `NODE_ENV` | `production` ou `development` | Backend |
| `FRONTEND_URL` | URL do frontend (para CORS) | Backend |
| `VITE_API_URL` | URL da API (para o React) | Frontend (build) |

## Licença

Projeto privado - Elaine Cabeleireiro
