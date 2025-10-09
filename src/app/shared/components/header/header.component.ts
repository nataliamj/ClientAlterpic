import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],  

  template: `
    <header class="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div class="flex items-center justify-between p-4">
        <!-- Título de página -->
        <div>
          <h2 class="text-xl font-semibold text-white">{{ getPageTitle() }}</h2>
        </div>

        <!-- User menu -->
        <div class="flex items-center space-x-4">
          @if (authService.isAuthenticated()) {
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ authService.currentUser()?.name?.charAt(0) }}
                </span>
              </div>
              <span class="text-white text-sm">{{ authService.currentUser()?.name }}</span>
              <button 
                (click)="authService.logout()"
                class="text-white/60 hover:text-white transition"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          } @else {
            <div class="flex space-x-2">
              <a 
                routerLink="/auth/login"
                class="px-4 py-2 text-white/80 hover:text-white transition"
              >
                Login
              </a>
              <a 
                routerLink="/auth/register"
                class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              >
                Registrarse
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: ``
})
export class HeaderComponent {
  authService = inject(AuthService);

  getPageTitle(): string {
    // Lógica para determinar el título según la ruta actual
    const path = window.location.pathname;
    if (path.includes('transform')) return 'Transformar Imágenes';
    if (path.includes('history')) return 'Mi Historial';
    if (path.includes('home')) return 'Inicio';
    return 'Alterpic';
  }
}