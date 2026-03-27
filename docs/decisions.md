# Decisões Técnicas

Documento detalhado sobre as decisões de arquitetura e implementação do projeto.

## Backend

### Custom User Model com roles

O modelo `User` extende `AbstractUser` com campo `role` (PROFESSOR/ALUNO) e relação M2M com `Turma`. Isso permite controle de acesso granular sem tabelas extras. O `default='PROFESSOR'` no role garante que `createsuperuser` funcione sem pedir esse campo.

### Três níveis de serializers para User

- `UserSerializer`: público, usado no login. NÃO expõe `is_superuser`.
- `UserMeSerializer`: privado, usado em `/auth/me/`. Inclui `is_admin` computado server-side.
- `UserAdminSerializer`: admin-only, herda de `UserMeSerializer`. Usado em endpoints protegidos por `IsAdminUser`.

Essa separação impede que um atacante descubra quem é admin interceptando a resposta do login.

### Permissões com superuser bypass

`IsProfessor` e `IsAluno` verificam `request.user.is_superuser` antes do role. Isso garante que o admin acesse qualquer endpoint sem precisar de permissões específicas em cada view.

### Paginação em function-based views

O DRF aplica paginação automaticamente apenas em class-based views. O helper `paginate_queryset()` em `accounts/pagination.py` resolve isso para `@api_view`, retornando o formato padrão `{ count, next, previous, results }`.

### Validação de prazo apenas na criação

O `clean()` do model `Resposta` verifica `self.pk is None` antes de validar a data de entrega. Isso permite que professores corrijam respostas de atividades encerradas, enquanto alunos não podem enviar novas respostas após o prazo.

### Endpoints admin em /gestao/ (não /admin/)

O Django reserva `/admin/` para o painel admin nativo. As rotas da API admin usam `/gestao/` para evitar conflito. O Django admin foi movido para `/django-admin/`.

### Endpoint /auth/me/stats/ para dashboards

Em vez de fazer N requests no frontend para calcular estatísticas, um único endpoint retorna tudo calculado server-side (total atividades, respostas recebidas, taxa de correção, média de notas). Campos variam por role.

### Organização em apps por domínio

O backend é dividido em 4 apps Django independentes (`accounts`, `turmas`, `atividades`, `respostas`), cada um com seus próprios models, serializers, views, urls e admin. Utilitários compartilhados (pagination, permissions) ficam em `accounts/` por ser o app base.

## Frontend

### Zustand para estado global, React Query para server state

Zustand gerencia estado síncrono (auth, theme, toast) com API mínima. React Query gerencia cache de dados do servidor com invalidação automática, retry e staleTime. Essa separação evita misturar estado local com dados remotos.

### Autenticação server-verified

Após login, o frontend chama `GET /auth/me/` para obter `is_admin` verificado pelo servidor. O campo `is_admin` nunca é retornado no login nem armazenado no localStorage. Em cada reload, `useAuthInitialize` revalida o token via `/auth/me/`. Se o token expirou, limpa o estado sem redirect (o `ProtectedRoute` cuida do redirect via React Router).

### Interceptor do Axios com exceção para /auth/me

O interceptor de response faz logout + redirect em qualquer 401, exceto para `/auth/me/`. Sem essa exceção, o `useAuthInitialize` causaria loop infinito: reload → fetchMe → 401 → redirect → reload.

### Cache limpo na troca de usuário

`queryClient.clear()` é chamado tanto no login quanto no logout. Isso evita que dados do usuário anterior apareçam para o novo usuário (ex: atividades de outro professor).

### Tailwind CSS v4 com dark mode via classe

O Tailwind v4 usa `@media (prefers-color-scheme)` por default. A diretiva `@custom-variant dark (&:where(.dark, .dark *))` no `index.css` ativa dark mode via classe `.dark` no `<html>`, controlada pelo `ThemeProvider` + `useThemeStore`.

### shadcn/ui (base-nova) com tema azul

Componentes shadcn geram arquivos locais em `components/ui/` que podem ser customizados. O tema usa cores em oklch com primary azul customizado para light e dark. A fonte Geist Variable é carregada via `@fontsource-variable`.

### nuqs para filtros na URL

Filtros de busca e paginação são sincronizados com a URL via `useQueryState` do nuqs. Isso permite compartilhar links com filtros aplicados e funciona com back/forward do browser. O `NuqsAdapter` para React Router v7 envolve as rotas.

### Debounce nos filtros de busca

O `useDebouncedCallback` (400ms) evita que cada keystroke dispare uma request. O `SearchFilter` mantém estado local no input e só propaga o valor após o debounce, evitando perda de foco.

### TurmaMultiSelect com portal

O dropdown de seleção de turmas usa `createPortal(document.body)` para renderizar fora do Card pai. Sem isso, o `overflow: hidden` do Card cortava o dropdown. A posição é calculada via `getBoundingClientRect` e atualizada em scroll/resize.

### NativeSelect com fix de dark mode

O `<select>` nativo com `bg-transparent` faz as `<option>` ficarem invisíveis no dark mode. O `NativeSelect` usa `bg-background` no select e `[&>option]:bg-popover` nas options.

### Layouts separados por papel

- `Layout`: sidebar para professor (Dashboard, Atividades, Criar, Turmas) e aluno (Dashboard, Atividades, Respostas).
- `AdminLayout`: sidebar dedicada para admin (Painel, Usuários, Turmas, Atividades, Respostas).

O admin nunca vê itens de professor/aluno e vice-versa.

### ProtectedRoute com requireAdmin

Além de verificar `role`, o `ProtectedRoute` aceita `requireAdmin` que verifica `user.is_admin` (campo server-verified). Rotas `/admin/*` usam `requireAdmin` em vez de `role="PROFESSOR"`.
