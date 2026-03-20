"use client";

import ProjectDetailPage from "@/pages/ProjectDetailPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <ProjectDetailPage />
            </Layout>
        </ProtectedRoute>
    );
}
