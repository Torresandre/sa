# Agents Guide - SA Salão

## Padrão de Commits

Este projeto segue o padrão **Conventional Commits** para manter consistência no histórico do repositório.

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação, indentação (sem mudança de código) |
| `refactor` | Refatoração de código |
| `perf` | Melhoria de performance |
| `test` | Adição ou correção de testes |
| `build` | Mudanças em build ou dependências |
| `ci` | Mudanças em CI/CD |
| `chore` | Tarefas gerais (deps, configs) |
| `revert` | Reverte commit anterior |

### Escopos (Scopes)

| Escopo | Descrição |
|--------|-----------|
| `frontend` | Componentes, páginas, estilos |
| `backend` | API, lógica de negócio |
| `database` | Models, migrations, seeds |
| `auth` | Autenticação, JWT, RBAC |
| `api` | Endpoints, DTOs |
| `infra` | Docker, docker-compose |
| `config` | Configurações gerais |

### Regras

1. **Mensagem em português** ou **inglês** (escolha um e mantenha)
2. **Descrição curta** (max 72 caracteres)
3. **Tipo em minúsculo**
4. **Escopo opcional** (usar quando aplicável)

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(frontend): add login page"
git commit -m "feat(backend): add client CRUD endpoints"
git commit -m "feat(auth): implement JWT authentication"

# Correção de bug
git commit -m "fix(frontend): correct date format in appointments"
git commit -m "fix(backend): resolve schedule conflict validation"
git commit -m "fix(auth): fix token expiration handling"

# Documentação
git commit -m "docs: update README with installation steps"
git commit -m "docs(backend): add API documentation for clients"

# Refatoração
git commit -m "refactor(frontend): extract Sidebar component"
git commit -m "refactor(backend): simplify appointment service"

# Estilo
git commit -m "style(frontend): format code with prettier"

# Performance
git commit -m "perf(backend): optimize database queries for reports"

# Testes
git commit -m "test(frontend): add tests for LoginPage"
git commit -m "test(backend): add integration tests for clients API"

# Build/CI
git commit -m "build: upgrade React to v18"
git commit -m "ci: add GitHub Actions workflow"

# Tarefas gerais
git commit -m "chore: add ESLint configuration"
git commit -m "chore(deps): update Tailwind to v3.4"
git commit -m "chore(database): add seed data for testing"

# Reverter
git commit -m "revert: revert 'feat(auth): add refresh token'"
```

## Branches

### Nomenclatura

```
<tipo>/<descricao-curta>
```

### Exemplos

```bash
# Feature
git checkout -b feat/add-appointment-reminders
git checkout -b feat/implement-reports-dashboard

# Bugfix
git checkout -b fix/login-redirect-loop
git checkout -b fix/date-picker-timezone

# Hotfix
git checkout -b hotfix/security-patch-auth
git checkout -b hotfix/database-connection-timeout

# Refactor
git checkout -b refactor/auth-module
git checkout -b refactor/database-schema

# Docs
git checkout -b docs/api-documentation
```

## Releases

### Versionamento Semântico (SemVer)

```
v<MAJOR>.<MINOR>.<PATCH>
```

| Parte | Incremento quando |
|-------|-------------------|
| MAJOR | Breaking changes |
| MINOR | Novas funcionalidades (compatível) |
| PATCH | Correções (compatível) |

### Tags

```bash
# Após completar uma versão
git tag -a v1.0.0 -m "feat: projeto inicial com MVP"
git tag -a v1.1.0 -m "feat: adiciona relatórios básicos"
git tag -a v1.1.1 -m "fix: corrige validação de agendamento"
```

## Fluxo de Trabalho

### 1. Criar Branch
```bash
git checkout -b feat/minha-nova-funcionalidade
```

### 2. Desenvolver e Commitar
```bash
git add .
git commit -m "feat(frontend): add new feature component"
```

### 3. Atualizar main/develop
```bash
git checkout main
git pull origin main
```

### 4. Fazer Merge
```bash
git checkout main
git merge feat/minha-nova-funcionalidade
git push origin main
```

### 5. Deletar Branch (opcional)
```bash
git branch -d feat/minha-nova-funcionalidade
```

## Hooks (Opcional)

Para garantir que commits sigam o padrão, adicione um commit-msg hook:

```bash
# .git/hooks/commit-msg
#!/bin/sh

commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,72}"

if ! echo "$commit_msg" | grep -Eq "$pattern"; then
    echo "Commit message does not follow Conventional Commits format!"
    exit 1
fi
```

## Checklist Antes do Commit

- [ ] Código formatado
- [ ] Sem console.log ou debug
- [ ] Testes passando
- [ ] Mensagem seguindo padrão
- [ ] Arquivos necessários adicionados

## Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Strategy](https://guides.github.com/introduction/flow/)
