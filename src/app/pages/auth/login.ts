import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../layout/service/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, InputTextModule, MessageModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img src="images/iss-logo.png" alt="" class="logo-iss w-20 mx-auto mb-4" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">ISS Solution</div>
                            <span class="text-muted-color font-medium">Entre para continuar</span>
                        </div>

                        <form (ngSubmit)="entrar()">
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">E-mail</label>
                            <input pInputText id="email1" name="email" type="email" autocomplete="username" placeholder="seu@email.com" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <p-password id="password1" name="senha" [(ngModel)]="password" placeholder="Senha" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            @if (erro()) {
                                <p-message severity="error" styleClass="mb-4">{{ erro() }}</p-message>
                            }

                            <p-button type="submit" label="Entrar" styleClass="w-full mt-4" [loading]="carregando()"></p-button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    private auth = inject(AuthService);
    private router = inject(Router);

    email: string = '';

    password: string = '';

    carregando = signal(false);
    erro = signal('');

    entrar(): void {
        if (!this.email.trim() || !this.password) {
            this.erro.set('Informe e-mail e senha.');
            return;
        }

        this.carregando.set(true);
        this.erro.set('');

        this.auth.login(this.email.trim(), this.password).subscribe({
            next: () => {
                this.carregando.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (erro: HttpErrorResponse) => {
                this.carregando.set(false);
                this.erro.set(erro.status === 0 ? 'Não foi possível conectar ao servidor.' : (erro.error?.mensagem ?? 'Erro ao fazer login.'));
            }
        });
    }
}
