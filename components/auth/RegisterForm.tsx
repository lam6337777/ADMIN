'use client';

import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Auth.module.css';

export default function RegisterForm() {
    const { signUp, isLoading, error, isAuthenticated, resetError } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (error) {
            message.error(error);
            resetError();
        }
    }, [error, resetError]);

    const onFinish = (values: any) => {
        // API requires password, but provided spec didn't show it in register request body example
        // however, usually it IS required. I'll include it if user provided it.
        signUp(values);
    };

    return (
        <div className={styles.authCard}>
            <h2 className={styles.authTitle}>Tạo tài khoản</h2>
            <p className={styles.authSubtitle}>Bắt đầu quản lý cửa hàng của bạn một cách chuyên nghiệp</p>

            <Form
                name="register"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                className={styles.form}
            >
                <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input
                        prefix={<User size={16} className={styles.inputIcon} />}
                        placeholder="Nguyễn Văn A"
                        className={styles.input}
                    />
                </Form.Item>

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
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                    <Input
                        prefix={<Phone size={16} className={styles.inputIcon} />}
                        placeholder="0912345678"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }
                    ]}
                >
                    <Input.Password
                        prefix={<Lock size={16} className={styles.inputIcon} />}
                        placeholder="••••••••"
                        className={styles.input}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        block
                        className={styles.submitBtn}
                        icon={<UserPlus size={18} />}
                    >
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>

            <div className={styles.authFooter}>
                <span>Đã có tài khoản? </span>
                <Link href="/login">Đăng nhập</Link>
            </div>
        </div>
    );
}
