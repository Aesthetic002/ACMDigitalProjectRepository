import Layout from "@/components/Layout";
import { Hero } from "@/components/sections/Hero";
import { Statistics } from "@/features/projects/components/Statistics";
import { FeatureSlides } from "@/features/projects/components/FeatureSlides";

export default function HomePage() {
    return (
        <Layout>
            <Hero />
            <Statistics />
            <div id="features">
                <FeatureSlides />
            </div>
        </Layout>
    );
}
