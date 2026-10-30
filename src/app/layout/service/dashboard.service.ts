import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDashboardResponse } from '../interfaces/dashboard.interface';
import { API_URL } from './importar.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private url = `${API_URL}/api/dashboard.php`;

    /** meses: tamanho da série mensal (1 a 36). */
    resumo(meses: number): Observable<IDashboardResponse> {
        return this.http.get<IDashboardResponse>(this.url, { params: { meses } });
    }
}
