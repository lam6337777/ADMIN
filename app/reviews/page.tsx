'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, Button, Popconfirm, Rate, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Star, Trash2 } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import { ReviewResponse } from '@/types/review';
import { assetUrl } from '@/lib/orderStatus';

const PAGE_SIZE = 10;

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reviewService.getAllReviews(page, PAGE_SIZE);
            setReviews(data.content);
            setTotal(data.totalElements ?? data.content.length);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
            message.error('Không tải được danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id: number) => {
        try {
            await reviewService.deleteReview(id);
            message.success('Đã xóa đánh giá');
            fetchReviews();
        } catch {
            message.error('Xóa thất bại');
        }
    };

    const columns: ColumnsType<ReviewResponse> = [
        {
            title: 'KHÁCH HÀNG',
            key: 'user',
            width: 200,
            render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar src={r.avatarUrl ? assetUrl(r.avatarUrl) : undefined} style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', flexShrink: 0 }}>
                        {r.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <span style={{ fontWeight: 600 }}>{r.fullName}</span>
                </div>
            ),
        },
        {
            title: 'SẢN PHẨM',
            key: 'product',
            width: 260,
            render: (_, r) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/inventory/${r.productId}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.productName}
                    </Link>
                    {r.orderCode && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Đơn #{r.orderCode}</span>}
                </div>
            ),
        },
        {
            title: 'ĐÁNH GIÁ',
            dataIndex: 'rating',
            width: 150,
            render: (v: number) => <Rate disabled value={v} style={{ fontSize: 14, color: '#f59e0b' }} />,
        },
        {
            title: 'NỘI DUNG',
            dataIndex: 'comment',
            render: (v: string) => (v ? <span style={{ whiteSpace: 'pre-line' }}>{v}</span> : <span style={{ color: 'var(--text-secondary)' }}>Không có nội dung</span>),
        },
        {
            title: 'NGÀY',
            dataIndex: 'createdAt',
            width: 120,
            render: (v: string) => <span style={{ color: 'var(--text-secondary)' }}>{new Date(v).toLocaleDateString('vi-VN')}</span>,
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            align: 'right',
            render: (_, r) => (
                <Popconfirm title="Xóa đánh giá này?" okText="Xóa" cancelText="Không" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(r.id)}>
                    <Button type="text" danger icon={<Trash2 size={16} />} aria-label="Xóa đánh giá" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="page-title">
                        <Star size={24} /> Đánh giá
                    </h1>
                    <p className="page-subtitle">Phản hồi của khách sau khi nhận hàng. Xóa các đánh giá spam hoặc vi phạm.</p>
                </div>
            </div>

            <div className="page-card">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={reviews}
                    loading={loading}
                    scroll={{ x: 900 }}
                    locale={{ emptyText: 'Chưa có đánh giá nào' }}
                    pagination={{
                        current: page + 1,
                        pageSize: PAGE_SIZE,
                        total,
                        showSizeChanger: false,
                        onChange: (p) => setPage(p - 1),
                    }}
                />
            </div>
        </div>
    );
}
