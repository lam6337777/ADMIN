export interface OrderItem {
    id: number;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string;
    isReviewed?: boolean;
    productId?: string;
    status?: string;
}

export interface StatusHistory {
    status: Order['status'];
    note: string | null;
    createdAt: string;
}

export interface Order {
    id: number;
    orderCode: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'PARTIALLY_RETURNED' | 'EXCHANGE_REQUESTED' | 'EXCHANGED' | 'WARRANTY_REQUESTED' | 'WARRANTY_REPAIRING' | 'WARRANTY_COMPLETED';
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    voucherCode?: string | null;
    totalAmount: number;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    note: string;
    createdAt: string;
    deliveredAt?: string | null;
    statusHistory?: StatusHistory[];
    user?: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
    };
    items: OrderItem[];
}

export interface OrderPageResponse {
    content: Order[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
