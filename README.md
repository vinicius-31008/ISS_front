# ISS_front

## Visão geral

Este frontend foi desenvolvido em Angular para gerir o fluxo de importação, autenticação e acompanhamento de empresas, usuários, histórico e processos de importação de dados. A aplicação trabalha em conjunto com uma API PHP localizada em `http://localhost:8000/src`, que expõe endpoints como login, logout, histórico, importação e dados de consulta.

## Como o projeto funciona

A aplicação usa uma arquitetura baseada em componentes standalone do Angular, com serviços injetáveis para controle de sessão, layout e consumo de API. O fluxo principal é:

- O usuário acessa a tela de login e envia email e senha.
- O `AuthService` chama o endpoint `/api/login.php`.
- Se a resposta for válida, a sessão é salva no `localStorage` e o estado de autenticação do Angular é atualizado.
- Os guards e rotas protegem páginas administrativas e de acesso restrito.
- Os serviços de domínio fazem requisições à API para histórico, importação, empresas e usuários.

## Fluxo de autenticação

A classe `AuthService` mantém a sessão em memória através de signals e valida a expiração do token com base em data e hora. Em caso de expiração ou logout, a aplicação limpa a sessão local e redireciona para `/auth/login`.

## Estrutura principal do projeto

- `src/app/layout`: estrutura base da aplicação, menus, topbar, sidebar, autenticação e serviços de layout.
- `src/app/pages`: telas e módulos da interface, como documentação, dashboard, login e CRUD.
- `src/app/layout/interfaces`: interfaces TypeScript para empresas, histórico, importação e usuários.
- `src/app/layout/service`: serviços de API, guards, autenticação e gerenciamento do layout.
- `src/assets`: estilos globais, assets visuais e tema do sistema.

## Principais serviços e responsabilidades

- `AuthService`: login, logout, manutenção de sessão e controle de acesso.
- `LayoutService`: tema, modo do menu, sidebar e estado visual da aplicação.
- `ApiService`: comunicação com endpoints de saúde, histórico e importação.
- `empresas.service.ts`, `usuarios.service.ts` e `importar.service.ts`: integrações específicas de domínio.

## Rotas e navegação

A navegação principal é definida em `src/app/pages/pages.routes.ts`. A aplicação possui rotas como documentação, CRUD, autenticação e fallback de página não encontrada.

## Dependências principais

- Angular 21: framework principal da aplicação.
- PrimeNG: biblioteca de componentes UI.
- PrimeIcons: ícones do sistema.
- Tailwind CSS: utilitários para layout e espaçamento.
- RxJS: programação reativa e streams assíncronos.
- Chart.js: gráficos e visualizações.
- TypeScript: tipagem e organização do código.

## Como rodar o projeto localmente

No diretório do projeto, execute:

```bash
npm install
npm start
```

O projeto normalmente fica disponível em `http://localhost:4200/`. O backend precisa estar em execução em `http://localhost:8000` para que as ações de login, importação e consulta funcionem corretamente.

## Comandos úteis

```bash
npm start        # inicia a aplicação em modo desenvolvimento
npm run build    # gera a build de produção
npm run test     # executa os testes
```

## Observações importantes

A API base está configurada em `src/app/layout/service/importar.service.ts` como `http://localhost:8000/src`. Se o backend mudar de porta ou pasta, esse valor precisa ser ajustado.

A camada de autenticação salva dados sensíveis no navegador e valida a expiração antes de autorizar acesso. Sempre mantenha a sessão e a API sincronizadas.