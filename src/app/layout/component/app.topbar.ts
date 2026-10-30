import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/layout/service/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, DatePickerModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/dashboard">
                <img src="images/iss-logo.png" alt="" class="logo-iss logo-iss-simbolo" />
                <span>SOLUTION</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="calendar-wrapper">
                        <button type="button" class="layout-topbar-action calendar-button" (click)="toggleCalendarPopup()" aria-label="Visualizar calendário">
                            <i class="pi pi-calendar"></i>
                        </button>

                        <div class="calendar-popup" *ngIf="calendarOpen">
                            <p-datepicker
                                [(ngModel)]="selectedDate"
                                [inline]="true"
                                [showIcon]="false"
                                [readonlyInput]="true"
                                [showButtonBar]="false"
                                [selectionMode]="'single'"
                                dateFormat="dd/mm/yy"
                                appendTo="body"
                            ></p-datepicker>
                        </div>
                    </div>

                    <div class="user-menu-wrapper">
                        <button type="button" class="layout-topbar-action user-button" [title]="auth.sessao()?.usuario?.nome ?? ''" (click)="toggleUserMenu()">
                            <i class="pi pi-user"></i>
                            <span>{{ auth.sessao()?.usuario?.nome }}</span>
                        </button>

                        <div class="user-info-card" *ngIf="userMenuOpen && auth.sessao() as sessao">
                            <div class="user-info-header">
                                <i class="pi pi-user"></i>
                                <strong>{{ sessao.usuario.nome }}</strong>
                            </div>
                            <div class="user-info-item">
                                <span class="label">E-mail</span>
                                <span>{{ sessao.usuario.email }}</span>
                            </div>
                            <div class="user-info-item">
                                <span class="label">Perfil</span>
                                <span>{{ sessao.usuario.perfil }}</span>
                            </div>
                            <div class="user-info-item">
                                <span class="label">Empresa</span>
                                <span>{{ sessao.empresa.razao_social }}</span>
                            </div>
                            <div class="user-info-item">
                                <span class="label">CNPJ</span>
                                <span>{{ sessao.empresa.cnpj }}</span>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="layout-topbar-action" title="Sair" (click)="auth.logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    styles: `
        .calendar-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            padding: 0.25rem;
        }

        .calendar-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 2.5rem;
            min-height: 2.5rem;
            border: 0;
            background: transparent;
            cursor: pointer;
        }

        .calendar-popup {
            position: absolute;
            right: 0;
            top: calc(100% + 0.75rem);
            background: var(--surface-overlay);
            border: 1px solid var(--surface-border);
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
            padding: 0.75rem;
            z-index: 1000;
        }

        :host ::ng-deep .calendar-popup .p-datepicker {
            border: none;
            box-shadow: none;
            background: transparent;
        }

        :host ::ng-deep .calendar-popup .p-datepicker table {
            margin: 0;
        }

        .user-menu-wrapper {
            position: relative;
        }

        .user-button {
            position: relative;
        }

        .user-info-card {
            position: absolute;
            right: 0;
            top: calc(100% + 0.75rem);
            min-width: 260px;
            background: var(--surface-overlay);
            border: 1px solid var(--surface-border);
            border-radius: 12px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
            padding: 1rem;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .user-info-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--surface-border);
            font-size: 0.95rem;
        }

        .user-info-item {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            font-size: 0.85rem;
        }

        .user-info-item .label {
            color: var(--text-color-secondary);
            font-size: 0.74rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        :host ::ng-deep .topbar-calendar {
            width: 100%;
        }

        :host ::ng-deep .topbar-calendar .p-inputtext {
            background: transparent;
            border: 1px solid var(--surface-border);
            color: var(--text-color);
            width: 100%;
        }
    `
})
export class AppTopbar {
    items!: MenuItem[];
    selectedDate: Date | null = new Date();
    userMenuOpen = false;
    calendarOpen = false;

    layoutService = inject(LayoutService);

    auth = inject(AuthService);

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    toggleUserMenu() {
        this.userMenuOpen = !this.userMenuOpen;
    }

    toggleCalendarPopup() {
        this.calendarOpen = !this.calendarOpen;
    }
}
