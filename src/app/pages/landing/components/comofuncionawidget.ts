import { Component } from '@angular/core';

@Component({
    selector: 'como-funciona-widget',
    template: `
        <div id="como-funciona" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center max-w-3xl mx-auto">
                <span class="text-primary font-semibold uppercase tracking-wider">Passo a passo</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-semibold mt-2 mb-4 text-4xl">Como o ISS Solution ajuda na entrega</h2>
                <p class="text-surface-600 dark:text-surface-300 text-xl leading-normal m-0">
                    Do arquivo de notas ao valor do imposto conferido: o sistema faz o trabalho repetitivo e aponta o que precisa da sua atenção antes da declaração.
                </p>
            </div>

            <div class="grid grid-cols-12 gap-6 mt-12">
                @for (etapa of etapas; track etapa.titulo; let i = $index) {
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="etapa h-full p-6 rounded-2xl bg-surface-0 dark:bg-surface-900">
                            <div class="flex items-center gap-3 mb-4">
                                <span class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-contrast font-bold">{{ i + 1 }}</span>
                                <i class="pi {{ etapa.icone }} text-primary text-2xl!"></i>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-2">{{ etapa.titulo }}</div>
                            <p class="text-surface-600 dark:text-surface-300 leading-normal m-0">{{ etapa.texto }}</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    `,
    styles: `
        .etapa {
            border: 1px solid var(--surface-border);
            border-top: 3px solid var(--primary-color);
        }
    `
})
export class ComoFuncionaWidget {
    readonly etapas = [
        {
            icone: 'pi-file-export',
            titulo: 'Exporte as notas',
            texto: 'Gere um arquivo TXT com as notas de serviço do período: número, série, data, prestador, tomador, código LC 116, município e valor.'
        },
        {
            icone: 'pi-upload',
            titulo: 'Importe no sistema',
            texto: 'Cada linha é validada. As linhas com problema são listadas com o motivo, sem travar o restante da importação.'
        },
        {
            icone: 'pi-calculator',
            titulo: 'Cálculo automático',
            texto: 'O serviço é classificado pelo código da LC 116 e o ISS é calculado com a alíquota cadastrada para ele.'
        },
        {
            icone: 'pi-send',
            titulo: 'Confira e declare',
            texto: 'Use o painel e o histórico para conferir os totais do mês e declarar e recolher o ISS à Prefeitura com segurança.'
        }
    ];
}
