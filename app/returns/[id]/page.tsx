'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Package,
    ClipboardList,
    MessageSquare,
    CheckCircle,
    XCircle,
    Calendar,
    Tag as TagIcon
} from 'lucide-react';
import { Button, Modal, Input, Tag, message, Spin, Divider } from 'antd';
import styles from './page.module.css';
import { supportService } from '@/services/support.service';
import { ReturnRequest } from '@/types/support';

export default function ReturnDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<ReturnRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (id) {
            fetchRequest();
        }
    }, [id]);

    const fetchRequest = async () => {
        setLoading(true);
        try {
            const data = await supportService.getReturnRequestById(Number(id));
            setRequest(data);
            setAdminNote(data.adminNote || '');
        } catch (error) {
            console.error('Error fetching return request:', error);
            message.error('Không thể tải chi tiết yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!request) return;
        try {
            await supportService.approveReturnRequest(request.id, adminNote);
            message.success('Duyệt yêu cầu thành công');
            setIsApproveModalOpen(false);
            fetchRequest();
        } catch (error) {
            console.error('Error approving request:', error);
            message.error('Lỗi khi duyệt yêu cầu');
        }
    };

    const handleReject = async () => {
        if (!request) return;
        if (!adminNote.trim()) {
            message.warning('Vui lòng cung cấp lý do từ chối trong Ghi chú của Admin');
            return;
        }
        try {
            await supportService.rejectReturnRequest(request.id, adminNote);
            message.success('Từ chối yêu cầu thành công');
            setIsRejectModalOpen(false);
            fetchRequest();
        } catch (error) {
            console.error('Error rejecting request:', error);
            message.error('Lỗi khi từ chối yêu cầu');
        }
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'PENDING': return <Tag color="gold">CHỜ DUYỆT</Tag>;
            case 'APPROVED': return <Tag color="green">ĐÃ DUYỆT</Tag>;
            case 'REJECTED': return <Tag color="red">TỪ CHỐI</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const getTypeTag = (type: string) => {
        switch (type) {
            case 'RETURN': return <Tag color="blue">HOÀN HÀNG</Tag>;
            case 'EXCHANGE': return <Tag color="orange">ĐỔI HÀNG</Tag>;
            case 'WARRANTY': return <Tag color="purple">BẢO HÀNH</Tag>;
            default: return <Tag>{type}</Tag>;
        }
    };

    if (loading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className={styles.container}>
                <Button
                    type="text"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => router.back()}
                    className={styles.backButton}
                >
                    Quay lại danh sách
                </Button>
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <h2>Không tìm thấy yêu cầu</h2>
                    <p>Yêu cầu hỗ trợ bạn đang tìm kiếm không tồn tại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => router.back()}>
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Chi tiết Yêu cầu Hỗ trợ</h1>
                    <span className={styles.orderCode}>Đơn hàng #{request.orderCode}</span>
                </div>
                <div className={styles.actionButtons}>
                    {request.status === 'PENDING' && (
                        <>
                            <Button
                                danger
                                icon={<XCircle size={16} />}
                                onClick={() => setIsRejectModalOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                Từ chối
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircle size={16} />}
                                onClick={() => setIsApproveModalOpen(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--text-primary)', borderColor: 'var(--text-primary)' }}
                            >
                                Duyệt
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.mainInfo}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><ClipboardList size={20} /> Thông tin Yêu cầu</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Mã yêu cầu</label>
                                <p>#{request.id}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Trạng thái</label>
                                <div>{getStatusTag(request.status)}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Loại yêu cầu</label>
                                <div>{getTypeTag(request.type)}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Ngày tạo</label>
                                <p>{new Date(request.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                        <Divider />
                        <div className={styles.infoItem}>
                            <label>Lý do {request.type === 'RETURN' ? 'hoàn hàng' : request.type === 'EXCHANGE' ? 'đổi hàng' : 'bảo hành'}</label>
                            <div className={styles.reasonBox}>
                                {request.reason}
                            </div>
                        </div>

                        {request.adminNote && (
                            <div className={styles.adminNoteSection}>
                                <label>Ghi chú của Admin</label>
                                <div className={styles.adminNoteBox}>
                                    {request.adminNote}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Package size={20} /> Sản phẩm {request.type === 'RETURN' ? 'hoàn trả' : 'trao đổi'}</h2>
                        <div className={`${styles.itemRow} ${styles.itemHeader}`}>
                            <span>Sản phẩm</span>
                            <span>Kích thước</span>
                            <span>Màu sắc</span>
                            <span>Số lượng</span>
                        </div>
                        {request.returnItems.map(item => (
                            <div key={item.id} className={styles.itemRow}>
                                <span className={styles.productName}>{item.productName}</span>
                                <span>{item.size}</span>
                                <span>{item.color}</span>
                                <span>{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><User size={20} /> Khách hàng</h2>
                        <div className={styles.infoItem} style={{ marginBottom: '1rem' }}>
                            <label>Họ và tên</label>
                            <p>{request.user?.fullName}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Email</label>
                            <p>{request.user?.email}</p>
                        </div>
                        <Divider />
                        <Button
                            block
                            icon={<MessageSquare size={16} />}
                            onClick={() => router.push(`/support?userId=${request.user?.id}`)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            Nhắn tin với khách hàng
                        </Button>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><Calendar size={20} /> Lịch sử</h2>
                        <div className={styles.infoItem}>
                            <label>Ngày gửi yêu cầu</label>
                            <p>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        {request.status !== 'PENDING' && (
                            <div className={styles.infoItem} style={{ marginTop: '1rem' }}>
                                <label>Ngày xử lý</label>
                                <p>Vừa cập nhật</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="Duyệt Yêu cầu Hỗ trợ"
                open={isApproveModalOpen}
                onOk={handleApprove}
                onCancel={() => setIsApproveModalOpen(false)}
                okText="Duyệt"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn duyệt yêu cầu {request.type === 'RETURN' ? 'hoàn hàng' : request.type === 'EXCHANGE' ? 'đổi hàng' : 'bảo hành'} này?</p>
                {request.type === 'EXCHANGE' && (
                    <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '15px' }}>
                        <strong>Đổi hàng:</strong>
                        <p>Một đơn hàng mới sẽ được tự động tạo sau khi duyệt.</p>
                    </div>
                )}
                <div style={{ marginBottom: '10px' }}>
                    <label>Ghi chú của Admin (Tùy chọn):</label>
                    <Input.TextArea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Cung cấp thông tin vận chuyển hoặc hướng dẫn bổ sung..."
                        rows={4}
                    />
                </div>
            </Modal>

            <Modal
                title="Từ chối Yêu cầu Hỗ trợ"
                open={isRejectModalOpen}
                onOk={handleReject}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn <strong>từ chối</strong> yêu cầu {request.type === 'RETURN' ? 'hoàn hàng' : request.type === 'EXCHANGE' ? 'đổi hàng' : 'bảo hành'} này?</p>
                <div style={{ marginBottom: '10px' }}>
                    <label>Lý do từ chối (Bắt buộc):</label>
                    <Input.TextArea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Vui lòng giải thích lý do từ chối yêu cầu..."
                        rows={4}
                    />
                </div>
            </Modal>
        </div>
    );
}
