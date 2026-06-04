'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, MessageSquare, ShoppingCart, RefreshCcw, LogOut } from 'lucide-react';
import { Button, Badge, Dropdown, List, Avatar } from 'antd';
import styles from './Header.module.css';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
    id: string;
    type: 'order' | 'return' | 'chat';
    title: string;
    description: string;
    time: Date;
    read: boolean;
    link: string;
}

export default function Header() {
    const pathname = usePathname();
    const { user, isAuthenticated, signOut } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const handleNewOrder = (event: any) => {
            const order = event.detail;
            const newNotif: Notification = {
                id: `order-${order.id}-${Date.now()}`,
                type: 'order',
                title: 'Đơn hàng mới',
                description: `Đơn hàng #${order.orderCode} vừa được đặt.`,
                time: new Date(),
                read: false,
                link: '/orders'
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        };

        const handleNewReturn = (event: any) => {
            const ret = event.detail;
            const newNotif: Notification = {
                id: `return-${ret.id}-${Date.now()}`,
                type: 'return',
                title: 'Yêu cầu đổi/trả',
                description: `Yêu cầu #${ret.id} cho đơn #${ret.orderCode}.`,
                time: new Date(),
                read: false,
                link: '/returns'
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        };

        const handleChat = (event: any) => {
            const msg = event.detail;
            setNotifications(prev => {
                // Lọc trùng lặp thông báo chat dựa trên id duy nhất
                if (prev.some(n => n.id === `chat-${msg.id}`)) {
                    return prev;
                }
                const newNotif: Notification = {
                    id: `chat-${msg.id}`,
                    type: 'chat',
                    title: msg.sender.fullName,
                    description: msg.content,
                    time: new Date(),
                    read: false,
                    link: '/support'
                };
                return [newNotif, ...prev].slice(0, 20);
            });
        };

        window.addEventListener('admin_new_order', handleNewOrder);
        window.addEventListener('admin_new_return', handleNewReturn);
        window.addEventListener('admin_new_chat_message', handleChat);

        return () => {
            window.removeEventListener('admin_new_order', handleNewOrder);
            window.removeEventListener('admin_new_return', handleNewReturn);
            window.removeEventListener('admin_new_chat_message', handleChat);
        };
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const notificationMenu = (
        <div className={styles.notificationDropdown}>
            <div className={styles.notifHeader}>
                <h3>Thông báo</h3>
                <Button type="link" size="small" onClick={markAllAsRead}>Đánh dấu đã đọc</Button>
            </div>
            <List
                className={styles.notifList}
                itemLayout="horizontal"
                dataSource={notifications}
                locale={{ emptyText: 'Không có thông báo mới' }}
                renderItem={(item) => (
                    <List.Item className={`${styles.notifItem} ${!item.read ? styles.unread : ''}`}>
                        <Link href={item.link} onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                        }} className={styles.notifLink}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        icon={item.type === 'order' ? <ShoppingCart size={16} /> :
                                            item.type === 'return' ? <RefreshCcw size={16} /> :
                                                <MessageSquare size={16} />}
                                        className={styles[`icon${item.type}`]}
                                    />
                                }
                                title={<span className={styles.notifTitle}>{item.title}</span>}
                                description={
                                    <div>
                                        <p className={styles.notifDesc}>{item.description}</p>
                                        <span className={styles.notifTime}>
                                            {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                }
                            />
                        </Link>
                    </List.Item>
                )}
            />
            <div className={styles.notifFooter}>
                <Link href="/notifications">Xem tất cả</Link>
            </div>
        </div>
    );

    const navItems = [
        { label: 'Tổng quan', href: '/' },
        { label: 'Sản phẩm', href: '/inventory' },
        { label: 'Đơn hàng', href: '/orders' },
        { label: 'Đổi trả', href: '/returns' },
        { label: 'Hỗ trợ', href: '/support' },
        { label: 'Khách hàng', href: '/customers' },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Plus size={18} color="white" strokeWidth={3} />
                    </div>
                    <span className={styles.logoText}>Admin PF</span>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className={styles.actions}>


                <Dropdown popupRender={() => notificationMenu} trigger={['click']} placement="bottomRight">
                    <button className={styles.notificationBtn}>
                        <Badge count={notifications.filter(n => !n.read).length} size="small" offset={[2, 0]}>
                            <Bell size={20} className={notifications.some(n => !n.read) ? styles.bellShake : ''} />
                        </Badge>
                    </button>
                </Dropdown>

                {isAuthenticated && user ? (
                    <Dropdown 
                        menu={{ 
                            items: [
                                {
                                    key: 'profile',
                                    label: (
                                        <div style={{ padding: '4px 8px' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email || 'admin@shoestore.com'}</div>
                                        </div>
                                    ),
                                },
                                { type: 'divider' },
                                {
                                    key: 'logout',
                                    icon: <LogOut size={16} />,
                                    label: <span style={{ fontWeight: 500 }}>Đăng xuất</span>,
                                    danger: true,
                                    onClick: signOut
                                }
                            ]
                        }} 
                        trigger={['click']} 
                        placement="bottomRight"
                    >
                        <div className={styles.userProfile}>
                            <div className={styles.avatar}>
                                <img
                                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                    alt="Avatar"
                                    width={32}
                                    height={32}
                                />
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.fullName}</span>
                                <span className={styles.userRole}>Quản trị viên</span>
                            </div>
                        </div>
                    </Dropdown>
                ) : (
                    <Link href="/login" className={styles.loginLink}>
                        <Button type="primary" size="small">Đăng nhập</Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
