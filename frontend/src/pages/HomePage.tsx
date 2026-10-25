import { BrandStrip } from '../components/home/BrandStrip';
import { ExploreSection } from '../components/home/ExploreSection';
import { HeroSlider } from '../components/home/HeroSlider';
import { QuickSearch } from '../components/home/QuickSearch';

export function HomePage() {
  return (
    <>
      <HeroSlider />
      <QuickSearch />
      <ExploreSection />
      <BrandStrip />
    </>
  );
}