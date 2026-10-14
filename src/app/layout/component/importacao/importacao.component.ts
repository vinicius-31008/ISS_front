import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { IResultadoImportacao } from '../../interfaces/importacao.interface';
import { ApiService } from '../../service/importar.service';

@Component({
    selector: 'app-importacao',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    templateUrl: './importacao.component.html',
    styleUrls: ['./importacao.component.scss']
})
export class ImportacaoComponent implements OnDestroy {
    private apiService = inject(ApiService);
    private requisicao?: Subscription;

    // Formato esperado pelo backend (ver README do ISS_back)
    readonly exemploLinha = '1001;A;2026-08-20;12345678000190;Empresa Exemplo Ltda;98765432000110;Cliente Exemplo Ltda;01.01;3550407;10000,00';

    readonly arquivo = signal<File | null>(null);
    readonly arrastando = signal(false);
    readonly enviando = signal(false);
    readonly erro = signal('');
    readonly mensagem = signal('');
    readonly resultado = signal<IResultadoImportacao | null>(null);

    ngOnDestroy(): void {
        this.requisicao?.unsubscribe();
    }

    aoSelecionar(evento: Event): void {
        const input = evento.target as HTMLInputElement;
        this.definirArquivo(input.files?.[0] ?? null);
        // Permite selecionar o mesmo arquivo de novo depois de remover
        input.value = '';
    }

    aoArrastar(evento: DragEvent, arrastando: boolean): void {
        evento.preventDefault();
        this.arrastando.set(arrastando);
    }

    aoSoltar(evento: DragEvent): void {
        evento.preventDefault();
        this.arrastando.set(false);
        this.definirArquivo(evento.dataTransfer?.files?.[0] ?? null);
    }

    removerArquivo(): void {
        this.arquivo.set(null);
        this.erro.set('');
    }

    importar(): void {
        const arquivo = this.arquivo();
        if (!arquivo || this.enviando()) {
            return;
        }

        this.enviando.set(true);
        this.erro.set('');
        this.mensagem.set('');
        this.resultado.set(null);

        this.requisicao = this.apiService.importarArquivo(arquivo).subscribe({
            next: (resposta) => {
                this.resultado.set(resposta.dados);
                this.mensagem.set(resposta.mensagem);
                this.arquivo.set(null);
                this.enviando.set(false);
            },
            error: (erro: HttpErrorResponse) => {
                this.erro.set(erro.status === 0 ? 'Não foi possível conectar ao servidor.' : (erro.error?.mensagem ?? 'Erro ao importar o arquivo.'));
                this.enviando.set(false);
            }
        });
    }

    novaImportacao(): void {
        this.resultado.set(null);
        this.mensagem.set('');
        this.erro.set('');
    }

    severidadeStatus(status: string): string {
        switch (status) {
            case 'PROCESSADA':
                return 'sucesso';
            case 'PROCESSADA_COM_ERROS':
                return 'alerta';
            default:
                return 'falha';
        }
    }

    formatarTamanho(bytes: number): string {
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    private definirArquivo(arquivo: File | null): void {
        if (!arquivo) {
            return;
        }

        // Mesma validação do backend, para avisar antes do upload
        if (!arquivo.name.toLowerCase().endsWith('.txt')) {
            this.erro.set('Apenas arquivos .txt são aceitos.');
            return;
        }
        if (arquivo.size === 0) {
            this.erro.set('O arquivo TXT está vazio.');
            return;
        }

        this.erro.set('');
        this.arquivo.set(arquivo);
    }
}
