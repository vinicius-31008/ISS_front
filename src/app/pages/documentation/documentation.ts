import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="card">
            <div class="font-semibold text-2xl mb-4">Documentação do projeto</div>

            <div class="font-semibold text-xl mb-4">Visão geral</div>
            <p class="text-lg mb-4">
                Este frontend foi desenvolvido em Angular para gerir o fluxo de importação, autenticação e acompanhamento de empresas,
                usuários, histórico e processos de importação de dados. A aplicação trabalha em conjunto com uma API PHP localizada em
                <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">http://localhost:8000/src</span>,
                que expõe endpoints como login, logout, histórico, importação e dados de consulta.
            </p>

            <div class="font-semibold text-xl mb-4">Como o projeto funciona</div>
            <p class="text-lg mb-4">
                A aplicação usa uma arquitetura baseada em componentes standalone do Angular, com serviços injetáveis para controle de sessão,
                layout e consumo de API. O fluxo principal é:
            </p>
            <ul class="leading-normal list-disc pl-8 text-lg mb-4">
                <li>O usuário acessa a tela de login e envia email e senha.</li>
                <li>O <span class="text-primary font-medium">AuthService</span> chama o endpoint <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">/api/login.php</span>.</li>
                <li>Se a resposta for válida, a sessão é salva no <span class="text-primary font-medium">localStorage</span> e o estado de autenticação do Angular é atualizado.</li>
                <li>Os guards e rotas protegem páginas administrativas e de acesso restrito.</li>
                <li>Os serviços de domínio fazem requisições à API para histórico, importação, empresas e usuários.</li>
            </ul>

            <div class="font-semibold text-xl mb-4">Fluxo de autenticação</div>
            <p class="text-lg mb-4">
                A classe <span class="text-primary font-medium">AuthService</span> mantém a sessão em memória através de signals e valida a expiração
                do token com base em data e hora. Em caso de expiração ou logout, a aplicação limpa a sessão local e redireciona para
                <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">/auth/login</span>.
            </p>

            <div class="font-semibold text-xl mb-4">Estrutura principal do projeto</div>
            <ul class="leading-normal list-disc pl-8 text-lg mb-4">
                <li><span class="text-primary font-medium">src/app/layout</span>: estrutura base da aplicação, menus, topbar, sidebar, autenticação e serviços de layout.</li>
                <li><span class="text-primary font-medium">src/app/pages</span>: telas e módulos da interface, como documentação, dashboard, login e CRUD.</li>
                <li><span class="text-primary font-medium">src/app/layout/interfaces</span>: interfaces TypeScript para empresas, histórico, importação e usuários.</li>
                <li><span class="text-primary font-medium">src/app/layout/service</span>: serviços de API, guards, autenticação e gerenciamento do layout.</li>
                <li><span class="text-primary font-medium">src/assets</span>: estilos globais, assets visuais e tema do sistema.</li>
            </ul>

            <div class="font-semibold text-xl mb-4">Principais serviços e responsabilidades</div>
            <ul class="leading-normal list-disc pl-8 text-lg mb-4">
                <li><span class="text-primary font-medium">AuthService</span>: login, logout, manutenção de sessão e controle de acesso.</li>
                <li><span class="text-primary font-medium">LayoutService</span>: tema, modo do menu, sidebar e estado visual da aplicação.</li>
                <li><span class="text-primary font-medium">ApiService</span>: comunicação com endpoints de saúde, histórico e importação.</li>
                <li><span class="text-primary font-medium">empresas.service.ts</span>, <span class="text-primary font-medium">usuarios.service.ts</span> e <span class="text-primary font-medium">importar.service.ts</span>: integrações específicas de domínio.</li>
            </ul>

            <div class="font-semibold text-xl mb-4">Rotas e navegação</div>
            <p class="text-lg mb-4">
                A navegação principal é definida em <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">src/app/pages/pages.routes.ts</span>.
                A aplicação possui rotas como documentação, CRUD, autenticação e fallback de página não encontrada.
            </p>

            <div class="font-semibold text-xl mb-4">Dependências principais</div>
            <ul class="leading-normal list-disc pl-8 text-lg mb-4">
                <li><span class="text-primary font-medium">Angular 21</span>: framework principal da aplicação.</li>
                <li><span class="text-primary font-medium">PrimeNG</span>: biblioteca de componentes UI.</li>
                <li><span class="text-primary font-medium">PrimeIcons</span>: ícones do sistema.</li>
                <li><span class="text-primary font-medium">Tailwind CSS</span>: utilitários para layout e espaçamento.</li>
                <li><span class="text-primary font-medium">RxJS</span>: programação reativa e streams assíncronos.</li>
                <li><span class="text-primary font-medium">Chart.js</span>: gráficos e visualizações.</li>
                <li><span class="text-primary font-medium">TypeScript</span>: tipagem e organização do código.</li>
            </ul>

            <div class="font-semibold text-xl mb-4">Como rodar o projeto localmente</div>
            <p class="text-lg mb-4">No diretório do projeto, execute:</p>
            <pre class="app-code"><code>npm install
npm start</code></pre>
            <p class="text-lg mb-4">
                O projeto normalmente fica disponível em <i class="bg-highlight px-2 py-1 rounded-border not-italic text-base">http://localhost:4200/</i>.
                O backend precisa estar em execução em <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">http://localhost:8000</span>
                para que as ações de login, importação e consulta funcionem corretamente.
            </p>

            <div class="font-semibold text-xl mb-4">Comandos úteis</div>
            <pre class="app-code"><code>npm start        # inicia a aplicação em modo desenvolvimento
npm run build    # gera a build de produção
npm run test     # executa os testes</code></pre>

            <div class="font-semibold text-xl mb-4">Observações importantes</div>
            <p class="text-lg mb-4">
                A API base está configurada em <span class="bg-highlight px-2 py-1 rounded-border not-italic text-base">src/app/layout/service/importar.service.ts</span>
                como <span class="text-primary font-medium">http://localhost:8000/src</span>. Se o backend mudar de porta ou pasta, esse valor precisa ser ajustado.
            </p>
            <p class="text-lg mb-4">
                A camada de autenticação salva dados sensíveis no navegador e valida a expiração antes de autorizar acesso. Sempre mantenha a sessão e a API sincronizadas.
            </p>
        </div>
    `,
    styles: `
        @media screen and (max-width: 991px) {
            .video-container {
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 56.25%;

                iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    `
})
export class Documentation {}
