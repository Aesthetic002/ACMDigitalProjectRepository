"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace(`/login?from=${encodeURIComponent(pathname)}`);
            } else if (adminOnly && user?.role !== 'admin') {
                router.replace("/");
            }
        }
    }, [isLoading, isAuthenticated, user, adminOnly, router, pathname]);

    if (isLoading || !isAuthenticated || (adminOnly && user?.role !== 'admin')) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-acm-blue" />
            </div>
        );
    }

    return children;
}
