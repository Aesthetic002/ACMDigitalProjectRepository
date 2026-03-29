"use client";

import CreateProjectPage from "@/pages/CreateProjectPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <CreateProjectPage />
            </Layout>
        </ProtectedRoute>
    );
}
