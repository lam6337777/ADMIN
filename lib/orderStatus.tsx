import { Tag } from 'antd';

/** Nhãn + màu (antd Tag preset) cho trạng thái đơn hàng — dùng chung toàn bộ Admin */
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'gold' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
    SHIPPING: { label: 'Đang giao', color: 'purple' },
    DELIVERED: { label: 'Đã giao', color: 'green' },
    CANCELLED: { label: 'Đã hủy', color: 'default' },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', color: 'volcano' },
    RETURNED: { label: 'Đã trả hàng', color: 'default' },
    PARTIALLY_RETURNED: { label: 'Đã trả một phần', color: 'default' },
    EXCHANGE_REQUESTED: { label: 'Yêu cầu đổi hàng', color: 'volcano' },
    EXCHANGED: { label: 'Đã đổi hàng', color: 'cyan' },
    WARRANTY_REQUESTED: { label: 'Yêu cầu bảo hành', color: 'volcano' },
    WARRANTY_REPAIRING: { label: 'Đang bảo hành', color: 'purple' },
    WARRANTY_COMPLETED: { label: 'Bảo hành xong', color: 'cyan' },
};

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'gold' },
    PENDING: { label: 'Chờ thanh toán', color: 'gold' },
    PAID: { label: 'Đã thanh toán', color: 'green' },
    COMPLETED: { label: 'Đã thanh toán', color: 'green' },
    FAILED: { label: 'Thất bại', color: 'red' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'default' },
    PARTIALLY_REFUNDED: { label: 'Hoàn tiền một phần', color: 'default' },
};

export const PAYMENT_METHOD: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    VNPAY: 'VNPay',
};

/** Các bước admin được phép chuyển — khớp với OrderService.validateStatusTransition ở backend */
export const NEXT_STATUSES: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED', 'CANCELLED'],
};

export function orderStatusLabel(status: string) {
    return ORDER_STATUS[status]?.label ?? status;
}

export function OrderStatusTag({ status }: { status: string }) {
    const s = ORDER_STATUS[status];
    return <Tag color={s?.color ?? 'default'} style={{ marginInlineEnd: 0, width: 'fit-content' }}>{s?.label ?? status}</Tag>;
}

export function PaymentStatusTag({ status }: { status: string }) {
    const s = PAYMENT_STATUS[status];
    return <Tag color={s?.color ?? 'default'} style={{ marginInlineEnd: 0, width: 'fit-content' }}>{s?.label ?? status}</Tag>;
}

export const formatVND = (value?: number | null) => `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}₫`;

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

/** Ảnh lưu dạng đường dẫn tương đối (/uploads/...) cần gắn host backend */
export function assetUrl(url?: string | null) {
    if (!url) return '';
    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}
