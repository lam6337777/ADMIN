'use client';

import React, { useEffect, useRef } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Auth.module.css';

export default function LoginForm() {
    const { signIn, isLoading, error, isAuthenticated, user, resetError } = useAuth();
    const router = useRouter();
    // Track xem user có đang chủ động đăng nhập không
    const isSigningIn = useRef(false);

    // Chỉ redirect khi user chủ động bấm đăng nhập, tránh loop với proxy
    useEffect(() => {
        if (isAuthenticated && isSigningIn.current) {
            isSigningIn.current = false;
            console.log('Login successful, user data:', user);
            message.success('Đăng nhập thành công!');
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (error) {
            message.error(error);
            resetError();
        }
    }, [error, resetError]);

    const onFinish = (values: any) => {
        isSigningIn.current = true; // đánh dấu đang đăng nhập chủ động
        signIn(values);
    };

    return (
        <div className={styles.authCard}>
            <div className={styles.authLogo}>PF</div>
            <h2 className={styles.authTitle}>Chào mừng trở lại</h2>
            <p className={styles.authSubtitle}>Đăng nhập để quản lý cửa hàng của bạn</p>

            <Form
                name="login"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                className={styles.form}
            >
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input
                        prefix={<Mail size={16} className={styles.inputIcon} />}
                        placeholder="admin@shoestore.com"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password
                        prefix={<Lock size={16} className={styles.inputIcon} />}
                        placeholder="••••••••"
                        className={styles.input}
                    />
                </Form.Item>

                <div className={styles.formExtras}>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </div>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        block
                        className={styles.submitBtn}
                        icon={<LogIn size={18} />}
                    >
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>


        </div>
    );
}
