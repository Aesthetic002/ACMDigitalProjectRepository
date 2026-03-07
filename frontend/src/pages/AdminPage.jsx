import Layout from "@/components/Layout";
import { AdminAnalytics } from "@/features/admin/components/AdminAnalytics";

export default function AdminPage() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <AdminAnalytics />
            </div>
        </Layout>
    );
}
