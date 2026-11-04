import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../service/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    private auth = inject(AuthService);

    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Início',
                items: [{ label: 'Painel', icon: 'pi pi-fw pi-th-large', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Notas Fiscais',
                items: [
                    { label: 'Importar', icon: 'pi pi-fw pi-upload', routerLink: ['/importacao'] },
                    { label: 'Exportar', icon: 'pi pi-fw pi-download', routerLink: ['/exportacao'] },
                    { label: 'Histórico', icon: 'pi pi-fw pi-history', routerLink: ['/historico'] }
                ]
            },
            {
                label: 'Administração',
                visible: this.auth.admin(),
                items: [
                    { label: 'Empresas', icon: 'pi pi-fw pi-building', routerLink: ['/empresas'] },
                    { label: 'Usuários', icon: 'pi pi-fw pi-users', routerLink: ['/usuarios'] }
                ]
            },/*
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },*/
            {
                label: 'Sobre',
                items: [
                    {
                        label: 'Documentação',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    {
                        label: 'Código-fonte',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/vinicius-31008/ISS_front',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
