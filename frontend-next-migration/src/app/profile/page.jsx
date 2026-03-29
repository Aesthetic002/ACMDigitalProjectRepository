"use client";

import ProfilePage from "@/pages/ProfilePage";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute>
            <Layout>
                <ProfilePage />
            </Layout>
        </ProtectedRoute>
    );
}
