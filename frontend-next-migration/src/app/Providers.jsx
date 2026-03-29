"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5, retry: 1 },
    },
});

function AuthInitializer({ children }) {
    const initAuth = useAuthStore((s) => s.initAuth);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        initAuth();
        setMounted(true);
    }, [initAuth]);

    if (!mounted) return null;
    return children;
}

export function Providers({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthInitializer>
                    {children}
                    <Toaster position="top-right" richColors />
                </AuthInitializer>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
