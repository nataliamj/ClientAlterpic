import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TransformationHistory } from '../../models/history.model';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1 flex flex-col">
          <app-header></app-header>
          <main class="flex-1 p-8">
            <div class="max-w-4xl mx-auto">
              <!-- Header con navegación -->
              <div class="flex items-center justify-between mb-8">
                <button 
                  (click)="goBack()"
                  class="flex items-center text-white/80 hover:text-white transition bg-white/10 px-4 py-2 rounded-lg"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Volver al listado
                </button>
                
                <div class="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                  ID: {{ historyId }}
                </div>
              </div>

              <!-- Contenido principal -->
              <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <!-- Loading State -->
                @if (isLoading) {
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold">Cargando detalles...</h3>
                    <p class="text-white/60">Obteniendo información del registro</p>
                  </div>
                }

                <!-- Error State -->
                @if (errorMessage && !isLoading) {
                  <div class="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <svg class="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p class="text-white">{{ errorMessage }}</p>
                      </div>
                      <button 
                        (click)="loadHistoryDetail()"
                        class="text-red-400 hover:text-red-300 bg-white/10 px-3 py-1 rounded"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                }

                <!-- Detalles del item -->
                @if (!isLoading && historyItem && !errorMessage) {
                  <div class="space-y-6">
                    <!-- Header del item -->
                    <div class="flex items-start justify-between">
                      <div>
                        <h1 class="text-3xl font-bold text-white mb-2">
                          Transformación #{{ historyItem.id_transformacion }}
                        </h1>
                        <div class="flex items-center space-x-4 text-white/70">
                          <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {{ historyItem.fecha_formateada }}
                          </span>
                          <span class="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {{ historyItem.tipo || 'Transformación' }}
                          </span>
                          @if (historyItem.orden) {
                            <span class="bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                              Orden: {{ historyItem.orden }}
                            </span>
                          }
                        </div>
                      </div>
                      
                      <button 
                        (click)="deleteItem()"
                        class="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition flex items-center"
                      >
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>

                    <!-- Grid de información -->
                    <div class="grid md:grid-cols-2 gap-6">
                      <!-- Información básica -->
                      <div class="space-y-4">
                        <div class="bg-white/5 rounded-xl p-4">
                          <h3 class="text-white font-semibold mb-3 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Información de la Transformación
                          </h3>
                          <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                              <span class="text-white/70">ID Transformación:</span>
                              <span class="text-white font-mono">{{ historyItem.id_transformacion }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-white/70">ID Imagen:</span>
                              <span class="text-white font-mono">{{ historyItem.id_imagen || 'N/A' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-white/70">Tipo:</span>
                              <span class="text-blue-300">{{ historyItem.tipo || 'No especificado' }}</span>
                            </div>
                            @if (historyItem.orden) {
                              <div class="flex justify-between">
                                <span class="text-white/70">Orden:</span>
                                <span class="text-white">{{ historyItem.orden }}</span>
                              </div>
                            }
                            <div class="flex justify-between">
                              <span class="text-white/70">Fecha de creación:</span>
                              <span class="text-white">{{ historyItem.fecha_formateada }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Parámetros -->
                      <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-white font-semibold mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                          </svg>
                          Parámetros Aplicados
                        </h3>
                        <div class="bg-black/20 rounded-lg p-3 max-h-40 overflow-auto">
                          <pre class="text-white/80 text-sm font-mono">{{ formatParameters(historyItem.parametros_parsed) }}</pre>
                        </div>
                      </div>
                    </div>

                    <!-- Información de parámetros detallada -->
                    @if (hasDetailedParameters(historyItem.parametros_parsed)) {
                      <div class="bg-white/5 rounded-xl p-4">
                        <h3 class="text-white font-semibold mb-3 flex items-center">
                          <svg class="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          Configuración Detallada
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          @for (param of getParameterDetails(historyItem.parametros_parsed); track param.key) {
                            <div class="flex justify-between items-center py-2 border-b border-white/10">
                              <span class="text-white/70 capitalize">{{ param.key }}:</span>
                              <span class="text-white font-mono text-xs">{{ param.value }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Estado sin datos -->
                @if (!isLoading && !historyItem && !errorMessage) {
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold mb-2">Registro no encontrado</h3>
                    <p class="text-white/60 mb-4">El registro solicitado no existe o no está disponible.</p>
                    <button 
                      (click)="goBack()"
                      class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                    >
                      Volver al listado
                    </button>
                  </div>
                }
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class HistoryDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private historyService = inject(HistoryService);

  historyId!: number;
  historyItem: TransformationHistory | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadHistoryDetail();
  }

  ngOnDestroy(): void {
    this.historyService.clearSelection();
  }

  async loadHistoryDetail(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.route.params.subscribe(async params => {
      this.historyId = +params['id'];
      
      try {
        console.log('Cargando detalle del historial ID:', this.historyId);

        // Primero intentar con el item seleccionado (si viene del listado)
        const selected = this.historyService.selectedHistory();
        if (selected && selected.id_transformacion === this.historyId) {
          console.log('Usando item seleccionado del listado');
          this.historyItem = selected;
          this.isLoading = false;
          return;
        }

        // Si no está seleccionado, hacer petición al backend para obtener detalles
        console.log('Haciendo petición al backend para detalles...');
        this.historyItem = await this.historyService.getHistoryDetail(this.historyId);
        
        if (!this.historyItem) {
          this.errorMessage = 'No se pudo cargar la información del registro';
          console.error('No se encontró el registro en el backend');
        } else {
          console.log('Detalles cargados correctamente:', this.historyItem);
        }
      } catch (error: any) {
        console.error('Error cargando detalle:', error);
        this.errorMessage = error.message || 'Error al cargar los detalles del historial';
      } finally {
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/history/list']);
  }

  async deleteItem(): Promise<void> {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este registro del historial? Esta acción no se puede deshacer.');
    if (confirmDelete) {
      try {
        const success = await this.historyService.deleteHistory(this.historyId);
        if (success) {
          console.log('Registro eliminado, navegando al listado');
          this.goBack();
        } else {
          this.errorMessage = 'Error al eliminar el registro';
        }
      } catch (error) {
        this.errorMessage = 'Error al eliminar el registro';
        console.error('Error eliminando:', error);
      }
    }
  }

  formatParameters(parameters: any): string {
    if (!parameters || (typeof parameters === 'object' && Object.keys(parameters).length === 0)) {
      return 'No hay parámetros específicos para esta transformación';
    }
    
    if (typeof parameters === 'string') {
      return parameters;
    }
    
    try {
      return JSON.stringify(parameters, null, 2);
    } catch {
      return 'Parámetros no válidos o no parseables';
    }
  }

  hasDetailedParameters(parameters: any): boolean {
    if (!parameters || typeof parameters !== 'object') return false;
    return Object.keys(parameters).length > 0 && Object.keys(parameters).some(key => 
      typeof parameters[key] !== 'object'
    );
  }

  getParameterDetails(parameters: any): {key: string, value: string}[] {
    if (!parameters || typeof parameters !== 'object') return [];
    
    return Object.entries(parameters)
      .filter(([key, value]) => typeof value !== 'object')
      .map(([key, value]) => ({
        key,
        value: String(value)
      }));
  }
}