import { Component } from '@angular/core';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { SobreIssWidget } from './components/sobreisswidget';
import { ComoFuncionaWidget } from './components/comofuncionawidget';
import { RecursosWidget } from './components/recursoswidget';
import { FooterWidget } from './components/footerwidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [TopbarWidget, HeroWidget, SobreIssWidget, ComoFuncionaWidget, RecursosWidget, FooterWidget],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <sobre-iss-widget />
                <como-funciona-widget />
                <recursos-widget />
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {}
