'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Printer,
    Truck,
    CreditCard,
    User,
    MapPin,
    Calendar,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Steps, Tag, Button, Divider, Select, message, Spin } from 'antd';
import styles from './page.module.css';
import { orderService } from '@/services/order.service';
import { Order } from '@/types/order';

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (params.id) {
                    const data = await orderService.getOrderById(Number(params.id));
                    setOrder(data);
                }
            } catch (error: any) {
                message.error('Không thể tải thông tin đơn hàng');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            setUpdating(true);
            const updatedOrder = await orderService.updateOrderStatus(Number(params.id), newStatus);
            setOrder(updatedOrder);
            message.success('Cập nhật trạng thái thành công');
        } catch (error: any) {
            message.error(error.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };



    if (!order) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} color="var(--error)" />
                <h2>Không tìm thấy đơn hàng</h2>
                <Button onClick={() => router.push('/orders')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const getStatusTagColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'success';
            case 'SHIPPING': return 'processing';
            case 'CONFIRMED': return 'cyan';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            case 'RETURN_REQUESTED':
            case 'EXCHANGE_REQUESTED':
            case 'WARRANTY_REQUESTED': return 'warning';
            case 'RETURNED':
            case 'EXCHANGED':
            case 'WARRANTY_COMPLETED': return 'default';
            default: return 'default';
        }
    };

    const getStepCurrent = (status: string) => {
        switch (status) {
            case 'PENDING': return 0;
            case 'CONFIRMED': return 1;
            case 'SHIPPING': return 2;
            case 'DELIVERED': return 3;
            case 'CANCELLED': return -1;
            case 'RETURN_REQUESTED':
            case 'EXCHANGE_REQUESTED':
            case 'WARRANTY_REQUESTED': return 4;
            case 'RETURNED':
            case 'EXCHANGED':
            case 'WARRANTY_COMPLETED': return 5;
            default: return 0;
        }
    };

    const formatCurrency = (value?: number | null) => (value ?? 0).toLocaleString('vi-VN');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.backLink} onClick={() => router.push('/orders')}>
                        <ChevronLeft size={18} />
                        <span>Quay lại Đơn hàng</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1>Đơn hàng #{order.orderCode}</h1>
                        <Tag color={getStatusTagColor(order.status)}>{order.status}</Tag>
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Select
                        value={order.status}
                        style={{ width: 160 }}
                        loading={updating}
                        onChange={handleStatusChange}
                        options={[
                            { value: 'PENDING', label: 'Chờ duyệt' },
                            { value: 'CONFIRMED', label: 'Đã xác nhận' },
                            { value: 'SHIPPING', label: 'Đang giao' },
                            { value: 'DELIVERED', label: 'Đã giao' },
                            { value: 'CANCELLED', label: 'Đã hủy' }
                        ]}
                    />
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Package size={20} /> Sản phẩm đơn hàng</h2>
                        <div className={styles.itemsList}>
                            {(order.items || []).map(item => (
                                <div key={item.id} className={styles.orderItem}>
                                    <div className={styles.itemImageContainer}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className={styles.itemImage} />
                                        ) : (
                                            <div className={styles.itemImagePlaceholder}>
                                                <Package size={24} color="#ccc" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.productName}</span>
                                        <span className={styles.itemSku}>Size: {item.size} / Color: {item.color}</span>
                                        {item.isReviewed && <Tag color="green" style={{ marginTop: 4, width: 'fit-content' }}>Đã đánh giá</Tag>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={styles.itemPrice}>{formatCurrency(item.unitPrice)}đ x {item.quantity}</div>
                                        <div style={{ fontWeight: 800 }}>{formatCurrency(item.totalPrice)}đ</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 24, maxWidth: 350, marginLeft: 'auto' }}>
                            <div className={styles.summaryRow}>
                                <span>Tạm tính</span>
                                <span>{formatCurrency(order.subtotal)}đ</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Phí giao hàng</span>
                                <span>{formatCurrency(order.shippingFee)}đ</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Giảm giá</span>
                                <span style={{ color: 'var(--error)' }}>-{formatCurrency(order.discountAmount)}đ</span>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <div className={styles.totalRow}>
                                <span>Tổng cộng</span>
                                <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{formatCurrency(order.totalAmount)}đ</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Truck size={20} /> Trạng thái xử lý</h2>
                        <div className={styles.timeline}>
                            <Steps
                                current={getStepCurrent(order.status)}
                                size="small"
                                items={[
                                    { title: 'Chờ duyệt' },
                                    { title: 'Đã xác nhận' },
                                    { title: 'Đang giao' },
                                    { title: 'Đã giao' },
                                    { title: 'Đổi/Trả/Hoàn' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><User size={20} /> Khách hàng</h2>
                        <div className={styles.customerSection}>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Tên</div>
                                <div className={styles.value}>{order.user?.fullName || order.shippingName}</div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Email</div>
                                <div className={styles.value}>{order.user?.email || 'N/A'}</div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Số điện thoại</div>
                                <div className={styles.value}>{order.user?.phone || order.shippingPhone}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><MapPin size={20} /> Địa chỉ giao hàng</h2>
                        <div className={styles.value} style={{ lineHeight: 1.6 }}>
                            {order.shippingAddress}
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <div className={styles.label} style={{ marginBottom: 4 }}>Ghi chú</div>
                            <div className={styles.value}>{order.note || 'Không có ghi chú'}</div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><CreditCard size={20} /> Thanh toán</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className={styles.label}>Phương thức:</div>
                                <div className={styles.value}>{order.paymentMethod}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className={styles.label}>Trạng thái:</div>
                                <Tag color={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                                    {order.paymentStatus}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
