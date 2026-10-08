import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHistoricoResponse, IImportacaoHistorico } from '../../interfaces/historico.interface';
import { ApiService } from '../../service/importar.service';

@Component({
    selector: 'app-historico',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './historico.component.html',
    styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent implements OnInit, OnDestroy {
    private apiService = inject(ApiService);
    private route = inject(ActivatedRoute);
    private refreshTimer?: ReturnType<typeof setInterval>;

    historicoResponse: IHistoricoResponse = {
        sucesso: false,
        dados: {
            importacoes: [],
            paginacao: {
                pagina: 0,
                por_pagina: 0,
                total_registros: 0,
                total_paginas: 0
            },
            resumo: {
                iss_total: 0
            }
        }
    };

    get importacoes(): IImportacaoHistorico[] {
        return this.historicoResponse?.dados?.importacoes ?? [];
    }

    get paginacao() {
        return this.historicoResponse?.dados?.paginacao ?? {
            pagina: 0,
            por_pagina: 0,
            total_registros: 0,
            total_paginas: 0
        };
    }

    get resumo() {
        return this.historicoResponse?.dados?.resumo ?? { iss_total: 0 };
    }

    ngOnInit(): void {
        const resolved = this.route.snapshot.data['historico'];
        if (resolved) {
            this.historicoResponse = resolved;
        }

        this.carregarHistorico();
        this.refreshTimer = setInterval(() => {
            this.carregarHistorico();
        }, 15000);
    }

    ngOnDestroy(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    private carregarHistorico(): void {
        this.apiService.getHistorico<IHistoricoResponse>().subscribe({
            next: (response) => {
                this.historicoResponse = response;
                console.log('Histórico carregado com sucesso:', response);
            },
            error: (erro) => {
                console.error('Erro ao carregar histórico:', erro);
            }
        });
    }
}
