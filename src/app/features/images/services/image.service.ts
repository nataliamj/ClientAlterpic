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
    status: 'processing' 
  });

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

      const url = `${this.apiUrl}${environment.endpoints.images.upload}`;
      const response = await this.http.post<any>(url, formData).toPromise();
      
      return response?.success || false;
    } catch (error) {
      this.errorMessage.set('Error al subir las imágenes');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Aplicar transformaciones
 async applyTransformations(request: BatchTransformationRequest): Promise<BatchResult | null> {
  this.isLoading.set(true);
  this.errorMessage.set('');
  this.progress.set({ total: request.applyToAll ? 1 : (request.imageConfigs?.length || 0), processed: 0, percentage: 0, status: 'processing' });

  try {
    const url = `${this.apiUrl}${environment.endpoints.images.transform}`;
    
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

    const response = await this.http.post<BatchResult>(url, request).toPromise();
    
    clearInterval(simulateProgress);
    this.progress.set({ ...this.progress(), status: 'completed' });
    
    return response || null;
  } catch (error) {
    this.errorMessage.set('Error al aplicar transformaciones');
    this.progress.set({ ...this.progress(), status: 'error' });
    return null;
  } finally {
    this.isLoading.set(false);
  }
}

  // Descargar resultado
  async downloadResult(batchId: string, downloadType: 'zip' | 'individual' = 'zip'): Promise<void> {
    try {
      const url = `${this.apiUrl}/download/${batchId}?type=${downloadType}`;
      // Implementar lógica de descarga
      window.open(url, '_blank');
    } catch (error) {
      this.errorMessage.set('Error al descargar los resultados');
    }
  }
}