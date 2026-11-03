import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { IHistoricoResponse } from '../../interfaces/historico.interface';
import { ApiService, IFiltrosHistorico } from '../../service/importar.service';

@Component({
    selector: 'app-historico',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PaginatorModule, SelectModule],
    templateUrl: './historico.component.html',
    styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent implements OnInit, OnDestroy {
    private apiService = inject(ApiService);
    private refreshTimer?: ReturnType<typeof setInterval>;
    private requisicao?: Subscription;

    readonly opcoesStatus = [
        { label: 'Processada', value: 'PROCESSADA' },
        { label: 'Processada com erros', value: 'PROCESSADA_COM_ERROS' },
        { label: 'Erro', value: 'ERRO' }
    ];

    // Filtros ligados ao formulário; só são aplicados ao clicar em "Filtrar"
    filtroStatus = '';
    filtroArquivo = '';
    filtroDataInicio = '';
    filtroDataFim = '';

    private filtrosAplicados: IFiltrosHistorico = {};
    readonly pagina = signal(1);
    readonly porPagina = signal(20);

    // Signals porque o app é zoneless: propriedades comuns não atualizam a tela após o subscribe
    readonly historicoResponse = signal<IHistoricoResponse | null>(null);
    readonly carregando = signal(false);
    readonly erro = signal('');

    readonly importacoes = computed(() => this.historicoResponse()?.dados?.importacoes ?? []);
    readonly paginacao = computed(
        () =>
            this.historicoResponse()?.dados?.paginacao ?? {
                pagina: this.pagina(),
                por_pagina: this.porPagina(),
                total_registros: 0,
                total_paginas: 0
            }
    );
    readonly resumo = computed(() => this.historicoResponse()?.dados?.resumo ?? { iss_total: 0 });

    ngOnInit(): void {
        this.carregarHistorico();
        this.refreshTimer = setInterval(() => {
            this.carregarHistorico(false);
        }, 15000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        this.requisicao?.unsubscribe();
    }

    filtrar(): void {
        if (this.filtroDataInicio && this.filtroDataFim && this.filtroDataInicio > this.filtroDataFim) {
            this.erro.set('A data inicial não pode ser maior que a data final.');
            return;
        }

        this.filtrosAplicados = {
            status: this.filtroStatus,
            arquivo: this.filtroArquivo.trim(),
            data_inicio: this.filtroDataInicio,
            data_fim: this.filtroDataFim
        };
        this.pagina.set(1);
        this.carregarHistorico();
    }

    limparFiltros(): void {
        this.filtroStatus = '';
        this.filtroArquivo = '';
        this.filtroDataInicio = '';
        this.filtroDataFim = '';
        this.filtrar();
    }

    mudarPagina(evento: PaginatorState): void {
        this.porPagina.set(evento.rows ?? this.porPagina());
        this.pagina.set((evento.page ?? 0) + 1);
        this.carregarHistorico();
    }

    private carregarHistorico(mostrarCarregando = true): void {
        // Cancela a requisição anterior para uma resposta antiga não sobrescrever a página nova
        this.requisicao?.unsubscribe();

        if (mostrarCarregando) {
            this.carregando.set(true);
        }

        this.requisicao = this.apiService
            .getHistorico<IHistoricoResponse>({
                ...this.filtrosAplicados,
                pagina: this.pagina(),
                por_pagina: this.porPagina()
            })
            .subscribe({
                next: (response) => {
                    this.historicoResponse.set(response);
                    this.erro.set('');
                    this.carregando.set(false);
                },
                error: (erro) => {
                    console.error('Erro ao carregar histórico:', erro);
                    this.erro.set(erro?.error?.mensagem ?? 'Não foi possível carregar o histórico.');
                    this.carregando.set(false);
                }
            });
    }
}
