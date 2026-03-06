'use client';

import AuthLayout from '@/layouts/AuthLayout';
import Login from '@/features/auth/pages/Login';

export default function LoginPage() {
    return (
        <AuthLayout>
            <Login />
        </AuthLayout>
    );
}
