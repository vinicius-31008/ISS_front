import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-documentation',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="doc-shell">
            <header class="doc-header">
                <div>
                    <span class="eyebrow">ISS Front</span>
                    <h1>Documentação do sistema</h1>
                </div>
                <div class="header-badges">
                    <span>Angular 21</span>
                    <span>PrimeNG</span>
                    <span>API PHP</span>
                </div>
            </header>

            <section class="hero-card">
                <div class="hero-copy">
                    <p class="lead">
                        Esta aplicação foi desenvolvida para centralizar o fluxo de importação, exportação, histórico e gestão de
                        notas fiscais de ISS em um painel web simples e organizado.
                    </p>
                    <p>
                        O frontend se comunica com a API do backend em <strong>http://localhost:8000</strong> e oferece uma experiência
                        para autenticação, consulta, importação de arquivos TXT e geração de arquivos de exportação para SIGISSWEB.
                    </p>
                </div>
                <div class="hero-panel">
                    <div class="mini-stat">
                        <span class="label">Ambiente</span>
                        <strong>Local</strong>
                    </div>
                    <div class="mini-stat">
                        <span class="label">Frontend</span>
                        <strong>Angular</strong>
                    </div>
                    <div class="mini-stat">
                        <span class="label">Backend</span>
                        <strong>PHP</strong>
                    </div>
                </div>
            </section>

            <section class="doc-grid">
                <article class="doc-card">
                    <div class="card-icon"><i class="pi pi-sign-in"></i></div>
                    <h2>1. Como acessar</h2>
                    <ol>
                        <li>Inicie o backend do projeto ISS_back na porta <strong>8000</strong>.</li>
                        <li>Instale as dependências do frontend com <code>npm install</code>.</li>
                        <li>Execute <code>npm start</code> e acesse <strong>http://localhost:4200</strong>.</li>
                        <li>Faça login com o usuário cadastrado no sistema.</li>
                    </ol>
                </article>

                <article class="doc-card">
                    <div class="card-icon"><i class="pi pi-file-import"></i></div>
                    <h2>2. Importação correta</h2>
                    <p>Na tela de importação, envie um arquivo TXT com o formato esperado:</p>
                    <pre>numero;serie;data_emissao;cnpj_prestador;razao_social_prestador;documento_tomador;razao_social_tomador;codigo_lc116;municipio_ibge;valor_servico</pre>
                    <ul>
                        <li>Arquivos aceitos: somente <strong>.txt</strong>.</li>
                        <li>Campo obrigatório: <strong>numero, data_emissao, cnpj_prestador, codigo_lc116 e valor_servico</strong>.</li>
                        <li>Use datas no formato <strong>YYYY-MM-DD</strong> ou <strong>YYYY-MM-DD HH:MM:SS</strong>.</li>
                    </ul>
                </article>

                <article class="doc-card">
                    <div class="card-icon"><i class="pi pi-download"></i></div>
                    <h2>3. Exportação</h2>
                    <p>Na página de exportação, selecione uma nota disponível na lista e informe:</p>
                    <ul>
                        <li><strong>Regime</strong>: V, S, M ou L</li>
                        <li><strong>Retenção</strong>: N, S, F, D ou I</li>
                        <li><strong>Homologação</strong>: marcar apenas para validação</li>
                    </ul>
                    <p>O sistema gera automaticamente o arquivo TXT para uso no SIGISSWEB.</p>
                </article>

                <article class="doc-card">
                    <div class="card-icon"><i class="pi pi-history"></i></div>
                    <h2>4. Histórico e acompanhamento</h2>
                    <p>A tela de histórico mostra:</p>
                    <ul>
                        <li>quantidade de registros</li>
                        <li>status das importações</li>
                        <li>linhas processadas e erros</li>
                        <li>valor total do ISS</li>
                    </ul>
                    <p>Use os filtros para localizar registros específicos antes de exportar ou revisar o resultado.</p>
                </article>
            </section>

            <section class="info-block">
                <div class="section-title">
                    <i class="pi pi-shield"></i>
                    <h2>Fluxo correto de uso</h2>
                </div>
                <div class="steps">
                    <div class="step">
                        <span class="step-number">01</span>
                        <div>
                            <h3>Login</h3>
                            <p>Entre com credenciais válidas e confirme que a sessão esteja ativa.</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">02</span>
                        <div>
                            <h3>Importe a base</h3>
                            <p>Carregue apenas arquivos TXT no padrão da aplicação. Evite campos em branco ou estrutura inconsistente.</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">03</span>
                        <div>
                            <h3>Valide no histórico</h3>
                            <p>Consulte os registros processados para verificar erros, status e total de ISS.</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">04</span>
                        <div>
                            <h3>Exporte a nota</h3>
                            <p>Selecione a nota correta e configure regime, retenção e homologação antes de gerar o arquivo.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="info-block">
                <div class="section-title">
                    <i class="pi pi-cog"></i>
                    <h2>Estrutura do projeto</h2>
                </div>
                <ul class="structure-list">
                    <li><strong>src/app/layout</strong>: layout, menus, autenticação, serviços e interfaces.</li>
                    <li><strong>src/app/pages</strong>: páginas da aplicação, como dashboard, login, documentação e CRUD.</li>
                    <li><strong>src/app/layout/service</strong>: serviços de API, guards e autenticação.</li>
                    <li><strong>src/assets</strong>: estilos e recursos visuais da interface.</li>
                </ul>
            </section>

            <section class="info-block">
                <div class="section-title">
                    <i class="pi pi-sparkles"></i>
                    <h2>Boas práticas</h2>
                </div>
                <ul class="structure-list">
                    <li>Não altere a porta do backend sem ajustar o endereço da API no serviço de comunicação.</li>
                    <li>Use sempre os filtros do histórico antes de revisar dados específicos.</li>
                    <li>Valide a exportação apenas em notas realmente importadas e disponíveis para processamento.</li>
                    <li>Mantenha o backend e o frontend em execução simultaneamente durante o uso local.</li>
                </ul>
            </section>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 0.5rem 0 2rem;
        }

        .doc-shell {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .doc-header,
        .hero-card,
        .doc-card,
        .info-block {
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: 1rem;
            box-shadow: 0 12px 32px -18px color-mix(in srgb, var(--primary-color) 34%, transparent);
        }

        .doc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 1.5rem 1.75rem;
            border-top: 3px solid var(--app-accent);
        }

        .eyebrow {
            display: inline-block;
            margin-bottom: 0.5rem;
            padding: 0.4rem 0.75rem;
            border-radius: 999px;
            background: var(--app-accent-faint);
            color: var(--primary-color);
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .doc-header h1 {
            margin: 0;
            font-size: clamp(1.8rem, 2.3vw, 2.6rem);
            color: var(--text-color);
        }

        .header-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .header-badges span {
            padding: 0.45rem 0.8rem;
            border-radius: 999px;
            background: var(--surface-ground);
            color: var(--text-color-secondary);
            font-size: 0.8rem;
            font-weight: 600;
        }

        .hero-card {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 1.5rem;
            padding: 1.5rem 1.75rem;
        }

        .hero-copy {
            color: var(--text-color);
        }

        .hero-copy .lead {
            margin: 0 0 0.75rem;
            font-size: 1.08rem;
            line-height: 1.7;
        }

        .hero-copy p {
            margin: 0;
            color: var(--text-color-secondary);
            line-height: 1.7;
        }

        .hero-panel {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.75rem;
            align-items: stretch;
        }

        .mini-stat {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100px;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 0.9rem;
            background: linear-gradient(135deg, var(--app-accent-soft), var(--surface-ground));
        }

        .mini-stat .label {
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--text-color-secondary);
        }

        .mini-stat strong {
            margin-top: 0.4rem;
            font-size: 1.1rem;
            color: var(--text-color);
        }

        .doc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.25rem;
            align-items: stretch;
            grid-auto-rows: 1fr;
        }

        .doc-card {
            padding: 1.5rem;
            height: 100%;
        }

        .card-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2.8rem;
            height: 2.8rem;
            border-radius: 0.8rem;
            background: var(--app-accent-faint);
            color: var(--primary-color);
            font-size: 1.15rem;
            margin-bottom: 0.9rem;
        }

        .doc-card h2 {
            margin: 0 0 0.85rem;
            font-size: 1.1rem;
            color: var(--text-color);
        }

        .doc-card p,
        .doc-card li,
        .doc-card ol,
        .doc-card ul {
            color: var(--text-color-secondary);
            line-height: 1.7;
        }

        .doc-card ol,
        .doc-card ul,
        .structure-list {
            margin: 0;
            padding-left: 1.2rem;
        }

        .doc-card pre {
            margin: 0.7rem 0 1rem;
            padding: 0.8rem 0.9rem;
            border-radius: 0.8rem;
            background: var(--surface-ground);
            color: var(--text-color);
            border: 1px solid var(--surface-border);
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
        }

        code {
            font-family: 'Courier New', monospace;
            background: var(--surface-ground);
            border: 1px solid var(--surface-border);
            border-radius: 0.5rem;
            padding: 0.15rem 0.45rem;
            color: var(--text-color);
        }

        .info-block {
            padding: 1.5rem 1.75rem;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 0.7rem;
            margin-bottom: 1rem;
        }

        .section-title i {
            color: var(--primary-color);
        }

        .section-title h2 {
            margin: 0;
            font-size: 1.25rem;
            color: var(--text-color);
        }

        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            align-items: stretch;
            grid-auto-rows: 1fr;
        }

        .step {
            display: flex;
            gap: 0.9rem;
            height: 100%;
            padding: 1rem;
            border: 1px solid var(--surface-border);
            border-radius: 0.85rem;
            background: var(--surface-ground);
        }

        .step-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2.1rem;
            height: 2.1rem;
            border-radius: 50%;
            background: var(--app-accent);
            color: #fff;
            font-weight: 700;
            font-size: 0.8rem;
        }

        .step h3 {
            margin: 0 0 0.35rem;
            color: var(--text-color);
            font-size: 1rem;
        }

        .step p {
            margin: 0;
            color: var(--text-color-secondary);
            line-height: 1.6;
        }

        .structure-list {
            display: grid;
            gap: 0.75rem;
            color: var(--text-color-secondary);
            line-height: 1.7;
        }

        @media (max-width: 768px) {
            .doc-header,
            .hero-card {
                grid-template-columns: 1fr;
                display: grid;
            }

            .doc-header {
                padding: 1.2rem 1.25rem;
            }

            .hero-card,
            .info-block,
            .doc-card {
                padding: 1.2rem 1.25rem;
            }

            .header-badges {
                justify-content: flex-start;
            }

            .hero-panel {
                grid-template-columns: 1fr;
            }
        }
    `
})
export class Documentation {}
