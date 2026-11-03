import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../../service/importar.service';

@Component({
    selector: 'app-exportacao-nota',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, InputNumberModule, CheckboxModule],
    template: `
        <div class="exportacao-nota-card">
            <div class="exportacao-nota-header">
                <div>
                    <h3>Exportar nota ISS</h3>
                    <p>Gera o arquivo TXT do SIGISSWEB para a nota selecionada.</p>
                </div>
            </div>

            <div class="exportacao-nota-body">
                <div class="campo">
                    <label for="nota-id">ID da nota</label>
                    <p-inputNumber
                        id="nota-id"
                        inputId="nota-id"
                        [(ngModel)]="notaId"
                        [min]="1"
                        [showButtons]="false"
                        placeholder="Ex.: 123"
                    />
                </div>

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
                        [disabled]="exportando() || !notaId || notaId < 1"
                        (onClick)="exportar()"
                    />
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .exportacao-nota-card {
                border: 1px solid var(--surface-border);
                border-radius: 14px;
                background: var(--surface-card);
                padding: 1.25rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, .04);
            }

            .exportacao-nota-header h3 {
                margin: 0;
                font-size: 1.125rem;
            }

            .exportacao-nota-header p {
                margin: 0.35rem 0 0;
                color: var(--text-color-secondary);
            }

            .exportacao-nota-body {
                margin-top: 1.25rem;
                display: grid;
                gap: 1rem;
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
                font-weight: 600;
                color: var(--text-color);
            }

            .campo-check {
                display: flex;
                align-items: center;
                min-height: 2.5rem;
            }

            .acoes {
                display: flex;
                justify-content: flex-start;
            }

            .aviso {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                border-radius: 10px;
                font-weight: 500;
            }

            .aviso-falha {
                background: rgba(239, 68, 68, 0.08);
                color: #b91c1c;
                border: 1px solid rgba(239, 68, 68, 0.2);
            }

            .aviso-sucesso {
                background: rgba(34, 197, 94, 0.08);
                color: #15803d;
                border: 1px solid rgba(34, 197, 94, 0.2);
            }

            @media (max-width: 640px) {
                .campo-grid {
                    grid-template-columns: 1fr;
                }
            }
        `
    ]
})
export class ExportacaoNotaComponent {
    private apiService = inject(ApiService);

    notaId: number | null = null;
    regime: 'S' | 'V' | 'M' | 'L' = 'V';
    retencao: 'N' | 'S' | 'F' | 'D' | 'I' = 'N';
    homologacao = false;
    readonly exportando = signal(false);
    readonly erro = signal('');
    readonly mensagem = signal('');

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

    exportar(): void {
        const id = Number(this.notaId);

        if (!Number.isFinite(id) || id <= 0) {
            this.erro.set('Informe um ID da nota válido.');
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
