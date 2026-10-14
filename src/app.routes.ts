import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { EmpresasComponent } from './app/layout/component/empresas/empresas.component';
import { HistoricoComponent } from './app/layout/component/historico/historico.component';
import { ImportacaoComponent } from './app/layout/component/importacao/importacao.component';
import { UsuariosComponent } from './app/layout/component/usuarios/usuarios.component';
import { adminGuard } from './app/layout/service/admin.guard';
import { authGuard } from './app/layout/service/auth.guard';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'importacao', component: ImportacaoComponent },
            { path: 'historico', component: HistoricoComponent },
            { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
            { path: 'empresas', component: EmpresasComponent, canActivate: [adminGuard] },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
