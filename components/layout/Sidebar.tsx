'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    RotateCcw,
    Users,
    Package,
    Star,
    TicketPercent,
    Truck,
    MessageCircle,
    Bell,
    X,
    ExternalLink,
    type LucideIcon,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchDashboardStats } from '@/store/redux/slices/dashboardSlice';
import { RootState } from '@/store/redux/store';

type NavItem = { icon: LucideIcon; label: string; href: string; badge?: 'pendingOrders' };
type Tone = 'teal' | 'sky' | 'violet' | 'coral' | 'amber';

const NAV_GROUPS: { title?: string; tone: Tone; items: NavItem[] }[] = [
    { tone: 'teal', items: [{ icon: LayoutDashboard, label: 'Tổng quan', href: '/' }] },
    {
        title: 'Bán hàng',
        tone: 'sky',
        items: [
            { icon: ShoppingBag, label: 'Đơn hàng', href: '/orders', badge: 'pendingOrders' },
            { icon: RotateCcw, label: 'Đổi trả · Bảo hành', href: '/returns' },
            { icon: Users, label: 'Khách hàng', href: '/customers' },
        ],
    },
    {
        title: 'Sản phẩm',
        tone: 'violet',
        items: [
            { icon: Package, label: 'Kho sản phẩm', href: '/inventory' },
            { icon: Star, label: 'Đánh giá', href: '/reviews' },
        ],
    },
    {
        title: 'Khuyến mãi & vận chuyển',
        tone: 'coral',
        items: [
            { icon: TicketPercent, label: 'Mã giảm giá', href: '/vouchers' },
            { icon: Truck, label: 'Phí ship', href: '/shipping' },
        ],
    },
    {
        title: 'Chăm sóc khách hàng',
        tone: 'amber',
        items: [
            { icon: MessageCircle, label: 'Hỗ trợ', href: '/support' },
            { icon: Bell, label: 'Thông báo', href: '/notifications' },
        ],
    },
];

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

function isActive(pathname: string, href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname() || '/';
    const dispatch = useAppDispatch();
    const stats = useAppSelector((state: RootState) => state.dashboard.stats);

    // Số đơn chờ xác nhận cho badge — tải 1 lần và làm mới khi có đơn mới qua websocket
    useEffect(() => {
        if (!stats) dispatch(fetchDashboardStats());
        const refresh = () => dispatch(fetchDashboardStats());
        window.addEventListener('admin_new_order', refresh);
        return () => window.removeEventListener('admin_new_order', refresh);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    return (
        <>
            <div className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`} onClick={onClose} aria-hidden />
            <aside className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Điều hướng quản trị">
                <div className={styles.brand}>
                    <Link href="/" className={styles.logo} onClick={onClose}>
                        <span className={styles.logoMark}>PF</span>
                        <span className={styles.logoText}>
                            PF. Shoes
                            <small>Quản trị cửa hàng</small>
                        </span>
                    </Link>
                    <button className={styles.close} onClick={onClose} aria-label="Đóng menu">
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {NAV_GROUPS.map((group, gi) => (
                        <div key={gi} className={`${styles.group} ${styles[group.tone]}`}>
                            {group.title && <div className={styles.groupTitle}>{group.title}</div>}
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(pathname, item.href);
                                const count = item.badge ? stats?.[item.badge] ?? 0 : 0;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`${styles.navItem} ${active ? styles.active : ''}`}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        <span className={styles.iconChip}>
                                            <Icon size={16} />
                                        </span>
                                        <span className={styles.label}>{item.label}</span>
                                        {count > 0 && (
                                            <span className={styles.badge} title={`${count} đơn chờ xác nhận`}>
                                                {count > 99 ? '99+' : count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className={styles.storeLink}>
                    <span>Xem cửa hàng</span>
                    <ExternalLink size={15} />
                </a>
            </aside>
        </>
    );
}
