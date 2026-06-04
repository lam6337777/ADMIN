import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

export const loginThunk = createAsyncThunk<User, LoginRequest, { rejectValue: string }>(
    'auth/login',
    async (data: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authService.login(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const registerThunk = createAsyncThunk<User, RegisterRequest, { rejectValue: string }>(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const getMeThunk = createAsyncThunk<User, void, { rejectValue: string }>(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getMe();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch user info');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state: AuthState) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            authService.logout();
        },
        clearError: (state: AuthState) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginThunk.pending, (state: AuthState) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginThunk.rejected, (state: AuthState, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerThunk.pending, (state: AuthState) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerThunk.rejected, (state: AuthState, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Me
            .addCase(getMeThunk.pending, (state: AuthState) => {
                state.isLoading = true;
            })
            .addCase(getMeThunk.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getMeThunk.rejected, (state: AuthState, action) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string || 'Failed to fetch user info';
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
