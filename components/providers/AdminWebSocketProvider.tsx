'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { notification } from 'antd';
import { useAppSelector } from '@/store/redux/hooks';
import { RootState } from '@/store/redux/store';

interface WebSocketContextType {
    connected: boolean;
}

const AdminWebSocketContext = createContext<WebSocketContextType>({
    connected: false
});

export const useAdminWebSocket = () => useContext(AdminWebSocketContext);

export const AdminWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [connected, setConnected] = useState(false);
    const stompClientRef = useRef<Client | null>(null);
    const processedChatIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        const handleNewChatMessage = (chatMessage: any) => {
            if (!chatMessage || !chatMessage.id) return;
            
            if (processedChatIds.current.has(chatMessage.id)) {
                console.log('Duplicate chat message ignored:', chatMessage.id);
                return;
            }
            
            processedChatIds.current.add(chatMessage.id);
            // Limit set size to prevent memory leaks
            if (processedChatIds.current.size > 100) {
                const firstValue = processedChatIds.current.values().next().value;
                if (firstValue !== undefined) {
                    processedChatIds.current.delete(firstValue);
                }
            }
            
            console.log('Processing new chat message:', chatMessage);
            window.dispatchEvent(new CustomEvent('admin_new_chat_message', { detail: chatMessage }));
            
            // Show bubble notification if not on support page
            if (typeof window !== 'undefined' && window.location.pathname !== '/support') {
                notification.success({
                    message: 'Tin nhắn mới',
                    description: `${chatMessage.sender?.fullName || 'Khách hàng'}: ${chatMessage.content}`,
                    placement: 'bottomRight',
                });
            }
        };

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
            debug: (str) => {
                // console.log(str);
            },
            reconnectDelay: 15000, // tăng delay tránh loop khi backend không chạy
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                console.log('Admin WebSocket Connected: ' + frame);
                setConnected(true);

                // Subscribe to new orders
                client.subscribe('/topic/admin/orders', (message) => {
                    const order = JSON.parse(message.body);
                    notification.info({
                        message: 'Đơn hàng mới!',
                        description: `Đơn hàng #${order.orderCode} vừa được đặt thành công.`,
                        placement: 'topRight',
                    });
                    window.dispatchEvent(new CustomEvent('admin_new_order', { detail: order }));
                });

                // Subscribe to new return requests
                client.subscribe('/topic/admin/returns', (message) => {
                    const returnRequest = JSON.parse(message.body);
                    notification.warning({
                        message: 'Yêu cầu đổi/trả mới!',
                        description: `Yêu cầu #${returnRequest.id} cho đơn hàng ${returnRequest.orderCode}.`,
                        placement: 'topRight',
                    });
                    window.dispatchEvent(new CustomEvent('admin_new_return', { detail: returnRequest }));
                });

                // Subscribe to new chat messages (broadcast to all admins)
                client.subscribe('/topic/admin/chat', (message) => {
                    const chatMessage = JSON.parse(message.body);
                    console.log('Admin received new chat message via broadcast:', chatMessage);
                    handleNewChatMessage(chatMessage);
                });

                // Also subscribe to topic for messages sent specifically to this admin
                if (user) {
                    client.subscribe(`/topic/chat/${user.id}`, (message) => {
                        const chatMessage = JSON.parse(message.body);
                        console.log('Admin received private message via WS:', chatMessage);
                        handleNewChatMessage(chatMessage);
                    });
                }
            },
            onStompError: (frame) => {
                console.error('Admin WebSocket Error:', frame);
                setConnected(false);
            },
            onWebSocketClose: () => {
                setConnected(false);
            }
        });

        // Chỉ kết nối khi user đã đăng nhập
        if (!user) return;

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [user]);

    return (
        <AdminWebSocketContext.Provider value={{ connected }}>
            {children}
        </AdminWebSocketContext.Provider>
    );
};
