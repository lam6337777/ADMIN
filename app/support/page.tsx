'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, Send, User, ChevronRight, MessageSquare } from 'lucide-react';
import { Input, Button, message, Avatar, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { supportService } from '@/services/support.service';
import { customerService } from '@/services/customer.service';
import { ChatMessage, ChatUser } from '@/types/support';

function SupportChatContent() {
    const searchParams = useSearchParams();
    const userIdParam = searchParams.get('userId');

    const [conversations, setConversations] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Tìm kiếm khách hàng
    const scrollRef = useRef<HTMLDivElement>(null);
    const initializedParamRef = useRef<string | null>(null); // Tránh lặp chọn khách hàng từ URL

    useEffect(() => {
        fetchConversations();
    }, [userIdParam]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
        }

        const handleNewMessage = (event: any) => {
            const newMessage = event.detail;
            // Cập nhật tin nhắn nếu đang mở cuộc hội thoại đó
            if (selectedUser && (newMessage.sender.id === selectedUser.id || newMessage.receiver.id === selectedUser.id)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            }
            // Cập nhật lại danh sách cuộc trò chuyện
            fetchConversations();
        };

        window.addEventListener('admin_new_chat_message', handleNewMessage);
        return () => window.removeEventListener('admin_new_chat_message', handleNewMessage);
    }, [selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const data = await supportService.getChatUsers();
            setConversations(data);

            // Tự động chọn cuộc hội thoại từ tham số URL
            if (userIdParam && initializedParamRef.current !== userIdParam) {
                initializedParamRef.current = userIdParam;
                const targetUserId = Number(userIdParam);
                const matchedUser = data.find(conv => conv.id === targetUserId);
                if (matchedUser) {
                    setSelectedUser(matchedUser);
                } else {
                    // Tạo hội thoại ảo nếu khách hàng chưa nhắn tin bao giờ
                    try {
                        const customer = await customerService.getCustomerById(targetUserId);
                        if (customer) {
                            const newChatUser: ChatUser = {
                                id: customer.id,
                                fullName: customer.fullName,
                                email: customer.email,
                                lastMessage: 'Bắt đầu cuộc hội thoại mới',
                                lastMessageTime: '',
                                unreadCount: 0
                            };
                            setConversations(prev => {
                                if (prev.some(conv => conv.id === targetUserId)) return prev;
                                return [newChatUser, ...prev];
                            });
                            setSelectedUser(newChatUser);
                        }
                    } catch (err) {
                        console.error('Error fetching customer details for chat:', err);
                        message.error('Không tìm thấy thông tin khách hàng');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (userId: number) => {
        setLoadingMessages(true);
        try {
            const data = await supportService.getMessages(userId);
            setMessages(data);

            // Đánh dấu đã đọc
            await supportService.markAsRead();

            // Reset unread count trên local state
            setConversations(prev => prev.map(conv =>
                conv.id === userId ? { ...conv, unreadCount: 0 } : conv
            ));
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedUser || isSending) return;
        setIsSending(true);
        try {
            const sentMessage = await supportService.sendMessage(selectedUser.id, inputValue);
            setInputValue('');
            if (sentMessage) {
                setMessages(prev => {
                    if (prev.some(m => m.id === sentMessage.id)) return prev;
                    return [...prev, sentMessage];
                });
            }
            fetchConversations();
        } catch (error) {
            message.error('Gửi tin nhắn thất bại');
        } finally {
            setIsSending(false);
        }
    };

    // Lọc danh sách trò chuyện
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.trim();
        const normalize = (str?: string) => {
            if (!str) return '';
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        };

        const normalizedQuery = normalize(query);
        const nameMatch = conv.fullName?.toLowerCase().includes(query.toLowerCase()) || normalize(conv.fullName).includes(normalizedQuery);
        const emailMatch = conv.email?.toLowerCase().includes(query.toLowerCase()) || normalize(conv.email).includes(normalizedQuery);
        
        return nameMatch || emailMatch;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Hỗ trợ trực tuyến</h1>
                    <p>Trò chuyện và hỗ trợ khách hàng theo thời gian thực.</p>
                </div>
            </div>

            <div className={styles.chatCard}>
                <div className={styles.chatLayout}>
                    {/* Sidebar */}
                    <div className={styles.chatSidebar}>
                        <div className={styles.sidebarHeader}>
                            <h2>Cuộc hội thoại</h2>
                            <div className={styles.sidebarSearch}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khách hàng..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.conversationList}>
                            {loadingConversations ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><Spin /></div>
                            ) : filteredConversations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    {searchQuery ? 'Không tìm thấy khách hàng' : 'Không có hội thoại'}
                                </div>
                            ) : filteredConversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`${styles.convItem} ${selectedUser?.id === conv.id ? styles.activeConv : ''}`}
                                    onClick={() => setSelectedUser(conv)}
                                >
                                    <Avatar icon={<User size={20} />} className={styles.avatar} />
                                    <div className={styles.convInfo}>
                                        <div className={styles.convHeader}>
                                            <span className={styles.convName}>{conv.fullName}</span>
                                            <span className={styles.convTime}>
                                                {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className={styles.convLast}>{conv.lastMessage}</p>
                                    </div>
                                    {conv.unreadCount > 0 && <span className={styles.unreadBadge}>{conv.unreadCount}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Khung chat */}
                    <div className={styles.chatMain}>
                        {selectedUser ? (
                            <>
                                <div className={styles.chatHeader}>
                                    <div className={styles.selectedUserInfo}>
                                        <Avatar icon={<User size={20} />} className={styles.avatar} />
                                        <div>
                                            <h3>{selectedUser.fullName}</h3>
                                            <p>{selectedUser.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.messageList} ref={scrollRef}>
                                    {loadingMessages ? (
                                        <div style={{ textAlign: 'center', padding: '2rem' }}><Spin /></div>
                                    ) : messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`${styles.messageWrapper} ${msg.sender.role === 'ADMIN' ? styles.ownMessage : ''}`}
                                        >
                                            <div className={styles.messageBubble}>
                                                {msg.content}
                                            </div>
                                            <span className={styles.messageTime}>
                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.chatInputWrapper}>
                                    <Input
                                        placeholder="Nhập tin nhắn khách hàng..."
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        onPressEnter={handleSend}
                                        className={styles.chatInput}
                                        suffix={
                                            <Button
                                                type="primary"
                                                icon={<Send size={16} />}
                                                onClick={handleSend}
                                                loading={isSending}
                                                style={{ background: 'var(--text-primary)', borderColor: 'var(--text-primary)' }}
                                            />
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <div className={styles.noSelection}>
                                <div className={styles.noSelectionContent}>
                                    <div className={styles.noSelectionIcon}>
                                        <MessageSquare size={48} strokeWidth={1} />
                                    </div>
                                    <h3>Chọn một cuộc hội thoại</h3>
                                    <p>Chọn khách hàng từ danh sách bên trái để bắt đầu trò chuyện.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SupportPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" />
            </div>
        }>
            <SupportChatContent />
        </Suspense>
    );
}
