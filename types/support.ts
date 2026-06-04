export type ReturnRequestType = 'RETURN' | 'EXCHANGE' | 'WARRANTY';
export type ReturnRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReturnRequestItem {
    id: number;
    productName: string;
    size: string;
    color: string;
    quantity: number;
}

export interface ReturnRequest {
    id: number;
    orderCode: string;
    type: ReturnRequestType;
    reason: string;
    status: ReturnRequestStatus;
    adminNote?: string;
    createdAt: string;
    returnItems: ReturnRequestItem[];
    user?: {
        id: number;
        fullName: string;
        email: string;
    };
}

export interface ChatMessage {
    id: number;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: number;
        fullName: string;
        role: string;
    };
    receiver: {
        id: number;
        fullName: string;
        role: string;
    };
}

export interface ChatUser {
    id: number;
    fullName: string;
    email: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}
