'use client';

import React, { useEffect } from 'react';
import styles from "./page.module.css";
import StatCard from "@/components/ui/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import { DollarSign, Truck, Users, AlertTriangle, Package } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/redux/hooks";
import { fetchDashboardStats } from "@/store/redux/slices/dashboardSlice";
import { RootState } from "@/store/redux/store";

export default function Home() {
    const dispatch = useAppDispatch();
    const { stats, loading } = useAppSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    return (
        <div className={styles.container}>
            <div className={styles.titleGroup}>
                <h1 className={styles.title}>Tổng quan Doanh số & Đơn hàng</h1>
                <p className={styles.subtitle}>Chào mừng trở lại. Dưới đây là tình hình cửa hàng hôm nay.</p>
            </div>

            <div className={styles.statsGrid}>
                <StatCard
                    title="Tổng doanh thu"
                    value={stats ? `${stats.totalRevenue?.toLocaleString('vi-VN')}đ` : '---'}
                    trend="+12.5%"
                    isUp={true}
                    subtext="so với tháng trước"
                    icon={DollarSign}
                />
                <StatCard
                    title="Đơn hàng "
                    value={stats ? stats.totalOrders?.toLocaleString() : '---'}
                    trend="+5.0%"
                    isUp={true}
                    subtext={`${stats?.pendingOrders || 0} đơn đang chờ`}
                    icon={Truck}
                />
                <StatCard
                    title="Tổng khách hàng"
                    value={stats ? stats.totalUsers?.toLocaleString() : '---'}
                    trend="+8.2%"
                    isUp={true}
                    subtext="Tất cả người dùng"
                    icon={Users}
                />
                <StatCard
                    title="Tổng sản phẩm"
                    value={stats ? stats.totalProducts?.toLocaleString() : '---'}
                    trend="-2.1%"
                    isUp={false}
                    subtext="Đang bán tại cửa hàng"
                    icon={Package}
                />
            </div>

            <SalesChart />

            <RecentOrdersTable orders={stats?.recentOrders || []} />
        </div>
    );
}
