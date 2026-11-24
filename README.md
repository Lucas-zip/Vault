# Vault — Gerenciador de Finanças Pessoais

Sistema web de controle financeiro pessoal, desenvolvido como trabalho acadêmico. O Vault reúne contas, transações, orçamentos, metas de economia e investimentos em um único lugar, com backend em **Java/Spring Boot** (API REST) e frontend em **React + TypeScript**.

---

## Integrantes

| Nome | Matrícula |
|------|-----------|
| Lucas Gabriel Simões Marinho | 06009936 |
| Arthur Martins | 06012635 |
| Carlos Eduardo Mendes | 06011992 |
| Emanuel de Oliveira | 06010524 |
| Laura de Lima | 06010735 |
| Caio de Paiva Barragat Maniaudet | 06012117 |

---

## Situação-problema escolhida

**Dificuldade de manter o controle financeiro pessoal consolidado.**

Hoje, a maior parte das pessoas acompanha a própria vida financeira de forma fragmentada: o saldo está no aplicativo do banco, as contas a pagar estão no calendário, o controle de gastos está em uma planilha e as metas de economia (a viagem, a reserva de emergência, a troca do carro) ficam apenas na memória. Essa dispersão gera três problemas recorrentes:

- **Falta de visão consolidada**: não se sabe, em um único lugar, quanto se tem, quanto se deve e quanto se pode gastar no mês.
- **Falta de previsibilidade**: despesas futuras e recorrências não são contabilizadas, o que leva a estouros de orçamento e ao uso do limite de crédito.
- **Desmotivação para poupar**: sem metas claras e sem acompanhamento visual do progresso, o hábito de guardar dinheiro não se sustenta.

O **Vault** ataca exatamente esse cenário: centraliza as movimentações financeiras, aplica automaticamente o impacto dos lançamentos nos saldos, avisa quando um limite mensal está próximo de ser atingido e transforma objetivos de economia em "quadradinhos" preenchíveis, tornando o progresso das metas visível e palpável.

---

## Descrição do MVP

O MVP entregue é um **sistema web full-stack** funcional, com autenticação e isolamento total de dados por usuário. Cada usuário acessa apenas as próprias informações, e todo o domínio financeiro é servido por uma API REST documentada.

### Funcionalidades entregues

- **Autenticação e perfil**: cadastro, login com JWT, consulta/atualização de perfil, alteração de senha e desativação da conta.
- **Contas financeiras**: cadastro de contas (corrente, poupança, carteira, cartão de crédito, investimento) com saldo inicial e saldo atual.
- **Categorias**: categorias de receita e de despesa por usuário.
- **Transações**: registro de receitas e despesas com aplicação/reversão automática do saldo da conta, filtros (período, tipo, categoria, conta) e paginação.
- **Transferências**: movimentação entre contas do próprio usuário modelada como duas transações atômicas.
- **Contas a pagar/receber**: compromissos com vencimento e status, listagem de vencidos e próximos vencimentos, e baixa que gera a transação correspondente.
- **Recorrências**: receitas/despesas recorrentes (diária, semanal, mensal, anual) e execução que gera as transações do período.
- **Orçamentos por categoria**: limite mensal por categoria com acompanhamento de utilizado, restante e percentual.
- **Limite mensal total** (diferencial do MVP): teto geral de gastos do mês com **alerta de proximidade em 75%** (estado amarelo) antes de estourar o limite (estado vermelho).
- **Metas financeiras (caixinhas)** com três modalidades:
  - *Meta tradicional*: depósitos e retiradas manuais com histórico.
  - *Quadradinhos*: a meta é dividida em N quadradinhos numerados; o sistema calcula o valor de cada um (valores iguais, crescentes ou aleatórios) sempre fechando exatamente o valor da meta. O usuário clica no quadradinho para preenchê-lo com o valor dele.
  - *Calculadora de investimentos*: projeção de juros compostos com aportes até o objetivo.
- **Dashboard**: resumo do mês, saldos por conta, gastos por categoria, evolução mensal, maiores despesas e pendências.
- **Relatórios**: receitas/despesas por período, totais por categoria, evolução mensal e maiores movimentações.
- **Documentação interativa da API** via Swagger UI.
- **Tratamento global de erros** com respostas JSON padronizadas e validação de entrada com Bean Validation.

---

## Tecnologias

### Backend (`vault/`)

| Camada | Tecnologia |
|---|---|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.3.2 |
| Web | Spring Web (MVC) |
| Persistência | Spring Data JPA / Hibernate |
| Segurança | Spring Security + JWT (JJWT 0.12.6) |
| Validação | Bean Validation (Jakarta) |
| Migrações | Flyway (V1 a V11) |
| Banco | PostgreSQL 16 |
| Documentação | SpringDoc OpenAPI 2.6.0 (Swagger UI) |
| Build | Maven 3.9+ |
| Auxiliares | Lombok |
| Testes | JUnit 5, Mockito, AssertJ, H2 |

### Frontend (`frontend/`)

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Biblioteca | React 19 |
| Build/dev server | Vite 8 |
| Roteamento | React Router 7 |
| HTTP | Axios |
| Estilo | Tailwind CSS 4 |
| Ícones | lucide-react |

---

## Estrutura do repositório

```text
Vault/
├── README.md              # Este arquivo (visível na página principal do repositório)
├── frontend/              # Aplicação React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis (Layout, UI, gráficos, painéis de metas)
│   │   ├── context/       # Contexto de autenticação
│   │   ├── pages/         # Telas (Dashboard, Transações, Contas, Metas, etc.)
│   │   ├── services/      # Cliente Axios da API
│   │   ├── types/         # Tipos TypeScript do contrato da API
│   │   └── utils/         # Formatação e regras auxiliares
│   ├── vite.config.ts     # Proxy /api -> http://localhost:8080
│   └── package.json
└── vault/                 # Backend Spring Boot
    ├── src/main/java/com/projeto/vault/
    │   ├── config/        # SecurityConfig, SwaggerConfig
    │   ├── controller/    # Endpoints REST
    │   ├── dto/           # DTOs de entrada (request) e saída (response)
    │   ├── entity/        # Entidades JPA
    │   ├── enums/         # Enumeradores de domínio
    │   ├── exception/     # Exceções e handler global
    │   ├── mapper/        # Entity <-> DTO
    │   ├── repository/    # Repositórios Spring Data JPA
    │   ├── security/      # Filtro JWT e usuário autenticado
    │   ├── service/       # Regras de negócio
    │   └── specification/ # Filtros dinâmicos
    ├── src/main/resources/
    │   ├── db/migration/  # Migrações Flyway (V1 a V11)
    │   └── application.yml
    ├── docker-compose.yml # PostgreSQL + aplicação
    ├── Dockerfile
    └── env.example        # Modelo de variáveis de ambiente
```

> O backend possui documentação técnica detalhada (todas as rotas, payloads, arquitetura e modelo de dados) em [`vault/README.md`](./vault/README.md).

---

## Como executar o MVP localmente

### Pré-requisitos

- **Java 21** (JDK)
- **Maven 3.9+**
- **PostgreSQL 16** (instalado localmente **ou** via Docker)
- **Node.js 20+** e **npm**
- **Docker e Docker Compose** (opcional, apenas para o modo contêiner do backend)

### 1. Banco de dados

Crie o banco e o usuário que a aplicação espera (os valores padrão estão em `vault/src/main/resources/application.yml`):

```sql
CREATE USER vault WITH PASSWORD 'vault123';
CREATE DATABASE vault OWNER vault;
```

As tabelas são criadas automaticamente pelo **Flyway** na primeira inicialização do backend — não é necessário rodar script algum manualmente.

### 2. Backend (API)

Abra um terminal na pasta `vault/` e defina as variáveis de ambiente:

```powershell
cd vault
$env:DB_HOST="localhost"; $env:DB_PORT="5432"; $env:DB_NAME="vault"; $env:DB_USERNAME="vault"; $env:DB_PASSWORD="vault123"
mvn spring-boot:run
```

Em Linux/macOS:

```bash
cd vault
export DB_HOST=localhost DB_PORT=5432 DB_NAME=vault DB_USERNAME=vault DB_PASSWORD=vault123
mvn spring-boot:run
```

O backend sobe em `http://localhost:8080`, com o Swagger em `http://localhost:8080/swagger-ui.html`.

> Alternativa: `docker compose up --build` dentro de `vault/` sobe o PostgreSQL e a aplicação juntos.

### 3. Frontend

Em **outro** terminal, na pasta `frontend/`:

```bash
cd frontend
npm install      # apenas na primeira vez
npm run dev
```

Acesse **http://localhost:5173**, crie uma conta em "Criar conta" e comece a usar. O Vite faz proxy das chamadas `/api` para `http://localhost:8080`, então os dois processos precisam estar rodando.

### Scripts de atalho (Windows, opcional)

Você pode criar dois arquivos `.bat` no Desktop apontando para as pastas do projeto — um para o backend (`start-backend.bat`, que define as variáveis `DB_*` e roda `mvn spring-boot:run`) e outro para o frontend (`start-frontend.bat`, que roda `npm run dev`). Execute primeiro o do backend e depois o do frontend.

### Testes

```bash
cd vault
mvn test
```

Os testes usam H2 em memória (perfil `test`), portanto **não** exigem um PostgreSQL ativo.

---

## Variáveis de ambiente do backend

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco | `vault` |
| `DB_USERNAME` | Usuário do banco | `vault` |
| `DB_PASSWORD` | Senha do banco | `vault123` |
| `JWT_SECRET` | Chave secreta do JWT (mín. 32 caracteres) | valor interno |
| `JWT_EXPIRATION` | Validade do token (ms) | `86400000` (24 h) |
| `PORT` | Porta HTTP da aplicação | `8080` |

Use `vault/env.example` como modelo. **Nunca** versione o arquivo `.env` real.

---

## Modelo de dados (visão geral)

| Migração | Tabela | Conteúdo |
|---|---|---|
| V1 | `users` | Usuários e credenciais |
| V2 | `accounts` | Contas financeiras |
| V3 | `categories` | Categorias de receita/despesa |
| V4 | `transactions` | Transações |
| V5 | `recurrences` | Recorrências |
| V6 | `future_transactions` | Contas a pagar/receber |
| V7 | `budgets` | Orçamentos mensais por categoria |
| V8 | Índices | Índices e campos de auditoria |
| V9 | `savings_goals`, `goal_movements`, `goal_deposit_plans` | Metas, movimentações e plano de depósitos |
| V10 | `monthly_budgets` | Limite mensal total de gastos |
| V11 | `goal_slot_plans` | Quadradinhos (slots) das metas |

Todos os registros são vinculados ao usuário (`user_id`), garantindo o isolamento dos dados.

---

## Endpoints principais da API

Prefixo `/api`. Apenas `/api/auth/**` e a documentação Swagger são públicas; as demais rotas exigem `Authorization: Bearer <token>`.

| Recurso | Rotas |
|---|---|
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login` |
| Usuário | `GET/PUT /api/users/me`, `PUT /api/users/me/password`, `DELETE /api/users/me` |
| Contas | `GET/POST /api/accounts`, `GET/PUT/DELETE /api/accounts/{id}` |
| Categorias | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/{id}` |
| Transações | `GET/POST /api/transactions`, `GET/PUT/DELETE /api/transactions/{id}` |
| Transferências | `POST /api/transfers` |
| Contas a pagar/receber | `GET/POST /api/futures`, `GET /api/futures/overdue`, `GET /api/futures/upcoming`, `POST /api/futures/{id}/pay` |
| Recorrências | `GET/POST /api/recurrences`, `POST /api/recurrences/{id}/execute` |
| Orçamentos por categoria | `GET/POST /api/budgets`, `GET /api/budgets/status`, `PUT/DELETE /api/budgets/{id}` |
| Limite mensal | `GET /api/monthly-budget`, `GET/PUT/DELETE /api/monthly-budget/{period}` |
| Metas | `GET/POST /api/goals`, `GET /api/goals/summary`, `GET/PUT/DELETE /api/goals/{id}`, `POST /api/goals/{id}/movements`, `POST/PATCH /api/goals/{id}/slot-plan`, `POST /api/goals/calculator` |
| Dashboard | `GET /api/dashboard/summary`, `/categories`, `/monthly`, `/accounts`, `/top-expenses`, `/pending` |
| Relatórios | `GET /api/reports/summary`, `/expenses`, `/incomes`, `/monthly-evolution`, `/top-expenses`, `/top-incomes` |

Detalhes de payloads, códigos HTTP e formato de erro estão em [`vault/README.md`](./vault/README.md) e no Swagger UI.

---

## Segurança

- Autenticação **stateless** com **JWT** assinado por chave secreta; senhas armazenadas com hash **BCrypt**.
- Todas as consultas filtram pelo usuário autenticado (`SecurityUtils.getAuthenticatedUserId()`), impedindo acesso cruzado entre usuários.
- Regras de negócio críticas ficam na camada de serviço, com transações gerenciadas pelo Spring (`@Transactional`).
- Exceções de domínio convertidas em respostas JSON padronizadas pelo `GlobalExceptionHandler`.

---

## Observações adicionais

- O `docker-compose.yml` usa as variáveis `DB_USER`, `APP_JWT_SECRET` e `APP_PORT`, enquanto o `application.yml` lê `DB_USERNAME`, `JWT_SECRET` e `PORT`. Como os valores padrão coincidem, a aplicação sobe corretamente; alinhar os nomes é uma melhoria pendente.
- O `env.example` sugere usuário/senha `postgres`, enquanto o `docker-compose.yml` cria `vault`/`vault123` — ao rodar localmente, use credenciais compatíveis com o seu banco.
- O schema é validado contra as entidades (`ddl-auto: validate`); alterações de modelo devem vir acompanhadas de uma nova migração Flyway.
- Nenhuma senha, chave ou segredo real está versionado neste repositório.
- O projeto não possui arquivo de licença (`LICENSE`).
