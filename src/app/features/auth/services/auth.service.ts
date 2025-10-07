import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
   
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isLoading = signal(false);
  public errorMessage = signal('');

  constructor(private http: HttpClient) {}

  // login
  async login(credentials: LoginRequest): Promise<boolean> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.auth.login}`;
       const response = await this.http.post<AuthResponse>(url, credentials).toPromise();
      
      if (response?.success) {
        this.currentUserSignal.set(response.user);
        localStorage.setItem('auth_token', response.token);
        return true;
      } else {
        this.errorMessage.set(response?.message || 'Error en el login');
        return false;
      }
    } catch (error) {
      this.errorMessage.set('Error de conexión');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // register
async register(userData: RegisterRequest): Promise<boolean> {
  this.isLoading.set(true);
  this.errorMessage.set('');

  try {
    const url = `${this.apiUrl}${environment.endpoints.auth.register}`;
 
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(url, userData)
    );
    
    if (response.success) {
      this.currentUserSignal.set(response.user!);
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      return true;
    } else {
      this.errorMessage.set(response.message || 'Error en el registro');
      return false;
    }
  } catch (error: any) {
 
    console.error('Error en registro:', error);
    
    if (error.error?.message) {
      this.errorMessage.set(error.error.message);
    } else if (error.status === 0) {
      this.errorMessage.set('Error de conexión: No se pudo conectar al servidor');
    } else {
      this.errorMessage.set('Error interno del servidor');
    }
    return false;
  } finally {
    this.isLoading.set(false);
  }
}

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}