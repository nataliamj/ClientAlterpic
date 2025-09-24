import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen w-64 bg-white/10 backdrop-blur-lg border-r border-white/20">
      <!-- Logo -->
      <div class="p-6 border-b border-white/20">
        <h1 class="text-2xl font-bold text-white">Alterpic</h1>
        <p class="text-white/60 text-sm">Transforma tus imágenes</p>
      </div>

      <!-- Menú de navegación -->
      <nav class="p-4 space-y-2">
        <!-- Home -->
        <a 
          routerLink="/home" 
          routerLinkActive="bg-black/20 text-white"
          class="flex items-center px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-200 group"
        >
          <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Home
        </a>

        <!-- Transformar (solo para autenticados) -->
        @if (authService.isAuthenticated()) {
          <a 
            routerLink="/images/transform" 
            routerLinkActive="bg-black/20 text-white"
            class="flex items-center px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-200 group"
          >
            <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Transformar
          </a>

          <!-- Historial (solo para autenticados) -->
          <a 
            routerLink="/history" 
            routerLinkActive="bg-black/20 text-white"
            class="flex items-center px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-all duration-200 group"
          >
            <svg class="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Historial
          </a>
        }

        <!-- Estado de autenticación -->
        @if (authService.isAuthenticated()) {
          <div class="mt-8 p-4 bg-white/5 rounded-xl">
            <p class="text-white text-sm">Bienvenido</p>
            <p class="text-white/60 text-xs truncate">{{ authService.currentUser()?.name }}</p>
            <button 
              (click)="logout()"
              class="w-full mt-2 text-white/60 hover:text-white text-xs transition"
            >
              Cerrar sesión
            </button>
          </div>
        } @else {
          <div class="mt-8 p-4 bg-white/5 rounded-xl">
            <p class="text-white/60 text-sm">Inicia sesión para usar todas las funciones</p>
            <a 
              routerLink="/auth/login"
              class="block mt-2 text-blue-400 hover:text-blue-300 text-xs transition"
            >
              Iniciar sesión →
            </a>
          </div>
        }
      </nav>
    </div>
  `,
  styles: ``
})
export class SidebarComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}