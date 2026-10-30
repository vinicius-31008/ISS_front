import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { rolarPara } from './rolar';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="py-12 px-6 lg:px-20 mx-0 mt-12 lg:mx-20 border-t border-surface">
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12 md:col-span-5">
                    <a (click)="rolarPara('home')" class="flex items-center gap-3 cursor-pointer justify-center md:justify-start">
                        <img src="images/iss-logo.png" alt="" class="logo-iss h-12 w-auto" />
                        <span class="font-semibold text-2xl text-surface-900 dark:text-surface-0">ISS Solution</span>
                    </a>
                    <p class="text-surface-600 dark:text-surface-300 leading-normal mt-4 text-center md:text-left">
                        Importação de notas fiscais e cálculo do ISS para empresas prestadoras de serviço de Santa Bárbara d'Oeste - SP.
                    </p>
                </div>

                <div class="col-span-12 md:col-span-7">
                    <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                        <div class="col-span-12 sm:col-span-6">
                            <h4 class="font-semibold text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Conteúdo</h4>
                            <a (click)="rolarPara('iss')" class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">O que é o ISS</a>
                            <a (click)="rolarPara('como-funciona')" class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Como funciona</a>
                            <a (click)="rolarPara('recursos')" class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100">Recursos</a>
                        </div>
                        <div class="col-span-12 sm:col-span-6">
                            <h4 class="font-semibold text-xl leading-normal mb-4 text-surface-900 dark:text-surface-0">Sistema</h4>
                            <a routerLink="/auth/login" class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100">Entrar</a>
                            <a routerLink="/dashboard" class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100">Painel</a>
                        </div>
                    </div>
                </div>
            </div>

            <p class="text-sm text-surface-500 dark:text-surface-400 leading-normal mt-12 mb-0 text-center">
                © {{ ano }} ISS Solution. Os valores calculados apoiam a apuração; as regras, alíquotas e prazos oficiais são os da legislação do município de Santa
                Bárbara d'Oeste.
            </p>
        </div>
    `
})
export class FooterWidget {
    readonly ano = new Date().getFullYear();
    readonly rolarPara = rolarPara;
}
