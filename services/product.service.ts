import axiosInstance from '@/lib/axios';
import { Product, PageResponse, ProductApiResponse, ProductQueryParams, ProductFiltersResponse, ProductRequest, AdminCategory, AdminBrand } from '../types/product';

export const productService = {
    async getProducts(params?: ProductQueryParams): Promise<PageResponse<Product>> {
        const response = await axiosInstance.get<ProductApiResponse<PageResponse<Product>>>('/api/products', {
            params
        });
        console.log('API Response [/api/products]:', response.data);
        return response.data?.data || { content: [], totalElements: 0, totalPages: 0, size: 12, number: 0 };
    },

    async getProductById(id: string): Promise<Product> {
        const response = await axiosInstance.get<ProductApiResponse<Product>>(`/api/products/${id}`);
        return response.data.data;
    },

    async getProductFilters(): Promise<ProductFiltersResponse> {
        const response = await axiosInstance.get<ProductApiResponse<ProductFiltersResponse>>('/api/products/filters');
        return response.data.data;
    },

    async searchProducts(params: { q: string, page?: number, size?: number }): Promise<PageResponse<Product>> {
        const response = await axiosInstance.get<ProductApiResponse<PageResponse<Product>>>('/api/products/search', {
            params
        });
        return response.data.data;
    },

    // Admin APIs
    async createProduct(request: ProductRequest): Promise<Product> {
        const response = await axiosInstance.post<ProductApiResponse<Product>>('/api/admin/products', request);
        return response.data.data;
    },

    async updateProduct(id: string, request: ProductRequest): Promise<Product> {
        const response = await axiosInstance.put<ProductApiResponse<Product>>(`/api/admin/products/${id}`, request);
        return response.data.data;
    },

    async deleteProduct(id: string): Promise<void> {
        await axiosInstance.delete(`/api/admin/products/${id}`);
    },

    async getAdminCategories(): Promise<AdminCategory[]> {
        const response = await axiosInstance.get<ProductApiResponse<AdminCategory[]>>('/api/admin/categories');
        return response.data.data || [];
    },

    async getAdminBrands(): Promise<AdminBrand[]> {
        const response = await axiosInstance.get<ProductApiResponse<AdminBrand[]>>('/api/admin/brands');
        return response.data.data || [];
    },

    async getInventoryStats(): Promise<any> {
        const response = await axiosInstance.get<ProductApiResponse<any>>('/api/admin/dashboard');
        return response.data.data;
    }
};
