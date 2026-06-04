import axiosInstance from '@/lib/axios';
import { ReviewResponse } from '../types/review';
import { PageResponse, ProductApiResponse } from '../types/product';

export const reviewService = {
    async getAllReviews(page = 0, size = 10): Promise<PageResponse<ReviewResponse>> {
        const response = await axiosInstance.get<ProductApiResponse<PageResponse<ReviewResponse>>>('/api/admin/reviews', {
            params: { page, size }
        });
        return response.data.data;
    },

    async deleteReview(id: number): Promise<void> {
        await axiosInstance.delete(`/api/admin/reviews/${id}`);
    }
};
