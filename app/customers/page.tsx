'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Phone, MapPin, Users, UserPlus, UserCheck, TrendingUp, Power } from 'lucide-react';
import Link from 'next/link';
import { Table, Select, Button, Tag, Avatar, message, Popconfirm, Tooltip } from 'antd';
import styles from './page.module.css';
import StatCard from '@/components/ui/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchCustomers } from '@/store/redux/slices/customerSlice';
import { fetchDashboardStats } from '@/store/redux/slices/dashboardSlice';
import { RootState } from '@/store/redux/store';
import { customerService } from '@/services/customer.service';

export default function CustomersPage() {
    const dispatch = useAppDispatch();
    const { customers, pagination, loading } = useAppSelector((state: RootState) => state.customers);
    const { stats } = useAppSelector((state: RootState) => state.dashboard);

    const [searchTerm, setSearchTerm] = useState('');

    const loadCustomers = useCallback((page = 0) => {
        dispatch(fetchCustomers({ page, size: 20 }));
    }, [dispatch]);

    useEffect(() => {
        loadCustomers();
        if (!stats) {
            dispatch(fetchDashboardStats());
        }
    }, [dispatch, stats, loadCustomers]);

    const handleToggleStatus = async (id: number) => {
        try {
            await customerService.toggleUserStatus(id);
            message.success('Cập nhật trạng thái thành công');
            loadCustomers(pagination.currentPage);
        } catch (error: any) {
            message.error(error.message || 'Cập nhật trạng thái thất bại');
        }
    };

    const getGradeClass = (role: string) => {
        switch (role) {
            case 'ADMIN': return styles.gradeVip;
            case 'CUSTOMER': return styles.gradeRegular;
            default: return styles.gradeNew;
        }
    };

    const columns = [
        {
            title: 'KHÁCH HÀNG',
            key: 'customer',
            render: (_: any, record: any) => (
                <div className={styles.customerCell}>
                    <img
                        src={record.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.id}`}
                        alt={record.fullName}
                        className={styles.avatar}
                    />
                    <div className={styles.customerInfo}>
                        <Link href={`/customers/${record.id}`} className={styles.customerName}>{record.fullName}</Link>
                        <span className={styles.customerEmail}>{record.email}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'SỐ ĐIỆN THOẠI',
            dataIndex: 'phone',
            key: 'phone',
            render: (text: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{text || 'N/A'}</span>
        },
        {
            title: 'VAI TRÒ',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <span className={`${styles.gradeTag} ${getGradeClass(role)}`}>
                    {role}
                </span>
            )
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'NGÀY TẠO',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(text).toLocaleDateString()}</span>
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            render: (_: any, record: any) => (
                <div className={styles.actions}>
                    <Link href={`/customers/${record.id}`}>
                        <Tooltip title="Sửa chi tiết">
                            <Edit2 size={18} className={styles.actionIcon} />
                        </Tooltip>
                    </Link>
                    <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                        <Power 
                            size={18} 
                            className={`${styles.actionIcon} ${record.isActive ? styles.actionDisable : styles.actionEnable}`} 
                            onClick={() => handleToggleStatus(record.id)}
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Quản lý khách hàng</h1>
                    <p>Xem và quản lý thông tin khách hàng cũng như lịch sử mua hàng của họ.</p>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    dataSource={customers}
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    rowKey="id"
                    className="custom-table"
                />
            </div>

            <div className={styles.pagination}>
                <span className={styles.paginationText}>
                    Hiển thị {pagination.currentPage * pagination.size + 1} đến {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)} trong số {pagination.totalElements} khách hàng
                </span>
                <div className={styles.paginationBtns}>
                    <button
                        className={styles.pageBtn}
                        disabled={pagination.currentPage === 0}
                        onClick={() => dispatch(fetchCustomers({ page: pagination.currentPage - 1 }))}
                    >
                        Trước
                    </button>
                    <button
                        className={`${styles.pageBtn} ${styles.pageBtnActive}`}
                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                        onClick={() => dispatch(fetchCustomers({ page: pagination.currentPage + 1 }))}
                    >
                        Tiếp
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard
                    title="TỔNG KHÁCH HÀNG"
                    value={stats ? stats.totalUsers?.toLocaleString() : '---'}
                    icon={Users}
                />
                <StatCard
                    title="MỚI TRONG THÁNG"
                    value={stats ? stats.newCustomersThisMonth?.toLocaleString() : '---'}
                    icon={UserPlus}
                />
                <StatCard
                    title="KHÁCH ĐANG HOẠT ĐỘNG"
                    value={stats ? stats.activeCustomers?.toLocaleString() : '---'}
                    icon={UserCheck}
                />
                <StatCard
                    title="GIÁ TRỊ VÒNG ĐỜI TRUNG BÌNH"
                    value={stats ? `${Math.round(stats.avgLifetimeValue || 0).toLocaleString('vi-VN')}đ` : '---'}
                    icon={TrendingUp}
                />
            </div>
        </div>
    );
}
