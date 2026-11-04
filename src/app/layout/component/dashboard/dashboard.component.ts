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

/** Cor do tema (#rgb, #rrggbb ou rgb()) com transparência, para o canvas do Chart.js. */
function comAlfa(cor: string, alfa: number): string {
    const valor = cor.trim();
    let r: number, g: number, b: number;

    if (valor.startsWith('#')) {
        const hex = valor.length === 4 ? [...valor.slice(1)].map((c) => c + c).join('') : valor.slice(1, 7);
        [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    } else {
        const partes = valor.match(/[\d.]+/g);
        if (!partes || partes.length < 3) return valor;
        [r, g, b] = partes.map(Number);
    }

    return [r, g, b].some((n) => Number.isNaN(n)) ? valor : `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

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
    readonly maiorIssTomador = computed(() => Math.max(0, ...(this.dados()?.top_tomadores ?? []).map((t) => t.valor_iss)));

    participacao(valor: number): number {
        const maior = this.maiorIssTomador();
        return maior > 0 ? Math.max(2, (valor / maior) * 100) : 0;
    }

    readonly graficoMensal = computed(() => {
        const dados = this.dados();
        this.versaoTema();
        if (!dados) return null;

        const cores = this.cores();
        const valores = dados.por_mes.map((m) => m.valor_iss);
        const maior = Math.max(0, ...valores);
        const indiceMaior = maior > 0 ? valores.indexOf(maior) : -1;

        // Degradê vertical: forte no topo, quase transparente na base.
        // O mês com mais ISS fica em cor sólida para se destacar.
        const preenchimento = (ctx: any) => {
            const { chart, dataIndex } = ctx;
            const area = chart.chartArea;
            if (!area) return comAlfa(cores.primaria, 0.6);
            if (dataIndex === indiceMaior) return cores.primaria;

            const degrade = chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
            degrade.addColorStop(0, comAlfa(cores.primaria, 0.12));
            degrade.addColorStop(1, comAlfa(cores.primaria, 0.7));
            return degrade;
        };

        return {
            data: {
                labels: dados.por_mes.map((m) => this.rotuloMes(m.mes)),
                datasets: [
                    {
                        type: 'bar',
                        label: 'ISS',
                        yAxisID: 'y',
                        backgroundColor: preenchimento,
                        hoverBackgroundColor: cores.primaria,
                        borderColor: cores.primaria,
                        borderWidth: { top: 2, left: 0, right: 0, bottom: 0 },
                        borderRadius: { topLeft: 10, topRight: 10 },
                        borderSkipped: 'bottom',
                        categoryPercentage: 0.7,
                        barPercentage: 0.85,
                        maxBarThickness: 44,
                        data: valores,
                        order: 2
                    },
                    {
                        type: 'line',
                        label: 'Notas',
                        yAxisID: 'y1',
                        borderColor: comAlfa(cores.texto, 0.55),
                        backgroundColor: cores.superficie,
                        borderWidth: 2,
                        borderDash: [6, 5],
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBorderWidth: 2,
                        pointBorderColor: cores.texto,
                        pointBackgroundColor: cores.superficie,
                        tension: 0.35,
                        data: dados.por_mes.map((m) => m.notas),
                        order: 1
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { top: 8 } },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: { color: cores.texto, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, padding: 16 }
                    },
                    tooltip: {
                        ...this.tooltipTema(cores),
                        callbacks: {
                            title: (itens: any[]) => (itens[0]?.dataIndex === indiceMaior ? `${itens[0].label} · maior ISS do período` : itens[0]?.label),
                            label: (ctx: any) => (ctx.dataset.yAxisID === 'y' ? ` ISS: ${moeda.format(ctx.parsed.y)}` : ` Notas: ${ctx.parsed.y}`)
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: cores.textoSecundario, font: { weight: 600 } },
                        grid: { display: false },
                        border: { display: false }
                    },
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, padding: 8, maxTicksLimit: 6, callback: (v: number) => moedaCompacta.format(v) },
                        grid: { color: comAlfa(cores.textoSecundario, 0.18), drawTicks: false },
                        border: { display: false, dash: [4, 4] }
                    },
                    y1: {
                        position: 'right',
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, padding: 8, precision: 0, maxTicksLimit: 6 },
                        grid: { display: false },
                        border: { display: false }
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
        const status = dados.importacoes_por_status;
        const total = status.reduce((soma, s) => soma + s.total, 0);
        // Cor pelo status, não pela posição: a API pode devolver em qualquer ordem.
        const corDoStatus = (s: string) => (s === 'PROCESSADA' ? cores.sucesso : s === 'PROCESSADA_COM_ERROS' ? cores.alerta : cores.falha);
        const coresBase = status.map((s) => corDoStatus(s.status));

        return {
            data: {
                labels: status.map((s) => ROTULOS_STATUS[s.status] ?? s.status),
                datasets: [
                    {
                        data: status.map((s) => s.total),
                        backgroundColor: coresBase.map((c) => comAlfa(c, 0.85)),
                        hoverBackgroundColor: coresBase,
                        borderColor: cores.superficie,
                        borderWidth: 3,
                        borderRadius: 8,
                        spacing: 2,
                        hoverOffset: 10
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                cutout: '72%',
                layout: { padding: 10 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: cores.texto, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, padding: 16 }
                    },
                    tooltip: {
                        ...this.tooltipTema(cores),
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${total ? Math.round((ctx.parsed / total) * 100) : 0}%)`
                        }
                    }
                }
            },
            // Total de importações escrito no meio da rosca
            plugins: [
                {
                    id: 'textoCentral',
                    afterDatasetsDraw: (chart: any) => {
                        const arco = chart.getDatasetMeta(0)?.data?.[0];
                        if (!arco) return;
                        const { x, y } = arco;
                        const c = chart.ctx;
                        c.save();
                        c.textAlign = 'center';
                        c.textBaseline = 'middle';
                        c.fillStyle = cores.texto;
                        c.font = `800 1.75rem ${cores.fonte}`;
                        c.fillText(String(total), x, y - 8);
                        c.fillStyle = cores.textoSecundario;
                        c.font = `600 0.72rem ${cores.fonte}`;
                        c.fillText('IMPORTAÇÕES', x, y + 16);
                        c.restore();
                    }
                }
            ]
        };
    });

    readonly graficoServicos = computed(() => {
        const dados = this.dados();
        this.versaoTema();
        if (!dados) return null;

        const cores = this.cores();
        const valores = dados.top_servicos.map((s) => s.valor_iss);
        const maior = Math.max(0, ...valores);
        const indiceMaior = maior > 0 ? valores.indexOf(maior) : -1;

        // Degradê horizontal (base → ponta); o serviço com mais ISS fica sólido.
        const preenchimento = (ctx: any) => {
            const { chart, dataIndex } = ctx;
            const area = chart.chartArea;
            if (!area) return comAlfa(cores.primaria, 0.6);
            if (dataIndex === indiceMaior) return cores.primaria;

            const degrade = chart.ctx.createLinearGradient(area.left, 0, area.right, 0);
            degrade.addColorStop(0, comAlfa(cores.primaria, 0.12));
            degrade.addColorStop(1, comAlfa(cores.primaria, 0.7));
            return degrade;
        };

        return {
            data: {
                labels: dados.top_servicos.map((s) => s.codigo_lc116),
                datasets: [
                    {
                        label: 'ISS',
                        backgroundColor: preenchimento,
                        hoverBackgroundColor: cores.primaria,
                        borderColor: cores.primaria,
                        borderWidth: { top: 0, left: 0, right: 2, bottom: 0 },
                        borderRadius: { topRight: 10, bottomRight: 10 },
                        borderSkipped: 'left',
                        categoryPercentage: 0.75,
                        barPercentage: 0.85,
                        maxBarThickness: 30,
                        data: valores
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                layout: { padding: { right: 8 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...this.tooltipTema(cores),
                        callbacks: {
                            title: (itens: any[]) => {
                                const servico = dados.top_servicos[itens[0].dataIndex];
                                const destaque = itens[0].dataIndex === indiceMaior ? ' · maior ISS' : '';
                                return `${servico.codigo_lc116} - ${servico.descricao}${destaque}`;
                            },
                            label: (ctx: any) => ` ISS: ${moeda.format(ctx.parsed.x)} (${dados.top_servicos[ctx.dataIndex].notas} notas)`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: cores.textoSecundario, padding: 6, maxTicksLimit: 5, callback: (v: number) => moedaCompacta.format(v) },
                        grid: { color: comAlfa(cores.textoSecundario, 0.18), drawTicks: false },
                        border: { display: false, dash: [4, 4] }
                    },
                    y: {
                        ticks: { color: cores.texto, padding: 8, font: { weight: 600 } },
                        grid: { display: false },
                        border: { display: false }
                    }
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
            falha: ler('--p-red-500'),
            fonte: getComputedStyle(document.body).fontFamily || 'sans-serif'
        };
    }

    /** Tooltip no visual do tema, igual nos três gráficos. */
    private tooltipTema(cores: ReturnType<DashboardComponent['cores']>) {
        return {
            backgroundColor: cores.superficie,
            titleColor: cores.texto,
            bodyColor: cores.texto,
            borderColor: cores.borda,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            usePointStyle: true,
            titleFont: { weight: 'bold' }
        };
    }
}
