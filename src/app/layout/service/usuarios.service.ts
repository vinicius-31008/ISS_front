import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFiltrosUsuarios, IUsuarioPayload, IUsuarioResponse, IUsuariosResponse } from '../interfaces/usuario.interface';
import { API_URL } from './importar.service';

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private http = inject(HttpClient);
    private url = `${API_URL}/api/usuarios.php`;

    listar(filtros: IFiltrosUsuarios = {}): Observable<IUsuariosResponse> {
        // Só envia os filtros preenchidos; o backend rejeita valores vazios/inválidos
        let params = new HttpParams();
        for (const [campo, valor] of Object.entries(filtros)) {
            if (valor !== undefined && valor !== null && valor !== '') {
                params = params.set(campo, String(valor));
            }
        }
        return this.http.get<IUsuariosResponse>(this.url, { params });
    }

    criar(dados: IUsuarioPayload): Observable<IUsuarioResponse> {
        return this.http.post<IUsuarioResponse>(this.url, dados);
    }

    atualizar(id: number, dados: IUsuarioPayload): Observable<IUsuarioResponse> {
        return this.http.put<IUsuarioResponse>(this.url, dados, { params: { id } });
    }

    /** Exclusão lógica: o backend só marca ativo = false. */
    desativar(id: number): Observable<{ sucesso: boolean; mensagem: string }> {
        return this.http.delete<{ sucesso: boolean; mensagem: string }>(this.url, { params: { id } });
    }
}
