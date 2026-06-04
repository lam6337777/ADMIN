import axiosInstance from '@/lib/axios';
import { Order, OrderPageResponse } from '../types/order';

export const orderService = {
    async getAllOrders(params?: { status?: string, search?: string, startDate?: string, endDate?: string, page?: number, size?: number }): Promise<OrderPageResponse> {
        const response = await axiosInstance.get('/api/admin/orders', { params });
        console.log('API Response [/api/admin/orders]:', response.data);
        return response.data?.data || { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
    },

    async getOrderById(id: number): Promise<Order> {
        const response = await axiosInstance.get(`/api/admin/orders/${id}`);
        return response.data.data;
    },

    async updateOrderStatus(id: number, status: string): Promise<Order> {
        const response = await axiosInstance.put(`/api/admin/orders/${id}/status`, null, {
            params: { status }
        });
        return response.data.data;
    }
};
