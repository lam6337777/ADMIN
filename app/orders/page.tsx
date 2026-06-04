'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Eye, Calendar, Package, Check, Truck, ShoppingBag, Clock, DollarSign, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Table, Select, DatePicker, Button, Tag, message } from 'antd';
import styles from './page.module.css';
import StatCard from '@/components/ui/StatCard';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchOrders } from '@/store/redux/slices/orderSlice';
import { fetchDashboardStats } from '@/store/redux/slices/dashboardSlice';
import { RootState } from '@/store/redux/store';
import { orderService } from '@/services/order.service';

const { RangePicker } = DatePicker;

export default function OrdersPage() {
    const dispatch = useAppDispatch();
    const { orders, pagination, loading } = useAppSelector((state: RootState) => state.orders);
    const { stats } = useAppSelector((state: RootState) => state.dashboard);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all-status');
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);
    const [pageSize, setPageSize] = useState(20);

    // Debounce tìm kiếm để tránh gọi API quá nhiều
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const loadOrders = useCallback((page = 0, size = pageSize) => {
        const params: any = { page, size };
        if (statusFilter !== 'all-status') params.status = statusFilter;
        if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
        if (dateRange) {
            params.startDate = dateRange[0];
            params.endDate = dateRange[1];
        }
        dispatch(fetchOrders(params));
    }, [dispatch, statusFilter, debouncedSearchTerm, dateRange, pageSize]);

    useEffect(() => {
        loadOrders();
        // Chỉ fetch dashboard stats một lần hoặc khi cần thiết
    }, [loadOrders]);

    useEffect(() => {
        if (!stats) {
            dispatch(fetchDashboardStats());
        }
    }, [dispatch, stats]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleRangeChange = (dates: any, dateStrings: [string, string]) => {
        if (dateStrings[0] && dateStrings[1]) {
            // Định dạng ISO Date Time cho Spring Boot
            setDateRange([`${dateStrings[0]}T00:00:00`, `${dateStrings[1]}T23:59:59`]);
        } else {
            setDateRange(null);
        }
    };

    const handleAction = async (id: number, newStatus: string, actionName: string) => {
        try {
            await orderService.updateOrderStatus(id, newStatus);
            message.success(`${actionName} thành công`);
            loadOrders(pagination.currentPage);
        } catch (error: any) {
            message.error(error.message || `${actionName} thất bại`);
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return styles.statusPending;
            case 'CONFIRMED': return styles.statusProcessing;
            case 'SHIPPING': return styles.statusShipped;
            case 'DELIVERED': return styles.statusDelivered;
            case 'CANCELLED': return styles.statusCancelled;
            default: return '';
        }
    };

    const columns = [
        {
            title: 'MÃ ĐƠN HÀNG',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <span className={styles.orderId}>#{text}</span>
        },
        {
            title: 'KHÁCH HÀNG',
            key: 'customer',
            render: (_: any, record: any) => (
                <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{record.shippingName || 'Không có tên'}</span>
                    <span className={styles.customerEmail}>{record.shippingPhone}</span>
                </div>
            )
        },
        {
            title: 'NGÀY',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{new Date(text).toLocaleString()}</span>
        },
        {
            title: 'SẢN PHẨM',
            key: 'items',
            render: (_: any, record: any) => (
                <div className={styles.itemsCell}>
                    <div className={styles.itemThumbnails}>
                        {record.items?.slice(0, 3).map((item: any, index: number) => (
                            <div key={item.id} className={styles.thumbnailWrapper} style={{ zIndex: 10 - index }}>
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.productName} className={styles.thumbnail} />
                                ) : (
                                    <div className={styles.thumbnailPlaceholder}>
                                        <Package size={12} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {record.items?.length > 3 && (
                            <div className={styles.moreItems}>+{record.items.length - 3}</div>
                        )}
                    </div>
                    <span className={styles.itemCount}>{record.items?.length || 0} sản phẩm</span>
                </div>
            )
        },
        {
            title: 'TỔNG CỘNG',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (total: number) => <span style={{ fontWeight: 700 }}>{total?.toLocaleString('vi-VN')}đ</span>
        },
        {
            title: 'THANH TOÁN',
            key: 'payment',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Tag color="default">{record.paymentMethod}</Tag>
                    <Tag color={record.paymentStatus === 'PAID' ? 'success' : 'warning'} style={{ fontSize: '10px' }}>
                        {record.paymentStatus}
                    </Tag>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={`${styles.statusTag} ${getStatusClass(status)}`}>
                    {status}
                </span>
            )
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            render: (_: any, record: any) => (
                <div className={styles.actions}>
                    <Link href={`/orders/${record.id}`} title="Xem chi tiết">
                        <Eye size={18} className={styles.actionIcon} />
                    </Link>
                    {record.status === 'PENDING' && (
                        <Check
                            size={18}
                            className={`${styles.actionIcon} ${styles.actionConfirm}`}
                            onClick={() => handleAction(record.id, 'CONFIRMED', 'Xác nhận đơn hàng')}
                        />
                    )}
                    {record.status === 'CONFIRMED' && (
                        <Truck
                            size={18}
                            className={`${styles.actionIcon} ${styles.actionShip}`}
                            onClick={() => handleAction(record.id, 'SHIPPING', 'Bắt đầu giao hàng')}
                        />
                    )}
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Quản lý đơn hàng</h1>
                    <p>Theo dõi, quản lý và xử lý đơn hàng của khách hàng.</p>
                </div>
                <button className={styles.exportButton}>
                    <Download size={16} />
                    <span>Xuất CSV</span>
                </button>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm mã đơn, tên khách, sđt..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                    />
                </div>
                <RangePicker
                    className={styles.datePicker}
                    onChange={handleRangeChange}
                    placeholder={['Từ ngày', 'Đến ngày']}
                />
                <Select
                    value={statusFilter}
                    className={styles.select}
                    onChange={handleStatusFilterChange}
                    options={[
                        { value: 'all-status', label: 'Tất cả trạng thái' },
                        { value: 'PENDING', label: 'Chờ xử lý' },
                        { value: 'CONFIRMED', label: 'Đã xác nhận' },
                        { value: 'SHIPPING', label: 'Đang giao' },
                        { value: 'DELIVERED', label: 'Đã giao' },
                        { value: 'RETURNED', label: 'Đã hoàn hàng' },
                        { value: 'CANCELLED', label: 'Đã hủy' },
                    ]}
                />
                <Button type="primary" icon={<Search size={14} />} onClick={() => loadOrders()}>Lọc</Button>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    dataSource={orders}
                    columns={columns}
                    pagination={false}
                    loading={loading}
                    rowKey="id"
                    className="custom-table"
                />
            </div>

            <div className={styles.pagination}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={styles.paginationText}>
                        Hiển thị {orders.length} trong số {pagination.totalElements} đơn hàng
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={styles.paginationText} style={{ fontSize: '0.8125rem' }}>Số dòng hiển thị:</span>
                        <Select
                            value={pageSize}
                            onChange={(val) => {
                                setPageSize(val);
                                // Tải lại từ trang đầu với kích thước mới
                                loadOrders(0, val);
                            }}
                            size="small"
                            style={{ width: '80px' }}
                            options={[
                                { value: 10, label: '10' },
                                { value: 20, label: '20' },
                                { value: 50, label: '50' },
                                { value: 100, label: '100' }
                            ]}
                        />
                    </div>
                </div>
                <div className={styles.paginationBtns}>
                    <button
                        className={styles.pageBtn}
                        disabled={pagination.currentPage === 0 || loading}
                        onClick={() => loadOrders(pagination.currentPage - 1)}
                    >
                        Trước
                    </button>
                    <button
                        className={`${styles.pageBtn} ${pagination.currentPage === (pagination.totalPages || 1) - 1 ? '' : styles.pageBtnActive}`}
                        disabled={pagination.currentPage >= (pagination.totalPages || 1) - 1 || loading}
                        onClick={() => loadOrders(pagination.currentPage + 1)}
                    >
                        Tiếp
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <StatCard
                    title="TỔNG ĐƠN HÀNG"
                    value={stats ? stats.totalOrders?.toLocaleString() : '---'}
                    icon={ShoppingBag}
                />
                <StatCard
                    title="ĐƠN ĐANG CHỜ"
                    value={stats ? stats.pendingOrders?.toLocaleString() : '---'}
                    icon={Clock}
                />
                <StatCard
                    title="TỔNG DOANH THU"
                    value={stats ? `${stats.totalRevenue?.toLocaleString('vi-VN')}đ` : '---'}
                    icon={DollarSign}
                />
                <StatCard
                    title="GIÁ TRỊ ĐƠN TRUNG BÌNH"
                    value={stats ? `${Math.round(stats.avgOrderValue || 0).toLocaleString('vi-VN')}đ` : '---'}
                    icon={BarChart3}
                />
            </div>
        </div>
    );
}
