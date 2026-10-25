import { BrandStrip } from '../components/home/BrandStrip';
import { HeroSlider } from '../components/home/HeroSlider';
import { QuickSearch } from '../components/home/QuickSearch';

export function HomePage() {
  return (
    <>
      <HeroSlider />
      <QuickSearch />
      <BrandStrip />
    </>
  );
}