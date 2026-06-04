import axiosInstance from '@/lib/axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth";

export const authService = {
    async register(data: RegisterRequest): Promise<User> {
        const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
        const user = response.data.data;
        if (user && user.token && typeof window !== 'undefined') {
            localStorage.setItem('token', user.token);
            // Lưu vào cookie cho middleware
            document.cookie = `accessToken=${user.token}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `userRole=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        return user;
    },

    async login(data: LoginRequest): Promise<User> {
        const response = await axiosInstance.post<AuthResponse>('/api/auth/login', data);
        const user = response.data.data;
        if (user && user.token && typeof window !== 'undefined') {
            localStorage.setItem('token', user.token);
            // Lưu vào cookie cho middleware
            document.cookie = `accessToken=${user.token}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `userRole=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        return user;
    },

    async getMe(): Promise<User> {
        const response = await axiosInstance.get<AuthResponse>('/api/auth/me');
        return response.data.data;
    },

    async logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            // Xóa cookie
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // Ép trình duyệt tải lại trang Đăng nhập để Middleware nhận diện đã xóa Cookie
            window.location.href = '/login';
        }
        console.log('Logging out...');
    }
};
