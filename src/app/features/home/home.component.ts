import { Component, inject } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../auth/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1">
          <app-header></app-header>
          <main class="p-8">
            <div class="max-w-4xl mx-auto">
              <!-- Mensaje personalizado según autenticación -->
              @if (authService.isAuthenticated()) {
                <div class="text-center mb-8">
                  <h1 class="text-4xl font-bold text-white mb-2">
                    ¡Bienvenido, {{ authService.currentUser()?.name }}!
                  </h1>
                  <p class="text-xl text-white/80">
                    ¿Listo para transformar tus imágenes?
                  </p>
                </div>

                <!-- Acciones rápidas para usuarios autenticados -->
                <div class="grid md:grid-cols-2 gap-6 mb-8">
                  <a 
                    routerLink="/images/transform" 
                    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition group"
                  >
                    <div class="text-center">
                      <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </div>
                      <h3 class="text-white text-xl font-semibold mb-2">Transformar Imágenes</h3>
                      <p class="text-white/60">Aplica filtros y efectos profesionales</p>
                    </div>
                  </a>

                  <a 
                    routerLink="/history" 
                    class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition group"
                  >
                    <div class="text-center">
                      <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h3 class="text-white text-xl font-semibold mb-2">Ver Historial</h3>
                      <p class="text-white/60">Revisa tus transformaciones anteriores</p>
                    </div>
                  </a>
                </div>

                <!-- Estadísticas rápidas -->
                <div class="bg-white/5 backdrop-blur-lg rounded-2xl p-6">
                  <h3 class="text-white text-lg font-semibold mb-4">Tu actividad reciente</h3>
                  <p class="text-white/60">Próximamente: estadísticas de uso</p>
                </div>

              } @else {
                <!-- Mensaje para usuarios no autenticados -->
                <div class="text-center mb-8">
                  <h1 class="text-4xl font-bold text-white mb-2">
                    Bienvenido a Alterpic
                  </h1>
                  <p class="text-xl text-white/80 mb-6">
                    Transforma tus imágenes de manera creativa y profesional
                  </p>
                  <div class="flex gap-4 justify-center">
                    <a 
                      routerLink="/auth/register" 
                      class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                      Crear Cuenta
                    </a>
                    <a 
                      routerLink="/auth/login" 
                      class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                    >
                      Iniciar Sesión
                    </a>
                  </div>
                </div>

                <!-- Características para todos -->
                <div class="grid md:grid-cols-3 gap-6">
                  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-lg font-semibold mb-2">Transforma</h3>
                    <p class="text-white/60">Aplica filtros y efectos profesionales</p>
                  </div>

                  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                    <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-lg font-semibold mb-2">Historial</h3>
                    <p class="text-white/60">Revisa tus transformaciones anteriores</p>
                  </div>

                  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                    <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-lg font-semibold mb-2">Personalizado</h3>
                    <p class="text-white/60">Experiencia adaptada a tus necesidades</p>
                  </div>
                </div>
              }
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class HomeComponent {
  authService = inject(AuthService);
}