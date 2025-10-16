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

  // Obtener todo el historial
  async getHistory(): Promise<TransformationHistory[]> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.history.list}`;
      console.log(' Obteniendo historial...', url);
      
      const response = await this.http.get<HistoryResponse>(url).toPromise();
      
      if (response?.success) {
        const history = response.data.map(item => ({
          ...item,
          fecha_formateada: this.formatDate(item.fecha_creacion),
          parametros_parsed: this.parseParameters(item.parametros)
        }));
        
        this.historyList.set(history);
        console.log('Historial obtenido:', history.length, 'registros');
        return history;
      } else {
        throw new Error(response?.message || 'Error al obtener historial');
      }
    } catch (error: any) {
      console.error('Error obteniendo historial:', error);
      this.errorMessage.set('Error al cargar el historial');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  // Obtener historial del usuario actual
  async getUserHistory(): Promise<TransformationHistory[]> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}/history/user-transformations`;
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
      console.error('Error obteniendo historial del usuario:', error);
      this.errorMessage.set('Error al cargar el historial del usuario');
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  // Eliminar del historial
  async deleteHistory(id: number): Promise<boolean> {
    try {
      const url = `${this.apiUrl}/history/transformations/${id}`;
      console.log('🗑️ Eliminando del historial:', id);
      
      const response = await this.http.delete<{success: boolean; message: string}>(url).toPromise();
      
      if (response?.success) {
        // Remover del listado actual
        const currentList = this.historyList().filter(item => item.id_transformacion !== id);
        this.historyList.set(currentList);
        console.log(' Registro eliminado del historial');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Parsear parámetros JSON
  private parseParameters(parametros: string): any {
    try {
      return JSON.parse(parametros);
    } catch {
      return {};
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