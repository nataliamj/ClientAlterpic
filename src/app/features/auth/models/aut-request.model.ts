import { User } from './user.model';

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