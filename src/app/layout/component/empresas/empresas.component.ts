import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { IEmpresa, IEmpresaPayload, IFiltrosEmpresas } from '../../interfaces/empresa.interface';
import { IPaginacao } from '../../interfaces/usuario.interface';
import { AuthService } from '../../service/auth.service';
import { EmpresasService } from '../../service/empresas.service';
import { formatarCnpj, somenteDigitos } from '../../utils/cnpj';

interface IFormEmpresa {
    cnpj: string;
    razao_social: string;
    ativo: boolean;
}

@Component({
    selector: 'app-empresas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        DialogModule,
        InputTextModule,
        PaginatorModule,
        SelectModule,
        TagModule,
        ToastModule,
        ToggleSwitchModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './empresas.component.html',
    styleUrls: ['./empresas.component.scss']
})
export class EmpresasComponent implements OnInit, OnDestroy {
    private empresasService = inject(EmpresasService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private auth = inject(AuthService);
    private requisicao?: Subscription;

    readonly formatarCnpj = formatarCnpj;

    readonly opcoesAtivo = [
        { label: 'Ativas', value: true },
        { label: 'Inativas', value: false }
    ];

    // O backend não deixa o admin desativar a empresa a que ele pertence
    readonly idEmpresaLogada = computed(() => this.auth.sessao()?.empresa.id ?? 0);

    // Filtros ligados ao formulário; só são aplicados ao clicar em "Filtrar"
    filtroBusca = '';
    filtroAtivo: boolean | null = null;

    private filtrosAplicados: IFiltrosEmpresas = {};
    readonly pagina = signal(1);
    readonly porPagina = signal(20);

    // Signals porque o app é zoneless
    readonly empresas = signal<IEmpresa[]>([]);
    readonly paginacao = signal<IPaginacao>({ pagina: 1, por_pagina: 20, total_registros: 0, total_paginas: 0 });
    readonly carregando = signal(false);
    readonly erro = signal('');

    // Diálogo de cadastro/edição
    readonly dialogoAberto = signal(false);
    readonly salvando = signal(false);
    readonly erroFormulario = signal('');
    readonly empresaEditada = signal<IEmpresa | null>(null);
    form: IFormEmpresa = this.formVazio();

    ngOnInit(): void {
        this.carregarEmpresas();
    }

    ngOnDestroy(): void {
        this.requisicao?.unsubscribe();
    }

    filtrar(): void {
        // A busca no backend é por trecho da razão social ou do CNPJ (gravado só com dígitos)
        const busca = this.filtroBusca.trim();
        const pareceCnpj = /^[\d./-]+$/.test(busca);

        this.filtrosAplicados = {
            busca: pareceCnpj ? somenteDigitos(busca) : busca,
            ativo: this.filtroAtivo
        };
        this.pagina.set(1);
        this.carregarEmpresas();
    }

    limparFiltros(): void {
        this.filtroBusca = '';
        this.filtroAtivo = null;
        this.filtrar();
    }

    mudarPagina(evento: PaginatorState): void {
        this.porPagina.set(evento.rows ?? this.porPagina());
        this.pagina.set((evento.page ?? 0) + 1);
        this.carregarEmpresas();
    }

    aoDigitarCnpj(valor: string): void {
        this.form.cnpj = formatarCnpj(valor);
    }

    nova(): void {
        this.empresaEditada.set(null);
        this.form = this.formVazio();
        this.erroFormulario.set('');
        this.dialogoAberto.set(true);
    }

    editar(empresa: IEmpresa): void {
        this.empresaEditada.set(empresa);
        this.form = {
            cnpj: formatarCnpj(empresa.cnpj),
            razao_social: empresa.razao_social,
            ativo: empresa.ativo
        };
        this.erroFormulario.set('');
        this.dialogoAberto.set(true);
    }

    salvar(): void {
        const erroValidacao = this.validarFormulario();
        if (erroValidacao) {
            this.erroFormulario.set(erroValidacao);
            return;
        }

        const editada = this.empresaEditada();
        const dados = editada ? this.camposAlterados(editada) : this.payloadCompleto();

        if (editada && Object.keys(dados).length === 0) {
            this.dialogoAberto.set(false);
            return;
        }

        this.salvando.set(true);
        this.erroFormulario.set('');

        const requisicao = editada ? this.empresasService.atualizar(editada.id, dados) : this.empresasService.criar(dados);

        requisicao.subscribe({
            next: (resposta) => {
                this.salvando.set(false);
                this.dialogoAberto.set(false);
                this.notificar('success', resposta.mensagem ?? 'Empresa salva.');
                this.carregarEmpresas();
            },
            error: (erro: HttpErrorResponse) => {
                this.salvando.set(false);
                this.erroFormulario.set(this.mensagemErro(erro));
            }
        });
    }

    confirmarDesativar(empresa: IEmpresa): void {
        const avisoUsuarios =
            empresa.usuarios_ativos > 0
                ? ` Os ${empresa.usuarios_ativos} usuário(s) ativo(s) dela perdem o acesso imediatamente.`
                : '';

        this.confirmationService.confirm({
            header: 'Desativar empresa',
            message: `Desativar ${empresa.razao_social}?${avisoUsuarios} Importações e notas fiscais são mantidas e a empresa pode ser reativada depois.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Desativar',
            rejectLabel: 'Cancelar',
            acceptButtonProps: { severity: 'danger' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => {
                this.empresasService.desativar(empresa.id).subscribe({
                    next: () => {
                        this.notificar('success', `${empresa.razao_social} foi desativada.`);
                        this.carregarEmpresas();
                    },
                    error: (erro: HttpErrorResponse) => this.notificar('error', this.mensagemErro(erro))
                });
            }
        });
    }

    reativar(empresa: IEmpresa): void {
        this.empresasService.atualizar(empresa.id, { ativo: true }).subscribe({
            next: () => {
                this.notificar('success', `${empresa.razao_social} foi reativada.`);
                this.carregarEmpresas();
            },
            error: (erro: HttpErrorResponse) => this.notificar('error', this.mensagemErro(erro))
        });
    }

    private carregarEmpresas(): void {
        // Cancela a requisição anterior para uma resposta antiga não sobrescrever a página nova
        this.requisicao?.unsubscribe();
        this.carregando.set(true);

        this.requisicao = this.empresasService
            .listar({ ...this.filtrosAplicados, pagina: this.pagina(), por_pagina: this.porPagina() })
            .subscribe({
                next: (resposta) => {
                    this.empresas.set(resposta.dados.empresas);
                    this.paginacao.set(resposta.dados.paginacao);
                    this.erro.set('');
                    this.carregando.set(false);
                },
                error: (erro: HttpErrorResponse) => {
                    this.erro.set(this.mensagemErro(erro));
                    this.carregando.set(false);
                }
            });
    }

    /** Mesmas regras do backend, para avisar antes de enviar. */
    private validarFormulario(): string {
        if (somenteDigitos(this.form.cnpj).length !== 14) return 'O CNPJ deve ter 14 dígitos.';
        if (!this.form.razao_social.trim()) return 'Informe a razão social.';
        if (this.form.razao_social.trim().length > 200) return 'A razão social deve ter no máximo 200 caracteres.';
        return '';
    }

    private payloadCompleto(): IEmpresaPayload {
        return {
            cnpj: somenteDigitos(this.form.cnpj),
            razao_social: this.form.razao_social.trim(),
            ativo: this.form.ativo
        };
    }

    /** No PUT só vão os campos alterados. */
    private camposAlterados(original: IEmpresa): IEmpresaPayload {
        const dados: IEmpresaPayload = {};
        const cnpj = somenteDigitos(this.form.cnpj);
        const razaoSocial = this.form.razao_social.trim();

        if (cnpj !== original.cnpj) dados.cnpj = cnpj;
        if (razaoSocial !== original.razao_social) dados.razao_social = razaoSocial;
        if (this.form.ativo !== original.ativo) dados.ativo = this.form.ativo;

        return dados;
    }

    private formVazio(): IFormEmpresa {
        return { cnpj: '', razao_social: '', ativo: true };
    }

    private mensagemErro(erro: HttpErrorResponse): string {
        if (erro.status === 0) return 'Não foi possível conectar ao servidor.';
        const mensagem: string = erro.error?.mensagem ?? 'Erro inesperado.';
        // O backend devolve mensagens de validação em minúsculo ("cnpj deve possuir 14 dígitos.")
        return mensagem.charAt(0).toUpperCase() + mensagem.slice(1);
    }

    private notificar(severity: 'success' | 'error', detail: string): void {
        this.messageService.add({ severity, summary: severity === 'success' ? 'Sucesso' : 'Erro', detail, life: 4000 });
    }
}
