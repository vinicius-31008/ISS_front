import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '@/app/layout/service/auth.service';
import { rolarPara } from './rolar';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule, RouterModule],
    template: `
        <div id="hero" class="hero px-6 lg:px-20 py-16 lg:py-24">
            <div class="grid grid-cols-12 gap-12 items-center mx-0 md:mx-12 lg:mx-20">
                <div class="col-span-12 lg:col-span-7">
                    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
                        <i class="pi pi-map-marker"></i>
                        Santa Bárbara d'Oeste - SP
                    </span>
                    <h1 class="text-4xl md:text-6xl font-bold text-surface-900 dark:text-surface-0 leading-tight m-0">
                        Seu ISS apurado, conferido e pronto para declarar
                    </h1>
                    <p class="text-xl md:text-2xl leading-normal mt-6 text-surface-600 dark:text-surface-300">
                        O ISS Solution importa suas notas fiscais de serviço, calcula o imposto de cada uma pelo código da LC 116 e organiza tudo o que você precisa para
                        cumprir a obrigação do ISS com a Prefeitura de Santa Bárbara d'Oeste, sem planilhas e sem retrabalho.
                    </p>
                    <div class="flex flex-wrap gap-3 mt-8">
                        @if (auth.autenticado()) {
                            <button pButton pRipple [rounded]="true" label="Acessar o painel" icon="pi pi-arrow-right" iconPos="right" routerLink="/dashboard" class="text-xl! px-6!"></button>
                        } @else {
                            <button pButton pRipple [rounded]="true" label="Entrar no sistema" icon="pi pi-sign-in" routerLink="/auth/login" class="text-xl! px-6!"></button>
                        }
                        <button pButton pRipple [rounded]="true" [outlined]="true" label="Como funciona" (click)="rolarPara('como-funciona')" class="text-xl! px-6!"></button>
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-5">
                    <div class="hero-card bg-surface-0 dark:bg-surface-900">
                        <div class="flex items-center gap-3 mb-6">
                            <img src="images/iss-logo.png" alt="" class="logo-iss h-10 w-auto" />
                            <span class="font-semibold text-xl text-surface-900 dark:text-surface-0">Da nota ao ISS em minutos</span>
                        </div>
                        @for (passo of passos; track passo.titulo) {
                            <div class="flex items-start gap-4 py-4 border-t border-surface">
                                <span class="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary">
                                    <i class="pi {{ passo.icone }} text-xl!"></i>
                                </span>
                                <div>
                                    <div class="font-semibold text-surface-900 dark:text-surface-0">{{ passo.titulo }}</div>
                                    <div class="text-surface-600 dark:text-surface-300">{{ passo.texto }}</div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: `
        .hero {
            background:
                radial-gradient(60% 80% at 85% 20%, color-mix(in srgb, var(--primary-color) 22%, transparent), transparent 70%),
                radial-gradient(50% 60% at 0% 100%, color-mix(in srgb, var(--primary-color) 10%, transparent), transparent 70%);
        }

        .hero-card {
            padding: 2rem;
            border-radius: 1.5rem;
            border: 1px solid var(--surface-border);
            border-top: 4px solid var(--primary-color);
            box-shadow: 0 24px 48px -24px color-mix(in srgb, var(--primary-color) 55%, transparent);
        }
    `
})
export class HeroWidget {
    auth = inject(AuthService);

    readonly passos = [
        { icone: 'pi-file-import', titulo: 'Importe o arquivo', texto: 'Envie o TXT com as notas emitidas no período.' },
        { icone: 'pi-check-square', titulo: 'Validação linha a linha', texto: 'CNPJ/CPF, datas, valores e serviço conferidos antes de gravar.' },
        { icone: 'pi-calculator', titulo: 'ISS calculado', texto: 'Base de cálculo e imposto de cada nota pela alíquota do serviço.' },
        { icone: 'pi-chart-bar', titulo: 'Acompanhe no painel', texto: 'Totais por mês, por serviço e por tomador para a apuração.' }
    ];

    readonly rolarPara = rolarPara;
}
