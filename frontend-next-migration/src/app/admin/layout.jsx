"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function LayoutWrapper({ children }) {
    return (
        <ProtectedRoute adminOnly>
            <AdminLayout>
                {children}
            </AdminLayout>
        </ProtectedRoute>
    );
}
