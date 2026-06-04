'use client';

import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import styles from './page.module.css';

export default function RegisterPage() {
    return (
        <div className={styles.authPage}>
            <RegisterForm />
        </div>
    );
}
