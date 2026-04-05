# Desafio tecnico - Automacao Web E2E

Automacao de testes end-to-end com Playwright e TypeScript para o site Magento demo.

## Objetivo

Automatizar os fluxos solicitados no enunciado:

- Cadastro de usuario
- Login
- Adicionar produto ao carrinho
- Finalizacao de compra (checkout)
- Relatorio de execucao

Site alvo: https://magento2-demo.magebit.com

## Stack escolhida

- Framework: Playwright Test
- Linguagem: TypeScript
- Dotenv para configuracao de ambiente

## Estrutura do projeto

```text
.
|- tests/
|  |- api/
|  |  \- automacao-desafio.spec.ts
|  \- support/
|     |- data-factory.ts
|     \- test-helpers.ts
|- .env.example
|- playwright.config.ts
|- package.json
|- README.md
\- tsconfig.json
```

## Como instalar

```bash
npm install
npx playwright install
```

## Como executar

1. Opcional: criar o arquivo .env baseado em .env.example para sobrescrever a URL.
2. Executar os testes:

```bash
npm test
npx playwright test
```

3. Abrir o relatorio HTML:

```bash
npm run report:show
```

## Cenario automatizado

- Fluxo completo em um unico teste:
- Cadastro de novo usuario
- Login
- Adicao de produto no carrinho
- Checkout com preenchimento de endereco e envio do pedido
- Validacao de mensagem de sucesso da compra

## Observacoes

- O email do usuario e gerado dinamicamente para evitar conflito entre execucoes.
- O teste usa apenas um worker para reduzir flakiness em ambiente compartilhado.
