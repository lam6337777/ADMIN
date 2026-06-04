'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  Circle,
  Star
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: '/' },
  { icon: ShoppingBag, label: 'Đơn hàng', href: '/orders' },
  { icon: Package, label: 'Sản phẩm', href: '/products' },
  { icon: Users, label: 'Khách hàng', href: '/customers' },
  { icon: BarChart3, label: 'Đổi trả', href: '/returns' },
  { icon: Star, label: 'Đánh giá', href: '/reviews' },
  { icon: Users, label: 'Hỗ trợ', href: '/support' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Circle size={20} fill="white" />
        </div>
        <span className={styles.logoText}>SOLEADMIN</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link
          href="/settings"
          className={`${styles.navItem} ${pathname === '/settings' ? styles.navItemActive : ''}`}
        >
          <Settings size={20} />
          <span>Cài đặt</span>
        </Link>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
              alt="Avatar"
              width={40}
              height={40}
            />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Alex Rivera</span>
            <span className={styles.userRole}>Quản lý cửa hàng</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
