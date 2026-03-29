"use client";

import { AdminAnalytics } from "@/features/admin/components/AdminAnalytics";
import { Shield } from "lucide-react";

export default function AdminModerationPage() {
    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-acm-blue flex items-center justify-center shadow-lg shadow-acm-blue/20">
                    <Shield className="text-white h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase italic">Admin Moderation</h1>
                    <p className="text-muted-foreground">Focused console for platform quality control and item approvals.</p>
                </div>
            </div>

            <AdminAnalytics />
        </div>
    );
}
