'use client';

import React, { useState, useEffect } from 'react';
import { reviewService } from '@/services/review.service';
import { ReviewResponse } from '@/types/review';
import { Star, Trash2, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getAllReviews(page, 10);
      setReviews(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(id);
      fetchReviews();
    } catch (error) {
      alert('Xóa thất bại');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Đánh giá</h1>
          <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest">Quản lý phản hồi từ khách hàng</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Khách hàng</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Sản phẩm</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Đánh giá</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nội dung</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ngày</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">Đang tải dữ liệu...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">Chưa có đánh giá nào</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden">
                        {review.avatarUrl ? (
                          <img src={review.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400">{review.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tight">{review.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-tight">{review.productName}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">SKU: {review.productId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={10} 
                          fill={s <= review.rating ? "black" : "none"} 
                          className={s <= review.rating ? "text-black" : "text-zinc-200"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs text-zinc-600 line-clamp-2 max-w-xs">{review.comment}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Trang {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50"
              >
                Trước
              </button>
              <button 
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
