# Vault

Backend de um sistema de controle financeiro pessoal, desenvolvido como trabalho acadêmico. O Vault expõe uma API REST para o gerenciamento de contas, categorias, transações, transferências, contas a pagar/receber, recorrências, orçamentos e relatórios financeiros, com autenticação baseada em tokens JWT.

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

## Sobre o projeto

O Vault é um sistema de controle financeiro voltado ao gerenciamento de finanças pessoais. O projeto foi desenvolvido no contexto acadêmico, tendo como objetivo aplicar conceitos de desenvolvimento de software no backend de uma aplicação real.

O problema que o sistema busca resolver é a dificuldade de manter o controle consolidado de receitas, despesas, contas e compromissos futuros em um único lugar. O Vault centraliza essas informações, permitindo que o usuário registre movimentações, acompanhe saldos, crie orçamentos e visualize relatórios sobre a própria vida financeira.

Dentro da aplicação, o backend é responsável por toda a lógica de negócio e persistência: recebe as requisições do frontend, valida os dados, aplica as regras (como o impacto das transações no saldo das contas) e armazena as informações no banco de dados. O frontend consome a API REST exposta pelo backend.

---

## Funcionalidades

O backend implementa as seguintes funcionalidades:

- **Autenticação e cadastro de usuários**: registro, login com JWT, consulta e atualização do perfil, alteração de senha e desativação da conta.
- **Contas financeiras**: criação, listagem paginada, busca, atualização e exclusão de contas, com controle de saldo (inicial e atual).
- **Categorias**: gerenciamento de categorias de receita e despesa.
- **Transações**: registro de receitas e despesas com aplicação/reversão automática do impacto no saldo da conta, além de filtros por período, tipo, categoria e conta com paginação.
- **Transferências**: movimentação de valores entre contas do mesmo usuário, modelada como duas transações atômicas (saída na origem e entrada no destino).
- **Contas a pagar e a receber**: registro de compromissos com data de vencimento e status, consulta de vencidos e próximos vencimentos, e baixa (pagamento) que gera a transação correspondente.
- **Recorrências**: definição de receitas/despesas recorrentes (diária, semanal, mensal ou anual) e execução para gerar as transações do período.
- **Orçamentos mensais por categoria**: definição de limite mensal e acompanhamento do valor utilizado, restante e percentual de uso.
- **Dashboard**: resumo financeiro do mês, saldos por conta, gastos por categoria, evolução mensal, maiores despesas e pendências.
- **Relatórios**: resumo de receitas/despesas por período, totais por categoria, evolução mensal e maiores receitas/despesas.
- **Documentação interativa da API** via Swagger UI.
- **Tratamento global de erros** com respostas padronizadas e validação de entrada via Bean Validation.

---

## Tecnologias utilizadas

| Camada | Tecnologia | Função |
|---|---|---|
| Linguagem | Java 21 | Linguagem de programação do backend. |
| Framework | Spring Boot 3.3.2 | Base da aplicação, com configuração automática e inicialização. |
| Web | Spring Web (Spring MVC) | Criação dos controllers e endpoints REST. |
| Persistência | Spring Data JPA / Hibernate | Mapeamento objeto-relacional e acesso a dados via repositórios. |
| Segurança | Spring Security | Autenticação, autorização e proteção dos endpoints. |
| JWT | JJWT 0.12.6 | Geração e validação dos tokens JWT. |
| Validação | Bean Validation (Jakarta) | Validação dos dados de entrada dos DTOs. |
| Migrações | Flyway | Versionamento e execução do schema do banco de dados. |
| Banco de dados | PostgreSQL 16 | Banco de dados relacional usado em desenvolvimento e produção. |
| Documentação | SpringDoc OpenAPI 2.6.0 | Geração da documentação interativa (Swagger UI). |
| Build | Maven 3.9+ | Gerenciamento de dependências e build do projeto. |
| Auxiliar | Lombok | Redução de código boilerplate (getters, setters, builders). |
| Testes | JUnit 5, Mockito, AssertJ | Testes unitários e de contexto. |
| Testes | H2 | Banco em memória usado nos testes (modo PostgreSQL). |
| Infra | Docker e Docker Compose | Execução da aplicação e do banco em contêineres. |

---

## Arquitetura

O backend segue uma arquitetura em camadas, com responsabilidades bem definidas:

- **Controllers** (`controller/`): recebem as requisições HTTP, validam a entrada e delegam o processamento aos serviços. Não contêm regra de negócio.
- **Services** (`service/`): concentram as regras de negócio e a orquestração das operações. É aqui que são aplicadas validações e o impacto financeiro no saldo.
- **Repositories** (`repository/`): abstraem o acesso ao banco de dados por meio de interfaces do Spring Data JPA, incluindo consultas derivadas e JPQL.
- **Entities** (`entity/`): classes JPA que representam as tabelas do banco.
- **DTOs** (`dto/`): objetos de entrada (`request`) e saída (`response`) usados na fronteira da API, evitando expor as entidades diretamente.
- **Mappers** (`mapper/`): convertem entidades em DTOs e vice-versa.
- **Enums** (`enums/`): tipos de domínio (tipo de transação, frequência, status, papéis, etc.).
- **Configurations** (`config/`): configurações de segurança (Spring Security) e do Swagger.
- **Security** (`security/`): filtro JWT, serviço de geração/validação de token e representação do usuário autenticado.
- **Exceptions** (`exception/`): exceções de domínio e o handler global (`@RestControllerAdvice`) que padroniza as respostas de erro.
- **Specifications** (`specification/`): filtros dinâmicos para consultas de transações.

Fluxo básico de uma requisição autenticada:

```
Cliente -> JwtAuthFilter (valida token) -> Controller -> Service -> Repository -> PostgreSQL
```

Alguns princípios importantes do código:

- **Isolamento por usuário**: toda consulta de dados usa o `userId` obtido do usuário autenticado (`SecurityUtils.getAuthenticatedUserId()`), garantindo que cada usuário acesse apenas os próprios dados.
- **Fonte única de verdade para o saldo**: o `BalanceService` é o único componente que aplica ou reverte o impacto das transações no saldo das contas, mantendo a consistência.
- **DTOs com validação**: os dados de entrada são validados com Bean Validation (`@Valid`).
- **Tratamento global de erros**: o `GlobalExceptionHandler` converte as exceções em respostas JSON padronizadas.

---

## Estrutura do projeto

```text
vault/
├── src/
│   ├── main/
│   │   ├── java/com/projeto/vault/
│   │   │   ├── VaultApplication.java   # Classe principal (Spring Boot)
│   │   │   ├── config/                 # SecurityConfig, SwaggerConfig
│   │   │   ├── controller/             # Endpoints REST
│   │   │   ├── dto/
│   │   │   │   ├── request/            # DTOs de entrada
│   │   │   │   └── response/           # DTOs de saída
│   │   │   ├── entity/                 # Entidades JPA
│   │   │   ├── enums/                  # Enumeradores de domínio
│   │   │   ├── exception/              # Exceções e handler global
│   │   │   ├── mapper/                 # Conversores Entity <-> DTO
│   │   │   ├── repository/             # Repositórios Spring Data JPA
│   │   │   ├── security/               # JWT, filtros e usuário autenticado
│   │   │   ├── service/                # Regras de negócio
│   │   │   └── specification/          # Filtros dinâmicos (Specifications)
│   │   └── resources/
│   │       ├── db/migration/           # Migrações Flyway (V1 a V8)
│   │       └── application.yml         # Configurações da aplicação
│   └── test/
│       ├── java/com/projeto/vault/     # Testes unitários e de contexto
│       └── resources/application-test.yml
├── docker-compose.yml                  # PostgreSQL + aplicação
├── Dockerfile                          # Build multi-estágio da imagem
├── env.example                         # Exemplo de variáveis de ambiente
├── pom.xml                             # Build e dependências Maven
└── README.md
```

Principais pastas:

- `controller/`: define as rotas e o mapeamento HTTP.
- `service/`: contém a lógica de negócio.
- `repository/`: acesso e consultas ao banco.
- `entity/`: modelo de dados persistido.
- `dto/`: contratos de entrada e saída da API.
- `security/`: autenticação JWT e contexto do usuário.
- `db/migration/`: scripts SQL versionados pelo Flyway.

---

## API

A API usa o prefixo `/api` e responde em JSON. As rotas públicas são as de autenticação e o Swagger; todas as demais exigem o cabeçalho `Authorization: Bearer <token>`.

### Autenticação

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastra um novo usuário. | Pública |
| POST | `/api/auth/login` | Autentica o usuário e retorna o token JWT. | Pública |

Corpo do cadastro (`RegisterRequest`):

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "cpfCnpj": "12345678900",
  "phone": "11999999999"
}
```

Campos obrigatórios: `name`, `email` (e-mail válido) e `password` (6 a 60 caracteres). `cpfCnpj` e `phone` são opcionais.

Corpo do login (`LoginRequest`):

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

Resposta do login (`LoginResponse`):

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "userId": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "role": "USER"
}
```

### Usuário

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| GET | `/api/users/me` | Retorna o perfil do usuário autenticado. | Bearer |
| PUT | `/api/users/me` | Atualiza nome, CPF/CNPJ e telefone. | Bearer |
| PUT | `/api/users/me/password` | Altera a senha. | Bearer |
| DELETE | `/api/users/me` | Desativa a conta do usuário. | Bearer |

Corpo da atualização de perfil (`UpdateUserRequest`):

```json
{
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "phone": "11999999999"
}
```

Corpo da alteração de senha (`ChangePasswordRequest`):

```json
{
  "currentPassword": "123456",
  "newPassword": "nova-senha"
}
```

### Contas

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/accounts` | Cria uma conta financeira. | Bearer |
| GET | `/api/accounts` | Lista contas (paginado; padrão 20 por página, ordenado por nome). | Bearer |
| GET | `/api/accounts/{id}` | Busca uma conta por id. | Bearer |
| PUT | `/api/accounts/{id}` | Atualiza nome, tipo, instituição e descrição. | Bearer |
| DELETE | `/api/accounts/{id}` | Exclui uma conta sem transações. | Bearer |

Corpo de criação (`CreateAccountRequest`):

```json
{
  "name": "Conta Corrente",
  "type": "CHECKING",
  "initialBalance": 1000.00,
  "institution": "Banco Exemplo",
  "description": "Conta principal"
}
```

Tipos possíveis (`AccountType`): `CHECKING`, `SAVINGS`, `WALLET`, `CREDIT_CARD`, `INVESTMENT`.

### Categorias

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/categories` | Cria uma categoria. | Bearer |
| GET | `/api/categories` | Lista categorias do usuário. | Bearer |
| GET | `/api/categories/{id}` | Busca uma categoria por id. | Bearer |
| PUT | `/api/categories/{id}` | Atualiza nome e descrição. | Bearer |
| DELETE | `/api/categories/{id}` | Exclui uma categoria. | Bearer |

Corpo de criação (`CreateCategoryRequest`):

```json
{
  "name": "Alimentação",
  "type": "EXPENSE",
  "description": "Gastos com alimentação"
}
```

Tipos possíveis (`CategoryType`): `INCOME`, `EXPENSE`.

### Transações

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/transactions` | Cria uma receita ou despesa e aplica o impacto no saldo. | Bearer |
| GET | `/api/transactions` | Lista transações com filtros e paginação. | Bearer |
| GET | `/api/transactions/{id}` | Busca uma transação por id. | Bearer |
| PUT | `/api/transactions/{id}` | Atualiza a transação (reverte e reaplica o impacto). | Bearer |
| DELETE | `/api/transactions/{id}` | Exclui a transação e reverte o impacto no saldo. | Bearer |

Corpo de criação (`CreateTransactionRequest`):

```json
{
  "description": "Almoço",
  "amount": 45.90,
  "type": "EXPENSE",
  "transactionDate": "2025-01-15",
  "accountId": 1,
  "categoryId": 2,
  "observation": "Almoço com a equipe"
}
```

Tipos possíveis (`TransactionType`): `INCOME`, `EXPENSE`.

A listagem aceita os parâmetros de consulta opcionais: `startDate`, `endDate` (formato `yyyy-MM-dd`), `type`, `categoryId`, `accountId`, além dos parâmetros de paginação do Spring (`page`, `size`, `sort`).

### Transferências

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/transfers` | Transfere um valor entre duas contas do usuário. | Bearer |

Corpo (`TransferRequest`):

```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 200.00,
  "description": "Transferência para poupança",
  "transactionDate": "2025-01-20"
}
```

### Contas a pagar/receber

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/futures` | Cria um compromisso a pagar/receber. | Bearer |
| GET | `/api/futures` | Lista compromissos; filtros opcionais `status` e `type`. | Bearer |
| GET | `/api/futures/overdue` | Lista compromissos vencidos. | Bearer |
| GET | `/api/futures/upcoming` | Lista próximos vencimentos (`days`, padrão 30). | Bearer |
| GET | `/api/futures/{id}` | Busca um compromisso por id. | Bearer |
| PUT | `/api/futures/{id}` | Atualiza um compromisso. | Bearer |
| DELETE | `/api/futures/{id}` | Exclui um compromisso. | Bearer |
| POST | `/api/futures/{id}/pay` | Marca como pago e gera a transação correspondente. | Bearer |

Corpo de criação (`CreateFutureTransactionRequest`):

```json
{
  "description": "Aluguel",
  "amount": 1200.00,
  "dueDate": "2025-02-10",
  "type": "EXPENSE",
  "categoryId": 3,
  "accountId": 1
}
```

Status possíveis (`FutureStatus`): `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`.

### Recorrências

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/recurrences` | Cria uma recorrência. | Bearer |
| GET | `/api/recurrences` | Lista recorrências do usuário. | Bearer |
| GET | `/api/recurrences/{id}` | Busca uma recorrência por id. | Bearer |
| PUT | `/api/recurrences/{id}` | Atualiza a recorrência. | Bearer |
| DELETE | `/api/recurrences/{id}` | Exclui a recorrência. | Bearer |
| POST | `/api/recurrences/{id}/execute` | Executa a recorrência e gera as transações. | Bearer |

Corpo de criação (`CreateRecurrenceRequest`):

```json
{
  "description": "Salário",
  "amount": 5000.00,
  "type": "INCOME",
  "frequency": "MONTHLY",
  "startDate": "2025-01-05",
  "endDate": "2025-12-05",
  "accountId": 1,
  "categoryId": 5
}
```

Frequências possíveis (`RecurrenceFrequency`): `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.

### Orçamentos

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| POST | `/api/budgets` | Cria um orçamento mensal por categoria. | Bearer |
| GET | `/api/budgets` | Lista orçamentos do usuário. | Bearer |
| GET | `/api/budgets/status` | Lista o status de utilização de todos os orçamentos. | Bearer |
| GET | `/api/budgets/{id}` | Calcula a utilização de um orçamento. | Bearer |
| GET | `/api/budgets/{id}/status` | Calcula a utilização de um orçamento. | Bearer |
| PUT | `/api/budgets/{id}` | Atualiza o orçamento. | Bearer |
| DELETE | `/api/budgets/{id}` | Exclui o orçamento. | Bearer |

Corpo de criação (`CreateBudgetRequest`):

```json
{
  "categoryId": 3,
  "limitAmount": 800.00,
  "period": "2025-01"
}
```

O campo `period` segue o formato `YYYY-MM`.

### Dashboard

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Resumo financeiro do mês corrente. | Bearer |
| GET | `/api/dashboard/categories` | Gastos/receitas por categoria (parâmetros opcionais `startDate`, `endDate`). | Bearer |
| GET | `/api/dashboard/monthly` | Evolução mensal (parâmetros `startDate`, `endDate`). | Bearer |
| GET | `/api/dashboard/accounts` | Saldo de cada conta. | Bearer |
| GET | `/api/dashboard/top-expenses` | Maiores despesas do período (`startDate`, `endDate`). | Bearer |
| GET | `/api/dashboard/pending` | Despesas pendentes e vencidas. | Bearer |

### Relatórios

| Método | Rota | Finalidade | Autenticação |
|---|---|---|---|
| GET | `/api/reports/summary` | Resumo de receitas, despesas e resultado (`startDate`, `endDate`). | Bearer |
| GET | `/api/reports/expenses` | Gastos por categoria (`startDate`, `endDate`). | Bearer |
| GET | `/api/reports/incomes` | Receitas por categoria (`startDate`, `endDate`). | Bearer |
| GET | `/api/reports/monthly-evolution` | Evolução mensal (`startDate`, `endDate`). | Bearer |
| GET | `/api/reports/top-expenses` | Maiores despesas (`startDate`, `endDate`). | Bearer |
| GET | `/api/reports/top-incomes` | Maiores receitas (`startDate`, `endDate`). | Bearer |

Datas (`startDate`, `endDate`) seguem o formato ISO `yyyy-MM-dd`.

### Códigos HTTP e formato de erro

| Código | Situação |
|---|---|
| 200 | Requisição concluída com sucesso. |
| 201 | Recurso criado com sucesso. |
| 204 | Operação concluída sem conteúdo de retorno. |
| 400 | Falha de validação dos dados enviados. |
| 401 | Não autenticado (token ausente ou inválido). |
| 403 | Sem autorização para acessar o recurso. |
| 404 | Recurso não encontrado. |
| 422 | Regra de negócio violada (ex.: saldo insuficiente, e-mail já cadastrado). |
| 500 | Erro interno do servidor. |

As respostas de erro seguem o formato padronizado pelo `GlobalExceptionHandler`:

```json
{
  "timestamp": "2025-01-15T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Conta não encontrada",
  "path": "/api/accounts/999"
}
```

---

## Banco de dados

O banco de dados utilizado é o **PostgreSQL 16**. A conexão é configurada em `application.yml` por meio de variáveis de ambiente (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`). O schema é controlado pelo **Flyway**, com o Hibernate configurado para `ddl-auto: validate` (as entidades são validadas contra o schema criado pelas migrations).

As migrações estão em `src/main/resources/db/migration/`:

| Versão | Tabela criada | Descrição |
|---|---|---|
| V1 | `users` | Usuários do sistema. |
| V2 | `accounts` | Contas financeiras. |
| V3 | `categories` | Categorias de receita/despesa. |
| V4 | `transactions` | Transações financeiras. |
| V5 | `recurrences` | Receitas/despesas recorrentes. |
| V6 | `future_transactions` | Contas a pagar/receber. |
| V7 | `budgets` | Orçamentos mensais por categoria. |
| V8 | Índices | Índices adicionais para otimização. |

Principais entidades e relacionamentos:

- **User**: dados de identificação e autenticação do usuário. É o "dono" das demais entidades.
- **Account**: conta financeira (corrente, poupança, carteira, cartão de crédito, investimento), com saldo inicial e saldo atual.
- **Category**: categoria de receita ou despesa, pertencente a um usuário.
- **Transaction**: receita ou despesa associada a uma conta (obrigatória) e a uma categoria (opcional). A receita soma ao saldo e a despesa subtrai.
- **FutureTransaction**: conta a pagar/receber, com data de vencimento e status, podendo gerar uma transação ao ser paga.
- **Recurrence**: receita/despesa recorrente com frequência, que gera transações ao ser executada.
- **Budget**: orçamento mensal por categoria, usado para acompanhar o limite de gastos.

Todos os registros são vinculados ao usuário (`user_id`), garantindo o isolamento dos dados.

---

## Autenticação e segurança

A autenticação é **stateless** e baseada em **JWT**:

1. O usuário se cadastra em `POST /api/auth/register` ou realiza login em `POST /api/auth/login`. A senha é armazenada como hash **BCrypt** (nunca em texto puro).
2. No login, o backend valida as credenciais e gera um token JWT assinado com uma chave secreta (`app.jwt.secret`). O token contém o e-mail, o `userId` e a `role` do usuário como claims, e tem validade configurável (`app.jwt.expiration`, padrão 24 horas).
3. Em cada requisição, o filtro `JwtAuthFilter` lê o token do cabeçalho `Authorization: Bearer <token>`, valida a assinatura e a expiração e, se válido, carrega o usuário no `SecurityContext`.
4. Os controllers obtêm o id do usuário autenticado por meio de `SecurityUtils.getAuthenticatedUserId()` e usam esse id em todas as consultas, garantindo que cada usuário acesse apenas os próprios dados.

Configuração de segurança (`SecurityConfig`):

- Rotas públicas: `/api/auth/register`, `/api/auth/login` e a documentação Swagger (`/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**`).
- As demais rotas exigem autenticação (`anyRequest().authenticated()`).
- Sessão desabilitada (`SessionCreationPolicy.STATELESS`).
- CSRF desabilitado (API sem estado) e CORS liberado para todas as origens.
- O filtro JWT é executado antes do filtro padrão de autenticação.

O sistema define dois papéis (`UserRole`): `USER` e `ADMIN`. O papel é transportado no token como authority `ROLE_USER`/`ROLE_ADMIN`, mas, no estado atual, nenhum endpoint restringe o acesso por papel (apenas a autenticação é exigida).

---

## Configuração do ambiente

As configurações ficam em `src/main/resources/application.yml` e são preenchidas por variáveis de ambiente. O arquivo `env.example` serve de modelo.

| Variável | Descrição | Valor padrão |
|---|---|---|
| `DB_HOST` | Host do PostgreSQL. | `localhost` |
| `DB_PORT` | Porta do PostgreSQL. | `5432` |
| `DB_NAME` | Nome do banco de dados. | `vault` |
| `DB_USERNAME` | Usuário do banco. | `vault` |
| `DB_PASSWORD` | Senha do banco. | `vault123` |
| `JWT_SECRET` | Chave secreta do JWT (mínimo de 32 caracteres). | (valor interno) |
| `JWT_EXPIRATION` | Validade do token em milissegundos. | `86400000` (24 h) |
| `PORT` | Porta HTTP da aplicação. | `8080` |

Exemplo de `.env` (valores fictícios):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vault
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=uma_chave_secreta_forte_com_pelo_menos_32_caracteres
JWT_EXPIRATION=86400000
PORT=8080
```

Nunca compartilhe ou versione valores reais de senha ou chave secreta.

---

## Pré-requisitos

Para executar o backend é necessário:

- **Java 21** (JDK).
- **Maven 3.9+**.
- **PostgreSQL 16** (ou Docker para subir o banco).
- **Docker e Docker Compose** (opcional, para o modo contêiner).

O projeto não utiliza o wrapper do Maven (`mvnw`); os comandos usam o Maven instalado no ambiente (ou a cópia disponível em `maven/`).

---

## Como executar

### Opção A — Com Docker

Sobe o PostgreSQL e a aplicação juntos:

```bash
docker compose up --build
```

A API fica disponível em `http://localhost:8080`.

### Opção B — Banco local + Maven

1. Suba um PostgreSQL e crie um banco chamado `vault` (ou ajuste as variáveis `DB_*`).
2. Defina as variáveis de ambiente (ou crie um `.env` a partir do `env.example`).
3. Execute a aplicação:

```bash
mvn spring-boot:run
```

Após iniciar, a API responde em `http://localhost:8080`, a documentação Swagger está em `http://localhost:8080/swagger-ui.html` e o JSON do OpenAPI em `http://localhost:8080/v3/api-docs`.

---

## Testes

Os testes ficam em `src/test/java/com/projeto/vault/` e utilizam JUnit 5, Mockito e AssertJ. O teste de contexto usa o perfil `test` com banco H2 em memória (modo PostgreSQL), sem depender de um PostgreSQL real.

| Arquivo | Tipo | Descrição |
|---|---|---|
| `AuthServiceTest` | Unitário | Registro e login (credenciais válidas, e-mail duplicado, senha incorreta, usuário inativo). |
| `TransactionServiceTest` | Unitário | Criação de receita/despesa e impacto no saldo. |
| `UserServiceTest` | Unitário | Alteração de senha (correta/incorreta). |
| `VaultApplicationTests` | Contexto | Smoke test que valida o carregamento do contexto Spring. |

Para executar todos os testes:

```bash
mvn test
```

---

## Integração com o frontend

O Vault possui um frontend em React que consome a API REST do backend. O frontend usa o axios com `baseURL: '/api'` e, em desenvolvimento, o Vite faz proxy das chamadas `/api` para `http://localhost:8080` (porta do backend).

A integração funciona da seguinte forma:

- O frontend armazena o token JWT no `localStorage` e o envia no cabeçalho `Authorization: Bearer <token>` em todas as requisições autenticadas.
- Em caso de resposta `401`, o frontend remove o token e redireciona para a tela de login.
- Os principais recursos consumidos são: autenticação, usuário, contas, categorias, transações, orçamentos, recorrências, contas a pagar/receber, dashboard e relatórios.

O foco deste documento é o backend; o frontend é apenas o consumidor da API.

---

## Exemplos de utilização

Fluxo completo: cadastro, login e criação de uma transação.

1. Cadastro:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

2. Login (retorna o token):

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "123456"
}
```

3. Criação de conta com o token:

```http
POST /api/accounts
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json

{
  "name": "Conta Corrente",
  "type": "CHECKING",
  "initialBalance": 1000.00
}
```

4. Criação de uma despesa:

```http
POST /api/transactions
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json

{
  "description": "Supermercado",
  "amount": 250.00,
  "type": "EXPENSE",
  "transactionDate": "2025-01-15",
  "accountId": 1,
  "categoryId": 2
}
```

---

## Observações

- O projeto não possui um arquivo de licença (`LICENSE`) no repositório.
- O `docker-compose.yml` utiliza as variáveis `DB_USER`, `APP_JWT_SECRET` e `APP_PORT`, enquanto o `application.yml` lê `DB_USERNAME`, `JWT_SECRET` e `PORT`. Como os valores padrão do `application.yml` coincidem com os do Compose, a aplicação sobe corretamente; ainda assim, o ideal seria alinhar os nomes das variáveis.
- O `env.example` sugere usuário/senha `postgres`, enquanto o `docker-compose.yml` cria o usuário `vault`/`vault123`. Ao executar localmente, use credenciais compatíveis com o seu banco.
- A aplicação usa `ddl-auto: validate`; o schema deve ser criado pelas migrations do Flyway (o Spring Boot as executa automaticamente na inicialização).
- O campo `transactionCount` do resumo do dashboard (`/api/dashboard/summary`) é retornado como `0` no código atual (simplificação).
- Nenhuma senha, chave ou segredo real foi incluído neste documento.