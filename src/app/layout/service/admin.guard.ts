import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Rotas restritas a ADMIN (o backend também bloqueia com 403). */
export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);

    return auth.admin() ? true : inject(Router).createUrlTree(['/auth/access']);
};
