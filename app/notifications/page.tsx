'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCcw, MessageSquare, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button, List, Avatar, Tag, Empty, message } from 'antd';
import styles from './page.module.css';
import Link from 'next/link';

import axiosInstance from '@/lib/axios';

interface Notification {
    id: number;
    type: 'ORDER' | 'RETURN' | 'CHAT';
    title: string;
    description: string;
    createdAt: string;
    isRead: boolean;
    link: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchNotifications = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/admin/notifications?page=${page}&size=${size}`);
            const { content, totalElements } = response.data.data;
            setNotifications(content);
            setPagination(prev => ({ ...prev, current: page + 1, total: totalElements }));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const handleNewOrder = () => {
            fetchNotifications(0); // Tải lại trang đầu khi có thông báo mới
        };

        window.addEventListener('admin_new_order', handleNewOrder);
        return () => window.removeEventListener('admin_new_order', handleNewOrder);
    }, []);

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put('/api/admin/notifications/mark-all-read');
            message.success('Đã đánh dấu tất cả là đã đọc');
            fetchNotifications(pagination.current - 1);
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const clearAll = async () => {
        try {
            await axiosInstance.delete('/api/admin/notifications');
            message.success('Đã xóa tất cả thông báo');
            setNotifications([]);
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const deleteOne = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/admin/notifications/${id}`);
            message.success('Đã xóa thông báo');
            fetchNotifications(pagination.current - 1);
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };

    const toggleRead = async (id: number) => {
        try {
            await axiosInstance.put(`/api/admin/notifications/${id}/read`);
            fetchNotifications(pagination.current - 1);
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Thông báo</h1>
                    <p>Theo dõi các hoạt động mới nhất của cửa hàng.</p>
                </div>
                <div className={styles.actions}>
                    <Button 
                        icon={<CheckCheck size={16} />} 
                        onClick={markAllAsRead}
                        disabled={notifications.length === 0}
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                    <Button 
                        icon={<Trash2 size={16} />} 
                        danger 
                        onClick={clearAll}
                        disabled={notifications.length === 0}
                    >
                        Xóa tất cả
                    </Button>
                </div>
            </div>

            <div className={styles.content}>
                {notifications.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        loading={loading}
                        dataSource={notifications}
                        pagination={{
                            ...pagination,
                            onChange: (page) => fetchNotifications(page - 1, pagination.pageSize),
                            position: 'bottom',
                            align: 'center',
                            hideOnSinglePage: false
                        }}
                        renderItem={(item) => (
                            <List.Item 
                                className={`${styles.notifItem} ${!item.isRead ? styles.unread : ''}`}
                                actions={[
                                    <Button type="link" onClick={() => toggleRead(item.id)}>
                                        {item.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                                    </Button>,
                                    <Button type="link" danger onClick={() => deleteOne(item.id)}>
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <Link href={item.link} className={styles.notifLink}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                icon={item.type === 'ORDER' ? <ShoppingCart size={20} /> :
                                                    item.type === 'RETURN' ? <RefreshCcw size={20} /> :
                                                        <MessageSquare size={20} />}
                                                className={styles[`icon${item.type.toLowerCase()}`]}
                                            />
                                        }
                                        title={
                                            <div className={styles.itemTitleGroup}>
                                                <span className={styles.notifTitle}>{item.title}</span>
                                                <span className={styles.notifTime} suppressHydrationWarning>
                                                    {new Date(item.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        }
                                        description={
                                            <div className={styles.notifDesc}>
                                                {item.description}
                                            </div>
                                        }
                                    />
                                </Link>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className={styles.empty}>
                        <Empty description="Không có thông báo nào" />
                    </div>
                )}
            </div>
        </div>
    );
}
