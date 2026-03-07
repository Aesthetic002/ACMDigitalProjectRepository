import Layout from "@/components/Layout";
import { Hero } from "@/components/sections/Hero";
import { Statistics } from "@/features/projects/components/Statistics";
import { FeatureSlides } from "@/features/projects/components/FeatureSlides";
import { DomainDistribution } from "@/features/projects/components/DomainDistribution";
import { AdminAnalytics } from "@/features/admin/components/AdminAnalytics";
import { DashboardEvents } from "@/features/events/components/DashboardEvents";

export default function HomePage() {
    return (
        <Layout>
            <Hero />
            <Statistics />
            <DashboardEvents />
            <div id="features">
                <FeatureSlides />
            </div>
            <div id="domains">
                <DomainDistribution />
            </div>
            <div id="admin-preview">
                <AdminAnalytics />
            </div>
        </Layout>
    );
}
