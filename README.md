# ISS_front

## Visão geral

Este frontend foi desenvolvido em Angular para gerenciar o fluxo completo de importação, exportação, autenticação, histórico e consulta de notas fiscais de ISS.

A aplicação se comunica com a API em `http://localhost:8000` e oferece uma interface para:

- login e controle de sessão
- importação de arquivos TXT
- consulta de histórico de processamento
- exportação de notas para o formato SIGISSWEB
- acompanhamento de status, erros e valores de ISS

## Como usar a aplicação corretamente

### 1. Preparação do ambiente

Antes de iniciar a aplicação, certifique-se de que o backend do projeto ISS_back esteja rodando na porta `8000`.

Depois, no diretório do frontend execute:

```bash
npm install
npm start
```

A interface normalmente fica disponível em:

```text
http://localhost:4200
```

### 2. Login

Acesse a tela de login e informe as credenciais válidas do sistema.

Se o usuário estiver autenticado, a sessão será salva no navegador e a aplicação liberará o acesso às páginas internas.

### 3. Importação de arquivos

Na tela de importação, carregue um arquivo TXT com a estrutura esperada:

```text
numero;serie;data_emissao;cnpj_prestador;razao_social_prestador;documento_tomador;razao_social_tomador;codigo_lc116;municipio_ibge;valor_servico
```

Campos obrigatórios:

- numero
- data_emissao
- cnpj_prestador
- codigo_lc116
- valor_servico

Formato recomendado:

- data_emissao: `YYYY-MM-DD` ou `YYYY-MM-DD HH:MM:SS`
- valor_servico: use `1000,50` ou `1.000,50`
- arquivo: somente `.txt`

### 4. Verificação no histórico

Após a importação, utilize a tela de histórico para:

- confirmar o status da importação
- validar linhas processadas
- verificar erros e valores totais
- consultar o ISS acumulado

Os filtros ajudam a localizar registros específicos antes de exportar ou revisar o processamento.

### 5. Exportação de nota

Na tela de exportação, escolha uma nota disponível para exportar e configure corretamente:

- Regime: `V`, `S`, `M` ou `L`
- Retenção: `N`, `S`, `F`, `D` ou `I`
- Homologação: marque apenas quando for uma validação

Ao confirmar, a aplicação gera um arquivo TXT no formato solicitado para uso com o SIGISSWEB.

## Fluxo ideal de uso

1. Faça login.
2. Importe um arquivo TXT corretamente formatado.
3. Revise a importação pelo histórico.
4. Se necessário, exporte a nota desejada com os parâmetros corretos.
5. Mantenha o backend em execução durante o uso do sistema localmente.

## Estrutura principal do projeto

- `src/app/layout`: layout, menus, autenticação, serviços e interfaces
- `src/app/pages`: páginas de uso da aplicação, como documentação, dashboard, login e CRUD
- `src/app/layout/service`: serviços que consomem a API e controlam autenticação
- `src/assets`: estilos e recursos visuais do sistema

## Principais serviços

- `AuthService`: login, logout e controle de sessão
- `LayoutService`: tema e configuração visual da interface
- `ApiService`: integração com a API do backend
- `importar.service.ts`: importação, histórico e exportação

## Dependências principais

- Angular 21
- PrimeNG
- PrimeIcons
- RxJS
- TypeScript

## Comandos úteis

```bash
npm install
npm start
npm run build
npm run test
```

## Observações importantes

- O backend precisa estar em execução em `http://localhost:8000`.
- A API base está configurada no serviço de comunicação do frontend; se a porta ou caminho do backend mudar, o ajuste deve ser feito ali.
- Sempre valide a estrutura do arquivo antes de importar, para evitar erros de processamento.
- O uso de homologação deve ser limitado a validação e não a geração de arquivos definitivos.