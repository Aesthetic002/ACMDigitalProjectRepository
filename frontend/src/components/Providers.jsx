'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/authStore';

export default function Providers({ children }) {
    const initAuth = useAuthStore(state => state.initAuth);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-center" richColors />
        </QueryClientProvider>
    );
}
