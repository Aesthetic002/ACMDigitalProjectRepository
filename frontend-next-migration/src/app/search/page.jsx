"use client";

import SearchPage from "@/pages/SearchPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <SearchPage />
            </Layout>
        </ProtectedRoute>
    );
}
