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
- `GET /api/reports/dashboard` - Estatísticas

## Licença

Projeto privado - Elaine Cabeleireiro
