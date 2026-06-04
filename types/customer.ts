export interface Customer {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    totalSpent?: number;
    totalOrders?: number;
}

export interface CustomerPageResponse {
    content: Customer[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
