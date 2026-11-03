import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IImportacaoResponse } from '../interfaces/importacao.interface';

export const API_URL = 'http://localhost:8000/src';

export interface IFiltrosHistorico {
  pagina?: number;
  por_pagina?: number;
  status?: string;
  arquivo?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface IExportacaoNotaParams {
  regime?: 'S' | 'V' | 'M' | 'L';
  retencao?: 'N' | 'S' | 'F' | 'D' | 'I';
  homologacao?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  getHealth<T>(): Observable<T> {

    let retorno = this.http.get<T>(`${this.apiUrl}/api/health.php`);

    console.log(retorno);

    return retorno;
  }

  getHistorico<T>(filtros: IFiltrosHistorico = {}): Observable<T> {

    // Só envia os filtros preenchidos; o backend rejeita valores vazios/inválidos
    let params = new HttpParams();
    for (const [campo, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(campo, String(valor));
      }
    }

    let retorno = this.http.get<T>(`${this.apiUrl}/api/historico.php`, { params });

    console.log(retorno);

    return retorno;
  }

  importarArquivo(arquivo: File): Observable<IImportacaoResponse> {

    const formData = new FormData();

    formData.append('arquivo', arquivo);

    let retorno = this.http.post<IImportacaoResponse>(
      `${this.apiUrl}/api/importar.php`,
      formData);

    console.log(retorno);

    return retorno;
   }

  exportarNota(id: number, params: IExportacaoNotaParams = {}): Observable<HttpResponse<Blob>> {
    const queryParams = new HttpParams({
      fromObject: {
        id: String(id),
        regime: params.regime ?? 'V',
        retencao: params.retencao ?? 'N',
        homologacao: params.homologacao ? 'true' : 'false'
      }
    });

    return this.http.get(`${this.apiUrl}/api/exportar-iss.php`, {
      params: queryParams,
      responseType: 'blob',
      observe: 'response'
    }) as Observable<HttpResponse<Blob>>;
  }

}