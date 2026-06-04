export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    avatarUrl?: string;
    role: UserRole;
    isActive: boolean;
    token?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface RegisterRequest {
    email: string;
    password?: string;
    fullName: string;
    phone: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}
