'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    Truck,
    CreditCard,
    User,
    MapPin,
    Calendar,
    Package,
    AlertCircle,
    Ticket,
    History,
    Check,
    X,
    PackageCheck,
} from 'lucide-react';
import { Steps, Tag, Button, Popconfirm, Timeline, message, Spin } from 'antd';
import styles from './page.module.css';
import { orderService } from '@/services/order.service';
import { Order } from '@/types/order';
import {
    assetUrl,
    formatVND,
    NEXT_STATUSES,
    ORDER_STATUS,
    OrderStatusTag,
    orderStatusLabel,
    PAYMENT_METHOD,
    PaymentStatusTag,
} from '@/lib/orderStatus';

const ITEM_STATUS_LABEL: Record<string, string> = {
    RETURN_REQUESTED: 'Đang yêu cầu trả',
    RETURNED: 'Đã trả',
    EXCHANGE_REQUESTED: 'Đang yêu cầu đổi',
    EXCHANGED: 'Đã đổi',
    WARRANTY_REQUESTED: 'Đang yêu cầu bảo hành',
    WARRANTY_REPAIRING: 'Đang bảo hành',
    WARRANTY_COMPLETED: 'Đã bảo hành',
};

/** Nút hành động cho từng trạng thái kế tiếp */
const ACTION: Record<string, { label: string; icon: React.ReactNode; danger?: boolean; confirm: string }> = {
    CONFIRMED: { label: 'Xác nhận đơn', icon: <Check size={16} />, confirm: 'Xác nhận đơn hàng này?' },
    SHIPPING: { label: 'Bắt đầu giao', icon: <Truck size={16} />, confirm: 'Chuyển đơn sang trạng thái đang giao?' },
    DELIVERED: { label: 'Đã giao thành công', icon: <PackageCheck size={16} />, confirm: 'Xác nhận khách đã nhận hàng? Đơn COD sẽ được đánh dấu đã thanh toán.' },
    CANCELLED: { label: 'Hủy đơn', icon: <X size={16} />, danger: true, confirm: 'Hủy đơn này? Tồn kho và lượt dùng mã giảm giá sẽ được hoàn lại.' },
};

const MAIN_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

function stepIndex(status: string) {
    const i = MAIN_STEPS.indexOf(status);
    return i === -1 ? MAIN_STEPS.length : i; // các trạng thái sau giao hàng → hoàn tất 4 bước
}

const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString('vi-VN') : '');

export default function OrderDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setOrder(await orderService.getOrderById(id));
        } catch (error) {
            console.error(error);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) load();
    }, [id, load]);

    const changeStatus = async (next: string) => {
        try {
            setUpdating(next);
            setOrder(await orderService.updateOrderStatus(id, next));
            message.success(`Đã chuyển sang "${orderStatusLabel(next)}"`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || error.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} color="var(--color-down)" />
                <h2>Không tìm thấy đơn hàng</h2>
                <Link href="/orders">
                    <Button>Quay lại danh sách</Button>
                </Link>
            </div>
        );
    }

    const nextStatuses = NEXT_STATUSES[order.status] || [];
    const cancelled = order.status === 'CANCELLED';
    const history = order.statusHistory?.length
        ? [...order.statusHistory].reverse()
        : [{ status: 'PENDING' as const, note: 'Đơn hàng được tạo', createdAt: order.createdAt }];
    const afterSales = !MAIN_STEPS.includes(order.status) && !cancelled;

    return (
        <div className={styles.container}>
            <Link href="/orders" className={styles.backLink}>
                <ChevronLeft size={18} />
                <span>Đơn hàng</span>
            </Link>

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleRow}>
                        <h1>Đơn hàng #{order.orderCode}</h1>
                        <OrderStatusTag status={order.status} />
                    </div>
                    <p className={styles.meta}>
                        <Calendar size={14} />
                        Đặt lúc {fmtDateTime(order.createdAt)}
                        {order.deliveredAt && <> · Giao lúc {fmtDateTime(order.deliveredAt)}</>}
                    </p>
                </div>
                {nextStatuses.length > 0 && (
                    <div className={styles.actions}>
                        {nextStatuses.map((s) => {
                            const a = ACTION[s];
                            if (!a) return null;
                            return (
                                <Popconfirm
                                    key={s}
                                    title={a.confirm}
                                    okText="Đồng ý"
                                    cancelText="Không"
                                    okButtonProps={{ danger: a.danger }}
                                    onConfirm={() => changeStatus(s)}
                                >
                                    <Button
                                        type={a.danger ? 'default' : 'primary'}
                                        danger={a.danger}
                                        icon={a.icon}
                                        loading={updating === s}
                                        disabled={!!updating && updating !== s}
                                    >
                                        {a.label}
                                    </Button>
                                </Popconfirm>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={styles.card}>
                {cancelled ? (
                    <div className={styles.cancelBanner}>
                        <X size={18} /> Đơn hàng đã bị hủy — tồn kho và lượt dùng mã giảm giá đã được hoàn lại.
                    </div>
                ) : (
                    <Steps
                        current={stepIndex(order.status)}
                        size="small"
                        items={MAIN_STEPS.map((s) => ({ title: ORDER_STATUS[s].label }))}
                    />
                )}
                {afterSales && (
                    <div className={styles.afterSales}>
                        Sau bán hàng: <OrderStatusTag status={order.status} />
                        <Link href="/returns">Xem yêu cầu đổi/trả →</Link>
                    </div>
                )}
            </div>

            <div className={styles.mainContent}>
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <Package size={18} /> Sản phẩm ({order.items?.length || 0})
                        </h2>
                        <div className={styles.itemsList}>
                            {(order.items || []).map((item) => (
                                <div key={item.id} className={styles.orderItem}>
                                    <div className={styles.itemImageContainer}>
                                        {item.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={assetUrl(item.imageUrl)} alt={item.productName} className={styles.itemImage} />
                                        ) : (
                                            <div className={styles.itemImagePlaceholder}>
                                                <Package size={22} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        {item.productId ? (
                                            <Link href={`/inventory/${item.productId}`} className={styles.itemName}>
                                                {item.productName}
                                            </Link>
                                        ) : (
                                            <span className={styles.itemName}>{item.productName}</span>
                                        )}
                                        <span className={styles.itemSku}>
                                            Size {item.size}
                                            {item.color && <> · {item.color}</>}
                                        </span>
                                        <div className={styles.itemTags}>
                                            {item.status && item.status !== 'ACTIVE' && (
                                                <Tag color="volcano">{ITEM_STATUS_LABEL[item.status] || item.status}</Tag>
                                            )}
                                            {item.isReviewed && <Tag color="green">Đã đánh giá</Tag>}
                                        </div>
                                    </div>
                                    <div className={styles.itemPrices}>
                                        <div className={styles.itemUnit}>
                                            {formatVND(item.unitPrice)} × {item.quantity}
                                        </div>
                                        <div className={styles.itemTotal}>{formatVND(item.totalPrice)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>Tạm tính</span>
                                <span>{formatVND(order.subtotal)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Phí vận chuyển</span>
                                <span>{order.shippingFee > 0 ? formatVND(order.shippingFee) : <Tag color="green">Miễn phí</Tag>}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                    <span className={styles.inline}>
                                        <Ticket size={15} /> Giảm giá
                                        {order.voucherCode && <Tag color="cyan" className={styles.voucherTag}>{order.voucherCode}</Tag>}
                                    </span>
                                    <span>-{formatVND(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className={styles.totalRow}>
                                <span>Khách cần trả</span>
                                <span className={styles.totalValue}>{formatVND(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <History size={18} /> Lịch sử trạng thái
                        </h2>
                        <Timeline
                            className={styles.history}
                            items={history.map((h, i) => ({
                                color: i === 0 ? (h.status === 'CANCELLED' ? 'red' : 'green') : 'gray',
                                children: (
                                    <div>
                                        <div className={styles.historyHead}>
                                            <strong>{orderStatusLabel(h.status)}</strong>
                                            <span>{fmtDateTime(h.createdAt)}</span>
                                        </div>
                                        {h.note && <div className={styles.historyNote}>{h.note}</div>}
                                    </div>
                                ),
                            }))}
                        />
                        {!order.statusHistory?.length && (
                            <p className={styles.historyHint}>Đơn được tạo trước khi có tính năng ghi lịch sử nên chỉ hiển thị mốc đặt hàng.</p>
                        )}
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <User size={18} /> Khách hàng
                        </h2>
                        <div className={styles.customerSection}>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Tên tài khoản</div>
                                <div className={styles.value}>{order.user?.fullName || 'Khách vãng lai'}</div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Email</div>
                                <div className={styles.value}>{order.user?.email || '—'}</div>
                            </div>
                            {order.user?.id && (
                                <Link href={`/customers/${order.user.id}`} className={styles.link}>
                                    Xem hồ sơ khách hàng →
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <MapPin size={18} /> Giao hàng
                        </h2>
                        <div className={styles.customerSection}>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Người nhận</div>
                                <div className={styles.value}>
                                    {order.shippingName} · <a href={`tel:${order.shippingPhone}`}>{order.shippingPhone}</a>
                                </div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Địa chỉ</div>
                                <div className={styles.value}>{order.shippingAddress}</div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Ghi chú của khách</div>
                                <div className={order.note ? styles.noteBox : styles.value}>{order.note || 'Không có'}</div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <CreditCard size={18} /> Thanh toán
                        </h2>
                        <div className={styles.customerSection}>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Phương thức</div>
                                <div className={styles.value}>{PAYMENT_METHOD[order.paymentMethod] || order.paymentMethod}</div>
                            </div>
                            <div className={styles.customerInfoGroup}>
                                <div className={styles.label}>Trạng thái</div>
                                <div>
                                    <PaymentStatusTag status={order.paymentStatus} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
