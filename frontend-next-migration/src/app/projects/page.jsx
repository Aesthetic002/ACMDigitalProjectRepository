"use client";

import ProjectsPage from "@/pages/ProjectsPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <ProjectsPage />
            </Layout>
        </ProtectedRoute>
    );
}
