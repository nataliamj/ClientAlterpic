import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  // ↔ State management con Signals (como tu Subject/Observer)
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isLoading = signal(false);
  public errorMessage = signal('');

  constructor(private http: HttpClient) {}

  // ↔ MÉTODO LOGIN (equivalente a tu init())
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

  // ↔ MÉTODO REGISTER
  async register(userData: RegisterRequest): Promise<boolean> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const url = `${this.apiUrl}${environment.endpoints.auth.register}`;
      const response = await this.http.post<AuthResponse>(url, userData).toPromise();
      
      if (response?.success) {
        this.currentUserSignal.set(response.user);
        localStorage.setItem('auth_token', response.token);
        return true;
      } else {
        this.errorMessage.set(response?.message || 'Error en el registro');
        return false;
      }
    } catch (error) {
      this.errorMessage.set('Error de conexión');
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