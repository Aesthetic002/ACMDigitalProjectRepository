'use client';

import AuthLayout from '@/layouts/AuthLayout';
import Register from '@/features/auth/pages/Register';

export default function RegisterPage() {
    return (
        <AuthLayout>
            <Register />
        </AuthLayout>
    );
}
