import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { TransformationHistory, HistoryResponse } from '../models/history.model';

export interface GroupedHistory {
  id_imagen: number;
  transformaciones: TransformationHistory[];
  fecha_creacion: string;
  fecha_formateada: string;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private apiUrl = environment.apiUrl;
  
  // State management con Signals
  public isLoading = signal(false);
  public errorMessage = signal('');
  public historyList = signal<TransformationHistory[]>([]);
  public groupedHistory = signal<GroupedHistory[]>([]);
  public selectedHistory = signal<TransformationHistory | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Obtener historial del usuario loggeado - GET /api/v1/history/user-transformations
   */
  async getHistory(): Promise<TransformationHistory[]> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.history.list}`;
      console.log(' Obteniendo historial del usuario...', url);
      
      const response = await this.http.get<HistoryResponse>(url).toPromise();

      console.log('GET History - Respuesta completa:', response);
      console.log(' GET History - data length:', response?.data?.length);
      
      if (response?.success) {
        const history = response.data.map(item => ({
          ...item,
          fecha_formateada: this.formatDate(item.fecha_creacion),
          parametros_parsed: this.parseParameters(item.parametros)
        }));
        
        this.historyList.set(history);
        
        // Agrupar por imagen
        this.groupHistoryByImage(history);
        
        console.log(' Historial del usuario obtenido:', history.length, 'registros');
        console.log(' Historial agrupado:', this.groupedHistory().length, 'imágenes');
        
        return history;
      } else {
        throw new Error(response?.message || 'Error al obtener historial del usuario');
      }
    } catch (error: any) {
      console.error(' Error obteniendo historial:', error);
      this.errorMessage.set(error.message || 'Error al cargar el historial');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Agrupar historial por imagen - CORREGIDO Y MEJORADO
   */
  private groupHistoryByImage(history: TransformationHistory[]): void {
    const grouped = history.reduce((acc, item) => {
      const existingGroup = acc.find(group => group.id_imagen === item.id_imagen);
      
      if (existingGroup) {
        // Agregar transformación al grupo existente
        existingGroup.transformaciones.push(item);
        
        // Ordenar transformaciones por orden (ascendente)
        existingGroup.transformaciones.sort((a, b) => a.orden - b.orden);
        
        // Actualizar fecha si es más reciente
        const currentDate = new Date(item.fecha_creacion);
        const groupDate = new Date(existingGroup.fecha_creacion);
        if (currentDate > groupDate) {
          existingGroup.fecha_creacion = item.fecha_creacion;
          existingGroup.fecha_formateada = item.fecha_formateada || this.formatDate(item.fecha_creacion);
        }
      } else {
        // Crear nuevo grupo
        acc.push({
          id_imagen: item.id_imagen,
          transformaciones: [item],
          fecha_creacion: item.fecha_creacion,
          fecha_formateada: item.fecha_formateada || this.formatDate(item.fecha_creacion)
        });
      }
      return acc;
    }, [] as GroupedHistory[]);

    // Ordenar grupos por fecha (más reciente primero) y por ID de imagen
    grouped.sort((a, b) => {
      const dateComparison = new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      return dateComparison !== 0 ? dateComparison : b.id_imagen - a.id_imagen;
    });
    
    // Ordenar transformaciones dentro de cada grupo por orden
    grouped.forEach(group => {
      group.transformaciones.sort((a, b) => a.orden - b.orden);
    });
    
    this.groupedHistory.set(grouped);
    
    console.log(' Historial agrupado:', grouped);
    console.log(' Resumen por imagen:');
    grouped.forEach(group => {
      console.log(`   Imagen ${group.id_imagen}: ${group.transformaciones.length} transformaciones`);
    });
  }

  /**
   * Obtener detalles específicos de una transformación - GET /api/v1/history/transformations/:id
   */
  async getHistoryDetail(id: number): Promise<TransformationHistory | null> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.history.detail(id)}`;
      console.log(' Obteniendo detalle del historial:', url);
      
      const response = await this.http.get<{
        success: boolean;
        data: TransformationHistory;
        message?: string;
      }>(url).toPromise();
      
      if (response?.success && response.data) {
        const historyDetail = {
          ...response.data,
          fecha_formateada: this.formatDate(response.data.fecha_creacion),
          parametros_parsed: this.parseParameters(response.data.parametros)
        };
        
        console.log('Detalle del historial obtenido:', historyDetail);
        return historyDetail;
      } else {
        throw new Error(response?.message || 'Error al obtener detalle del historial');
      }
    } catch (error: any) {
      console.error(' Error obteniendo detalle del historial:', error);
      this.errorMessage.set(error.message || 'Error al cargar los detalles del historial');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtener todas las transformaciones de una imagen específica
   */
  getTransformationsByImageId(idImagen: number): TransformationHistory[] {
    const group = this.groupedHistory().find(g => g.id_imagen === idImagen);
    return group ? group.transformaciones : [];
  }

  /**
   * Obtener grupo específico por ID de imagen
   */
  getGroupByImageId(idImagen: number): GroupedHistory | undefined {
    return this.groupedHistory().find(group => group.id_imagen === idImagen);
  }

  /**
   * Eliminar del historial - DELETE /api/v1/history/transformations/:id
   */
  async deleteHistory(id: number): Promise<boolean> {
    try {
      const url = `${this.apiUrl}${environment.endpoints.history.delete(id)}`;
      console.log(' Eliminando del historial:', url);
      
      const response = await this.http.delete<{success: boolean; message: string}>(url).toPromise();
      
      if (response?.success) {
        // Remover del listado actual
        const currentList = this.historyList().filter(item => item.id_transformacion !== id);
        this.historyList.set(currentList);
        
        // Reagrupar
        this.groupHistoryByImage(currentList);
        
        console.log('Registro eliminado del historial');
        return true;
      } else {
        throw new Error(response?.message || 'Error al eliminar del historial');
      }
    } catch (error: any) {
      console.error(' Error eliminando del historial:', error);
      this.errorMessage.set(error.message || 'Error al eliminar del historial');
      return false;
    }
  }

  /**
   * Eliminar todas las transformaciones de una imagen
   */
  async deleteImageHistory(idImagen: number): Promise<boolean> {
    try {
      const transformations = this.getTransformationsByImageId(idImagen);
      const deletePromises = transformations.map(trans => 
        this.deleteHistory(trans.id_transformacion)
      );
      
      const results = await Promise.all(deletePromises);
      return results.every(result => result);
    } catch (error: any) {
      console.error(' Error eliminando historial de imagen:', error);
      this.errorMessage.set(error.message || 'Error al eliminar el historial de la imagen');
      return false;
    }
  }

  /**
   * Formatear fecha
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

  /**
   * Parsear parámetros JSON - MEJORADO
   */
  private parseParameters(parametros: string): any {
    if (!parametros || parametros.trim() === '') {
      return { tipo: 'Sin parámetros' };
    }
    
    if (parametros.trim() === '{}') {
      return { tipo: 'Configuración predeterminada' };
    }
    
    try {
      const parsed = JSON.parse(parametros);
      
      if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
        return { tipo: 'Configuración predeterminada' };
      }
      
      return parsed;
    } catch (error) {
      console.log('⚠️ No se pudo parsear JSON, mostrando como texto:', parametros);
      return { valor: parametros };
    }
  }

  /**
   * Obtener descripción legible de los parámetros
   */
  getParametersDescription(parametros: any): string {
    if (!parametros || (typeof parametros === 'object' && Object.keys(parametros).length === 0)) {
      return 'Sin parámetros específicos';
    }
    
    if (typeof parametros === 'string') {
      return parametros;
    }
    
    if (parametros.tipo === 'Sin parámetros' || parametros.tipo === 'Configuración predeterminada') {
      return parametros.tipo;
    }
    
    try {
      return Object.entries(parametros)
        .map(([key, value]) => `${this.formatParameterKey(key)}: ${value}`)
        .join(', ');
    } catch {
      return 'Parámetros no válidos';
    }
  }

  /**
   * Formatear clave de parámetro para mostrar
   */
  private formatParameterKey(key: string): string {
    const keyMap: { [key: string]: string } = {
      'radius': 'Radio',
      'angle': 'Ángulo',
      'width': 'Ancho',
      'height': 'Alto',
      'brightness': 'Brillo',
      'contrast': 'Contraste',
      'x': 'Posición X',
      'y': 'Posición Y'
    };
    
    return keyMap[key] || key;
  }

  /**
   * Obtener tipo de transformación en español
   */
  getTransformationTypeSpanish(tipo: string): string {
    const types: { [key: string]: string } = {
      'grayscale': 'Escala de Grises',
      'blur': 'Desenfoque',
      'brightness': 'Ajuste de Brillo',
      'contrast': 'Ajuste de Contraste',
      'rotate': 'Rotación',
      'flip': 'Volteo',
      'resize': 'Redimensionado',
      'crop': 'Recorte',
      'default': 'Transformación'
    };
    
    return types[tipo] || tipo;
  }

  /**
   * Seleccionar item del historial
   */
  selectHistory(item: TransformationHistory): void {
    this.selectedHistory.set(item);
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.selectedHistory.set(null);
  }

  /**
   * Resetear estado
   */
  reset(): void {
    this.historyList.set([]);
    this.groupedHistory.set([]);
    this.selectedHistory.set(null);
    this.errorMessage.set('');
  }

  /**
   * Obtener estadísticas del historial
   */
  getStats(): { totalImages: number; totalTransformations: number; transformationsByType: { [key: string]: number } } {
    const grouped = this.groupedHistory();
    const allTransformations = this.historyList();
    
    const transformationsByType = allTransformations.reduce((acc, trans) => {
      acc[trans.tipo] = (acc[trans.tipo] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      totalImages: grouped.length,
      totalTransformations: allTransformations.length,
      transformationsByType
    };
  }
}