"use client";

import MembersPage from "@/pages/MembersPage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <MembersPage />
            </Layout>
        </ProtectedRoute>
    );
}
