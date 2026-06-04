'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <div className={styles.authPage}>
            <LoginForm />
        </div>
    );
}
