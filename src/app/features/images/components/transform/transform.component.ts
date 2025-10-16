  import { Component, inject, signal, computed } from '@angular/core';
  import { Router, RouterLink } from '@angular/router';
  import { ImageService } from '../../services/image.service';
  import { Transformation, ImageTransformationConfig } from '../../models/image.model';
  import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
  import { HeaderComponent } from '../../../../shared/components/header/header.component';
  import { FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-transform',
    standalone: true,
    imports: [CommonModule, SidebarComponent, HeaderComponent, RouterLink, FormsModule],
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

                      <!-- Ajustes con controles específicos -->
                      <div class="space-y-3 mb-4">
                        @for (transformation of adjustmentTransformations; track transformation.id) {
                          <div class="p-3 bg-white/5 rounded-lg">
                            <label class="flex items-center cursor-pointer mb-2"
                                  [class.opacity-50]="!canAddMoreTransformations() && !isSelected(transformation.id)">
                              <input 
                                type="checkbox" 
                                [checked]="isSelected(transformation.id)"
                                (change)="toggleTransformation(transformation)"
                                [disabled]="!canAddMoreTransformations() && !isSelected(transformation.id)"
                                class="rounded border-white/30 text-blue-600 focus:ring-blue-500 mr-2 w-3 h-3"
                              >
                              <span class="text-white text-xs font-medium">{{ transformation.name }}</span>
                            </label>
                            
                            <!-- Controles de parámetros específicos -->
                            @if (isSelected(transformation.id)) {
                              <div class="mt-2 pl-4 space-y-3">
                                
                                <!-- Escala de Grises - Sin parámetros adicionales -->
                                @if (transformation.id === 'grayscale') {
                                  <p class="text-white/60 text-xs">No requiere parámetros adicionales</p>
                                }
                                
                                <!-- Brillo -->
                                @else if (transformation.id === 'brightness') {
                                  <div class="space-y-2">
                                    <label class="text-white text-xs">Nivel de brillo: {{ getParam(transformation.id, 'value') || 0 }}</label>
                                    <input 
                                      type="range" 
                                      min="-100" 
                                      max="100" 
                                      [value]="getParam(transformation.id, 'value') || 0"
                                      (input)="updateParam(transformation.id, 'value', $event)"
                                      class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    >
                                    <div class="flex justify-between text-white/60 text-xs">
                                      <span>-100</span>
                                      <span>0</span>
                                      <span>+100</span>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Contraste -->
                                @else if (transformation.id === 'contrast') {
                                  <div class="space-y-2">
                                    <label class="text-white text-xs">Nivel de contraste: {{ getParam(transformation.id, 'value') || 0 }}</label>
                                    <input 
                                      type="range" 
                                      min="-100" 
                                      max="100" 
                                      [value]="getParam(transformation.id, 'value') || 0"
                                      (input)="updateParam(transformation.id, 'value', $event)"
                                      class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    >
                                    <div class="flex justify-between text-white/60 text-xs">
                                      <span>-100</span>
                                      <span>0</span>
                                      <span>+100</span>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Desenfoque -->
                                @else if (transformation.id === 'blur') {
                                  <div class="space-y-2">
                                    <label class="text-white text-xs">Radio de desenfoque: {{ getParam(transformation.id, 'radius') || 0 }}px</label>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="50" 
                                      [value]="getParam(transformation.id, 'radius') || 0"
                                      (input)="updateParam(transformation.id, 'radius', $event)"
                                      class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    >
                                    <div class="flex justify-between text-white/60 text-xs">
                                      <span>0</span>
                                      <span>25</span>
                                      <span>50</span>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Nitidez -->
                                @else if (transformation.id === 'sharpen') {
                                  <div class="space-y-2">
                                    <label class="text-white text-xs">Nivel de nitidez: {{ getParam(transformation.id, 'value') || 0 }}</label>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100" 
                                      [value]="getParam(transformation.id, 'value') || 0"
                                      (input)="updateParam(transformation.id, 'value', $event)"
                                      class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                    >
                                    <div class="flex justify-between text-white/60 text-xs">
                                      <span>0</span>
                                      <span>50</span>
                                      <span>100</span>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Rotación -->
                                @else if (transformation.id === 'rotate') {
                                  <div class="space-y-3">
                                    <div class="grid grid-cols-2 gap-2">
                                      <button 
                                        (click)="setRotation(90)"
                                        class="p-2 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                                      >
                                        90° Derecha
                                      </button>
                                      <button 
                                        (click)="setRotation(-90)"
                                        class="p-2 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                                      >
                                        90° Izquierda
                                      </button>
                                      <button 
                                        (click)="setRotation(180)"
                                        class="p-2 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                                      >
                                        180° Volteo
                                      </button>
                                      <button 
                                        (click)="setRotation(0)"
                                        class="p-2 bg-white/10 text-white rounded text-xs hover:bg-white/20 transition"
                                      >
                                        Restablecer
                                      </button>
                                    </div>
                                    <div class="space-y-2">
                                      <label class="text-white text-xs">Rotación personalizada: {{ getParam(transformation.id, 'degrees') || 0 }}°</label>
                                      <input 
                                        type="range" 
                                        min="0" 
                                        max="360" 
                                        [value]="getParam(transformation.id, 'degrees') || 0"
                                        (input)="updateParam(transformation.id, 'degrees', $event)"
                                        class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                      >
                                      <div class="flex justify-between text-white/60 text-xs">
                                        <span>0°</span>
                                        <span>180°</span>
                                        <span>360°</span>
                                      </div>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Marca de agua -->
                                @else if (transformation.id === 'watermark') {
                                  <div class="space-y-2">
                                    <label class="text-white text-xs">Texto de marca de agua:</label>
                                    <input 
                                      type="text" 
                                      [value]="getParam(transformation.id, 'text') || ''"
                                      (input)="updateParam(transformation.id, 'text', $event)"
                                      placeholder="Ingresa tu texto (máx. 30 caracteres)"
                                      maxlength="30"
                                      class="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-xs placeholder-white/40 focus:outline-none focus:border-blue-400"
                                    >
                                    <div class="flex justify-between text-white/60 text-xs">
                                      <span>Texto visible en la imagen</span>
                                      <span>{{ (getParam(transformation.id, 'text') || '').length }}/30</span>
                                    </div>
                                  </div>
                                }
                                
                                <!-- Volteos - Sin parámetros adicionales -->
                                @else if (transformation.id === 'flip' || transformation.id === 'flop') {
                                  <p class="text-white/60 text-xs">No requiere parámetros adicionales</p>
                                }
                                
                              </div>
                            }
                          </div>
                        }
                      </div>

                      <!-- Formato de salida - OPCIONAL -->
                      <div class="p-3 bg-white/5 rounded-lg">
                        <h4 class="text-white font-semibold text-xs mb-2">Formato de salida (Opcional)</h4>
                        <p class="text-white/60 text-xs mb-2">
                          Si no seleccionas formato, se mantendrá el formato original
                        </p>
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
                          <label class="flex items-center">
                            <input 
                              type="radio" 
                              name="outputFormat"
                              value="ORIGINAL"
                              [checked]="selectedFormat() === 'ORIGINAL'"
                              (change)="updateOutputFormat('ORIGINAL')"
                              class="mr-1 w-3 h-3"
                            >
                            <span class="text-white text-xs">Original</span>
                          </label>
                        </div>
                        @if (isBatchMode()) {
                          <p class="text-white/60 text-xs mt-1">
                            El formato de salida cuenta como una transformación solo si se selecciona
                          </p>
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
                                    ×
                                  </button>
                                </div>
                              }
                              <div class="text-white flex justify-between items-center">
                                <span class="truncate mr-2">
                                  Formato: {{ selectedFormat() === 'ORIGINAL' ? 'Original' : selectedFormat() }}
                                </span>
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
    styles: [`
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      
      .slider::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `]
  })
  export class TransformComponent {
    private router = inject(Router);
    imageService = inject(ImageService);

    // Signals principales
    selectedTransformations = signal<Transformation[]>([]);
    selectedFormat = signal<'JPG' | 'PNG' | 'TIF' | 'ORIGINAL'>('ORIGINAL');
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
        const formatCount = this.selectedFormat() === 'ORIGINAL' ? 0 : 1;
        return this.selectedTransformations().length + formatCount;
      } else {
        const config = this.individualConfigs().get(this.currentImageId());
        const formatCount = config?.outputFormat === 'ORIGINAL' ? 0 : 1;
        return (config?.transformations.length || 0) + formatCount;
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
        return 'Debes seleccionar al menos 1 transformación (máximo 4 + formato opcional)';
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
      { id: 'flop', name: 'Voltear verticalmente', type: 'filter' }
    ];

    adjustmentTransformations: Transformation[] = [
      { id: 'brightness', name: 'Ajustar brillo', type: 'adjustment', parameters: { value: 0 } },
      { id: 'contrast', name: 'Ajustar contraste', type: 'adjustment', parameters: { value: 0 } },
      { id: 'blur', name: 'Desenfocar', type: 'adjustment', parameters: { radius: 0 } },
      { id: 'sharpen', name: 'Aumentar nitidez', type: 'adjustment', parameters: { value: 0 } },
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
          outputFormat: 'ORIGINAL'
        });
      });
      this.individualConfigs.set(configs);
    }

    setCurrentImage(imageId: string) {
      this.currentImageId.set(imageId);
    }

    // Métodos para transformaciones
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

    // Método para rotación rápida
    setRotation(degrees: number): void {
      this.updateParam('rotate', 'degrees', { target: { value: degrees } } as any);
    }

    updateOutputFormat(format: 'JPG' | 'PNG' | 'TIF' | 'ORIGINAL'): void {
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
      const formatCount = config?.outputFormat === 'ORIGINAL' ? 0 : 1;
      return (config?.transformations.length || 0) + formatCount;
    }

    getImageTransformations(imageId: string): Transformation[] {
      const config = this.individualConfigs().get(imageId);
      return config?.transformations || [];
    }

    getImageTransformationNames(imageId: string): string {
      const transformations = this.getImageTransformations(imageId);
      return transformations.map(t => t.name).join(', ');
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
      let value: any;
      
      if (input.type === 'range') {
        value = parseInt(input.value);
      } else if (input.type === 'text') {
        value = input.value;
      } else {
        value = input.value;
      }
      
      if (this.isBatchMode()) {
        this.selectedTransformations.set(
          this.selectedTransformations().map(t => 
            t.id === transformationId 
              ? { 
                  ...t, 
                  parameters: { 
                    ...t.parameters, 
                    [paramName]: value 
                  } 
                }
              : t
          )
        );
      } else {
        const newConfigs = new Map(this.individualConfigs());
        const config = newConfigs.get(this.currentImageId());
        if (config) {
          config.transformations = config.transformations.map(t => 
            t.id === transformationId 
              ? { 
                  ...t, 
                  parameters: { 
                    ...t.parameters, 
                    [paramName]: value 
                  } 
                }
              : t
          );
          newConfigs.set(this.currentImageId(), config);
          this.individualConfigs.set(newConfigs);
        }
      }
    }

    async applyTransformations(): Promise<void> {
  if (!this.canProceed()) return;

  let request: any;

  // ✅ CONDICIONAL PARA PROCESAMIENTO INDIVIDUAL
  if (!this.isBatchMode()) {
    // PROCESAMIENTO INDIVIDUAL
    console.log('🎯 Modo: Procesamiento Individual');
    
    // ✅ CORRECCIÓN: OBTENER LOS IDs REALES DEL SERVICIO
    const realImageIds = this.imageService.selectedImages()
      .filter(img => img.selected)
      .map(img => img.id);
    
    console.log('🔍 IDs reales de imágenes:', realImageIds);
    
    request = {
      applyToAll: false,
      imageConfigs: Array.from(this.individualConfigs().values()).map(config => ({
        ...config,
        // ✅ CORRECCIÓN: Asegurar que usamos el imageId correcto
        imageId: config.imageId, // Este debería ser el ID real del backend
        transformations: config.transformations.map(t => ({
          ...t,
          parameters: t.parameters || {} 
        }))
      })),
      images: realImageIds // ✅ Usar los IDs reales, no los temporales
    };

    console.log('📤 Enviando procesamiento individual:', {
      imageConfigs: request.imageConfigs.length,
      images: request.images.length,
      imageIds: request.images
    });
    
  } else {
    // PROCESAMIENTO POR LOTE
    console.log('🎯 Modo: Procesamiento por Lote');
    
    // ✅ CORRECCIÓN: OBTENER LOS IDs REALES DEL SERVICIO
    const realImageIds = this.imageService.selectedImages()
      .filter(img => img.selected)
      .map(img => img.id);
    
    request = {
      applyToAll: true,
      transformations: this.selectedTransformations().map(t => ({
        ...t,
        parameters: t.parameters || {}  
      })),
      outputFormat: this.selectedFormat(),
      images: realImageIds // ✅ Usar los IDs reales, no los temporales
    };
  }

  console.log('TransformComponent - Iniciando transformación...');
  console.log('Request completo:', JSON.stringify(request, null, 2));
  console.log('🔍 IDs enviados al backend:', request.images);
  
  // ✅ VALIDAR LA CONFIGURACIÓN ANTES DE ENVIAR
  const validation = this.imageService.validateTransformationConfig(request);
  if (!validation.isValid) {
    console.error('❌ Configuración inválida:', validation.errors);
    this.imageService.errorMessage.set(validation.errors.join(', '));
    return;
  }

  // ✅ LLAMAR AL MÉTODO CORREGIDO
  const result = await this.imageService.applyTransformations(request);
  
  if (result) {
    console.log('✅ TransformComponent - Transformación exitosa, navegando...');
    setTimeout(() => {
      this.router.navigate(['/images/download']);
    }, 100);
  } else {
    console.error('❌ TransformComponent - Transformación falló');
    // El error ya está configurado en el servicio
  }
}

    goBack(): void {
      this.router.navigate(['/images/upload']);
    }
  }