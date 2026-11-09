'use client';

import React from 'react';
import { Table } from 'antd';
import Link from 'next/link'; // Thêm Link component
import styles from './RecentOrdersTable.module.css';
import { OrderStatusTag } from '@/lib/orderStatus';

const columns = [
    {
        title: 'MÃ ĐƠN HÀNG',
        dataIndex: 'orderCode',
        render: (code: string, record: any) => <Link href={`/orders/${record.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>#{code}</Link>,
    },
    {
        title: 'KHÁCH HÀNG',
        key: 'customer',
        render: (_: any, record: any) => (
            <div className={styles.userCell}>
                <div className={styles.avatar}>
                    {record.shippingName ? record.shippingName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{record.shippingName || 'Không có tên'}</span>
            </div>
        ),
    },
    {
        title: 'NGÀY',
        dataIndex: 'createdAt',
        render: (date: string) => <span style={{ color: 'var(--text-secondary)' }}>{new Date(date).toLocaleDateString('vi-VN')}</span>,
    },
    {
        title: 'TRẠNG THÁI',
        dataIndex: 'status',
        render: (status: string) => <OrderStatusTag status={status} />,
    },
    {
        title: 'TỔNG CỘNG',
        dataIndex: 'totalAmount',
        align: 'right' as const,
        render: (total: number) => <span className={styles.amount}>{total?.toLocaleString('vi-VN')}đ</span>,
    },
];

interface RecentOrdersTableProps {
    orders: any[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Đơn hàng gần đây</h2>
                <Link href="/orders" className={styles.viewAll}>Xem tất cả</Link>
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                pagination={false}
                rowKey="id"
                className="custom-table"
            />
        </div>
    );
}
