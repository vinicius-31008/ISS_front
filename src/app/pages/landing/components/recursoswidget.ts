import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '@/app/layout/service/auth.service';

@Component({
    selector: 'recursos-widget',
    imports: [ButtonModule, RippleModule, RouterModule],
    template: `
        <div id="recursos" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center max-w-3xl mx-auto">
                <span class="text-primary font-semibold uppercase tracking-wider">Recursos</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-semibold mt-2 mb-4 text-4xl">Tudo o que a apuração do ISS precisa</h2>
            </div>

            <div class="grid grid-cols-12 gap-6 mt-12">
                @for (recurso of recursos; track recurso.titulo) {
                    <div class="col-span-12 md:col-span-6 lg:col-span-4">
                        <div class="flex gap-4 h-full p-6 rounded-2xl border border-surface bg-surface-0 dark:bg-surface-900">
                            <span class="flex items-center justify-center shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary">
                                <i class="pi {{ recurso.icone }} text-xl!"></i>
                            </span>
                            <div>
                                <div class="text-surface-900 dark:text-surface-0 text-lg font-semibold mb-1">{{ recurso.titulo }}</div>
                                <p class="text-surface-600 dark:text-surface-300 leading-normal m-0">{{ recurso.texto }}</p>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <div class="chamada mt-16 p-8 md:p-12 rounded-3xl text-center">
                <h3 class="text-surface-900 dark:text-surface-0 text-3xl font-semibold m-0">Deixe o ISS do próximo mês pronto mais cedo</h3>
                <p class="text-surface-600 dark:text-surface-300 text-xl leading-normal mt-4 mb-8">
                    Importe as notas, confira o imposto e chegue ao prazo da Prefeitura de Santa Bárbara d'Oeste com tudo conferido.
                </p>
                @if (auth.autenticado()) {
                    <button pButton pRipple [rounded]="true" label="Acessar o painel" icon="pi pi-arrow-right" iconPos="right" routerLink="/dashboard" class="text-xl! px-6!"></button>
                } @else {
                    <button pButton pRipple [rounded]="true" label="Entrar no sistema" icon="pi pi-sign-in" routerLink="/auth/login" class="text-xl! px-6!"></button>
                }
            </div>
        </div>
    `,
    styles: `
        .chamada {
            border: 1px solid var(--surface-border);
            background: radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, var(--primary-color) 18%, transparent), transparent 70%);
        }
    `
})
export class RecursosWidget {
    auth = inject(AuthService);

    readonly recursos = [
        {
            icone: 'pi-check-circle',
            titulo: 'Validação antes de gravar',
            texto: 'CNPJ/CPF, datas inexistentes, valores e código IBGE do município são conferidos linha a linha.'
        },
        {
            icone: 'pi-copy',
            titulo: 'Sem notas duplicadas',
            texto: 'Reimportar uma nota atualiza o registro existente em vez de somar o imposto duas vezes.'
        },
        {
            icone: 'pi-chart-line',
            titulo: 'Painel com gráficos',
            texto: 'ISS por mês de emissão, serviços com mais imposto, maiores tomadores e status das importações.'
        },
        {
            icone: 'pi-history',
            titulo: 'Histórico completo',
            texto: 'Cada importação fica registrada com quem enviou, totais, notas gravadas e erros de linha.'
        },
        {
            icone: 'pi-building',
            titulo: 'Várias empresas',
            texto: 'Cada empresa tem seus próprios usuários, notas e importações. Ninguém enxerga os dados de outra empresa.'
        },
        {
            icone: 'pi-shield',
            titulo: 'Acesso seguro',
            texto: 'Login com sessão expirável, perfis de administrador e usuário e troca de senha obrigatória no primeiro acesso.'
        }
    ];
}
