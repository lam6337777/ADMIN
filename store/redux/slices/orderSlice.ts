import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '@/services/order.service';
import { Order, OrderPageResponse } from '@/types/order';

interface OrderState {
    orders: Order[];
    pagination: {
        totalElements: number;
        totalPages: number;
        currentPage: number;
        size: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    pagination: {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 20
    },
    loading: false,
    error: null,
};

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (params: { status?: string, search?: string, startDate?: string, endDate?: string, page?: number, size?: number } | undefined, { rejectWithValue }) => {
        try {
            const data = await orderService.getAllOrders(params);
            console.log('Fetch orders result:', data);
            return data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch orders';
            return rejectWithValue(message);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<OrderPageResponse>) => {
                state.loading = false;
                if (!action.payload) {
                    state.error = 'No data received';
                    return;
                }
                state.orders = action.payload.content || [];
                state.pagination = {
                    totalElements: action.payload.totalElements || 0,
                    totalPages: action.payload.totalPages || 0,
                    currentPage: action.payload.number || 0,
                    size: action.payload.size || 20
                };
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default orderSlice.reducer;
