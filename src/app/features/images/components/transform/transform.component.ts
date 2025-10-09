import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { Transformation, ImageTransformationConfig } from '../../models/image.model';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transform',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="flex">
        <app-sidebar></app-sidebar>
        <div class="flex-1">
          <app-header></app-header>
          <main class="p-6">
            <div class="max-w-6xl mx-auto">
              <!-- Título dinámico -->
              <div class="text-center mb-6">
                <h1 class="text-3xl font-bold text-white mb-1">Configurar Transformaciones</h1>
                <p class="text-white/80 text-sm">
                  {{ isBatchMode() ? 
                     'Aplicando las mismas transformaciones a todas las imágenes' : 
                     'Configura transformaciones individuales para cada imagen' }}
                </p>
              </div>

              <div class="grid lg:grid-cols-3 gap-6">
                <!-- Panel de transformaciones -->
                <div class="lg:col-span-2">
                  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                    
                    <!-- Modo Individual: Selector de imagen actual -->
                    @if (!isBatchMode()) {
                      <div class="mb-4 p-3 bg-white/5 rounded-lg">
                        <label class="text-white text-sm font-semibold mb-2 block">Seleccionar imagen a configurar:</label>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                          @for (image of selectedImages(); track image.id; let i = $index) {
                            <button 
                              (click)="setCurrentImage(image.id)"
                              [class]="currentImageId() === image.id ? 
                                      'bg-blue-500 text-white' : 
                                      'bg-white/10 text-white/80 hover:bg-white/20'"
                              class="p-2 rounded text-xs transition flex items-center space-x-2"
                            >
                              <div class="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                                <span class="text-xs">{{ i + 1 }}</span>
                              </div>
                              <span class="truncate">{{ image.name }}</span>
                            </button>
                          }
                        </div>
                      </div>
                    }

                    <h3 class="text-white text-base font-semibold mb-3">
                      {{ isBatchMode() ? 'Transformaciones para todas las imágenes' : 'Transformaciones para: ' + currentImageName() }}
                    </h3>
                    
                    <!-- Contador de transformaciones -->
                    <div class="mb-3 p-2 bg-blue-500/20 rounded">
                      <p class="text-white text-xs">
                        Transformaciones seleccionadas: <strong>{{ currentTransformationsCount() }}</strong> / 5
                        @if (isBatchMode()) {
                          (incluyendo formato de salida)
                        }
                      </p>
                    </div>
                    
                    <!-- Filtros básicos -->
                    <div class="grid grid-cols-2 gap-2 mb-4">
                      @for (transformation of basicTransformations; track transformation.id) {
                        <label class="flex items-center p-2 bg-white/5 rounded text-sm cursor-pointer hover:bg-white/10 transition"
                              [class.opacity-50]="!canAddMoreTransformations() && !isSelected(transformation.id)">
                          <input 
                            type="checkbox" 
                            [checked]="isSelected(transformation.id)"
                            (change)="toggleTransformation(transformation)"
                            [disabled]="!canAddMoreTransformations() && !isSelected(transformation.id)"
                            class="rounded border-white/30 text-blue-600 focus:ring-blue-500 mr-2 w-3 h-3"
                          >
                          <span class="text-white text-xs">{{ transformation.name }}</span>
                        </label>
                      }
                    </div>

                    <!-- Ajustes -->
                    <div class="space-y-2 mb-4">
                      @for (transformation of adjustmentTransformations; track transformation.id) {
                        <div class="p-2 bg-white/5 rounded text-sm">
                          <label class="flex items-center cursor-pointer"
                                [class.opacity-50]="!canAddMoreTransformations() && !isSelected(transformation.id)">
                            <input 
                              type="checkbox" 
                              [checked]="isSelected(transformation.id)"
                              (change)="toggleTransformation(transformation)"
                              [disabled]="!canAddMoreTransformations() && !isSelected(transformation.id)"
                              class="rounded border-white/30 text-blue-600 focus:ring-blue-500 mr-2 w-3 h-3"
                            >
                            <span class="text-white text-xs">{{ transformation.name }}</span>
                          </label>
                          
                          @if (isSelected(transformation.id)) {
                            <div class="mt-1 pl-4">
                              <!-- Controles de parámetros -->
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Formato de salida - SOLO en modo batch o cuenta en individual -->
                    <div class="p-2 bg-white/5 rounded">
                      <h4 class="text-white font-semibold text-xs mb-2">Formato de salida</h4>
                      <div class="flex gap-3">
                        @for (format of outputFormats; track format) {
                          <label class="flex items-center"
                                [class.opacity-50]="!canAddMoreTransformations() && selectedFormat() !== format">
                            <input 
                              type="radio" 
                              name="outputFormat"
                              [value]="format"
                              [checked]="selectedFormat() === format"
                              (change)="updateOutputFormat(format)"
                              [disabled]="!canAddMoreTransformations() && selectedFormat() !== format"
                              class="mr-1 w-3 h-3"
                            >
                            <span class="text-white text-xs">{{ format }}</span>
                          </label>
                        }
                      </div>
                      @if (isBatchMode()) {
                        <p class="text-white/60 text-xs mt-1">El formato de salida cuenta como una transformación</p>
                      }
                    </div>
                  </div>

                  <!-- Vista previa de configuraciones individuales -->
                  @if (!isBatchMode()) {
                    <div class="mt-4 bg-white/10 backdrop-blur-lg rounded-xl p-4">
                      <h4 class="text-white text-base font-semibold mb-3">Resumen por imagen</h4>
                      <div class="space-y-2">
                        @for (image of selectedImages(); track image.id; let i = $index) {
                          <div class="p-2 bg-white/5 rounded">
                            <div class="flex justify-between items-center mb-1">
                              <span class="text-white text-sm font-medium">{{ i + 1 }}. {{ image.name }}</span>
                              <span class="text-white/60 text-xs">
                                {{ getImageTransformationsCount(image.id) }} transformaciones
                              </span>
                            </div>
                            <div class="text-white/60 text-xs">
                              @if (getImageTransformations(image.id).length > 0) {
                                <span>{{ getImageTransformationNames(image.id) }}</span>
                              } @else {
                                <span class="text-yellow-400">Sin transformaciones configuradas</span>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Panel de resumen -->
                <div>
                  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 sticky top-4">
                    <h3 class="text-white text-base font-semibold mb-3">Resumen</h3>
                    
                    <div class="space-y-2 text-xs">
                      <div>
                        <p class="text-white/70">Imágenes a transformar:</p>
                        <p class="text-white font-semibold">{{ selectedImages().length }}</p>
                      </div>

                      <div>
                        <p class="text-white/70">Modo:</p>
                        <p class="text-white font-semibold">
                          {{ isBatchMode() ? 'Lote' : 'Individual' }}
                        </p>
                      </div>

                      <!-- Resumen de transformaciones -->
                      <div>
                        <p class="text-white/70">Transformaciones:</p>
                        <div class="mt-1 space-y-1">
                          @if (isBatchMode()) {
                            @for (transformation of selectedTransformations(); track transformation.id) {
                              <div class="text-white flex justify-between items-center">
                                <span class="truncate mr-2">{{ transformation.name }}</span>
                                <button 
                                  (click)="removeTransformation(transformation.id)"
                                  class="text-red-400 hover:text-red-300 text-xs flex-shrink-0"
                                >
                                   
                                </button>
                              </div>
                            }
                            <div class="text-white flex justify-between items-center">
                              <span class="truncate mr-2">Formato: {{ selectedFormat() }}</span>
                            </div>
                          } @else {
                            <p class="text-white/60 text-xs">
                              Configuraciones individuales por imagen
                            </p>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Validación -->
                    @if (hasValidationErrors()) {
                      <div class="bg-red-50 border border-red-200 rounded p-2 mt-2">
                        <p class="text-red-600 text-xs" [innerHTML]="validationMessage()"></p>
                      </div>
                    }

                    <!-- Botones de acción -->
                    <div class="space-y-2 mt-3">
                      <button 
                        (click)="applyTransformations()"
                        [disabled]="!canProceed() || imageService.isLoading()"
                        class="w-full bg-white text-blue-600 py-2 rounded text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        @if (imageService.isLoading()) {
                          <span class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </span>
                        } @else {
                          Transformar Imágenes
                        }
                      </button>
                      
                      <button 
                        (click)="goBack()"
                        class="w-full bg-white/20 text-white py-2 rounded text-sm font-semibold hover:bg-white/30 transition"
                      >
                        ← Volver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class TransformComponent {
  private router = inject(Router);
  imageService = inject(ImageService);

  // Signals principales
  selectedTransformations = signal<Transformation[]>([]);
  selectedFormat = signal<'JPG' | 'PNG' | 'TIF'>('JPG');
  currentImageId = signal<string>('');
  individualConfigs = signal<Map<string, ImageTransformationConfig>>(new Map());

  // Computed values
  isBatchMode = computed(() => this.imageService.transformationConfig()?.applyToAll ?? true);
  selectedImages = computed(() => this.imageService.selectedImages().filter(img => img.selected));
  
  currentImageName = computed(() => {
    const image = this.selectedImages().find(img => img.id === this.currentImageId());
    return image?.name || 'Selecciona una imagen';
  });

  currentTransformationsCount = computed(() => {
    if (this.isBatchMode()) {
      return this.selectedTransformations().length + 1;
    } else {
      const config = this.individualConfigs().get(this.currentImageId());
      return (config?.transformations.length || 0) + 1;
    }
  });

  canAddMoreTransformations = computed(() => this.currentTransformationsCount() < 5);

  hasValidationErrors = computed(() => {
    if (this.isBatchMode()) {
      return this.selectedTransformations().length === 0;
    } else {
      return Array.from(this.individualConfigs().values()).some(config => 
        config.transformations.length === 0
      );
    }
  });

  validationMessage = computed(() => {
    if (this.isBatchMode()) {
      return 'Debes seleccionar al menos 1 transformación (máximo 4 + formato)';
    } else {
      const incomplete = this.selectedImages().filter(image => 
        !this.individualConfigs().get(image.id)?.transformations.length
      );
      return `Faltan configuraciones en: ${incomplete.map(img => img.name).join(', ')}`;
    }
  });

  canProceed = computed(() => !this.hasValidationErrors());

  // Transformaciones disponibles
  basicTransformations: Transformation[] = [
    { id: 'grayscale', name: 'Escala de grises', type: 'filter' },
    { id: 'flip', name: 'Voltear horizontalmente', type: 'filter' },
    { id: 'flop', name: 'Voltear verticalmente', type: 'filter' },
    { id: 'sharpen', name: 'Aumentar nitidez', type: 'filter' }
  ];

  adjustmentTransformations: Transformation[] = [
    { id: 'brightness', name: 'Ajustar brillo', type: 'adjustment', parameters: { value: 0 } },
    { id: 'contrast', name: 'Ajustar contraste', type: 'adjustment', parameters: { value: 0 } },
    { id: 'blur', name: 'Desenfocar', type: 'adjustment', parameters: { radius: 0 } },
    { id: 'rotate', name: 'Rotar', type: 'adjustment', parameters: { degrees: 0 } },
    { id: 'watermark', name: 'Marca de agua/texto', type: 'adjustment', parameters: { text: '' } }
  ];

  outputFormats: ('JPG' | 'PNG' | 'TIF')[] = ['JPG', 'PNG', 'TIF'];

  ngOnInit() {
    if (!this.isBatchMode() && this.selectedImages().length > 0) {
      this.currentImageId.set(this.selectedImages()[0].id);
      this.initializeIndividualConfigs();
    }
  }

  initializeIndividualConfigs() {
    const configs = new Map<string, ImageTransformationConfig>();
    this.selectedImages().forEach(image => {
      configs.set(image.id, {
        imageId: image.id,
        transformations: [],
        outputFormat: 'JPG'
      });
    });
    this.individualConfigs.set(configs);
  }

  setCurrentImage(imageId: string) {
    this.currentImageId.set(imageId);
  }

  // Métodos
  isSelected(transformationId: string): boolean {
    if (this.isBatchMode()) {
      return this.selectedTransformations().some(t => t.id === transformationId);
    } else {
      const config = this.individualConfigs().get(this.currentImageId());
      return config?.transformations.some(t => t.id === transformationId) ?? false;
    }
  }

  toggleTransformation(transformation: Transformation): void {
    if (this.isBatchMode()) {
      this.toggleBatchTransformation(transformation);
    } else {
      this.toggleIndividualTransformation(transformation);
    }
  }

  private toggleBatchTransformation(transformation: Transformation): void {
    if (this.isSelected(transformation.id)) {
      this.selectedTransformations.set(
        this.selectedTransformations().filter(t => t.id !== transformation.id)
      );
    } else {
      if (this.canAddMoreTransformations()) {
        this.selectedTransformations.set([...this.selectedTransformations(), { ...transformation }]);
      }
    }
  }

  private toggleIndividualTransformation(transformation: Transformation): void {
    const config = this.individualConfigs().get(this.currentImageId());
    if (!config) return;

    const newConfigs = new Map(this.individualConfigs());
    const currentConfig = newConfigs.get(this.currentImageId())!;

    if (this.isSelected(transformation.id)) {
      currentConfig.transformations = currentConfig.transformations.filter(t => t.id !== transformation.id);
    } else {
      if (this.canAddMoreTransformations()) {
        currentConfig.transformations = [...currentConfig.transformations, { ...transformation }];
      }
    }

    newConfigs.set(this.currentImageId(), currentConfig);
    this.individualConfigs.set(newConfigs);
  }

  removeTransformation(transformationId: string): void {
    if (this.isBatchMode()) {
      this.selectedTransformations.set(
        this.selectedTransformations().filter(t => t.id !== transformationId)
      );
    } else {
      const newConfigs = new Map(this.individualConfigs());
      const config = newConfigs.get(this.currentImageId());
      if (config) {
        config.transformations = config.transformations.filter(t => t.id !== transformationId);
        newConfigs.set(this.currentImageId(), config);
        this.individualConfigs.set(newConfigs);
      }
    }
  }

  updateOutputFormat(format: 'JPG' | 'PNG' | 'TIF'): void {
    this.selectedFormat.set(format);
    
    if (!this.isBatchMode()) {
      const newConfigs = new Map(this.individualConfigs());
      newConfigs.forEach((config, imageId) => {
        config.outputFormat = format;
        newConfigs.set(imageId, config);
      });
      this.individualConfigs.set(newConfigs);
    }
  }

  getImageTransformationsCount(imageId: string): number {
    const config = this.individualConfigs().get(imageId);
    return (config?.transformations.length || 0) + 1;
  }

  getImageTransformations(imageId: string): Transformation[] {
    const config = this.individualConfigs().get(imageId);
    return config?.transformations || [];
  }

  getImageTransformationNames(imageId: string): string {
    const transformations = this.getImageTransformations(imageId);
    return transformations.map(t => t.name).join(', ');
  }

 async applyTransformations(): Promise<void> {
  if (!this.canProceed()) return;

  let request: any;

  if (this.isBatchMode()) {
    request = {
      applyToAll: true,
      transformations: this.selectedTransformations(),
      outputFormat: this.selectedFormat(),
      images: this.selectedImages().map(img => img.id)
    };
  } else {
    request = {
      applyToAll: false,
      imageConfigs: Array.from(this.individualConfigs().values()),
      images: this.selectedImages().map(img => img.id)
    };
  }

  console.log('  TransformComponent - Iniciando transformación...');
  console.log('  Request enviado:', request);
  
  const result = await this.imageService.applyTransformations(request);
  
  if (result) {
    console.log('  TransformComponent - Transformación exitosa, navegando...');
    console.log('  Estado del servicio antes de navegar:');
    console.log('  - currentBatch:', this.imageService.currentBatch());
    console.log('  - progress:', this.imageService.progress());
    console.log('  - hasProcessedBatch:', this.imageService.hasProcessedBatch());
    
    // Esperar un tick del ciclo de detección de cambios
    setTimeout(() => {
      console.log('  Navegando a /images/download...');
      this.router.navigate(['/images/download']);
    }, 100);
  } else {
    console.error('  TransformComponent - Transformación falló');
    this.imageService.errorMessage.set('Error en la transformación');
  }
}
  goBack(): void {
    this.router.navigate(['/images/upload']);
  }

  getParam(transformationId: string, paramName: string): any {
    if (this.isBatchMode()) {
      const transformation = this.selectedTransformations().find(t => t.id === transformationId);
      return transformation?.parameters?.[paramName];
    } else {
      const config = this.individualConfigs().get(this.currentImageId());
      const transformation = config?.transformations.find(t => t.id === transformationId);
      return transformation?.parameters?.[paramName];
    }
  }

  updateParam(transformationId: string, paramName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.type === 'range' ? parseInt(input.value) : input.value;
    
    if (this.isBatchMode()) {
      this.selectedTransformations.set(
        this.selectedTransformations().map(t => 
          t.id === transformationId 
            ? { ...t, parameters: { ...t.parameters, [paramName]: value } }
            : t
        )
      );
    } else {
      const newConfigs = new Map(this.individualConfigs());
      const config = newConfigs.get(this.currentImageId());
      if (config) {
        config.transformations = config.transformations.map(t => 
          t.id === transformationId 
            ? { ...t, parameters: { ...t.parameters, [paramName]: value } }
            : t
        );
        newConfigs.set(this.currentImageId(), config);
        this.individualConfigs.set(newConfigs);
      }
    }
  }
}
