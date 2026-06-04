import axiosInstance from '@/lib/axios';
import { Customer, CustomerPageResponse } from '../types/customer';

export const customerService = {
    async getAllCustomers(params?: { page?: number, size?: number }): Promise<CustomerPageResponse> {
        const response = await axiosInstance.get('/api/admin/users', { params });
        console.log('API Response [/api/admin/users]:', response.data);
        return response.data?.data || { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 };
    },

    async getCustomerById(id: number): Promise<Customer> {
        const response = await axiosInstance.get(`/api/admin/users/${id}`);
        return response.data.data;
    },

    async toggleUserStatus(id: number): Promise<Customer> {
        const response = await axiosInstance.put(`/api/admin/users/${id}/status`);
        return response.data.data;
    },

    async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
        const response = await axiosInstance.put(`/api/admin/users/${id}`, data);
        return response.data.data;
    }
};
