import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    isUp?: boolean;
    subtext?: string;
    icon?: LucideIcon;
}

export default function StatCard({
    title,
    value,
    trend,
    isUp,
    subtext,
    icon: Icon
}: StatCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                {Icon && (
                    <div className={styles.iconWrapper}>
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <span className={styles.value}>{value}</span>
            </div>

            <div className={styles.footer}>
                {trend && (
                    <span className={isUp ? styles.trendUp : styles.trendDown}>
                        {trend}
                    </span>
                )}
                {subtext && <span className={styles.subtext}>{subtext}</span>}
            </div>
        </div>
    );
}
