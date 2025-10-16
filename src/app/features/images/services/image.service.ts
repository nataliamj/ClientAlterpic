import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { 
  ImageFile, 
  Transformation, 
  BatchTransformationRequest, 
  TransformationProgress, 
  BatchResult 
} from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private apiUrl = environment.apiUrl;
  
  // State management con Signals
  public selectedImages = signal<ImageFile[]>([]);
  public transformationConfig = signal<any>(null);
  public isLoading = signal(false);
  public errorMessage = signal('');
  public transformationMode = signal<'batch' | 'individual'>('batch');
  public progress = signal<TransformationProgress>({ 
    total: 0, 
    processed: 0, 
    percentage: 0, 
    status: 'idle'
  });

  public currentBatch = signal<BatchResult | null>(null);

  constructor(private http: HttpClient) {}

  // Validar formatos de archivo
  isValidFileType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/zip'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.zip'];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  }

processFiles(files: FileList): { valid: ImageFile[], invalid: string[] } {
  const validFiles: ImageFile[] = [];
  const invalidFiles: string[] = [];

  Array.from(files).forEach(file => {
    if (this.isValidFileType(file)) {
       const imageFile: ImageFile = {
        id: '', 
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
        selected: true
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageFile.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(imageFile);
    } else {
      invalidFiles.push(file.name);
    }
  });

  return { valid: validFiles, invalid: invalidFiles };
}
// En ImageService, añade esta signal
public uploadResponse = signal<any>(null);

async uploadImages(images: ImageFile[]): Promise<boolean> {
  this.isLoading.set(true);
  this.errorMessage.set('');

  console.log(' === INICIANDO UPLOAD DE IMÁGENES ===');

  try {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image.file);
    });

    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.apiUrl}${environment.endpoints.images.upload}`;
    
    const response = await this.http.post<{
      success: boolean;
      images?: any[]; // ← Asegúrate de que el backend devuelva 'images'
      message?: string;
    }>(url, formData, { headers }).toPromise();

    console.log('✅ Respuesta del servidor:', response);

    if (response?.success && response.images) {
      // ✅ GUARDAR LA RESPUESTA Y ACTUALIZAR IDs
      this.uploadResponse.set(response);
      this.updateImageIdsWithBackendIds(response.images);
      
      return true;
    } else {
      this.errorMessage.set(response?.message || 'Error al subir las imágenes');
      return false;
    }

  } catch (error: any) {
    console.error('❌ Error de conexión:', error);
    this.errorMessage.set('Error al subir las imágenes');
    return false;
  } finally {
    this.isLoading.set(false);
  }
}

// ✅ MÉTODO PARA ACTUALIZAR IDs CON LOS DEL BACKEND
private updateImageIdsWithBackendIds(backendImages: any[]): void {
  const currentImages = this.selectedImages();
  
  const updatedImages = currentImages.map(currentImage => {
    // Buscar la imagen correspondiente por nombre
    const backendImage = backendImages.find(bImg => 
      bImg.name === currentImage.name
    );
    
    if (backendImage) {
      console.log(`🔄 Actualizando ID: ${currentImage.id} -> ${backendImage.id} para ${currentImage.name}`);
      return {
        ...currentImage,
        id: backendImage.id // ← ID real del backend
      };
    }
    
    console.warn(`⚠️ No se encontró ID del backend para: ${currentImage.name}`);
    return currentImage;
  });
  
  this.selectedImages.set(updatedImages);
  console.log('✅ IDs actualizados:', updatedImages.map(img => ({ id: img.id, name: img.name })));
}
 
async applyTransformations(request: BatchTransformationRequest): Promise<BatchResult | null> {
  this.isLoading.set(true);
  this.errorMessage.set('');
  
  // ✅ CORRECCIÓN: Determinar endpoint correcto
  let endpoint = environment.endpoints.images.transform; 
  
  const isIndividualMode = !request.applyToAll && request.imageConfigs && request.imageConfigs.length > 0;
  
  if (isIndividualMode) {
    // ✅ CORRECCIÓN: Usar endpoint sin /api/v1/ al inicio
    endpoint = '/lote-individual/procesar';
    console.log('🎯 MODO INDIVIDUAL DETECTADO - Usando endpoint:', endpoint);
    console.log('🔍 Configuraciones individuales:', request.imageConfigs!.length);
    this.transformationMode.set('individual');
  } else {
    console.log('🎯 MODO LOTE DETECTADO - Usando endpoint:', endpoint);
    this.transformationMode.set('batch');
  }

  // ✅ CORRECCIÓN: Configurar progreso de forma segura
  const totalItems = isIndividualMode ? 
    (request.imageConfigs?.length || 0) : 
    (request.applyToAll ? 1 : (request.images?.length || 0));
  
  this.progress.set({ 
    total: totalItems, 
    processed: 0, 
    percentage: 0, 
    status: 'processing' 
  });

  try {
    const url = `${this.apiUrl}${endpoint}`;

    console.log('=== INICIANDO TRANSFORMACIÓN ===');
    console.log('🔗 URL completa:', url);
    console.log('Modo:', isIndividualMode ? 'INDIVIDUAL' : 'LOTE');
    console.log('Request payload:', JSON.stringify(request, null, 2));
    
    // ✅ CORRECCIÓN: Asegurar parámetros de forma segura
    if (request.transformations) {
      request.transformations = request.transformations.map(trans => ({
        ...trans,
        parameters: trans.parameters || {}
      }));
    }
    
    // ✅ CORRECCIÓN: Verificar que imageConfigs existe antes de mapear
    if (request.imageConfigs) {
      request.imageConfigs = request.imageConfigs.map(config => ({
        ...config,
        transformations: config.transformations.map(trans => ({
          ...trans,
          parameters: trans.parameters || {}
        }))
      }));
    }

    // ✅ SIMULAR PROGRESO MEJORADO
    const progressInterval = setInterval(() => {
      const currentProgress = this.progress();
      if (currentProgress.processed < currentProgress.total) {
        const newProcessed = currentProgress.processed + 1;
        const newPercentage = (newProcessed / currentProgress.total) * 100;
        this.progress.set({
          ...currentProgress,
          processed: newProcessed,
          percentage: Math.round(newPercentage)
        });
        console.log(`📊 Progreso: ${newProcessed}/${currentProgress.total} (${Math.round(newPercentage)}%)`);
      } else {
        clearInterval(progressInterval);
      }
    }, 800);

    console.log('📤 Enviando petición POST...');
    
    // ✅ HACER LA PETICIÓN HTTP
    const response = await this.http.post<BatchResult>(url, request).toPromise();
    
    clearInterval(progressInterval);
    
    // ✅ GUARDAR EL RESULTADO
    if (response) {
      console.log('💾 Guardando resultado en currentBatch...');
      this.currentBatch.set(response);
      this.progress.set({ 
        total: response.imageCount, 
        processed: response.imageCount, 
        percentage: 100, 
        status: 'completed' 
      });
      
      console.log('✅ Estado actualizado - currentBatch:', this.currentBatch());
      console.log('📊 Estado actualizado - progress:', this.progress());
      
      console.log('=== TRANSFORMACIÓN EXITOSA ===');
      console.log('Response recibida:', response);
    } else {
      console.warn('⚠️ Response recibida pero es null o undefined');
      this.errorMessage.set('No se recibió respuesta del servidor');
      this.progress.set({ ...this.progress(), status: 'error' });
      return null;
    }
    
    return response;

  } catch (error: any) {
    console.error('💥 === ERROR EN TRANSFORMACIÓN ===', error);
    
    // ✅ MANEJO DE ERRORES MEJORADO
    if (error.status === 404) {
      this.errorMessage.set('Endpoint no encontrado. Verifica la configuración del servidor.');
      console.error('❌ Endpoint 404 - Verifica que la ruta esté registrada en el servidor');
    } else if (error.status === 500) {
      this.errorMessage.set('Error interno del servidor al procesar las imágenes.');
    } else if (error.status === 400) {
      this.errorMessage.set('Solicitud inválida. Verifica los parámetros de transformación.');
    } else if (error.status === 0) {
      this.errorMessage.set('Error de conexión: No se pudo contactar al servidor.');
    } else {
      this.errorMessage.set(`Error al aplicar transformaciones: ${error.message || 'Error desconocido'}`);
    }
    
    this.progress.set({ ...this.progress(), status: 'error' });
    return null;
  } finally {
    this.isLoading.set(false);
    console.log('=== TRANSFORMACIÓN FINALIZADA ===');
    console.log('Estado final - currentBatch:', this.currentBatch());
    console.log('Estado final - progress:', this.progress());
    console.log('Estado final - hasProcessedBatch:', this.hasProcessedBatch());
  }
}

   async applyIndividualTransformations(imageConfigs: any[], images: string[]): Promise<BatchResult | null> {
    console.log('🎯 EJECUTANDO applyIndividualTransformations');
    
    const request: BatchTransformationRequest = {
      applyToAll: false,
      imageConfigs: imageConfigs,
      images: images,
      transformations: [] // Vacío porque usamos imageConfigs
    };

    return this.applyTransformations(request);
  }

   async downloadResult(batchId: string, downloadType: 'zip' | 'individual' = 'zip'): Promise<void> {
    try {
      let url: string;
      
      if (downloadType === 'zip') {
        url = `${this.apiUrl}/images/download/batch/${batchId}`;
      } else {
        url = `${this.apiUrl}/images/download/${batchId}`;
      }
      
      console.log('     Iniciando descarga:', { batchId, downloadType, url });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `transformaciones_${batchId}.${downloadType === 'zip' ? 'zip' : 'jpg'}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('     Descarga iniciada');
      
    } catch (error) {
      console.error('     Error en downloadResult:', error);
      this.errorMessage.set('Error al descargar los resultados');
      throw error;
    }
  }

    async downloadSingleImage(imageId: string, filename: string): Promise<void> {
    try {
      const url = `${this.apiUrl}/images/download/${imageId}`;
      
      console.log('    Iniciando descarga individual:', { imageId, filename, url });
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('    Descarga individual iniciada');
      
    } catch (error) {
      console.error('    Error en downloadSingleImage:', error);
      this.errorMessage.set('Error descargando imagen individual');
      throw error;
    }
  }

   setCurrentBatch(batch: BatchResult): void {
    console.log('   setCurrentBatch llamado con:', batch);
    this.currentBatch.set(batch);
    this.progress.set({ 
      total: batch.imageCount, 
      processed: batch.imageCount, 
      percentage: 100, 
      status: 'completed' 
    });
  }

  // Resetear estado
  reset(): void {
    console.log('   Reseteando estado del servicio...');
    this.selectedImages.set([]);
    this.currentBatch.set(null);
    this.transformationMode.set('batch');
    this.progress.set({ 
      total: 0, 
      processed: 0, 
      percentage: 0, 
      status: 'idle' 
    });
    this.errorMessage.set('');
    console.log('  Estado reseteado');
  }

  // Método para verificar si hay un batch listo para descargar
  hasProcessedBatch(): boolean {
    const hasBatch = this.currentBatch() !== null;
    const isCompleted = this.progress().status === 'completed';
    
    console.log('  SERVICE - hasProcessedBatch check:');
    console.log('  - currentBatch:', this.currentBatch());
    console.log('  - hasBatch:', hasBatch);
    console.log('  - progress.status:', this.progress().status);
    console.log('  - isCompleted:', isCompleted);
    console.log('  - RESULT:', hasBatch && isCompleted);
    
    return hasBatch && isCompleted;
  }

  // ✅ NUEVO MÉTODO PARA VERIFICAR CONFIGURACIÓN
  validateTransformationConfig(request: BatchTransformationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.images || request.images.length === 0) {
      errors.push('No se han seleccionado imágenes');
    }

    if (request.applyToAll) {
      // Modo lote: verificar transformaciones generales
      if (!request.transformations || request.transformations.length === 0) {
        errors.push('Debe seleccionar al menos una transformación para el modo lote');
      }
    } else {
      // Modo individual: verificar configuraciones por imagen
      if (!request.imageConfigs || request.imageConfigs.length === 0) {
        errors.push('Debe configurar transformaciones para cada imagen en modo individual');
      } else {
        request.imageConfigs.forEach((config, index) => {
          if (!config.transformations || config.transformations.length === 0) {
            errors.push(`La imagen ${index + 1} no tiene transformaciones configuradas`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}