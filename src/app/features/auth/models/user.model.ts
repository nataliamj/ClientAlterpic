export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  registerDate: Date;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message: string;
}