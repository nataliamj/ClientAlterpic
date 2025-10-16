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
    status: 'idle'  //   CAMBIADO de 'processing' a 'idle'
  });

  //           MOVER currentBatch AL INICIO - ES CRÍTICO
  public currentBatch = signal<BatchResult | null>(null);

  constructor(private http: HttpClient) {}

  // Validar formatos de archivo
  isValidFileType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/zip'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.zip'];
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  }

  // Procesar archivos subidos
  processFiles(files: FileList): { valid: ImageFile[], invalid: string[] } {
    const validFiles: ImageFile[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (this.isValidFileType(file)) {
        const imageFile: ImageFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
          selected: true
        };

        // Crear preview para imágenes (no para ZIP)
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

  // Subir imágenes al servidor
// Subir imágenes al servidor - CON DEBUGGING CORREGIDO
async uploadImages(images: ImageFile[]): Promise<boolean> {
  this.isLoading.set(true);
  this.errorMessage.set('');

  console.log(' === INICIANDO UPLOAD DE IMÁGENES ===');
  console.log(' Imágenes a subir:', images.length);
  console.log(' Detalles de imágenes:', images.map(img => ({
    id: img.id,
    name: img.name,
    size: `${(img.size / 1024 / 1024).toFixed(2)} MB`,
    type: img.type
  })));

  try {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('images', image.file);
      console.log(` Añadiendo imagen ${index + 1}: ${image.name} al FormData`);
    });

    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(' Token de autenticación encontrado');
    } else {
      console.log(' No se encontró token de autenticación');
    }

    const url = `${this.apiUrl}${environment.endpoints.images.upload}`;
    console.log(' URL de upload:', url);
    
    // DEBUG: Verificar contenido del FormData (forma compatible)
    console.log(' FormData contiene:', images.length, 'archivos');
    images.forEach((image, index) => {
      console.log(`   ${index + 1}. ${image.name} (${image.type})`);
    });

    console.log(' Enviando petición POST al servidor...');
    const startTime = Date.now();
    
    const response = await this.http.post<{
      success: boolean;
      data?: any[];
      message?: string;
      count?: number;
    }>(url, formData, { headers }).toPromise();

    const endTime = Date.now();
    console.log(` Tiempo de respuesta: ${endTime - startTime}ms`);
    
    console.log(' Respuesta completa del servidor:', response);

    if (response?.success) {
      const uploadedCount = response.data?.length || response.count || images.length;
      console.log(' === UPLOAD EXITOSO ===');
      console.log(` Imágenes subidas correctamente: ${uploadedCount}/${images.length}`);
      console.log(' Mensaje del servidor:', response.message || 'Sin mensaje específico');
      
      if (response.data) {
        console.log('📋 Datos de imágenes subidas:', response.data);
      }
      
      return true;
    } else {
      console.log(' === UPLOAD FALLIDO ===');
      console.log(' El servidor reportó error en el upload');
      console.log(' Mensaje de error:', response?.message || 'No se proporcionó mensaje de error');
      console.log(' Respuesta completa:', response);
      
      this.errorMessage.set(response?.message || 'Error al subir las imágenes');
      return false;
    }

  } catch (error: any) {
    console.log(' === ERROR DE CONEXIÓN ===');
    console.log(' Error completo:', error);
    console.log(' Mensaje de error:', error.message);
    console.log(' Status:', error.status);
    console.log(' URL:', error.url);
    
    if (error.status === 0) {
      this.errorMessage.set('Error de conexión: No se pudo contactar al servidor');
    } else if (error.status === 401) {
      this.errorMessage.set('Error de autenticación: Token inválido o expirado');
    } else if (error.status === 413) {
      this.errorMessage.set('Error: Archivos demasiado grandes');
    } else {
      this.errorMessage.set(`Error al subir las imágenes: ${error.message || 'Error desconocido'}`);
    }
    
    return false;
  } finally {
    this.isLoading.set(false);
    console.log(' === UPLOAD FINALIZADO ===');
  }
}
async applyTransformations(request: BatchTransformationRequest): Promise<BatchResult | null> {
  this.isLoading.set(true);
  this.errorMessage.set('');
  this.progress.set({ 
    total: request.applyToAll ? 1 : (request.imageConfigs?.length || 0), 
    processed: 0, 
    percentage: 0, 
    status: 'processing' 
  });

  try {
    const url = `${this.apiUrl}${environment.endpoints.images.transform}`;

    console.log('=== INICIANDO TRANSFORMACIÓN ===');
    console.log('URL:', url);
    console.log('Request payload:', JSON.stringify(request, null, 2));
    
    // Asegurar parámetros
    if (request.transformations) {
      request.transformations = request.transformations.map(trans => ({
        ...trans,
        parameters: trans.parameters || {}
      }));
    }
    
    if (request.imageConfigs) {
      request.imageConfigs = request.imageConfigs.map(config => ({
        ...config,
        transformations: config.transformations.map(trans => ({
          ...trans,
          parameters: trans.parameters || {}
        }))
      }));
    }

    // Simular progreso (IMPORTANTE)
    const simulateProgress = setInterval(() => {
      const currentProgress = this.progress();
      if (currentProgress.processed < currentProgress.total) {
        const newProcessed = currentProgress.processed + 1;
        const newPercentage = (newProcessed / currentProgress.total) * 100;
        this.progress.set({
          ...currentProgress,
          processed: newProcessed,
          percentage: Math.round(newPercentage)
        });
      } else {
        clearInterval(simulateProgress);
      }
    }, 500);

    console.log('Enviando petición POST...');
    const response = await this.http.post<BatchResult>(url, request).toPromise();
    
    clearInterval(simulateProgress);
    
    // Guardar el resultado
    if (response) {
      console.log('Guardando resultado en currentBatch...');
      this.currentBatch.set(response);
      this.progress.set({ 
        total: response.imageCount, 
        processed: response.imageCount, 
        percentage: 100, 
        status: 'completed' 
      });
      
      console.log('Estado actualizado - currentBatch:', this.currentBatch());
      console.log('Estado actualizado - progress:', this.progress());
    } else {
      console.warn('Response recibida pero es null o undefined');
    }
    
    console.log('=== TRANSFORMACIÓN EXITOSA ===');
    console.log('Response recibida:', response);
    
    return response || null;

  } catch (error: any) {
    console.error('=== ERROR EN TRANSFORMACIÓN ===', error);
    this.errorMessage.set('Error al aplicar transformaciones');
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

  // Descargar resultado
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

  // Descargar imagen individual
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

  // Método para simular un batch completado (para testing)
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
 
    }