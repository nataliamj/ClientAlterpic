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
    status: 'idle'  // ✅ CAMBIADO de 'processing' a 'idle'
  });

  // ✅ MOVER currentBatch AL INICIO - ES CRÍTICO
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
  async uploadImages(images: ImageFile[]): Promise<boolean> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image.file);
      });

      const token = localStorage.getItem('auth_token');
      const headers: any = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${this.apiUrl}${environment.endpoints.images.upload}`;
      const response = await this.http.post<any>(url, formData, { headers }).toPromise();
      
      return response?.success || false;
    } catch (error) {
      this.errorMessage.set('Error al subir las imágenes');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ✅ SOLO UN MÉTODO applyTransformations - EL CORRECTO
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

      console.log('🔄 === INICIANDO TRANSFORMACIÓN ===');
      console.log('📤 URL:', url);
      console.log('📦 Request payload:', JSON.stringify(request, null, 2));
      
      // Simular progreso
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

      console.log('🚀 Enviando petición POST...');
      const response = await this.http.post<BatchResult>(url, request).toPromise();
      
      clearInterval(simulateProgress);
      
      // ✅✅✅ PARTE CRÍTICA - GUARDAR EL RESULTADO
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
        console.log('✅ Estado actualizado - progress:', this.progress());
      } else {
        console.warn('⚠️ Response recibida pero es null o undefined');
      }
      
      console.log('✅ === TRANSFORMACIÓN EXITOSA ===');
      console.log('📥 Response recibida:', response);
      
      return response || null;

    } catch (error: any) {
      console.error('❌ === ERROR EN TRANSFORMACIÓN ===', error);
      this.errorMessage.set('Error al aplicar transformaciones');
      this.progress.set({ ...this.progress(), status: 'error' });
      return null;
    } finally {
      this.isLoading.set(false);
      console.log('🏁 === TRANSFORMACIÓN FINALIZADA ===');
      console.log('🔍 Estado final - currentBatch:', this.currentBatch());
      console.log('🔍 Estado final - progress:', this.progress());
      console.log('🔍 Estado final - hasProcessedBatch:', this.hasProcessedBatch());
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
      
      console.log('📥 Iniciando descarga:', { batchId, downloadType, url });
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `transformaciones_${batchId}.${downloadType === 'zip' ? 'zip' : 'jpg'}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Descarga iniciada');
      
    } catch (error) {
      console.error('❌ Error en downloadResult:', error);
      this.errorMessage.set('Error al descargar los resultados');
      throw error;
    }
  }

  // Descargar imagen individual
  async downloadSingleImage(imageId: string, filename: string): Promise<void> {
    try {
      const url = `${this.apiUrl}/images/download/${imageId}`;
      
      console.log('📥 Iniciando descarga individual:', { imageId, filename, url });
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Descarga individual iniciada');
      
    } catch (error) {
      console.error('❌ Error en downloadSingleImage:', error);
      this.errorMessage.set('Error descargando imagen individual');
      throw error;
    }
  }

  // Método para simular un batch completado (para testing)
  setCurrentBatch(batch: BatchResult): void {
    console.log('🧪 setCurrentBatch llamado con:', batch);
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
    console.log('🔄 Reseteando estado del servicio...');
    this.selectedImages.set([]);
    this.currentBatch.set(null);
    this.progress.set({ 
      total: 0, 
      processed: 0, 
      percentage: 0, 
      status: 'idle' 
    });
    this.errorMessage.set('');
    console.log('✅ Estado reseteado');
  }

  // Método para verificar si hay un batch listo para descargar
  hasProcessedBatch(): boolean {
    const hasBatch = this.currentBatch() !== null;
    const isCompleted = this.progress().status === 'completed';
    
    console.log('🔍 SERVICE - hasProcessedBatch check:');
    console.log('🔍 - currentBatch:', this.currentBatch());
    console.log('🔍 - hasBatch:', hasBatch);
    console.log('🔍 - progress.status:', this.progress().status);
    console.log('🔍 - isCompleted:', isCompleted);
    console.log('🔍 - RESULT:', hasBatch && isCompleted);
    
    return hasBatch && isCompleted;
  }

  // ✅ ELIMINAR LOS MÉTODOS DUPLICADOS:
  // - applyTransformations2 
  // - applyTransformations3
  // Estos métodos causan confusión y no se deben usar
}