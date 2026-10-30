import { Component } from '@angular/core';

@Component({
    selector: 'sobre-iss-widget',
    template: `
        <div id="iss" class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center max-w-3xl mx-auto">
                <span class="text-primary font-semibold uppercase tracking-wider">Entenda a obrigação</span>
                <h2 class="text-surface-900 dark:text-surface-0 font-semibold mt-2 mb-4 text-4xl">O que é o ISS</h2>
                <p class="text-surface-600 dark:text-surface-300 text-xl leading-normal m-0">
                    O Imposto Sobre Serviços de Qualquer Natureza (ISS ou ISSQN) é o tributo municipal cobrado sobre a prestação de serviços. Em Santa Bárbara
                    d'Oeste, como em todo município, quem presta serviços precisa apurar, declarar e recolher o imposto à Prefeitura.
                </p>
            </div>

            <div class="grid grid-cols-12 gap-6 mt-12">
                @for (item of itens; track item.titulo) {
                    <div class="col-span-12 md:col-span-6 lg:col-span-3">
                        <div class="h-full p-6 rounded-2xl border border-surface bg-surface-0 dark:bg-surface-900">
                            <span class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                                <i class="pi {{ item.icone }} text-xl!"></i>
                            </span>
                            <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-2">{{ item.titulo }}</div>
                            <p class="text-surface-600 dark:text-surface-300 leading-normal m-0">{{ item.texto }}</p>
                        </div>
                    </div>
                }
            </div>

            <div class="flex items-start gap-4 mt-8 p-6 rounded-2xl border border-surface bg-primary/5">
                <i class="pi pi-info-circle text-primary text-2xl! mt-1"></i>
                <p class="text-surface-700 dark:text-surface-200 leading-normal m-0">
                    <strong>Reforma tributária:</strong> a Emenda Constitucional 132/2023 prevê a substituição gradual do ISS pelo IBS até 2033. Durante a
                    transição as notas passam a carregar novos dados, como o código NBS, o indicador de operação e a classificação tributária (cClassTrib). O ISS
                    Solution já mantém esses campos associados a cada serviço.
                </p>
            </div>
        </div>
    `
})
export class SobreIssWidget {
    readonly itens = [
        {
            icone: 'pi-list',
            titulo: 'Base na LC 116/2003',
            texto: 'A Lei Complementar 116 traz a lista de serviços tributáveis. Cada nota é enquadrada em um item dessa lista, que define a regra aplicável.'
        },
        {
            icone: 'pi-percentage',
            titulo: 'Alíquota municipal',
            texto: 'Cada município define a alíquota de cada serviço por lei própria, dentro do limite nacional de 2% a 5% sobre o preço do serviço.'
        },
        {
            icone: 'pi-calendar',
            titulo: 'Apuração mensal',
            texto: "O imposto é apurado sobre os serviços prestados no mês e recolhido nos prazos do calendário fiscal da Prefeitura de Santa Bárbara d'Oeste."
        },
        {
            icone: 'pi-exclamation-triangle',
            titulo: 'Atenção aos erros',
            texto: 'Enquadramento errado, nota esquecida ou valor digitado incorretamente geram diferença de imposto, multa e juros.'
        }
    ];
}
