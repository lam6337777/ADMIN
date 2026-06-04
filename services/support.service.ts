import axiosInstance from '@/lib/axios';
import { ProductApiResponse as ApiResponse } from '../types/product';
import { ReturnRequest, ChatMessage, ChatUser } from '../types/support';

export const supportService = {
    // Return Requests
    getAllReturnRequests: async () => {
        const response = await axiosInstance.get<ApiResponse<ReturnRequest[]>>('/api/return-requests');
        return response.data.data;
    },

    getReturnRequestById: async (id: number) => {
        const response = await axiosInstance.get<ApiResponse<ReturnRequest>>(`/api/return-requests/${id}`);
        return response.data.data;
    },

    approveReturnRequest: async (id: number, adminNote: string) => {
        const response = await axiosInstance.post<ApiResponse<ReturnRequest>>(`/api/return-requests/${id}/approve?adminNote=${encodeURIComponent(adminNote)}`);
        return response.data.data;
    },

    // Chat
    getChatUsers: async () => {
        const response = await axiosInstance.get<ApiResponse<ChatUser[]>>('/api/chat/users');
        return response.data.data;
    },

    getMessages: async (userId: number) => {
        const response = await axiosInstance.get<ApiResponse<ChatMessage[]>>(`/api/chat/messages/${userId}`);
        return response.data.data;
    },

    sendMessage: async (userId: number, content: string) => {
        const response = await axiosInstance.post<ApiResponse<ChatMessage>>(`/api/chat/send?receiverId=${userId}`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
        return response.data.data;
    },

    rejectReturnRequest: async (id: number, adminNote: string) => {
        const response = await axiosInstance.post<ApiResponse<ReturnRequest>>(`/api/return-requests/${id}/reject?adminNote=${encodeURIComponent(adminNote)}`);
        return response.data.data;
    },

    markAsRead: async () => {
        const response = await axiosInstance.post<ApiResponse<string>>('/api/chat/read');
        return response.data.data;
    }
};
