import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customerService } from '@/services/customer.service';
import { Customer, CustomerPageResponse } from '@/types/customer';

interface CustomerState {
    customers: Customer[];
    pagination: {
        totalElements: number;
        totalPages: number;
        currentPage: number;
        size: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: CustomerState = {
    customers: [],
    pagination: {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 20
    },
    loading: false,
    error: null,
};

export const fetchCustomers = createAsyncThunk(
    'customers/fetchCustomers',
    async (params: { page?: number, size?: number } | undefined, { rejectWithValue }) => {
        try {
            const data = await customerService.getAllCustomers(params);
            console.log('Fetch customers result:', data);
            return data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch customers';
            return rejectWithValue(message);
        }
    }
);

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<CustomerPageResponse>) => {
                state.loading = false;
                if (!action.payload) {
                    state.error = 'No data received';
                    return;
                }
                state.customers = action.payload.content || [];
                state.pagination = {
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                    currentPage: action.payload.number || 0,
                    size: action.payload.size || 20
                };
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default customerSlice.reducer;
