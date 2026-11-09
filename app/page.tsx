'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import StatCard from '@/components/ui/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import { Wallet, ShoppingBag, Users, Package, Clock, Truck, AlertTriangle, ArrowRight, TicketPercent } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchDashboardStats } from '@/store/redux/slices/dashboardSlice';
import { RootState } from '@/store/redux/store';
import { formatVND } from '@/lib/orderStatus';

const num = (v?: number | null) => (v ?? 0).toLocaleString('vi-VN');

export default function Home() {
    const dispatch = useAppDispatch();
    const { stats, error } = useAppSelector((state: RootState) => state.dashboard) as any;

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    const dash = '—';

    const tasks = stats
        ? [
              { icon: Clock, label: 'Đơn chờ xác nhận', value: stats.pendingOrders, href: '/orders', tone: 'amber' },
              { icon: Truck, label: 'Đơn đang giao', value: stats.shippingOrders, href: '/orders', tone: 'violet' },
              { icon: AlertTriangle, label: 'Sắp hết hàng (<10 đôi)', value: stats.lowStockAlerts, href: '/inventory', tone: 'coral' },
              { icon: Package, label: 'Sản phẩm hết hàng', value: stats.outOfStock, href: '/inventory', tone: 'coral' },
          ]
        : [];

    return (
        <div className={styles.container}>
            <section className={styles.hero}>
                <div className={styles.heroText}>
                    <span className={styles.heroEyebrow}>Tổng quan cửa hàng</span>
                    <h1 className={styles.title}>Hôm nay shop thế nào?</h1>
                    <p className={styles.subtitle}>
                        {stats
                            ? `${num(stats.ordersToday)} đơn mới · doanh thu ${formatVND(stats.revenueToday)} · ${num(stats.pendingOrders)} đơn đang chờ bạn xác nhận`
                            : 'Doanh số, đơn hàng và những việc cần xử lý hôm nay.'}
                    </p>
                </div>
                <div className={styles.heroActions}>
                    <Link href="/orders" className={styles.heroBtn}>
                        <ShoppingBag size={16} /> Xử lý đơn hàng
                    </Link>
                    <Link href="/vouchers" className={styles.heroBtnGhost}>
                        <TicketPercent size={16} /> Tạo mã giảm giá
                    </Link>
                </div>
                <span className={styles.blob1} aria-hidden />
                <span className={styles.blob2} aria-hidden />
            </section>

            {error && !stats && <div className={styles.error}>Không tải được số liệu tổng quan. Kiểm tra backend (cổng 8082) rồi tải lại trang.</div>}

            <div className={styles.statsGrid}>
                <StatCard
                    title="Tổng doanh thu"
                    value={stats ? formatVND(stats.totalRevenue) : dash}
                    subtext={stats ? `Hôm nay: ${formatVND(stats.revenueToday)}` : undefined}
                    icon={Wallet}
                />
                <StatCard
                    title="Đơn hàng"
                    value={stats ? num(stats.totalOrders) : dash}
                    subtext={stats ? `Hôm nay: ${num(stats.ordersToday)} · TB ${formatVND(stats.avgOrderValue)}/đơn` : undefined}
                    icon={ShoppingBag}
                    tone="sky"
                />
                <StatCard
                    title="Khách hàng"
                    value={stats ? num(stats.totalUsers) : dash}
                    subtext={stats ? `+${num(stats.newCustomersThisMonth)} trong tháng này` : undefined}
                    icon={Users}
                    tone="violet"
                />
                <StatCard
                    title="Sản phẩm"
                    value={stats ? num(stats.totalProducts) : dash}
                    subtext={stats ? `Giá trị tồn kho: ${formatVND(stats.totalInventoryValue)}` : undefined}
                    icon={Package}
                    tone="coral"
                />
            </div>

            {stats && (
                <div className={styles.tasks}>
                    {tasks.map((t) => {
                        const Icon = t.icon;
                        return (
                            <Link key={t.label} href={t.href} className={`${styles.task} ${t.value > 0 ? styles[t.tone] : styles.done}`}>
                                <Icon size={18} />
                                <span className={styles.taskValue}>{num(t.value)}</span>
                                <span className={styles.taskLabel}>{t.label}</span>
                                <ArrowRight size={16} className={styles.taskArrow} />
                            </Link>
                        );
                    })}
                </div>
            )}

            <SalesChart />

            <RecentOrdersTable orders={stats?.recentOrders || []} />
        </div>
    );
}
