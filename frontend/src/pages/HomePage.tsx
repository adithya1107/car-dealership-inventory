import { BlogSection } from '../components/home/BlogSection';
import { BrandStrip } from '../components/home/BrandStrip';
import { ExploreSection } from '../components/home/ExploreSection';
import { FeatureBanner } from '../components/home/FeatureBanner';
import { HeroSlider } from '../components/home/HeroSlider';
import { QuickSearch } from '../components/home/QuickSearch';
import { ServicesSection } from '../components/home/ServicesSection';
import { Testimonials } from '../components/home/Testimonials';

export function HomePage() {
  return (
    <>
      <HeroSlider />
      <QuickSearch />
      <BrandStrip />
      <ExploreSection />
      <ServicesSection />
      <FeatureBanner />
      <Testimonials />
      <BlogSection />
    </>
  );
}