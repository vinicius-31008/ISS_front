import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from './app/layout/service/auth.interceptor';
import { PALETA_VERMELHA } from './app/layout/theme/paleta-vermelha';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideZonelessChangeDetection(),
        // Já inicia com o vermelho, sem piscar o verde padrão do Aura até o configurador carregar
        providePrimeNG({ theme: { preset: definePreset(Aura, { semantic: { primary: PALETA_VERMELHA } }), options: { darkModeSelector: '.app-dark' } } })
    ]
};
