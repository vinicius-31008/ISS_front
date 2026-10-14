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
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { IEmpresa } from '../../interfaces/empresa.interface';
import { IFiltrosUsuarios, IPaginacao, IUsuario, IUsuarioPayload, PerfilUsuario } from '../../interfaces/usuario.interface';
import { AuthService } from '../../service/auth.service';
import { EmpresasService } from '../../service/empresas.service';
import { UsuariosService } from '../../service/usuarios.service';
import { formatarCnpj } from '../../utils/cnpj';

interface IFormUsuario {
    nome: string;
    email: string;
    empresa_id: number | null;
    perfil: PerfilUsuario;
    ativo: boolean;
    senha: string;
}

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        DialogModule,
        InputTextModule,
        PaginatorModule,
        PasswordModule,
        SelectModule,
        TagModule,
        ToastModule,
        ToggleSwitchModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, OnDestroy {
    private usuariosService = inject(UsuariosService);
    private empresasService = inject(EmpresasService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private auth = inject(AuthService);
    private requisicao?: Subscription;

    readonly opcoesPerfil = [
        { label: 'Administrador', value: 'ADMIN' },
        { label: 'Usuário', value: 'USUARIO' }
    ];
    readonly opcoesAtivo = [
        { label: 'Ativos', value: true },
        { label: 'Inativos', value: false }
    ];

    readonly idUsuarioLogado = computed(() => this.auth.sessao()?.usuario.id ?? 0);

    // Filtros ligados ao formulário; só são aplicados ao clicar em "Filtrar"
    filtroBusca = '';
    filtroEmpresa: number | null = null;
    filtroPerfil: PerfilUsuario | null = null;
    filtroAtivo: boolean | null = null;

    private filtrosAplicados: IFiltrosUsuarios = {};
    readonly pagina = signal(1);
    readonly porPagina = signal(20);

    // Signals porque o app é zoneless
    readonly usuarios = signal<IUsuario[]>([]);
    readonly paginacao = signal<IPaginacao>({ pagina: 1, por_pagina: 20, total_registros: 0, total_paginas: 0 });
    readonly empresas = signal<IEmpresa[]>([]);
    readonly carregando = signal(false);
    readonly erro = signal('');

    // Diálogo de cadastro/edição
    readonly dialogoAberto = signal(false);
    readonly salvando = signal(false);
    readonly erroFormulario = signal('');
    readonly usuarioEditado = signal<IUsuario | null>(null);
    form: IFormUsuario = this.formVazio();

    ngOnInit(): void {
        this.carregarUsuarios();
        this.empresasService.listarAtivas().subscribe({
            next: (resposta) => this.empresas.set(resposta.dados.empresas),
            error: (erro) => console.error('Erro ao carregar empresas:', erro)
        });
    }

    ngOnDestroy(): void {
        this.requisicao?.unsubscribe();
    }

    filtrar(): void {
        this.filtrosAplicados = {
            busca: this.filtroBusca.trim(),
            empresa_id: this.filtroEmpresa,
            perfil: this.filtroPerfil,
            ativo: this.filtroAtivo
        };
        this.pagina.set(1);
        this.carregarUsuarios();
    }

    limparFiltros(): void {
        this.filtroBusca = '';
        this.filtroEmpresa = null;
        this.filtroPerfil = null;
        this.filtroAtivo = null;
        this.filtrar();
    }

    mudarPagina(evento: PaginatorState): void {
        this.porPagina.set(evento.rows ?? this.porPagina());
        this.pagina.set((evento.page ?? 0) + 1);
        this.carregarUsuarios();
    }

    novo(): void {
        this.usuarioEditado.set(null);
        this.form = this.formVazio();
        this.erroFormulario.set('');
        this.dialogoAberto.set(true);
    }

    editar(usuario: IUsuario): void {
        this.usuarioEditado.set(usuario);
        this.form = {
            nome: usuario.nome,
            email: usuario.email,
            empresa_id: usuario.empresa.id,
            perfil: usuario.perfil,
            ativo: usuario.ativo,
            senha: ''
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

        const editado = this.usuarioEditado();
        const dados = editado ? this.camposAlterados(editado) : this.payloadCompleto();

        if (editado && Object.keys(dados).length === 0) {
            this.dialogoAberto.set(false);
            return;
        }

        this.salvando.set(true);
        this.erroFormulario.set('');

        const requisicao = editado ? this.usuariosService.atualizar(editado.id, dados) : this.usuariosService.criar(dados);

        requisicao.subscribe({
            next: (resposta) => {
                this.salvando.set(false);
                this.dialogoAberto.set(false);
                this.notificar('success', resposta.mensagem ?? 'Usuário salvo.');
                this.carregarUsuarios();
            },
            error: (erro: HttpErrorResponse) => {
                this.salvando.set(false);
                this.erroFormulario.set(this.mensagemErro(erro));
            }
        });
    }

    confirmarDesativar(usuario: IUsuario): void {
        this.confirmationService.confirm({
            header: 'Desativar usuário',
            message: `Desativar ${usuario.nome}? As sessões abertas dele serão encerradas. O histórico de importações é mantido e o usuário pode ser reativado depois.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Desativar',
            rejectLabel: 'Cancelar',
            acceptButtonProps: { severity: 'danger' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: () => {
                this.usuariosService.desativar(usuario.id).subscribe({
                    next: () => {
                        this.notificar('success', `${usuario.nome} foi desativado.`);
                        this.carregarUsuarios();
                    },
                    error: (erro: HttpErrorResponse) => this.notificar('error', this.mensagemErro(erro))
                });
            }
        });
    }

    reativar(usuario: IUsuario): void {
        this.usuariosService.atualizar(usuario.id, { ativo: true }).subscribe({
            next: () => {
                this.notificar('success', `${usuario.nome} foi reativado.`);
                this.carregarUsuarios();
            },
            error: (erro: HttpErrorResponse) => this.notificar('error', this.mensagemErro(erro))
        });
    }

    readonly formatarCnpj = formatarCnpj;

    private carregarUsuarios(): void {
        // Cancela a requisição anterior para uma resposta antiga não sobrescrever a página nova
        this.requisicao?.unsubscribe();
        this.carregando.set(true);

        this.requisicao = this.usuariosService
            .listar({ ...this.filtrosAplicados, pagina: this.pagina(), por_pagina: this.porPagina() })
            .subscribe({
                next: (resposta) => {
                    this.usuarios.set(resposta.dados.usuarios);
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
        const editando = this.usuarioEditado() !== null;

        if (!this.form.nome.trim()) return 'Informe o nome.';
        if (this.form.nome.trim().length > 150) return 'O nome deve ter no máximo 150 caracteres.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) return 'Informe um e-mail válido.';
        if (!this.form.empresa_id) return 'Selecione a empresa.';
        if (!editando && !this.form.senha) return 'Informe a senha.';
        if (this.form.senha && (this.form.senha.length < 8 || this.form.senha.length > 72)) {
            return 'A senha deve ter entre 8 e 72 caracteres.';
        }
        return '';
    }

    private payloadCompleto(): IUsuarioPayload {
        return {
            empresa_id: this.form.empresa_id!,
            nome: this.form.nome.trim(),
            email: this.form.email.trim(),
            senha: this.form.senha,
            perfil: this.form.perfil,
            ativo: this.form.ativo
        };
    }

    /** No PUT só vão os campos alterados; senha em branco mantém a atual. */
    private camposAlterados(original: IUsuario): IUsuarioPayload {
        const dados: IUsuarioPayload = {};
        const nome = this.form.nome.trim();
        const email = this.form.email.trim();

        if (nome !== original.nome) dados.nome = nome;
        if (email !== original.email) dados.email = email;
        if (this.form.empresa_id !== original.empresa.id) dados.empresa_id = this.form.empresa_id!;
        if (this.form.perfil !== original.perfil) dados.perfil = this.form.perfil;
        if (this.form.ativo !== original.ativo) dados.ativo = this.form.ativo;
        if (this.form.senha) dados.senha = this.form.senha;

        return dados;
    }

    private formVazio(): IFormUsuario {
        return { nome: '', email: '', empresa_id: null, perfil: 'USUARIO', ativo: true, senha: '' };
    }

    private mensagemErro(erro: HttpErrorResponse): string {
        if (erro.status === 0) return 'Não foi possível conectar ao servidor.';
        const mensagem: string = erro.error?.mensagem ?? 'Erro inesperado.';
        // O backend devolve mensagens de validação em minúsculo ("email inválido.")
        return mensagem.charAt(0).toUpperCase() + mensagem.slice(1);
    }

    private notificar(severity: 'success' | 'error', detail: string): void {
        this.messageService.add({ severity, summary: severity === 'success' ? 'Sucesso' : 'Erro', detail, life: 4000 });
    }
}
