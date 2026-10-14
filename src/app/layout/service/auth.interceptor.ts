import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './importar.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    // Só envia o token para o nosso backend
    if (!req.url.startsWith(API_URL)) {
        return next(req);
    }

    const ehLogin = req.url.endsWith('/api/login.php');
    const token = auth.token;

    const requisicao = token && !ehLogin ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(requisicao).pipe(
        catchError((erro: HttpErrorResponse) => {
            // Token expirado/inválido: manda de volta para o login (no login, 401 é só senha errada)
            if (erro.status === 401 && !ehLogin) {
                auth.encerrarSessaoLocal();
            }
            return throwError(() => erro);
        })
    );
};
