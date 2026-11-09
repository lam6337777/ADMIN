'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    DollarSign,
    Star,
    Edit3,
    Clock,
    User,
    AlertCircle
} from 'lucide-react';
import { Table, Tag, Button, Tabs, message, Spin, Modal, Form, Input, Select } from 'antd';
import styles from './page.module.css';
import { OrderStatusTag } from '@/lib/orderStatus';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types/customer';
import { Order } from '@/types/order';
import axiosInstance from '@/lib/axios';

export default function CustomerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [form] = Form.useForm();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                if (params.id) {
                    const data = await customerService.getCustomerById(Number(params.id));
                    setCustomer(data);
                    form.setFieldsValue({
                        fullName: data.fullName,
                        phone: data.phone,
                        role: data.role
                    });
                    fetchOrders();
                }
            } catch (error: any) {
                message.error('Không thể tải thông tin khách hàng');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchOrders = async () => {
            setOrderLoading(true);
            try {
                const response = await axiosInstance.get(`/api/admin/users/${params.id}/orders`);
                setOrders(response.data?.data?.content || []);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setOrderLoading(false);
            }
        };

        const fetchReviews = async () => {
            setReviewLoading(true);
            try {
                const response = await axiosInstance.get(`/api/admin/users/${params.id}/reviews`);
                setReviews(response.data?.data?.content || []);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setReviewLoading(false);
            }
        };

        fetchCustomerData();
        fetchReviews();
    }, [params.id, form]);

    const handleEditSubmit = async (values: any) => {
        setUpdating(true);
        try {
            const updated = await customerService.updateCustomer(Number(params.id), values);
            setCustomer(updated);
            message.success('Cập nhật hồ sơ thành công');
            setIsEditModalOpen(false);
        } catch (error: any) {
            message.error(error.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" tip="Đang tải thông tin khách hàng..." />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} color="var(--error)" />
                <h2>Không tìm thấy khách hàng</h2>
                <Button onClick={() => router.push('/customers')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const columns = [
        {
            title: 'MÃ ĐƠN HÀNG',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <span style={{ fontWeight: 700 }}>#{text}</span>
        },
        {
            title: 'NGÀY',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'TỔNG CỘNG',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (total: number) => <span style={{ fontWeight: 700 }}>{total.toLocaleString('vi-VN')}đ</span>
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <OrderStatusTag status={status} />
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="link" onClick={() => router.push(`/orders/${record.id}`)}>Xem</Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.backLink} onClick={() => router.push('/customers')}>
                        <ChevronLeft size={18} />
                        <span>Quay lại Khách hàng</span>
                    </div>
                    <h1>Hồ sơ Khách hàng</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        danger={customer.isActive}
                        onClick={async () => {
                            try {
                                await customerService.toggleUserStatus(customer.id);
                                setCustomer({ ...customer, isActive: !customer.isActive });
                                message.success(`Đã ${customer.isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`);
                            } catch (error) {
                                message.error('Thao tác thất bại');
                            }
                        }}
                    >
                        {customer.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<Edit3 size={16} />} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Chỉnh sửa hồ sơ
                    </Button>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    <div className={`${styles.card} ${styles.profileCard}`}>
                        <div className={styles.avatarWrapper}>
                            {customer.avatarUrl ? (
                                <img src={customer.avatarUrl} alt={customer.fullName} className={styles.avatarLarge} />
                            ) : (
                                <div className={styles.avatarPlaceholderLarge}>
                                    {customer.fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h2 className={styles.customerName}>{customer.fullName}</h2>
                        <span className={styles.customerEmail}>{customer.email}</span>
                        <Tag color={customer.isActive ? 'success' : 'error'} style={{ fontWeight: 700 }}>
                            {customer.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Tag>

                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Tổng Số Đơn</span>
                                <span className={styles.statValue}>{customer.totalOrders || 0}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Tổng Chi Tiêu</span>
                                <span className={styles.statValue}>{customer.totalSpent?.toLocaleString('vi-VN') || 0}đ</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><User size={20} /> Thông tin cá nhân</h2>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Số điện thoại</span>
                                <span className={styles.value}><Phone size={14} /> {customer.phone || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Vai trò</span>
                                <span className={styles.value}><Star size={14} /> {customer.role}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Thành viên từ</span>
                                <span className={styles.value}><Calendar size={14} /> {new Date(customer.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.card} style={{ padding: 0 }}>
                        <Tabs
                            defaultActiveKey="1"
                            style={{ padding: '0 24px' }}
                            items={[
                                {
                                    key: '1',
                                    label: `Lịch sử mua hàng (${orders.length})`,
                                    children: (
                                        <div style={{ paddingBottom: 24 }}>
                                            <Table
                                                dataSource={orders}
                                                columns={columns}
                                                pagination={{ pageSize: 5 }}
                                                loading={orderLoading}
                                                rowKey="id"
                                                className="custom-table"
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: '2',
                                    label: `Đánh giá (${reviews.length})`,
                                    children: (
                                        <div style={{ paddingBottom: 24 }}>
                                            <Table
                                                dataSource={reviews}
                                                columns={[
                                                    {
                                                        title: 'SẢN PHẨM',
                                                        key: 'product',
                                                        render: (_: any, record: any) => (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <img src={record.productImage} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                                                <span style={{ fontSize: '0.8125rem' }}>{record.productName}</span>
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        title: 'ĐÁNH GIÁ',
                                                        dataIndex: 'rating',
                                                        key: 'rating',
                                                        render: (rating: number) => (
                                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star 
                                                                        key={i} 
                                                                        size={12} 
                                                                        fill={i < rating ? "#fadb14" : "none"} 
                                                                        color={i < rating ? "#fadb14" : "#d9d9d9"} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        title: 'NỘI DUNG',
                                                        dataIndex: 'comment',
                                                        key: 'comment',
                                                        render: (text: string) => <span style={{ fontSize: '0.8125rem' }}>{text}</span>
                                                    },
                                                    {
                                                        title: 'NGÀY',
                                                        dataIndex: 'createdAt',
                                                        key: 'createdAt',
                                                        render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
                                                    }
                                                ]}
                                                pagination={{ pageSize: 5 }}
                                                loading={reviewLoading}
                                                rowKey="id"
                                                className="custom-table"
                                                locale={{ emptyText: 'Chưa có đánh giá nào' }}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: '3',
                                    label: 'Danh sách yêu thích',
                                    children: <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có sản phẩm nào.</div>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <Modal
                title="Chỉnh sửa hồ sơ khách hàng"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    initialValues={{
                        fullName: customer.fullName,
                        phone: customer.phone,
                        role: customer.role
                    }}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select>
                            <Select.Option value="CUSTOMER">CUSTOMER</Select.Option>
                            <Select.Option value="ADMIN">ADMIN</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item className={styles.formActions}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={updating}>
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
