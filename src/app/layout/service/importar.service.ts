import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8000/src';

  constructor(private http: HttpClient) {}

  getHealth<T>(): Observable<T> {

    let retorno = this.http.get<T>(`${this.apiUrl}/api/health.php`);

    console.log(retorno);

    return retorno;
  }

  getHistorico<T>(): Observable<T> {

    let retorno = this.http.get<T>(`${this.apiUrl}/api/historico.php`);

    console.log(retorno);

    return retorno;
  }

  importarArquivo(arquivo: File): Observable<any> {

    const formData = new FormData();

    formData.append('arquivo', arquivo);

    let retorno = this.http.post<any>(
      `${this.apiUrl}/api/importar.php`,
      formData);

    console.log(retorno);

    return retorno;
   }

}