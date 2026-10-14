import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEmpresaPayload, IEmpresaResponse, IEmpresasResponse, IFiltrosEmpresas } from '../interfaces/empresa.interface';
import { API_URL } from './importar.service';

@Injectable({
    providedIn: 'root'
})
export class EmpresasService {
    private http = inject(HttpClient);
    private url = `${API_URL}/api/empresas.php`;

    listar(filtros: IFiltrosEmpresas = {}): Observable<IEmpresasResponse> {
        // Só envia os filtros preenchidos; o backend rejeita valores vazios/inválidos
        let params = new HttpParams();
        for (const [campo, valor] of Object.entries(filtros)) {
            if (valor !== undefined && valor !== null && valor !== '') {
                params = params.set(campo, String(valor));
            }
        }
        return this.http.get<IEmpresasResponse>(this.url, { params });
    }

    /** Empresas ativas para selects (máximo permitido pelo backend: 100). */
    listarAtivas(): Observable<IEmpresasResponse> {
        return this.listar({ ativo: true, por_pagina: 100 });
    }

    criar(dados: IEmpresaPayload): Observable<IEmpresaResponse> {
        return this.http.post<IEmpresaResponse>(this.url, dados);
    }

    atualizar(id: number, dados: IEmpresaPayload): Observable<IEmpresaResponse> {
        return this.http.put<IEmpresaResponse>(this.url, dados, { params: { id } });
    }

    /** Exclusão lógica: o backend só marca ativo = false. */
    desativar(id: number): Observable<{ sucesso: boolean; mensagem: string }> {
        return this.http.delete<{ sucesso: boolean; mensagem: string }>(this.url, { params: { id } });
    }
}
