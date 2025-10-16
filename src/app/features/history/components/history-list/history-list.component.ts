import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1 flex flex-col">
          <app-header></app-header>
          <main class="flex-1 p-8">
            <div class="max-w-6xl mx-auto">
              <!-- Título -->
              <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">Historial de Transformaciones</h1>
                <p class="text-xl text-white/80">
                  Revisa todas las transformaciones que has aplicado a tus imágenes
                </p>
              </div>

              <!-- Controles -->
              <div class="flex justify-between items-center mb-6">
                <div class="flex gap-4">
                  <button 
                    (click)="loadHistory()"
                    [disabled]="historyService.isLoading()"
                    class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition disabled:opacity-50 flex items-center"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Actualizar
                  </button>
                  
                  <button 
                    (click)="loadUserHistory()"
                    [disabled]="historyService.isLoading()"
                    class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Mi Historial
                  </button>
                </div>
                
                <div class="text-white/60 text-sm">
                  {{ historyService.historyList().length }} registros encontrados
                </div>
              </div>

              <!-- Error -->
              @if (historyService.errorMessage()) {
                <div class="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg class="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p class="text-white">{{ historyService.errorMessage() }}</p>
                    </div>
                    <button 
                      (click)="historyService.errorMessage.set('')"
                      class="text-red-400 hover:text-red-300"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              }

              <!-- Loading -->
              @if (historyService.isLoading()) {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold mb-2">Cargando historial</h3>
                    <p class="text-white/60">Obteniendo registros de transformaciones...</p>
                  </div>
                </div>
              }

              <!-- Lista de historial -->
              @if (!historyService.isLoading() && historyService.historyList().length > 0) {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <div class="space-y-4">
                    @for (item of historyService.historyList(); track item.id_transformacion; let i = $index) {
                      <div class="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                           (click)="selectItem(item)">
                        <div class="flex justify-between items-start mb-2">
                          <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                            <div>
                              <h4 class="text-white font-semibold text-lg">
                                Transformación #{{ item.id_transformacion }}
                              </h4>
                              <p class="text-white/60 text-sm">
                                Imagen ID: {{ item.id_imagen }} • Orden: {{ item.orden }}
                              </p>
                            </div>
                          </div>
                          
                          <div class="flex items-center space-x-2">
                            <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              {{ item.tipo }}
                            </span>
                            <button 
                              (click)="deleteItem(item.id_transformacion, $event)"
                              class="text-red-400 hover:text-red-300 p-1 rounded transition"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p class="text-white/70 mb-1">Parámetros:</p>
                            <div class="bg-black/20 rounded p-2 font-mono text-xs text-white/80">
                              {{ formatParameters(item.parametros_parsed) }}
                            </div>
                          </div>
                          
                          <div>
                            <p class="text-white/70 mb-1">Fecha:</p>
                            <p class="text-white">{{ item.fecha_formateada }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Sin resultados -->
              @if (!historyService.isLoading() && historyService.historyList().length === 0) {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                  <div class="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-white text-xl font-semibold mb-2">No hay registros en el historial</h3>
                  <p class="text-white/60 mb-4">Aún no se han realizado transformaciones o no hay datos disponibles</p>
                  <button 
                    (click)="loadHistory()"
                    class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                  >
                    Cargar Historial
                  </button>
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
export class HistoryListComponent implements OnInit {
  private router = inject(Router);
  historyService = inject(HistoryService);

  ngOnInit(): void {
    console.log('HistoryListComponent - Inicializando');
    // Cargar historial automáticamente al iniciar
    this.loadHistory();
  }

  async loadHistory(): Promise<void> {
    console.log('Cargando historial completo...');
    await this.historyService.getHistory();
  }

  async loadUserHistory(): Promise<void> {
    console.log('Cargando historial del usuario...');
    await this.historyService.getUserHistory();
  }

  selectItem(item: any): void {
    console.log('Seleccionando item:', item);
    this.historyService.selectHistory(item);
  }

  async deleteItem(id: number, event: Event): Promise<void> {
    event.stopPropagation(); // Prevenir que se active el click del contenedor
    
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este registro del historial?');
    if (confirmDelete) {
      console.log(' Eliminando registro:', id);
      await this.historyService.deleteHistory(id);
    }
  }

  formatParameters(parameters: any): string {
    if (!parameters || Object.keys(parameters).length === 0) {
      return 'Sin parámetros';
    }
    
    try {
      return JSON.stringify(parameters, null, 2);
    } catch {
      return 'Parámetros no válidos';
    }
  }
}