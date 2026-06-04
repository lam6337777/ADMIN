import axiosInstance from '@/lib/axios';

import { Order } from '@/types/order';

export interface DashboardStats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    ordersToday: number;
    revenueToday: number;
    pendingOrders: number;
    shippingOrders: number;
    lowStockAlerts: number;
    outOfStock: number;
    totalInventoryValue: number;
    avgOrderValue: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    avgLifetimeValue: number;
    recentOrders: Order[];
    revenueChart: { name: string; value: number }[];
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const response = await axiosInstance.get('/api/admin/dashboard');
        console.log('API Response [/api/admin/dashboard]:', response.data);
        return response.data?.data;
    }
};
