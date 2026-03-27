# Plataforma Escolar

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-3.14+-A30000)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

Aplicação web fullstack para gerenciamento de atividades escolares. Professores criam atividades e corrigem respostas com nota e feedback. Alunos visualizam atividades da sua turma, enviam respostas e acompanham correções. Administradores gerenciam usuários, turmas, atividades e respostas de todo o sistema.

<!-- Descomente e adicione o caminho quando tiver screenshots
## Demo

| Login | Dashboard Professor | Dashboard Aluno |
|-------|-------------------|-----------------|
| ![Login](docs/screenshots/login.png) | ![Professor](docs/screenshots/professor.png) | ![Aluno](docs/screenshots/aluno.png) |
-->

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Django 4.2+, Django REST Framework, SimpleJWT, PostgreSQL |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui (base-nova) |
| Formulários | TanStack Form + Zod (validação com schemas tipados) |
| Estado | Zustand (auth, theme, toast), React Query (server state) |
| URL Params | nuqs (search params sincronizados com a URL) |
| Infra | Docker, Docker Compose |

## Pré-requisitos

- Python 3.10+
- Node.js 20+ (Vite 8 requer 20.19+)
- Docker e Docker Compose
- npm

## Setup Rápido

### 1. Variáveis de ambiente

```bash
cp .env.example backend/.env
```

Edite `backend/.env` se necessário. Valores default funcionam para desenvolvimento local.

### 2. Banco de dados

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Backend

```bash
# Criar e ativar ambiente virtual
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r backend/requirements.txt

# Rodar migrations
python manage.py migrate

# Criar admin (superuser)
python manage.py createsuperuser

# Popular banco com dados de exemplo (opcional)
python seed.py

# Iniciar servidor
python manage.py runserver
```

Backend disponível em `http://localhost:8000`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:5173`

### 5. Credenciais de teste (após rodar seed.py)

| Email | Senha | Papel |
|-------|-------|-------|
| admin@escola.com | admin123 | Superuser |
| silva@escola.com | senha123 | Professor |
| ana.souza@escola.com | senha123 | Aluno |

Todos os usuários criados pelo seed usam senha `senha123`. O login é feito por **email + senha**.

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_NAME` | Nome do banco | `escola` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |
| `SECRET_KEY` | Chave secreta do Django | insecure key (dev only) |
| `DEBUG` | Modo debug | `True` |

## Estrutura do Projeto

```
plataforma-escolar/
├── accounts/                   # App de usuários e autenticação
│   ├── models.py               # User (AbstractUser + email login + role + turma M2M)
│   ├── serializers.py          # UserSerializer, UserMeSerializer, UserAdminSerializer, UserCreateSerializer
│   ├── views.py                # Login, me, stats, registro, listagem admin, toggle
│   ├── permissions.py          # IsProfessor, IsAluno (superuser bypass)
│   ├── pagination.py           # Helper de paginação para FBVs
│   ├── urls.py
│   └── admin.py
├── turmas/                     # App de turmas
│   ├── models.py               # Turma
│   ├── serializers.py          # TurmaSerializer, TurmaCreateSerializer
│   ├── views.py                # CRUD + listagem pública
│   ├── urls.py
│   └── admin.py
├── atividades/                 # App de atividades
│   ├── models.py               # Atividade (FK professor, M2M turma)
│   ├── serializers.py          # AtividadeSerializer
│   ├── views.py                # CRUD + respostas da atividade + endpoints admin
│   ├── urls.py
│   └── admin.py
├── respostas/                  # App de respostas
│   ├── models.py               # Resposta (FK atividade + aluno, unique_together)
│   ├── serializers.py          # RespostaSerializer
│   ├── views.py                # Envio, edição, correção + endpoint admin
│   ├── urls.py
│   └── admin.py
├── backend/                    # Configuração Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios config + React Query client
│   │   ├── components/         # Componentes reutilizáveis + shadcn/ui
│   │   ├── hooks/              # useAuth, useAtividades, useDebounce, useToast
│   │   ├── pages/              # admin/ (7), aluno/ (4), professor/ (5), Login, Register
│   │   ├── routes/             # React Router + NuqsAdapter
│   │   ├── schemas/            # Zod schemas de validação (login, registro, atividade)
│   │   ├── services/           # Chamadas HTTP (auth, atividade, admin, user, turma)
│   │   ├── store/              # Zustand (auth, theme, toast)
│   │   └── types/              # TypeScript interfaces
│   └── components.json
├── docs/
│   └── decisions.md            # Decisões técnicas detalhadas
├── seed.py                     # Script para popular o banco
├── docker-compose.yml          # Produção (backend + frontend + db)
├── docker-compose.dev.yml      # Desenvolvimento (apenas db)
└── .env.example                # Variáveis de ambiente de exemplo
```

## Endpoints da API

### Públicos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login/ | Login com email + senha (retorna JWT + dados) |
| POST | /usuarios/ | Registro (usuário inicia inativo) |
| GET | /turmas/publico/ | Lista turmas (para registro) |
| GET | /hello/ | Health check |

### Autenticados

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /auth/me/ | Dados do usuário (inclui is_admin) |
| GET | /auth/me/stats/ | Estatísticas do dashboard |
| GET | /me/atividades/ | Atividades do usuário (filtros + pag) |
| POST | /atividades/ | Criar atividade (professor) |
| POST | /respostas/ | Enviar resposta (aluno) |
| GET | /me/respostas/ | Respostas do aluno (filtros + pag) |
| GET | /atividades/:id/respostas/ | Respostas de uma atividade (professor) |
| PATCH | /respostas/:id/ | Editar (aluno) ou corrigir (professor) |
| GET | /turmas/ | Listar turmas |
| POST | /turmas/ | Criar turma |

### Admin (superuser)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /usuarios/lista/ | Listar usuários (filtros + pag) |
| PATCH | /usuarios/:id/toggle/ | Ativar/desativar usuário |
| GET | /gestao/atividades/ | Todas as atividades |
| GET | /gestao/atividades/:id/respostas/ | Respostas de qualquer atividade |
| GET | /gestao/respostas/ | Todas as respostas |

Todos os endpoints de listagem suportam `?page=1&page_size=10` e filtros específicos documentados nas docstrings de cada view.

## Regras de Negócio

- Usuários criados via registro iniciam com `is_active=false`. Um admin precisa ativá-los.
- Um aluno só pode enviar **uma resposta por atividade** (constraint `unique_together` no banco).
- Alunos só podem responder atividades de turmas que pertencem.
- Alunos podem editar sua resposta enquanto a atividade estiver ativa.
- Professores podem corrigir (nota + feedback) a qualquer momento, mesmo após o prazo.
- Nota deve estar entre 0 e 10.
- Superusers não podem ser desativados pelo endpoint de toggle.
- O campo `is_admin` é calculado como `is_superuser AND is_active`.

> Para decisões técnicas detalhadas (arquitetura, segurança, frontend), veja [docs/decisions.md](docs/decisions.md).

## Decisões Técnicas Resumidas

### Backend

- **Custom User Model** com campo `role` (PROFESSOR/ALUNO) e M2M com Turma
- **3 níveis de serializers** para User: público (login), privado (/auth/me/), admin-only
- **Permissões com superuser bypass** — `IsProfessor` e `IsAluno` concedem acesso automático a superusers
- **Paginação em FBVs** via helper `paginate_queryset()` com formato `{ count, next, previous, results }`
- **Validação de prazo apenas na criação** — professores corrigem mesmo após prazo
- **Endpoints admin em /gestao/** para evitar conflito com Django admin nativo
- **Endpoint /auth/me/stats/** retorna estatísticas calculadas server-side por role

### Frontend

- **TanStack Form + Zod** para formulários — schemas centralizados em `schemas/forms.ts`, validação via `safeParse()` no submit, erros do backend injetados via `onError` da mutation
- **Zustand** para estado síncrono (auth, theme, toast), **React Query** para server state com cache e invalidação automática
- **Autenticação server-verified** — `is_admin` nunca exposto no login, obtido via `/auth/me/` a cada reload
- **nuqs** para filtros sincronizados com a URL (busca, status, página) com debounce de 400ms
- **shadcn/ui (base-nova)** com tema azul customizado em oklch, dark mode via classe `.dark`
- **Layouts separados** — professor/aluno têm sidebar própria, admin tem `AdminLayout` dedicado
- **TurmaMultiSelect** com portal para evitar corte por overflow do Card pai

## Docker (Produção)

### 1. Subir os containers

```bash
docker-compose up --build
```

Aguarde até ver os 3 containers rodando (postgres_db, django_backend, react_frontend).

### 2. Criar o admin (segundo terminal)

```bash
docker exec -it django_backend python manage.py createsuperuser
```

### 3. Popular o banco com dados de teste (opcional)

```bash
docker exec -it django_backend python seed.py
```

### 4. Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Banco | localhost:5432 |

## Comandos Úteis

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Popular banco com dados de teste
python seed.py

# Build do frontend
cd frontend && npm run build

# Resetar banco (remove volume do Docker)
docker-compose -f docker-compose.dev.yml down -v
```

## Autor

Lucas Martins
