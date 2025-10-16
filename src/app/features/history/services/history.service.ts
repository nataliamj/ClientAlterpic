import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { TransformationHistory, HistoryResponse } from '../models/history.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private apiUrl = environment.apiUrl;
  
  // State management con Signals
  public isLoading = signal(false);
  public errorMessage = signal('');
  public historyList = signal<TransformationHistory[]>([]);
  public selectedHistory = signal<TransformationHistory | null>(null);

  constructor(private http: HttpClient) {}

  // Obtener historial del usuario loggeado - GET /api/v1/history/user-transformations
  async getHistory(): Promise<TransformationHistory[]> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.history.list}`;
      console.log('Obteniendo historial del usuario...', url);
      
      const response = await this.http.get<HistoryResponse>(url).toPromise();
      
      if (response?.success) {
        const history = response.data.map(item => ({
          ...item,
          fecha_formateada: this.formatDate(item.fecha_creacion),
          parametros_parsed: this.parseParameters(item.parametros)
        }));
        
        this.historyList.set(history);
        console.log('Historial del usuario obtenido:', history.length, 'registros');
        return history;
      } else {
        throw new Error(response?.message || 'Error al obtener historial del usuario');
      }
    } catch (error: any) {
      console.error(' Error obteniendo historial:', error);
      this.errorMessage.set('Error al cargar el historial');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  // Obtener detalles específicos de una transformación - GET /api/v1/history/transformations/:id
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
      console.error('Error obteniendo detalle del historial:', error);
      this.errorMessage.set('Error al cargar los detalles del historial');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Eliminar del historial - DELETE /api/v1/history/transformations/:id
  async deleteHistory(id: number): Promise<boolean> {
    try {
      const url = `${this.apiUrl}${environment.endpoints.history.delete(id)}`;
      console.log('Eliminando del historial:', url);
      
      const response = await this.http.delete<{success: boolean; message: string}>(url).toPromise();
      
      if (response?.success) {
        // Remover del listado actual
        const currentList = this.historyList().filter(item => item.id_transformacion !== id);
        this.historyList.set(currentList);
        console.log('Registro eliminado del historial');
        return true;
      } else {
        throw new Error(response?.message || 'Error al eliminar del historial');
      }
    } catch (error: any) {
      console.error(' Error eliminando del historial:', error);
      this.errorMessage.set('Error al eliminar del historial');
      return false;
    }
  }

  // Formatear fecha
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

  // Parsear parámetros JSON
  
private parseParameters(parametros: string): any {
  if (!parametros || parametros.trim() === '') {
    return 'Sin parámetros';
  }
  
  try {
    const parsed = JSON.parse(parametros);
    
    // Si es un objeto vacío
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      return 'Configuración predeterminada';
    }
    
    return parsed;
  } catch (error) {
    console.log('⚠️ No se pudo parsear JSON, mostrando como texto:', parametros);
    // Si no es JSON válido, devolver el string original
    return parametros;
  }
}

  // Seleccionar item del historial
  selectHistory(item: TransformationHistory): void {
    this.selectedHistory.set(item);
  }

  // Limpiar selección
  clearSelection(): void {
    this.selectedHistory.set(null);
  }

  // Resetear estado
  reset(): void {
    this.historyList.set([]);
    this.selectedHistory.set(null);
    this.errorMessage.set('');
  }

  
}