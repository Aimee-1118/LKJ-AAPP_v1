import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { MetricsTicker } from "@/components/home/metrics-ticker";
import { PartnersSponsors } from "@/components/home/partners-sponsors";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col space-y-[59px] pb-[59px]">
      <HeroSection />
      <FeaturedProjects />
      <MetricsTicker />
      <PartnersSponsors />
    </main>
  );
}
