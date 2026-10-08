import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { IHistoricoResponse } from '../../interfaces/historico.interface';
import { ApiService } from '../../service/importar.service';

export const historicoResolver: ResolveFn<IHistoricoResponse> = async () => {
    const apiService = inject(ApiService);

    return firstValueFrom(apiService.getHistorico<IHistoricoResponse>());
};
