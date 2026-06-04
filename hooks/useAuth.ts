'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import { loginThunk, registerThunk, logout, getMeThunk, clearError } from '@/store/redux/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { useEffect } from 'react';

// Module-level: chỉ fetch 1 lần duy nhất trong suốt phiên
let hasFetched = false;

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const signIn = (data: LoginRequest) => dispatch(loginThunk(data));
    const signUp = (data: RegisterRequest) => dispatch(registerThunk(data));
    const signOut = () => {
        hasFetched = false; // reset để fetch lại sau khi login
        dispatch(logout());
    };
    const resetError = () => dispatch(clearError());

    // Fetch user info 1 lần khi có token
    useEffect(() => {
        if (hasFetched || isLoading || isAuthenticated) return;

        const hasToken = typeof window !== 'undefined' && (
            localStorage.getItem('token') ||
            document.cookie.includes('accessToken=')
        );

        if (!hasToken) return;

        hasFetched = true;
        dispatch(getMeThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Đồng bộ cookie từ localStorage khi isAuthenticated = true
    // Tránh redirect loop: proxy cần cookie, API dùng localStorage
    useEffect(() => {
        if (!isAuthenticated || typeof window === 'undefined') return;

        const cookieHasToken = document.cookie.includes('accessToken=');
        if (!cookieHasToken) {
            const token = localStorage.getItem('token');
            if (token) {
                // Refresh lại cookie để proxy nhận diện được
                document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
                if (user?.role) {
                    document.cookie = `userRole=${user.role}; path=/; max-age=86400; SameSite=Lax`;
                }
            }
        }
    }, [isAuthenticated, user]);

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        resetError,
    };
};
