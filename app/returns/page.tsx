'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, CheckCircle, XCircle, Package, Clock } from 'lucide-react';
import { Table, Button, Input, Modal, Tag, message } from 'antd';
import styles from './page.module.css';
import { supportService } from '@/services/support.service';
import { ReturnRequest } from '@/types/support';

export default function ReturnsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // State lưu trữ từ khóa tìm kiếm khách hàng/đơn hàng

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await supportService.getAllReturnRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching return requests:', error);
            message.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request: ReturnRequest) => {
        setSelectedRequest(request);
        setIsApproveModalOpen(true);
    };

    const handleReject = (request: ReturnRequest) => {
        setSelectedRequest(request);
        setIsRejectModalOpen(true);
    };

    const submitApprove = async () => {
        if (!selectedRequest) return;
        try {
            await supportService.approveReturnRequest(selectedRequest.id, adminNote);
            message.success('Yêu cầu đã được phê duyệt');
            setIsApproveModalOpen(false);
            setAdminNote('');
            fetchRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            message.error('Phê duyệt yêu cầu thất bại');
        }
    };

    const submitReject = async () => {
        if (!selectedRequest) return;
        if (!adminNote.trim()) {
            message.warning('Vui lòng cung cấp lý do từ chối trong Ghi chú Admin');
            return;
        }
        try {
            await supportService.rejectReturnRequest(selectedRequest.id, adminNote);
            message.success('Đã từ chối yêu cầu thành công');
            setIsRejectModalOpen(false);
            setAdminNote('');
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            message.error('Từ chối yêu cầu thất bại');
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

    const columns = [
        {
            title: 'ĐƠN HÀNG',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => <span className={styles.orderId}>#{text}</span>
        },
        {
            title: 'KHÁCH HÀNG',
            key: 'customer',
            render: (_: any, record: ReturnRequest) => (
                <div className={styles.customerInfo}>
                    <span className={styles.customerName}>{record.user?.fullName}</span>
                    <span className={styles.customerEmail}>{record.user?.email}</span>
                </div>
            )
        },
        {
            title: 'LOẠI',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => getTypeTag(type)
        },
        {
            title: 'LÝ DO',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'NGÀY TẠO',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => new Date(text).toLocaleString('vi-VN')
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            render: (_: any, record: ReturnRequest) => (
                <div className={styles.actions}>
                    {record.status === 'PENDING' && (
                        <>
                            <Button
                                type="text"
                                icon={<CheckCircle size={18} color="var(--color-up)" />}
                                onClick={() => handleApprove(record)}
                            />
                            <Button
                                type="text"
                                icon={<XCircle size={18} color="var(--color-down)" />}
                                onClick={() => handleReject(record)}
                            />
                        </>
                    )}
                    <Button
                        type="text"
                        icon={<Eye size={18} />}
                        onClick={() => router.push(`/returns/${record.id}`)}
                    />
                </div>
            )
        }
    ];

    // Lọc danh sách yêu cầu theo mã đơn hàng, tên khách hàng hoặc email
    const filteredRequests = requests.filter(request => {
        const orderCode = request.orderCode?.toLowerCase() || '';
        const fullName = request.user?.fullName?.toLowerCase() || '';
        const email = request.user?.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase().trim();
        
        return orderCode.includes(search) || fullName.includes(search) || email.includes(search);
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Yêu cầu Hỗ trợ</h1>
                    <p>Quản lý các yêu cầu hoàn hàng, đổi hàng và bảo hành sản phẩm.</p>
                </div>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <Input
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                        className={styles.searchInput}
                        bordered={false}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    dataSource={filteredRequests}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 15 }}
                />
            </div>

            <Modal
                title="Duyệt Yêu cầu Hỗ trợ"
                open={isApproveModalOpen}
                onOk={submitApprove}
                onCancel={() => setIsApproveModalOpen(false)}
                okText="Duyệt"
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn duyệt yêu cầu {selectedRequest?.type === 'RETURN' ? 'hoàn hàng' : selectedRequest?.type === 'EXCHANGE' ? 'đổi hàng' : 'bảo hành'} này?</p>
                {selectedRequest?.type === 'EXCHANGE' && (
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
                onOk={submitReject}
                onCancel={() => setIsRejectModalOpen(false)}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Bạn có chắc chắn muốn <strong>từ chối</strong> yêu cầu {selectedRequest?.type === 'RETURN' ? 'hoàn hàng' : selectedRequest?.type === 'EXCHANGE' ? 'đổi hàng' : 'bảo hành'} này?</p>
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
