import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { IDadosDashboard } from '../../interfaces/dashboard.interface';
import { DashboardService } from '../../service/dashboard.service';
import { LayoutService } from '../../service/layout.service';
import { formatarCpfCnpj } from '../../utils/cnpj';

const NOMES_MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ROTULOS_STATUS: Partial<Record<string, string>> = {
    PROCESSADA: 'Processada',
    PROCESSADA_COM_ERROS: 'Com erros',
    ERRO: 'Erro'
};
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCompacta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' });

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, ButtonModule, ChartModule, SelectModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private layoutService = inject(LayoutService);
    private requisicao?: Subscription;

    readonly opcoesPeriodo = [
        { label: 'Últimos 6 meses', value: 6 },
        { label: 'Últimos 12 meses', value: 12 },
        { label: 'Últimos 24 meses', value: 24 }
    ];
    meses = 12;

    // Signals porque o app é zoneless
    readonly dados = signal<IDadosDashboard | null>(null);
    readonly carregando = signal(false);
    readonly erro = signal('');

    // Incrementado quando o tema muda, para os gráficos relerem as cores do CSS
    private readonly versaoTema = signal(0);

    readonly totais = computed(() => this.dados()?.totais);
    readonly semNotas = computed(() => (this.totais()?.notas ?? 0) === 0);
    readonly semImportacoes = computed(() => (this.totais()?.importacoes ?? 0) === 0);

    readonly graficoMensal = computed(() => {
        const dados = this.dados();
        this.versaoTema();
        if (!dados) return null;

        const cores = this.cores();
        return {
            data: {
                labels: dados.por_mes.map((m) => this.rotuloMes(m.mes)),
                datasets: [
                    {
                        type: 'bar',
                        label: 'ISS',
                        yAxisID: 'y',
                        backgroundColor: cores.primaria,
                        borderRadius: 6,
                        maxBarThickness: 36,
                        data: dados.por_mes.map((m) => m.valor_iss),
                        order: 2
                    },
                    {
                        type: 'line',
                        label: 'Notas',
                        yAxisID: 'y1',
                        borderColor: cores.texto,
                        backgroundColor: cores.texto,
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.3,
                        data: dados.por_mes.map((m) => m.notas),
                        order: 1
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: cores.texto } },
                    tooltip: {
                        callbacks: {
                            label: (ctx: any) => (ctx.dataset.yAxisID === 'y' ? `ISS: ${moeda.format(ctx.parsed.y)}` : `Notas: ${ctx.parsed.y}`)
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: cores.textoSecundario }, grid: { display: false } },
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, callback: (v: number) => moedaCompacta.format(v) },
                        grid: { color: cores.borda, drawTicks: false }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, precision: 0 },
                        grid: { display: false }
                    }
                }
            }
        };
    });

    readonly graficoStatus = computed(() => {
        const dados = this.dados();
        this.versaoTema();
        if (!dados) return null;

        const cores = this.cores();
        return {
            data: {
                labels: dados.importacoes_por_status.map((s) => ROTULOS_STATUS[s.status] ?? s.status),
                datasets: [
                    {
                        data: dados.importacoes_por_status.map((s) => s.total),
                        backgroundColor: [cores.sucesso, cores.alerta, cores.falha],
                        borderColor: cores.superficie,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { color: cores.texto, usePointStyle: true } } }
            }
        };
    });

    readonly graficoServicos = computed(() => {
        const dados = this.dados();
        this.versaoTema();
        if (!dados) return null;

        const cores = this.cores();
        return {
            data: {
                labels: dados.top_servicos.map((s) => s.codigo_lc116),
                datasets: [
                    {
                        label: 'ISS',
                        backgroundColor: cores.primaria,
                        borderRadius: 6,
                        maxBarThickness: 28,
                        data: dados.top_servicos.map((s) => s.valor_iss)
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (itens: any[]) => {
                                const servico = dados.top_servicos[itens[0].dataIndex];
                                return `${servico.codigo_lc116} - ${servico.descricao}`;
                            },
                            label: (ctx: any) => `ISS: ${moeda.format(ctx.parsed.x)} (${dados.top_servicos[ctx.dataIndex].notas} notas)`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, callback: (v: number) => moedaCompacta.format(v) },
                        grid: { color: cores.borda, drawTicks: false }
                    },
                    y: { ticks: { color: cores.textoSecundario }, grid: { display: false } }
                }
            }
        };
    });

    readonly formatarCpfCnpj = formatarCpfCnpj;
    readonly rotulosStatus = ROTULOS_STATUS;

    constructor() {
        effect(() => {
            this.layoutService.layoutConfig();
            // As variáveis CSS do tema só mudam depois da troca de classe/preset
            setTimeout(() => this.versaoTema.update((v) => v + 1), 150);
        });
    }

    ngOnInit(): void {
        this.carregar();
    }

    ngOnDestroy(): void {
        this.requisicao?.unsubscribe();
    }

    carregar(): void {
        this.requisicao?.unsubscribe();
        this.carregando.set(true);

        this.requisicao = this.dashboardService.resumo(this.meses).subscribe({
            next: (resposta) => {
                this.dados.set(resposta.dados);
                this.erro.set('');
                this.carregando.set(false);
            },
            error: (erro: HttpErrorResponse) => {
                this.erro.set(erro.status === 0 ? 'Não foi possível conectar ao servidor.' : (erro.error?.mensagem ?? 'Não foi possível carregar o painel.'));
                this.carregando.set(false);
            }
        });
    }

    private rotuloMes(mes: string): string {
        const [ano, numero] = mes.split('-');
        return `${NOMES_MESES[Number(numero) - 1]}/${ano.slice(2)}`;
    }

    private cores() {
        const estilo = getComputedStyle(document.documentElement);
        const ler = (nome: string) => estilo.getPropertyValue(nome).trim();
        return {
            primaria: ler('--p-primary-color'),
            texto: ler('--text-color'),
            textoSecundario: ler('--text-color-secondary'),
            borda: ler('--surface-border'),
            superficie: ler('--surface-card'),
            sucesso: ler('--p-green-500'),
            alerta: ler('--p-amber-500'),
            falha: ler('--p-red-500')
        };
    }
}
