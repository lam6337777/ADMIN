import axiosInstance from '@/lib/axios';
import { ProductApiResponse } from '../types/product';

export interface Voucher {
    id: number;
    code: string;
    description: string | null;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    maxDiscount: number | null;
    minOrderValue: number;
    startAt: string | null;
    endAt: string | null;
    usageLimit: number | null;
    usedCount: number;
    perUserLimit: number | null;
    isActive: boolean;
    createdAt: string;
}

export type VoucherRequest = Omit<Voucher, 'id' | 'usedCount' | 'createdAt'>;

export interface ShippingRate {
    id: number;
    province: string;
    fee: number;
    estimatedDays: string | null;
}

export const promotionService = {
    async getVouchers(): Promise<Voucher[]> {
        const res = await axiosInstance.get<ProductApiResponse<Voucher[]>>('/api/admin/vouchers');
        return res.data.data;
    },
    async createVoucher(data: VoucherRequest): Promise<Voucher> {
        const res = await axiosInstance.post<ProductApiResponse<Voucher>>('/api/admin/vouchers', data);
        return res.data.data;
    },
    async updateVoucher(id: number, data: VoucherRequest): Promise<Voucher> {
        const res = await axiosInstance.put<ProductApiResponse<Voucher>>(`/api/admin/vouchers/${id}`, data);
        return res.data.data;
    },
    async deleteVoucher(id: number): Promise<void> {
        await axiosInstance.delete(`/api/admin/vouchers/${id}`);
    },

    async getShippingRates(): Promise<ShippingRate[]> {
        const res = await axiosInstance.get<ProductApiResponse<ShippingRate[]>>('/api/admin/shipping-rates');
        return res.data.data;
    },
    async saveShippingRate(data: Omit<ShippingRate, 'id'>): Promise<ShippingRate> {
        const res = await axiosInstance.put<ProductApiResponse<ShippingRate>>('/api/admin/shipping-rates', data);
        return res.data.data;
    },
    async deleteShippingRate(id: number): Promise<void> {
        await axiosInstance.delete(`/api/admin/shipping-rates/${id}`);
    },
};
