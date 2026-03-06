import { Hero } from '@/components/sections/Hero';
import { Statistics } from '@/components/sections/Statistics';
import { FeatureSlides } from '@/components/sections/FeatureSlides';
import { DomainDistribution } from '@/components/sections/DomainDistribution';
import { AdminAnalytics } from '@/components/sections/AdminAnalytics';

export default function Home() {
  return (
    <main>
      <Hero />
      <Statistics />
      <div id="features">
        <FeatureSlides />
      </div>
      <div id="domains">
        <DomainDistribution />
      </div>
      <div id="admin-preview">
        <AdminAnalytics />
      </div>
    </main>
  );
}
