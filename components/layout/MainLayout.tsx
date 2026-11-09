'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    // Đóng menu mobile khi chuyển trang
    useEffect(() => setMenuOpen(false), [pathname]);

    return (
        <div className={styles.layout}>
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <div className={styles.main}>
                <Header onMenuClick={() => setMenuOpen(true)} />
                <main className={styles.content}>{children}</main>
                <Footer />
            </div>
        </div>
    );
}
