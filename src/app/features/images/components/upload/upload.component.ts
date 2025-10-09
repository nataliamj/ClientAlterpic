  import { Component, inject, ElementRef, ViewChild, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { ImageFile } from '../../models/image.model';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1">
          <app-header></app-header>
          <main class="p-8">
            <div class="max-w-4xl mx-auto">
              <!-- Título y descripción -->
              <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white mb-2">Subir Imágenes</h1>
                <p class="text-xl text-white/80">
                  Selecciona las imágenes que deseas transformar
                </p>
              </div>

              <!-- Área de upload -->
              <div 
                class="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center mb-6 cursor-pointer hover:border-white/50 transition"
                (click)="fileInput.click()"
                (drop)="onDrop($event)"
                (dragover)="onDragOver($event)"
              >
                <input 
                  #fileInput
                  type="file" 
                  multiple 
                  accept=".jpg,.jpeg,.png,.tif,.tiff,.zip"
                  (change)="onFileSelected($event)"
                  class="hidden"
                >
                
                <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                
                <h3 class="text-white text-lg font-semibold mb-2">Arrastra tus archivos aquí</h3>
                <p class="text-white/60 text-sm mb-3">o haz clic para seleccionar</p>
                
                <div class="text-white/50 text-xs">
                  Formatos aceptados: JPG, PNG, TIF, ZIP
                </div>
              </div>

              <!-- Archivos inválidos -->
              @if (invalidFiles.length > 0) {
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p class="text-red-600 font-semibold text-sm mb-1">Archivos no válidos:</p>
                  <ul class="text-red-600 text-xs">
                    @for (file of invalidFiles; track file) {
                      <li>{{ file }}</li>
                    }
                  </ul>
                </div>
              }

              <!-- Imágenes seleccionadas -->
              @if (imageService.selectedImages().length > 0) {
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-4">
                  <div class="flex justify-between items-center mb-3">
                    <h3 class="text-white text-base font-semibold">
                      Imágenes seleccionadas: {{ imageService.selectedImages().length }}
                    </h3>
                    <button 
                      (click)="clearSelection()"
                      class="text-white/60 hover:text-white text-sm transition"
                    >
                      Limpiar todo
                    </button>
                  </div>

                  <!-- Lista de imágenes más compacta -->
                  <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
                    @for (image of imageService.selectedImages(); track image.id) {
                      <div class="relative group">
                        <div class="aspect-square bg-white/5 rounded flex items-center justify-center">
                          @if (image.previewUrl) {
                            <img [src]="image.previewUrl" [alt]="image.name" class="w-full h-full object-cover rounded">
                          } @else {
                            <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          }
                        </div>
                        <div class="absolute top-1 right-1">
                          <button 
                            (click)="toggleImageSelection(image)"
                            class="w-4 h-4 rounded-full flex items-center justify-center text-xs transition"
                            [class]="image.selected ? 'bg-green-500 text-white' : 'bg-white/20 text-white/60'"
                          >
                            ✓
                          </button>
                        </div>
                        <p class="text-white text-xs mt-1 truncate">{{ image.name }}</p>
                        <p class="text-white/50 text-xs">{{ (image.size / 1024 / 1024).toFixed(1) }} MB</p>
                      </div>
                    }
                  </div>

                  <!-- Configuración de transformación - MEJORADO -->
                  <div class="mt-3 p-3 bg-white/5 rounded-lg">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        [ngModel]="applyToAll()"
                        (ngModelChange)="applyToAll.set($event)"
                        class="rounded border-white/30 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      >
                      <span class="text-white text-sm">Aplicar las mismas transformaciones a todas las imágenes</span>
                    </label>
                    <p class="text-white/60 text-xs mt-1 pl-6">
                      {{ applyToAll() ? 
                         'Todas las imágenes tendrán las mismas transformaciones' : 
                         'Podrás configurar transformaciones individuales para cada imagen' }}
                    </p>
                  </div>
                </div>

                <!-- Botón continuar -->
                <div class="text-center">
                  <button 
                    (click)="continueToTransform()"
                    [disabled]="!hasSelectedImages() || imageService.isLoading()"
                    class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    @if (imageService.isLoading()) {
                      <span class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    } @else {
                      Continuar →
                    }
                  </button>
                </div>
              } @else {
                <!-- Estado vacío -->
                <div class="text-center text-white/60 text-sm">
                  <p>No hay imágenes seleccionadas</p>
                  <p>Haz clic en "Subir Imágenes" para comenzar</p>
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
export class UploadComponent {
  private router = inject(Router);
  imageService = inject(ImageService);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  invalidFiles: string[] = [];
  applyToAll = signal<boolean>(false); // ← Cambiado a signal con valor inicial false

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(input.files);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  processFiles(files: FileList): void {
    const result = this.imageService.processFiles(files);
    this.invalidFiles = result.invalid;
    
    if (result.valid.length > 0) {
      const currentImages = this.imageService.selectedImages();
      this.imageService.selectedImages.set([...currentImages, ...result.valid]);
    }
  }

  toggleImageSelection(image: ImageFile): void {
    const images = this.imageService.selectedImages().map(img => 
      img.id === image.id ? { ...img, selected: !img.selected } : img
    );
    this.imageService.selectedImages.set(images);
  }

  clearSelection(): void {
    this.imageService.selectedImages.set([]);
    this.invalidFiles = [];
    this.applyToAll.set(false); // Resetear al limpiar
  }

  hasSelectedImages(): boolean {
    return this.imageService.selectedImages().some(img => img.selected);
  }

 async continueToTransform(): Promise<void> {
  if (!this.hasSelectedImages()) return;

  //   PRIMERO SUBIR IMÁGENES AL BACKEND
  const selectedImages = this.imageService.selectedImages().filter(img => img.selected);
  
  console.log('   Subiendo imágenes al backend...', selectedImages.length);
  
  const uploadSuccess = await this.imageService.uploadImages(selectedImages);
  
  if (!uploadSuccess) {
    console.error('   Error subiendo imágenes');
    return;
  }

  console.log('   Imágenes subidas exitosamente');

  //    LUEGO NAVEGAR A TRANSFORM
  const mode = this.applyToAll() ? 'batch' : 'individual';
  this.imageService.transformationMode.set(mode);

  this.imageService.transformationConfig.set({
    applyToAll: this.applyToAll(),
    transformations: [],
    outputFormat: 'JPG'
  });

  this.router.navigate(['/images/configure']);
}
}