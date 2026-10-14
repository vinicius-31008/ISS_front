import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from './importar.service';

export interface ISessao {
    token: string;
    expira_em: string;
    usuario: { id: number; nome: string; email: string; perfil: 'ADMIN' | 'USUARIO'; trocar_senha: boolean };
    empresa: { id: number; cnpj: string; razao_social: string };
}

interface ILoginResponse {
    sucesso: boolean;
    mensagem?: string;
    dados: ISessao;
}

const CHAVE_SESSAO = 'iss_sessao';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    readonly sessao = signal<ISessao | null>(this.lerSessaoSalva());
    readonly autenticado = computed(() => this.sessao() !== null);
    readonly admin = computed(() => this.sessao()?.usuario.perfil === 'ADMIN');

    get token(): string {
        return this.sessao()?.token ?? '';
    }

    login(email: string, senha: string): Observable<ILoginResponse> {
        return this.http.post<ILoginResponse>(`${API_URL}/api/login.php`, { email, senha }).pipe(
            tap((resposta) => {
                localStorage.setItem(CHAVE_SESSAO, JSON.stringify(resposta.dados));
                this.sessao.set(resposta.dados);
            })
        );
    }

    logout(): void {
        // Invalida o token no backend, mas não espera a resposta para sair
        if (this.token) {
            this.http.post(`${API_URL}/api/logout.php`, {}).subscribe({ error: () => {} });
        }
        this.encerrarSessaoLocal();
    }

    /** Limpa a sessão do navegador e volta para o login (usado também quando a API responde 401). */
    encerrarSessaoLocal(): void {
        localStorage.removeItem(CHAVE_SESSAO);
        this.sessao.set(null);
        this.router.navigate(['/auth/login']);
    }

    private lerSessaoSalva(): ISessao | null {
        try {
            const sessao: ISessao | null = JSON.parse(localStorage.getItem(CHAVE_SESSAO) ?? 'null');
            // expira_em vem do MySQL como "YYYY-MM-DD HH:MM:SS"
            if (!sessao?.token || new Date(sessao.expira_em.replace(' ', 'T')) <= new Date()) {
                localStorage.removeItem(CHAVE_SESSAO);
                return null;
            }
            return sessao;
        } catch {
            return null;
        }
    }
}
