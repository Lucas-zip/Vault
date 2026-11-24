# Vault — Frontend

Aplicação web do **Vault** (controle financeiro pessoal), construída com **React + TypeScript + Vite**. Consome a API REST do backend Spring Boot.

> Documentação geral do projeto: [`../README.md`](../README.md) · Documentação da API: [`../vault/README.md`](../vault/README.md)

## Requisitos

- Node.js 20+
- Backend do Vault em execução em `http://localhost:8080`

## Como executar

```bash
npm install      # apenas na primeira vez
npm run dev      # http://localhost:5173
```

O Vite faz proxy de `/api` para `http://localhost:8080` (configurado em `vite.config.ts`), portanto **o backend precisa estar rodando** para que login e demais telas funcionem.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR em `http://localhost:5173` |
| `npm run build` | Checagem de tipos (`tsc -b`) e build de produção em `dist/` |
| `npm run preview` | Serve localmente o build de produção |
| `npm run lint` | Lint com Oxlint |

## Estrutura

```text
src/
├── components/   # Layout, componentes de UI, gráficos e painéis de metas
├── context/      # AuthContext (token JWT no localStorage, usuário logado)
├── pages/        # Dashboard, Transações, Contas, Categorias, Orçamentos,
│                 # Metas, Investimentos, Recorrências, Login, Registro
├── services/     # api.ts — cliente Axios com baseURL '/api'
├── types/        # Tipos TypeScript do contrato da API
└── utils/        # Formatação de valores/datas e regras auxiliares
```

## Autenticação

O token JWT é guardado no `localStorage` e enviado em todas as requisições como `Authorization: Bearer <token>`. Em respostas `401`, o token é removido e o usuário é redirecionado para a tela de login.

## Estilo

Tailwind CSS 4 com tokens de design (`bg-background`, `text-muted-fg`, `border-border`, `text-accent`, `bg-success-soft`, `focus-ring`). Ícones de `lucide-react`.
