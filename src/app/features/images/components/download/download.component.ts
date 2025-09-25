import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-download',
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
              <!-- Título -->
              <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">Descargar Resultados</h1>
                <p class="text-xl text-white/80">
                  Tus imágenes han sido transformadas exitosamente
                </p>
              </div>

              <!-- Barra de progreso -->
              @if (imageService.progress().status === 'processing') {
                <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                  <h3 class="text-white text-lg font-semibold mb-4">Procesando imágenes...</h3>
                  <div class="w-full bg-white/20 rounded-full h-4 mb-2">
                    <div 
                      class="bg-green-500 h-4 rounded-full transition-all duration-300"
                      [style.width.%]="imageService.progress().percentage"
                    ></div>
                  </div>
                  <p class="text-white/80 text-sm text-center">
                    {{ imageService.progress().processed }} de {{ imageService.progress().total }} imágenes procesadas
                    ({{ imageService.progress().percentage }}%)
                  </p>
                </div>
              }

              <!-- Resultados -->
              @if (imageService.progress().status === 'completed') {
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
                      <p class="text-white text-xl font-semibold">12</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-4 text-center">
                      <p class="text-white/60 text-sm">Tamaño total</p>
                      <p class="text-white text-xl font-semibold">45.2 MB</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-4 text-center">
                      <p class="text-white/60 text-sm">Formato</p>
                      <p class="text-white text-xl font-semibold">JPG</p>
                    </div>
                  </div>

                  <!-- Opciones de descarga -->
                  <div class="grid md:grid-cols-2 gap-4">
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
                    @for (image of transformedImages; track image.id) {
                      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                            <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                          <div>
                            <p class="text-white font-medium">{{ image.transformedName }}</p>
                            <p class="text-white/60 text-sm">{{ (image.size / 1024 / 1024).toFixed(2) }} MB</p>
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

              <!-- Botones de acción -->
              <div class="flex justify-center gap-4 mt-8">
                <button 
                  (click)="transformMore()"
                  class="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                >
                  Transformar más imágenes
                </button>
                
                <button 
                  (click)="goToHistory()"
                  class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Ver historial
                </button>
              </div>
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

  transformedImages = [
    { id: '1', originalName: 'foto1.jpg', transformedName: 'foto1_transformed.jpg', size: 2456789, format: 'JPG' },
    { id: '2', originalName: 'foto2.png', transformedName: 'foto2_transformed.jpg', size: 3456789, format: 'JPG' },
    // ... más imágenes de ejemplo
  ];

  ngOnInit(): void {
    // Simular procesamiento si es necesario
  }

  downloadZip(): void {
    this.imageService.downloadResult('batch123', 'zip');
  }

  downloadIndividual(): void {
    this.imageService.downloadResult('batch123', 'individual');
  }

  downloadSingle(image: any): void {
    // Lógica para descargar imagen individual
    window.open(image.downloadUrl, '_blank');
  }

  transformMore(): void {
    this.imageService.selectedImages.set([]);
    this.router.navigate(['/images/transform/upload']);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }
}