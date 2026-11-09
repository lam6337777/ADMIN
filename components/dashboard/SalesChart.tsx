'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './SalesChart.module.css';
import { useAppSelector } from '@/store/redux/hooks';
import { RootState } from '@/store/redux/store';
import { formatVND } from '@/lib/orderStatus';

const compact = (v: number) =>
    v >= 1e9 ? `${(v / 1e9).toFixed(1)} tỷ` : v >= 1e6 ? `${(v / 1e6).toFixed(1)} tr` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : `${v}`;

export default function SalesChart() {
    const { stats } = useAppSelector((state: RootState) => state.dashboard);
    const data = stats?.revenueChart || [];
    const total = data.reduce((s, d) => s + (d.value || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2 className={styles.title}>Doanh thu 7 ngày gần nhất</h2>
                    <p className={styles.subtitle}>Chỉ tính đơn đã thanh toán, không gồm đơn hủy hoặc trả hàng</p>
                </div>
                <div className={styles.total}>
                    <span>Tổng 7 ngày</span>
                    <strong>{formatVND(total)}</strong>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                {stats && total === 0 && <div className={styles.empty}>Chưa có doanh thu từ đơn đã thanh toán trong 7 ngày qua</div>}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ea893" stopOpacity={0.28} />
                                <stop offset="100%" stopColor="#0ea893" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dfeae7" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#5f7471', fontSize: 12 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5f7471', fontSize: 12 }} tickFormatter={compact} width={52} />
                        <Tooltip
                            formatter={(v: number) => [formatVND(v), 'Doanh thu']}
                            contentStyle={{ borderRadius: 12, border: '1px solid #dfeae7', boxShadow: '0 8px 24px rgba(16,35,31,0.08)' }}
                            cursor={{ stroke: '#94eedb' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#0ea893"
                            strokeWidth={2.5}
                            fill="url(#revFill)"
                            dot={{ r: 3.5, fill: '#0ea893', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#088777' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
