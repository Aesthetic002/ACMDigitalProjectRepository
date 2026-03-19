import { AdminAnalytics } from "@/features/admin/components/AdminAnalytics";

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Operations Dashboard</h1>
                <p className="text-muted-foreground font-medium">Real-time platform insights and community metrics.</p>
            </div>
            <AdminAnalytics />
        </div>
    );
}
