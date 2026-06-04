'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
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

    useEffect(() => {
        const socket = new SockJS('http://localhost:8082/ws');
        const client = over(socket);
        client.debug = () => { };

        client.connect({}, (frame) => {
            console.log('Admin WebSocket Connected: ' + frame);
            setConnected(true);
            stompClientRef.current = client;

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

            // If admin is logged in, subscribe to their private messages
            if (user) {
                client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
                    const chatMessage = JSON.parse(message.body);
                    console.log('Admin received new message via WS:', chatMessage);
                    window.dispatchEvent(new CustomEvent('admin_new_chat_message', { detail: chatMessage }));

                    // Show bubble notification if chat window is not open or not on support page
                    if (window.location.pathname !== '/support') {
                        notification.success({
                            message: 'Tin nhắn mới',
                            description: `${chatMessage.sender.fullName}: ${chatMessage.content}`,
                            placement: 'bottomRight',
                        });
                    }
                });
            }
        }, (error) => {
            console.error('Admin WebSocket Error:', error);
            setConnected(false);
        });

        return () => {
            if (client.connected) {
                client.disconnect(() => {
                    setConnected(false);
                });
            }
        };
    }, [user]);

    return (
        <AdminWebSocketContext.Provider value={{ connected }}>
            {children}
        </AdminWebSocketContext.Provider>
    );
};
