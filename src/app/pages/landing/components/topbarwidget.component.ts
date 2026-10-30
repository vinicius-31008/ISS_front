import { Component, inject } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '@/app/layout/component/app.floatingconfigurator';
import { AuthService } from '@/app/layout/service/auth.service';
import { rolarPara } from './rolar';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator],
    template: `<a class="flex items-center gap-3 cursor-pointer" (click)="rolarPara('home')">
            <img src="images/iss-logo.png" alt="" class="logo-iss h-12 w-auto" />
            <span class="text-surface-900 dark:text-surface-0 font-semibold text-2xl leading-normal mr-20">ISS Solution</span>
        </a>

        <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden!" pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true" aria-label="Menu">
            <i class="pi pi-bars text-2xl!"></i>
        </a>

        <div class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
            <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
                @for (secao of secoes; track secao.id) {
                    <li>
                        <a (click)="rolarPara(secao.id)" pRipple class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                            <span>{{ secao.titulo }}</span>
                        </a>
                    </li>
                }
            </ul>
            <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2">
                @if (auth.autenticado()) {
                    <button pButton pRipple label="Acessar o painel" icon="pi pi-arrow-right" iconPos="right" routerLink="/dashboard" [rounded]="true"></button>
                } @else {
                    <button pButton pRipple label="Entrar" icon="pi pi-sign-in" routerLink="/auth/login" [rounded]="true"></button>
                }
                <app-floating-configurator [float]="false" />
            </div>
        </div> `
})
export class TopbarWidget {
    auth = inject(AuthService);

    readonly secoes = [
        { id: 'home', titulo: 'Início' },
        { id: 'iss', titulo: 'O que é o ISS' },
        { id: 'como-funciona', titulo: 'Como funciona' },
        { id: 'recursos', titulo: 'Recursos' }
    ];

    readonly rolarPara = rolarPara;
}
