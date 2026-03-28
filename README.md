# Plataforma Escolar

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-3.14+-A30000)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

Aplicação web fullstack para gerenciamento de atividades escolares. Professores criam atividades e corrigem respostas com nota e feedback. Alunos visualizam atividades da sua turma, enviam respostas e acompanham correções. Administradores gerenciam usuários, turmas, atividades e respostas de todo o sistema.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Django 4.2+, Django REST Framework, SimpleJWT, PostgreSQL |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui (base-nova) |
| Formulários | TanStack Form + Zod (validação com schemas tipados) |
| Estado | Zustand (auth, theme, toast), React Query (server state) |
| URL Params | nuqs (search params sincronizados com a URL) |
| Infra | Docker, Docker Compose |

---

## Rodar com Docker (recomendado)

A forma mais rápida de rodar o projeto. Não precisa instalar Python, Node.js nem PostgreSQL.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (já vem com Docker Desktop no Windows/Mac)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/plataforma-escolar.git
cd plataforma-escolar
```

### 2. Subir os containers

```bash
docker-compose up --build
```

Aguarde até ver os 3 containers rodando: `postgres_db`, `django_backend`, `react_frontend`.

### 3. Criar o admin (em outro terminal)

Abra um **segundo terminal** (mantenha o primeiro rodando) e execute:

```bash
docker exec -it django_backend python manage.py createsuperuser
```

Digite um email e senha quando solicitado.

### 4. Popular o banco com dados de teste (opcional, mas recomendado)

```bash
docker exec -it django_backend python seed.py
```

Isso cria 8 turmas, 5 professores, 20 alunos, 15 atividades e 70 respostas prontas para testar.

### 5. Acessar

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |

### 6. Credenciais de teste (após rodar seed.py)

| Email | Senha | Papel |
|-------|-------|-------|
| admin@escola.com | admin123 | Administrador |
| silva@escola.com | senha123 | Professor |
| ana.souza@escola.com | senha123 | Aluno |

Todos os usuários criados pelo seed usam senha `senha123`. O login é feito por **email + senha**.

### Parar os containers

```bash
# No terminal onde rodou docker-compose up:
Ctrl+C

# Ou em qualquer terminal:
docker-compose down

# Para apagar o banco de dados também:
docker-compose down -v
```

---

## Rodar em Modo Desenvolvimento

Para quem quer desenvolver ou modificar o código com hot reload.

### Pré-requisitos

- Python 3.10+
- Node.js 20+ (Vite 8 requer 20.19+)
- npm
- Docker (apenas para o PostgreSQL)

### 1. Banco de dados

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Backend

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

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:5173`

---

## Variáveis de Ambiente

Crie `backend/.env` a partir do exemplo: `cp .env.example backend/.env`

| Variável | Descrição | Default |
|----------|-----------|---------|
| `SECRET_KEY` | Chave secreta do Django | insecure key (dev only) |
| `DEBUG` | Modo debug | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos (separados por vírgula) | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) | `http://localhost:5173` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_NAME` | Nome do banco | `escola` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |

> **⚠️ Importante:** Em produção, gere uma `SECRET_KEY` forte, defina `DEBUG=False` e configure `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` com os domínios corretos.

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
├── .env.example                # Variáveis de ambiente de exemplo
├── .gitignore                  # Arquivos ignorados pelo Git
└── .dockerignore               # Arquivos ignorados pelo Docker build
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
- Nota deve estar entre 0 e 10. Nota é obrigatória.
- Feedback é opcional.
- Superusers não podem ser desativados pelo endpoint de toggle.
- O campo `is_admin` é calculado como `is_superuser AND is_active`.

> Para decisões técnicas detalhadas (arquitetura, segurança, frontend), veja [docs/decisions.md](docs/decisions.md).

## Decisões Técnicas Resumidas

### Segurança

- **Variáveis sensíveis via `.env`** — `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` são carregadas via `python-dotenv`, sem valores hardcoded no código
- **`.gitignore`** impede commit de `.env`, `__pycache__/`, `node_modules/` e arquivos de IDE
- **`.dockerignore`** evita copiar `.git`, `.env`, `node_modules/` e caches para dentro das imagens Docker

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
