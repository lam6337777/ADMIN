'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.left}>
                <div className={styles.logoIcon}>
                    <Plus size={12} color="white" strokeWidth={4} />
                </div>
                <span className={styles.copyright}>Admin PF © 2024</span>
            </div>

            <div className={styles.links}>
                <Link href="/help" className={styles.link}>Help Center</Link>
                <Link href="/privacy" className={styles.link}>Privacy</Link>
                <a href="http://localhost:8082/swagger-ui/index.html" target="_blank" rel="noopener noreferrer" className={styles.link}>API Documentation</a>
            </div>
        </footer>
    );
}
