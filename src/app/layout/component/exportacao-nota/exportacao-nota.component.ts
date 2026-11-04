import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../service/importar.service';
import { formatarCpfCnpj } from '../../utils/cnpj';

/** Nota como vem em historico.php?id= (prestador, tomador e serviço aninhados). */
interface INotaDetalheResponse {
    id: number;
    numero: string;
    serie: string;
    data_emissao: string;
    prestador: { cnpj: string; razao_social: string | null } | null;
    tomador: { cpf_cnpj: string; razao_social: string | null } | null;
    servico: { codigo_lc116: string; descricao: string } | null;
    valor_servico: number;
    valor_iss: number;
    status: string;
}

interface IDetalheImportacaoResponse {
    sucesso: boolean;
    dados?: {
        notas?: INotaDetalheResponse[];
    };
}

/** Nota achatada para a tabela de exportação. */
interface INotaExportavel {
    id: number;
    numero: string;
    serie: string;
    data_emissao: string;
    prestador_cnpj: string;
    prestador_razao_social: string | null;
    tomador_documento: string | null;
    tomador_razao_social: string | null;
    codigo_lc116: string;
    valor_servico: number;
    valor_iss: number;
    status: string;
    /** MMAAAA, como no nome do arquivo do SIGISSWEB. */
    competencia: string;
    /** Texto em minúsculas para a busca. */
    busca: string;
}

interface IErroNotaLote {
    id: number;
    numero: string | null;
    mensagem: string;
}

const LIMITE_LOTE = 500;

@Component({
    selector: 'app-exportacao-nota',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, SelectModule, CheckboxModule, TableModule, InputTextModule, IconFieldModule, InputIconModule],
    templateUrl: './exportacao-nota.component.html',
    styleUrls: ['./exportacao-nota.component.scss']
})
export class ExportacaoNotaComponent implements OnInit {
    private apiService = inject(ApiService);

    readonly limiteLote = LIMITE_LOTE;
    readonly formatarCpfCnpj = formatarCpfCnpj;

    regime: 'S' | 'V' | 'M' | 'L' = 'V';
    retencao: 'N' | 'S' | 'F' | 'D' | 'I' = 'N';
    homologacao = false;

    readonly exportando = signal(false);
    readonly carregandoNotas = signal(false);
    readonly erro = signal('');
    readonly mensagem = signal('');
    readonly errosLote = signal<IErroNotaLote[]>([]);

    readonly notas = signal<INotaExportavel[]>([]);
    readonly selecionadas = signal<INotaExportavel[]>([]);
    readonly busca = signal('');
    readonly competenciaFiltro = signal<string | null>(null);

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

    readonly opcoesCompetencia = computed(() => {
        const unicas = [...new Set(this.notas().map((n) => n.competencia))];
        // MMAAAA → ordena por AAAAMM, mais recente primeiro
        unicas.sort((a, b) => (b.slice(2) + b.slice(0, 2)).localeCompare(a.slice(2) + a.slice(0, 2)));
        return unicas.map((c) => ({ label: `${c.slice(0, 2)}/${c.slice(2)}`, value: c }));
    });

    readonly notasFiltradas = computed(() => {
        const termo = this.busca().trim().toLowerCase();
        const competencia = this.competenciaFiltro();
        return this.notas().filter((n) => (!competencia || n.competencia === competencia) && (!termo || n.busca.includes(termo)));
    });

    readonly idsComErro = computed(() => new Map(this.errosLote().map((e) => [e.id, e.mensagem])));

    readonly resumo = computed(() => {
        const notas = this.selecionadas();
        const grupos = new Set(notas.map((n) => n.prestador_cnpj + n.competencia));
        return {
            notas: notas.length,
            arquivos: grupos.size,
            valorIss: notas.reduce((total, n) => total + Number(n.valor_iss || 0), 0),
            valorServico: notas.reduce((total, n) => total + Number(n.valor_servico || 0), 0)
        };
    });

    readonly idsSelecionados = computed(() => new Set(this.selecionadas().map((n) => n.id)));

    /** Atalhos por competência: quantas notas há e quantas já estão marcadas. */
    readonly atalhosCompetencia = computed(() => {
        const selecionados = this.idsSelecionados();
        return this.opcoesCompetencia().map((opcao) => {
            const daCompetencia = this.notas().filter((n) => n.competencia === opcao.value);
            const marcadas = daCompetencia.filter((n) => selecionados.has(n.id)).length;
            return { ...opcao, total: daCompetencia.length, marcadas, completa: marcadas === daCompetencia.length };
        });
    });

    /** Prévia dos TXT que a API vai gerar (um por prestador + competência). */
    readonly arquivosPrevistos = computed(() => {
        const grupos = new Map<string, { arquivo: string; prestador: string; cnpj: string; competencia: string; notas: number; valorIss: number }>();
        for (const nota of this.selecionadas()) {
            const chave = nota.prestador_cnpj + nota.competencia;
            const grupo = grupos.get(chave) ?? {
                arquivo: `${nota.prestador_cnpj}${nota.competencia}.TXT`,
                prestador: nota.prestador_razao_social || 'Sem razão social',
                cnpj: nota.prestador_cnpj,
                competencia: `${nota.competencia.slice(0, 2)}/${nota.competencia.slice(2)}`,
                notas: 0,
                valorIss: 0
            };
            grupo.notas++;
            grupo.valorIss += Number(nota.valor_iss || 0);
            grupos.set(chave, grupo);
        }
        return [...grupos.values()].sort((a, b) => a.arquivo.localeCompare(b.arquivo));
    });

    alternarCompetencia(competencia: string, completa: boolean): void {
        const daCompetencia = this.notas().filter((n) => n.competencia === competencia);
        if (completa) {
            const remover = new Set(daCompetencia.map((n) => n.id));
            this.selecionadas.set(this.selecionadas().filter((n) => !remover.has(n.id)));
            return;
        }
        const atuais = new Map(this.selecionadas().map((n) => [n.id, n]));
        daCompetencia.forEach((n) => atuais.set(n.id, n));
        this.selecionadas.set([...atuais.values()]);
    }

    selecionarTodas(): void {
        this.selecionadas.set([...this.notas()]);
    }

    readonly todasFiltradasSelecionadas = computed(() => {
        const filtradas = this.notasFiltradas();
        if (!filtradas.length) return false;
        const ids = new Set(this.selecionadas().map((n) => n.id));
        return filtradas.every((n) => ids.has(n.id));
    });

    ngOnInit(): void {
        this.carregarNotasDisponiveis();
    }

    carregarNotasDisponiveis(): void {
        this.carregandoNotas.set(true);
        this.erro.set('');

        this.apiService.getHistorico<{ sucesso: boolean; dados?: { importacoes?: Array<{ id: number }> } }>({ pagina: 1, por_pagina: 100 }).subscribe({
            next: (resposta) => {
                const ids = (resposta?.dados?.importacoes ?? []).map((item) => item.id);

                if (!ids.length) {
                    this.definirNotas([]);
                    return;
                }

                forkJoin(ids.map((id) => this.apiService.getHistorico<IDetalheImportacaoResponse>({ id }))).subscribe({
                    next: (detalhes) => this.definirNotas(detalhes.flatMap((d) => d?.dados?.notas ?? [])),
                    error: (erro: HttpErrorResponse) => this.falhaAoCarregar(erro)
                });
            },
            error: (erro: HttpErrorResponse) => this.falhaAoCarregar(erro)
        });
    }

    selecionarFiltradas(): void {
        const atuais = new Map(this.selecionadas().map((n) => [n.id, n]));
        for (const nota of this.notasFiltradas()) {
            atuais.set(nota.id, nota);
        }
        this.selecionadas.set([...atuais.values()]);
    }

    desmarcarFiltradas(): void {
        const filtradas = new Set(this.notasFiltradas().map((n) => n.id));
        this.selecionadas.set(this.selecionadas().filter((n) => !filtradas.has(n.id)));
    }

    limparSelecao(): void {
        this.selecionadas.set([]);
        this.errosLote.set([]);
    }

    removerComErro(): void {
        const comErro = this.idsComErro();
        this.selecionadas.set(this.selecionadas().filter((n) => !comErro.has(n.id)));
        this.errosLote.set([]);
        this.erro.set('');
    }

    exportar(): void {
        const ids = this.selecionadas().map((n) => n.id);

        if (!ids.length) {
            this.erro.set('Selecione ao menos uma nota para exportar.');
            this.mensagem.set('');
            return;
        }
        if (ids.length > LIMITE_LOTE) {
            this.erro.set(`Selecione no máximo ${LIMITE_LOTE} notas por lote.`);
            this.mensagem.set('');
            return;
        }

        this.exportando.set(true);
        this.erro.set('');
        this.mensagem.set('');
        this.errosLote.set([]);

        this.apiService.exportarNotasLote(ids, { regime: this.regime, retencao: this.retencao, homologacao: this.homologacao }).subscribe({
            next: (resposta) => {
                const nomeArquivo = this.baixar(resposta, ids.length > 1 ? 'exportacao-iss.zip' : `nota-${ids[0]}.TXT`);
                const notas = Number(resposta.headers.get('X-Notas-Exportadas') ?? ids.length);
                const arquivos = Number(resposta.headers.get('X-Arquivos-Gerados') ?? 1);

                this.mensagem.set(
                    arquivos > 1
                        ? `${notas} notas exportadas em ${arquivos} arquivos TXT (compactados em ${nomeArquivo}).`
                        : `${notas === 1 ? '1 nota exportada' : `${notas} notas exportadas`} em ${nomeArquivo}.`
                );
                this.exportando.set(false);
            },
            error: async (erro: HttpErrorResponse) => {
                const corpo = await this.lerCorpoErro(erro);
                this.errosLote.set(Array.isArray(corpo?.['erros']) ? (corpo['erros'] as IErroNotaLote[]) : []);
                this.erro.set(this.mensagemErro(erro, corpo) || 'Não foi possível exportar as notas.');
                this.exportando.set(false);
            }
        });
    }

    rotuloStatus(status: string): string {
        return status ? status.charAt(0) + status.slice(1).toLowerCase() : '-';
    }

    private definirNotas(lista: INotaDetalheResponse[]): void {
        // Uma nota pode aparecer em mais de um detalhe; o id é único.
        const porId = new Map<number, INotaExportavel>();
        for (const item of lista) {
            const nota = {
                id: item.id,
                numero: String(item.numero ?? ''),
                serie: item.serie ?? '',
                data_emissao: item.data_emissao ?? '',
                prestador_cnpj: item.prestador?.cnpj ?? '',
                prestador_razao_social: item.prestador?.razao_social ?? null,
                tomador_documento: item.tomador?.cpf_cnpj ?? null,
                tomador_razao_social: item.tomador?.razao_social ?? null,
                codigo_lc116: item.servico?.codigo_lc116 ?? '',
                valor_servico: Number(item.valor_servico ?? 0),
                valor_iss: Number(item.valor_iss ?? 0),
                status: item.status ?? ''
            };
            porId.set(nota.id, {
                ...nota,
                competencia: this.competencia(nota.data_emissao),
                busca: [nota.numero, nota.serie, nota.prestador_razao_social, nota.prestador_cnpj, nota.tomador_razao_social, nota.tomador_documento, nota.codigo_lc116, item.servico?.descricao]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
            });
        }

        this.notas.set([...porId.values()].sort((a, b) => b.data_emissao.localeCompare(a.data_emissao) || b.id - a.id));
        // Mantém a seleção apenas das notas que ainda existem
        this.selecionadas.set(this.selecionadas().filter((n) => porId.has(n.id)).map((n) => porId.get(n.id)!));
        this.carregandoNotas.set(false);
    }

    private async falhaAoCarregar(erro: HttpErrorResponse): Promise<void> {
        this.erro.set(this.mensagemErro(erro, await this.lerCorpoErro(erro)) || 'Não foi possível carregar as notas.');
        this.notas.set([]);
        this.carregandoNotas.set(false);
    }

    private competencia(data: string): string {
        const [ano, mes] = (data ?? '').split('-');
        return mes && ano ? `${mes}${ano}` : '';
    }

    private baixar(resposta: HttpResponse<Blob>, nomePadrao: string): string {
        const blob = resposta.body ?? new Blob([]);
        const nomeArquivo = this.extrairNomeArquivo(resposta.headers.get('Content-Disposition')) ?? nomePadrao;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        return nomeArquivo;
    }

    /** Corpo JSON do erro; com responseType 'blob' ele chega como Blob. */
    private async lerCorpoErro(erro: HttpErrorResponse): Promise<Record<string, unknown> | null> {
        let corpo: unknown = erro.error;

        if (corpo instanceof Blob) {
            try {
                corpo = JSON.parse(await corpo.text());
            } catch {
                return null;
            }
        } else if (typeof corpo === 'string') {
            try {
                corpo = JSON.parse(corpo);
            } catch {
                return { mensagem: corpo };
            }
        }

        return corpo && typeof corpo === 'object' ? (corpo as Record<string, unknown>) : null;
    }

    private mensagemErro(erro: HttpErrorResponse, corpo: Record<string, unknown> | null): string {
        const mensagem = corpo?.['mensagem'];
        if (typeof mensagem === 'string' && mensagem.trim()) {
            return mensagem.trim();
        }
        if (erro.status === 0) {
            return 'Não foi possível conectar ao servidor.';
        }
        return erro.message || '';
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
        return filenameMatch ? filenameMatch[1].trim() : null;
    }
}
