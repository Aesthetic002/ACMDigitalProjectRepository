"use client";

import DomainsPage from "@/pages/DomainsPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <DomainsPage />
            </Layout>
        </ProtectedRoute>
    );
}
