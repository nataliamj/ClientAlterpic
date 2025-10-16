import { Component, inject, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-download',
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
              <!-- Título -->
              <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">Descargar Resultados</h1>
                <p class="text-xl text-white/80">
                  @if (imageService.progress().status === 'processing') {
                    Procesando tus imágenes...
                  } @else if (hasResults()) {
                    Tus imágenes han sido transformadas exitosamente
                  } @else {
                    Gestión de descargas
                  }
                </p>
              </div>

              <!-- Procesando -->
              @if (imageService.progress().status === 'processing') {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold mb-2">Procesando imágenes</h3>
                    <p class="text-white/60">Las transformaciones están en progreso...</p>
                    <div class="mt-4 bg-white/10 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                           [style.width]="imageService.progress().percentage + '%'"></div>
                    </div>
                    <p class="text-white/60 text-sm mt-2">
                      {{ imageService.progress().processed }} de {{ imageService.progress().total }} imágenes procesadas
                    </p>
                  </div>
                </div>
              }

              <!-- Error -->
              @if (imageService.progress().status === 'error') {
                <div class="bg-red-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold mb-2">Error en el procesamiento</h3>
                    <p class="text-white/60 mb-4">{{ imageService.errorMessage() || 'Ha ocurrido un error durante la transformación' }}</p>
                    <button 
                      (click)="retryProcessing()"
                      class="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              }

              <!-- Resultados completados -->
              @if (hasResults()) {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 class="text-white text-xl font-semibold">Transformación completada</h3>
                    <p class="text-white/60">Tus imágenes están listas para descargar</p>
                  </div>

                  <!-- Información del lote -->
                  <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white/5 rounded-lg p-4 text-center">
                      <p class="text-white/60 text-sm">Número de imágenes</p>
                      <p class="text-white text-xl font-semibold">{{ currentBatch()!.imageCount }}</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-4 text-center">
                      <p class="text-white/60 text-sm">Tamaño total</p>
                      <p class="text-white text-xl font-semibold">
                        {{ (currentBatch()!.totalSize / 1024 / 1024).toFixed(2) }} MB
                      </p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-4 text-center">
                      <p class="text-white/60 text-sm">Formato</p>
                      <p class="text-white text-xl font-semibold">
                        {{ dominantFormat() }}
                      </p>
                    </div>
                  </div>

                  <!-- Opciones de descarga -->
                  <div class="grid md:grid-cols-2 gap-4 mb-6">
                    <button 
                      (click)="downloadZip()"
                      class="bg-green-500 text-white py-4 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Descargar ZIP completo
                    </button>
                    
                    <button 
                      (click)="downloadIndividual()"
                      class="bg-blue-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center"
                    >
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                      </svg>
                      Descargar individualmente
                    </button>
                  </div>
                </div>

                <!-- Lista de imágenes transformadas -->
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 class="text-white text-lg font-semibold mb-4">Imágenes transformadas</h3>
                  <div class="space-y-3">
                    @for (image of currentBatch()!.images; track image.id) {
                      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                            <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <p class="text-white font-medium">{{ image.transformedName }}</p>
                            <p class="text-white/60 text-sm">
                              {{ (image.size / 1024 / 1024).toFixed(2) }} MB • {{ image.format.toUpperCase() }}
                            </p>
                          </div>
                        </div>
                        <button 
                          (click)="downloadSingle(image)"
                          class="bg-white/20 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition"
                        >
                          Descargar
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Sin resultados -->
              @if (!hasResults() && imageService.progress().status === 'idle') {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                  <div class="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <h3 class="text-white text-xl font-semibold mb-2">No hay resultados disponibles</h3>
                  <p class="text-white/60 mb-4">No has procesado ningún lote de imágenes para transformar</p>
                  <button 
                    (click)="goToUpload()"
                    class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                  >
                    Transformar imágenes
                  </button>
                </div>
              }

              <!-- Botones de acción -->
              @if (hasResults()) {
                <div class="flex justify-center gap-4 mt-8">
                  <button 
                    (click)="transformMore()"
                    class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                  >
                    Transformar más imágenes
                  </button>
                  
                  <button 
                    (click)="goToUpload()"
                    class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Volver a subir imágenes
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
export class DownloadComponent implements OnInit {
  private router = inject(Router);
  imageService = inject(ImageService);

  // Usar las señales del servicio directamente
  currentBatch = this.imageService.currentBatch;
  progress = this.imageService.progress;
  
  // ✅ SEÑALES COMPUTADAS - Reemplazan las funciones que causaban múltiples llamadas
  hasResults = computed(() => {
    const batch = this.currentBatch();
    const progressStatus = this.progress().status;
    return !!(batch && batch.images && batch.images.length > 0 && progressStatus === 'completed');
  });
  
  dominantFormat = computed(() => {
    const batch = this.currentBatch();
    if (!batch?.images?.length) return 'JPG';
    
    const formats = batch.images.map(img => img.format.toUpperCase());
    const formatCount = formats.reduce((acc, format) => {
      acc[format] = (acc[format] || 0) + 1;
      return acc;
    }, {} as any);
    
    return Object.keys(formatCount).reduce((a, b) => 
      formatCount[a] > formatCount[b] ? a : b
    );
  });

  ngOnInit(): void {
    console.log('  DownloadComponent - ngOnInit');
    console.log('  Estado inicial del servicio:');
    console.log('  - currentBatch:', this.currentBatch());
    console.log('  - progress:', this.progress());
    console.log('  - hasResults:', this.hasResults());
  }

  async downloadZip(): Promise<void> {
    if (this.currentBatch()?.batchId) {
      try {
        await this.imageService.downloadResult(this.currentBatch()!.batchId, 'zip');
      } catch (error) {
        console.error('Error descargando ZIP:', error);
        this.imageService.errorMessage.set('Error al descargar el archivo ZIP');
      }
    }
  }

  async downloadIndividual(): Promise<void> {
    if (this.currentBatch()?.batchId) {
      try {
        await this.imageService.downloadResult(this.currentBatch()!.batchId, 'individual');
      } catch (error) {
        console.error('Error descargando individual:', error);
        this.imageService.errorMessage.set('Error al descargar archivos individuales');
      }
    }
  }

  async downloadSingle(image: any): Promise<void> {
    try {
      await this.imageService.downloadSingleImage(image.id, image.transformedName);
    } catch (error) {
      console.error('Error descargando imagen individual:', error);
      this.imageService.errorMessage.set('Error descargando imagen individual');
    }
  }

  retryProcessing(): void {
    this.router.navigate(['/images/transform']);
  }

  transformMore(): void {
    this.imageService.reset();
    this.router.navigate(['/images/transform']);
  }

  goToUpload(): void {
    this.imageService.reset();
    this.router.navigate(['/images/upload']);
  }
}