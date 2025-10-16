import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HistoryService, GroupedHistory } from '../../services/history.service';
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
                <h1 class="text-4xl font-bold text-white mb-2">Mi Historial de Transformaciones</h1>
                <p class="text-xl text-white/80">
                  Revisa todas las transformaciones aplicadas a tus imágenes
                </p>
              </div>

              <!-- Controles -->
              <div class="flex justify-between items-center mb-6">
                <div class="flex gap-4">
                  <button 
                    (click)="loadHistory()"
                    [disabled]="historyService.isLoading()"
                    class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Actualizar Historial
                  </button>
                </div>
                
                <div class="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                  {{ historyService.groupedHistory().length }} imágenes • {{ historyService.historyList().length }} transformaciones
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
                    <p class="text-white/60">Obteniendo tus transformaciones...</p>
                  </div>
                </div>
              }

              <!-- Lista de historial agrupado por imagen -->
              @if (!historyService.isLoading() && historyService.groupedHistory().length > 0) {
                <div class="space-y-6">
                  @for (group of historyService.groupedHistory(); track group.id_imagen) {
                    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                      <!-- Header del grupo -->
                      <div class="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                        <div class="flex items-center space-x-3">
                          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 class="text-white font-semibold text-xl">Imagen #{{ group.id_imagen }}</h3>
                            <p class="text-white/60 text-sm">
                              {{ group.transformaciones.length }} transformación(es) • {{ group.fecha_formateada }}
                            </p>
                          </div>
                        </div>
                        <div class="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                          Orden: {{ getTransformationOrder(group.transformaciones) }}
                        </div>
                      </div>

                      <!-- Lista de transformaciones de esta imagen -->
                      <div class="space-y-3">
                        @for (item of group.transformaciones; track item.id_transformacion) {
                          <div class="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition cursor-pointer"
                               (click)="selectItem(item)">
                            <div class="flex justify-between items-start">
                              <div class="flex-1">
                                <div class="flex items-center space-x-3 mb-2">
                                  <span class="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                                    Paso {{ item.orden + 1 }}
                                  </span>
                                  <span class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                    {{ getTransformationType(item.tipo) }}
                                  </span>
                                  <span class="text-white/60 text-xs">
                                    ID: {{ item.id_transformacion }}
                                  </span>
                                </div>
                                
                                <!-- Parámetros -->
                                <div class="bg-black/20 rounded-lg p-2">
                                  <div class="flex items-center justify-between mb-1">
                                    <span class="text-white/70 text-xs">Configuración:</span>
                                    <span class="text-blue-400 text-xs">{{ getParametersType(item.parametros) }}</span>
                                  </div>
                                  <div class="font-mono text-xs text-white/80 overflow-x-auto">
                                    {{ formatParameters(item.parametros_parsed) }}
                                  </div>
                                </div>
                              </div>
                              
                              <div class="flex items-center space-x-2 ml-4">
                                <button 
                                  (click)="deleteItem(item.id_transformacion, $event)"
                                  class="text-red-400 hover:text-red-300 p-2 rounded-lg transition bg-white/5 hover:bg-white/10"
                                  title="Eliminar transformación"
                                >
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Sin resultados -->
              @if (!historyService.isLoading() && historyService.groupedHistory().length === 0) {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                  <div class="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 class="text-white text-xl font-semibold mb-2">No hay transformaciones en tu historial</h3>
                  <p class="text-white/60 mb-4">Aún no has realizado transformaciones de imágenes</p>
                  <button 
                    (click)="loadHistory()"
                    class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                  >
                    Recargar Historial
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
    this.loadHistory();
  }

  async loadHistory(): Promise<void> {
    console.log('Cargando historial del usuario...');
    await this.historyService.getHistory();
  }

  selectItem(item: any): void {
    console.log('Seleccionando item:', item);
    this.historyService.selectHistory(item);
    this.router.navigate(['/history/detail', item.id_transformacion]);
  }

  async deleteItem(id: number, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta transformación?');
    if (confirmDelete) {
      console.log('Eliminando registro:', id);
      await this.historyService.deleteHistory(id);
    }
  }

  formatParameters(parameters: any): string {
    if (!parameters) return 'Sin parámetros configurados';
    if (typeof parameters === 'string') return parameters;
    if (typeof parameters === 'object' && Object.keys(parameters).length === 0) return 'Configuración predeterminada';
    if (typeof parameters === 'object') {
      try {
        return JSON.stringify(parameters, null, 2);
      } catch {
        return 'Parámetros no válidos';
      }
    }
    return String(parameters);
  }

  getTransformationType(tipo: string): string {
    const types: {[key: string]: string} = {
      'grayscale': 'Escala de Grises',
      'blur': 'Desenfoque',
      'brightness': 'Brillo',
      'contrast': 'Contraste',
      'rotate': 'Rotación',
      'flip': 'Volteo',
      'resize': 'Redimensionar',
      'crop': 'Recortar'
    };
    return types[tipo] || tipo;
  }

  getParametersType(parametros: string): string {
    if (!parametros) return 'Sin parámetros';
    try {
      const parsed = JSON.parse(parametros);
      if (typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return `${Object.keys(parsed).length} parámetro(s)`;
      }
      return 'Configuración simple';
    } catch {
      return 'Texto plano';
    }
  }

  getTransformationOrder(transformaciones: any[]): string {
    return transformaciones.map(t => t.orden + 1).join(' → ');
  }
}