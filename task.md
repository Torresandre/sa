# Task Backlog — SA Salão

## Status

| Estado | Descrição |
|--------|-----------|
| ✅ | Concluído |
| 🔄 | Em progresso |
| ⏳ | Pendente |

---

## ✅ Tarefas Concluídas

### 1) Preparar ambiente do repositório
- **Estado:** ✅ Concluído
- Repositório com pastas `frontend` e `backend` (npm workspaces)
- Scripts de build/run para frontend e backend
- Docker Compose configurado

### 2) Configurar Tailwind no frontend
- **Estado:** ✅ Concluído
- TailwindCSS 3.4 funcionando com classes utilitárias
- Tema mobile-first com paleta primary (purple)
- PostCSS configurado

### 3) Estruturar frontend com routing
- **Estado:** ✅ Concluído
- React Router DOM 6.22 com rotas: Login, Dashboard, Clientes, Serviços, Atendimentos, Agenda, Profissionais, Relatórios, Admin
- ProtectedRoute com autenticação via AuthContext
- Sidebar com role-based filtering

### 4) Configurar DB local com Postgres e Prisma
- **Estado:** ✅ Concluído
- PostgreSQL 15 local configurado
- Prisma 5.10 com schema completo
- Conexão via `127.0.0.1:5432`

### 5) Definir modelo Prisma (esquema completo)
- **Estado:** ✅ Concluído
- Models: Salon, User, Staff, Customer, Service, Schedule, Appointment, RefreshToken, AuditLog
- Enums: UserRole, AppointmentStatus
- Relações FK configuradas com cascade
- Defaults para Portugal (EUR, PT, Europe/Lisbon)

### 6) Gerar migrations e aplicar
- **Estado:** ✅ Concluído
- `prisma db push` aplicado com sucesso
- Prisma Client gerado

### 7) Implementar autenticação (Auth)
- **Estado:** ✅ Concluído
- Login via JWT com access token (15min) + refresh token (7d)
- Refresh token armazenado em httpOnly cookie
- Endpoint `/api/auth/refresh` para renovação automática
- Endpoint `/api/auth/logout` para revogação do refresh token
- Frontend auto-refresh 1 min antes de expirar

### 8) Implementar RBAC (roles)
- **Estado:** ✅ Concluído
- Roles: ADMIN, RECEPTIONIST, STYLIST
- Middleware `requireRole()` para controle de acesso
- Sidebar esconde itens conforme papel do usuário
- Profissionais (STYLIST) veem apenas seus próprios agendamentos

### 9) Serviço de Clientes (CRUD)
- **Estado:** ✅ Concluído
- `GET/POST/PUT/DELETE /api/clients`
- Frontend integrado com API real + modal de criação
- Validação Zod no backend

### 10) Catálogo de Serviços (CRUD)
- **Estado:** ✅ Concluído
- `GET/POST/PUT/DELETE /api/services`
- Frontend integrado com API real + modal de criação
- Validação Zod (duração 5-480min, preço positivo)
- Preços formatados em EUR (€)

### 11) Marcação de Atendimentos
- **Estado:** ✅ Concluído
- `GET/POST/PUT /api/appointments`
- Verificação de conflito de horário (não permite sobreposição)
- Profissionais veem apenas seus agendamentos (`?my=true`)
- Botões para confirmar/cancelar/concluir na UI
- Validação Zod com UUID

### 12) Painel da Recepcionista / Profissional
- **Estado:** ✅ Concluído
- Dashboard com estatísticas reais da API
- Profissionais podem criar serviços e agendamentos
- Admin pode gerenciar profissionais (ativar/desativar)

### 13) Seed de dados inicial
- **Estado:** ✅ Concluído
- Seed com salão, 4 utilizadores, 10 serviços, 4 clientes, 3 agendamentos
- Credenciais: admin@salon.com/admin123, ana@salon.com/stylist123, recep@salon.com/recep123
- Preços adaptados para Portugal (EUR)

---

## 🔄 Tarefas em Progresso

### 14) Relatórios básicos
- **Estado:** 🔄 Parcial
- Endpoint `GET /api/reports/dashboard` com dados reais (faturamento calculado)
- Frontend com dashboard conectado à API
- Falta: relatórios de services mais pedidos, histórico por profissional

### 15) Painel Administrativo
- **Estado:** 🔄 Parcial
- Página de Admin com gestão de utilizadores (mock data)
- Gestão de profissionais integrada com API
- Falta: gestão de salão integrada, exportação de dados

---

## ⏳ Tarefas Pendentes

### 16) Agenda de Staff (horários)
- **Estado:** ⏳ Pendente
- Horários de trabalho por profissional; disponibilidade
- Frontend SchedulePage com mock data

### 17) Confirmações por e-mail
- **Estado:** ⏳ Pendente
- Envio de confirmação por e-mail via serviço externo

### 18) Testes automatizados
- **Estado:** ⏳ Pendente
- Testes unitários e de integração

### 19) Dockerização (frontend/backend)
- **Estado:** ⏳ Pendente
- Docker Compose configurado mas não testado

### 20) CI/CD
- **Estado:** ⏳ Pendente
- GitHub Actions pipeline

### 21) Documentação
- **Estado:** ⏳ Pendente
- README completo com guia de instalação

---

## Segurança Implementada

| Medida | Estado | Descrição |
|--------|--------|-----------|
| Helmet.js | ✅ | Headers de segurança (CSP, HSTS, X-Frame-Options) |
| Rate Limiting | ✅ | Geral (100/15min), Login (5/15min), API (60/min) |
| CORS Restrito | ✅ | Apenas origem do frontend |
| JWT Access Token | ✅ | Expira em 15 minutos |
| JWT Refresh Token | ✅ | Expira em 7 dias (httpOnly cookie) |
| Zod Validation | ✅ | Validação de schema em todas as rotas |
| Senha Forte | ✅ | 8+ chars, maiúscula, minúscula, número, especial |
| Audit Log | ✅ | Registra login, logout, CRUD |
| Body Parsing Limit | ✅ | Máximo 10kb |
| Compression | ✅ | Gzip para reduzir payload |
| Morgan Logging | ✅ | Logging de todas as requests |
| Verificação Conflito | ✅ | Não permite agendamentos sobrepostos |

---

## Adaptado para Portugal

| Campo | De | Para |
|-------|----|----|
| País | BR | PT |
| Moeda | BRL (R$) | EUR (€) |
| Timezone | America/Sao_Paulo | Europe/Lisbon |
| Formato moeda | R$ 50,00 | 50,00 € |
| Telefones | (11) 99999-9999 | +351 900 000 000 |

---

## Credenciais de Teste

| Perfil | Email | Senha |
|--------|--------|-------|
| Admin | admin@salon.com | admin123 |
| Profissional | ana@salon.com | stylist123 |
| Profissional | carlos@salon.com | stylist123 |
| Recepcionista | recep@salon.com | recep123 |

---

## Observações

- As estimativas são aproximadas e podem ser ajustadas conforme a prioridade.
- O foco inicial é MVP Salão Único com base nas decisões de arquitetura discutidas.
- Projeto adaptado para Portugal (Lisboa) com moeda EUR e timezone Europe/Lisbon.
