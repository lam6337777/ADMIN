'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import styles from './SalesChart.module.css';

import { useAppSelector } from '@/store/redux/hooks';
import { RootState } from '@/store/redux/store';

export default function SalesChart() {
    const { stats } = useAppSelector((state: RootState) => state.dashboard);
    const data = stats?.revenueChart || [];
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h2 className={styles.title}>Phân tích doanh số</h2>
                    <p className={styles.subtitle}>Hiệu suất doanh thu trong 30 ngày qua</p>
                </div>
                <select className={styles.filter}>
                    <option>30 ngày qua</option>
                    <option>60 ngày qua</option>
                    <option>90 ngày qua</option>
                </select>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#737373', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #E5E5E5',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#000000"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#000000', strokeWidth: 2, stroke: '#FFFFFF' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
