import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AppMenu } from './app.menu';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '../service/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, RouterModule],
    template: `
        <div class="layout-sidebar">
            <nav class="layout-sidebar-menu">
                <app-menu></app-menu>
            </nav>

            @if (sessao(); as s) {
                <div class="layout-sidebar-footer">
                    <span class="sidebar-avatar">{{ iniciais() }}</span>
                    <div class="sidebar-usuario">
                        <span class="sidebar-usuario-nome">{{ s.usuario.nome }}</span>
                        <span class="sidebar-usuario-empresa">{{ s.empresa.razao_social }}</span>
                    </div>
                    <span class="sidebar-perfil">{{ s.usuario.perfil === 'ADMIN' ? 'Admin' : 'Usuário' }}</span>
                </div>
            }
        </div>
    `
})
export class AppSidebar implements OnInit, OnDestroy {
    layoutService = inject(LayoutService);

    private auth = inject(AuthService);
    readonly sessao = this.auth.sessao;
    readonly iniciais = computed(() => {
        const partes = (this.sessao()?.usuario.nome ?? '').trim().split(/\s+/).filter(Boolean);
        return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
    });

    router = inject(Router);

    el = inject(ElementRef);

    private outsideClickListener: ((event: MouseEvent) => void) | null = null;

    private destroy$ = new Subject<void>();

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();

            if (this.layoutService.isDesktop()) {
                if (state.overlayMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            } else {
                if (state.mobileMenuActive) {
                    this.bindOutsideClickListener();
                } else {
                    this.unbindOutsideClickListener();
                }
            }
        });
    }

    ngOnInit() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event) => {
                const navEvent = event as NavigationEnd;
                this.onRouteChange(navEvent.urlAfterRedirects);
            });

        this.onRouteChange(this.router.url);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.unbindOutsideClickListener();
    }

    private onRouteChange(path: string) {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            activePath: path,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            mobileMenuActive: false,
            menuHoverActive: false
        }));
    }

    private bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: MouseEvent) => {
                if (this.isOutsideClicked(event)) {
                    this.layoutService.layoutState.update((val) => ({
                        ...val,
                        overlayMenuActive: false,
                        staticMenuMobileActive: false,
                        mobileMenuActive: false,
                        menuHoverActive: false
                    }));
                }
            };

            document.addEventListener('click', this.outsideClickListener);
        }
    }

    private unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }

    private isOutsideClicked(event: MouseEvent): boolean {
        const topbarButtonEl = document.querySelector('.topbar-start > button');
        const sidebarEl = this.el.nativeElement;

        return !(
            sidebarEl?.isSameNode(event.target as Node) ||
            sidebarEl?.contains(event.target as Node) ||
            topbarButtonEl?.isSameNode(event.target as Node) ||
            topbarButtonEl?.contains(event.target as Node)
        );
    }
}
