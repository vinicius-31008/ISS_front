import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../service/importar.service';

interface INotaExportavel {
    id: number;
    label: string;
    numero: string;
    serie: string;
    data_emissao: string;
    valor_iss: number;
    status: string;
}

interface INotaDetalheResponse {
    id: number;
    numero: string;
    serie: string;
    data_emissao: string;
    valor_iss: number;
    status: string;
}

interface IDetalheImportacaoResponse {
    sucesso: boolean;
    dados?: {
        notas?: INotaDetalheResponse[];
    };
}

@Component({
    selector: 'app-exportacao-nota',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, SelectModule, CheckboxModule],
    template: `
        <div class="exportacao-wrapper">
            <div class="exportacao-card">
                <div class="exportacao-header">
                    <div>
                        <h2>Exportar nota para ISS</h2>
                        <p>Selecione uma nota fiscal já cadastrada para gerar o arquivo TXT do SIGISSWEB.</p>
                    </div>
                    <a routerLink="/historico" class="link-historico">
                        <i class="pi pi-history"></i>
                        Ver histórico
                    </a>
                </div>

                <div class="exportacao-body">
                    <div class="campo">
                        <label for="nota-id">Nota fiscal</label>
                        @if (carregandoNotas()) {
                            <div class="select-loading">
                                <i class="pi pi-spin pi-spinner"></i>
                                Carregando notas...
                            </div>
                        } @else {
                            <p-select
                                inputId="nota-id"
                                [options]="notasDisponiveis()"
                                optionLabel="label"
                                optionValue="id"
                                placeholder="Selecione uma nota"
                                [showClear]="false"
                                [(ngModel)]="notaId"
                                [disabled]="notasDisponiveis().length === 0"
                            />
                        }
                    </div>

                    @if (!carregandoNotas() && notasDisponiveis().length === 0) {
                        <div class="aviso aviso-falha">
                            <i class="pi pi-exclamation-triangle"></i>
                            Nenhuma nota disponível para exportação.
                        </div>
                    }

                    <div class="campo-grid">
                        <div class="campo">
                            <label for="regime">Regime</label>
                            <p-select
                                inputId="regime"
                                [options]="opcoesRegime"
                                optionLabel="label"
                                optionValue="value"
                                [(ngModel)]="regime"
                                [showClear]="false"
                            />
                        </div>

                        <div class="campo">
                            <label for="retencao">Retenção</label>
                            <p-select
                                inputId="retencao"
                                [options]="opcoesRetencao"
                                optionLabel="label"
                                optionValue="value"
                                [(ngModel)]="retencao"
                                [showClear]="false"
                            />
                        </div>
                    </div>

                    <div class="campo-check">
                        <p-checkbox
                            [(ngModel)]="homologacao"
                            [binary]="true"
                            inputId="homologacao"
                            label="Homologação (somente validação)"
                        />
                    </div>

                    @if (erro()) {
                        <div class="aviso aviso-falha">
                            <i class="pi pi-exclamation-triangle"></i>
                            {{ erro() }}
                        </div>
                    }

                    @if (mensagem()) {
                        <div class="aviso aviso-sucesso">
                            <i class="pi pi-check-circle"></i>
                            {{ mensagem() }}
                        </div>
                    }

                    <div class="acoes">
                        <p-button
                            label="Exportar TXT"
                            icon="pi pi-download"
                            [loading]="exportando()"
                            [disabled]="exportando() || !notaId || notaId < 1 || notasDisponiveis().length === 0"
                            (onClick)="exportar()"
                        />
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .exportacao-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                padding: 0.5rem 0;
            }

            .exportacao-card {
                background: var(--surface-card);
                border: 1px solid var(--surface-border);
                border-radius: 1rem;
                border-top: 3px solid var(--app-accent);
                box-shadow: 0 12px 32px -16px color-mix(in srgb, var(--app-accent) 45%, transparent);
                overflow: hidden;
            }

            .exportacao-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid var(--surface-border);
                background: linear-gradient(135deg, var(--app-accent-soft), transparent 65%);
            }

            .exportacao-header h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-color);
            }

            .exportacao-header p {
                margin: 0.35rem 0 0;
                color: var(--text-color-secondary);
            }

            .link-historico {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--primary-color);
                text-decoration: none;
            }

            .exportacao-body {
                display: flex;
                flex-direction: column;
                gap: 1.25rem;
                padding: 1.5rem;
            }

            .campo-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 1rem;
            }

            .campo {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .campo label {
                font-size: 0.75rem;
                color: var(--text-color-secondary);
                text-transform: uppercase;
                letter-spacing: 0.04em;
                font-weight: 600;
            }

            .campo-check {
                display: flex;
                align-items: center;
                min-height: 2.5rem;
            }

            .select-loading {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                min-height: 42px;
                color: var(--text-color-secondary);
            }

            .acoes {
                display: flex;
                justify-content: flex-start;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .aviso {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                border-radius: 0.75rem;
            }

            .aviso-falha {
                background: var(--app-falha-bg);
                color: var(--app-falha);
            }

            .aviso-sucesso {
                background: var(--app-sucesso-bg);
                color: var(--app-sucesso);
            }

            @media (max-width: 640px) {
                .exportacao-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.75rem;
                }

                .exportacao-body {
                    padding: 1rem;
                }

                .campo-grid {
                    grid-template-columns: 1fr;
                }
            }
        `
    ]
})
export class ExportacaoNotaComponent implements OnInit {
    private apiService = inject(ApiService);

    notaId: number | null = null;
    regime: 'S' | 'V' | 'M' | 'L' = 'V';
    retencao: 'N' | 'S' | 'F' | 'D' | 'I' = 'N';
    homologacao = false;
    readonly exportando = signal(false);
    readonly carregandoNotas = signal(false);
    readonly erro = signal('');
    readonly mensagem = signal('');
    readonly notasDisponiveis = signal<INotaExportavel[]>([]);

    readonly opcoesRegime = [
        { label: 'Variável (V)', value: 'V' },
        { label: 'Simples Nacional (S)', value: 'S' },
        { label: 'MEI (M)', value: 'M' },
        { label: 'Especial (L)', value: 'L' }
    ];

    readonly opcoesRetencao = [
        { label: 'Não retido (N)', value: 'N' },
        { label: 'Retido no município (S)', value: 'S' },
        { label: 'Retido fora (F)', value: 'F' },
        { label: 'Devido fora (D)', value: 'D' },
        { label: 'Sem incidência (I)', value: 'I' }
    ];

    ngOnInit(): void {
        this.carregarNotasDisponiveis();
    }

    private carregarNotasDisponiveis(): void {
        this.carregandoNotas.set(true);
        this.erro.set('');

        this.apiService.getHistorico<{ sucesso: boolean; dados?: { importacoes?: Array<{ id: number }> } }>({
            pagina: 1,
            por_pagina: 100
        }).subscribe({
            next: (resposta) => {
                const importacoes = resposta?.dados?.importacoes ?? [];
                const ids = importacoes.map((item) => item.id);

                if (!ids.length) {
                    this.notasDisponiveis.set([]);
                    this.carregandoNotas.set(false);
                    return;
                }

                forkJoin(
                    ids.map((idImportacao) => this.apiService.getHistorico<IDetalheImportacaoResponse>({
                        id: idImportacao
                    }))
                ).subscribe({
                    next: (detalhes) => {
                        const notas = detalhes
                            .flatMap((detalhe) => detalhe?.dados?.notas ?? [])
                            .map((nota) => ({
                                id: nota.id,
                                label: `#${nota.id} • Nº ${nota.numero} • ${nota.serie || 'S/'} • ${this.formatarData(nota.data_emissao)}`,
                                numero: nota.numero,
                                serie: nota.serie,
                                data_emissao: nota.data_emissao,
                                valor_iss: nota.valor_iss,
                                status: nota.status
                            }))
                            .sort((a, b) => b.id - a.id);

                        this.notasDisponiveis.set(notas);
                        this.notaId = notas.length > 0 ? notas[0].id : null;
                        this.carregandoNotas.set(false);
                    },
                    error: async (erro: HttpErrorResponse) => {
                        this.erro.set(await this.lerMensagemErro(erro));
                        this.notasDisponiveis.set([]);
                        this.carregandoNotas.set(false);
                    }
                });
            },
            error: async (erro: HttpErrorResponse) => {
                this.erro.set(await this.lerMensagemErro(erro));
                this.notasDisponiveis.set([]);
                this.carregandoNotas.set(false);
            }
        });
    }

    exportar(): void {
        const id = Number(this.notaId);

        if (!Number.isFinite(id) || id <= 0) {
            this.erro.set('Selecione uma nota válida para exportar.');
            this.mensagem.set('');
            return;
        }

        this.exportando.set(true);
        this.erro.set('');
        this.mensagem.set('');

        this.apiService.exportarNota(id, {
            regime: this.regime,
            retencao: this.retencao,
            homologacao: this.homologacao
        }).subscribe({
            next: (resposta) => {
                const blob = resposta.body ?? new Blob([], { type: 'text/plain;charset=windows-1252' });
                const nomeArquivo = this.extrairNomeArquivo(resposta.headers.get('Content-Disposition')) ?? `nota-${id}.TXT`;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = url;
                link.download = nomeArquivo;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);

                this.mensagem.set(`Arquivo ${nomeArquivo} exportado com sucesso.`);
                this.exportando.set(false);
            },
            error: async (erro: HttpErrorResponse) => {
                const mensagem = await this.lerMensagemErro(erro);
                this.erro.set(mensagem || 'Não foi possível exportar a nota.');
                this.exportando.set(false);
            }
        });
    }

    private formatarData(data: string): string {
        if (!data) {
            return 'Sem data';
        }

        const valor = new Date(data);
        if (Number.isNaN(valor.getTime())) {
            return data;
        }

        return valor.toLocaleDateString('pt-BR');
    }

    private async lerMensagemErro(erro: HttpErrorResponse): Promise<string> {
        if (erro.error instanceof Blob) {
            try {
                const texto = await erro.error.text();
                const json = JSON.parse(texto) as Record<string, unknown>;
                const mensagem = json['mensagem'];
                if (typeof mensagem === 'string' && mensagem.trim()) {
                    return mensagem.trim();
                }
            } catch {
                // Ignora e tenta a leitura em texto bruto abaixo.
            }
        }

        if (typeof erro.error === 'string' && erro.error.trim()) {
            return erro.error.trim();
        }

        if (erro.error && typeof erro.error === 'object') {
            const mensagem = (erro.error as Record<string, unknown>)['mensagem'];
            if (typeof mensagem === 'string' && mensagem.trim()) {
                return mensagem.trim();
            }
        }

        if (erro.status === 0) {
            return 'Não foi possível conectar ao servidor.';
        }

        return erro.message || 'Erro ao exportar a nota.';
    }

    private extrairNomeArquivo(contentDisposition: string | null): string | null {
        if (!contentDisposition) {
            return null;
        }

        const filenameStarMatch = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(contentDisposition);
        if (filenameStarMatch) {
            return decodeURIComponent(filenameStarMatch[1].replace(/['"]/g, '').trim());
        }

        const filenameMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
        if (filenameMatch) {
            return filenameMatch[1].trim();
        }

        return null;
    }
}
