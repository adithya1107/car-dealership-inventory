import { Link } from 'react-router-dom';
import { SectionHeading } from './SectionHeading';

const brands = [
  { name: 'Honda', logo: '/images/brands/honda.png' },
  { name: 'Ferrari', logo: '/images/brands/ferrari.png' },
  { name: 'Toyota', logo: '/images/brands/toyota.png' },
  { name: 'Audi', logo: '/images/brands/audi.png' },
  { name: 'Tesla', logo: '/images/brands/tesla.png' },
];

export function BrandStrip() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading title="Brands" />
      <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
        {brands.map((b) => (
          <li key={b.name}>
            <Link to={`/inventory?make=${b.name}`} aria-label={`Browse ${b.name} vehicles`}>
              <img
                src={b.logo}
                alt={b.name}
                className="h-12 w-auto opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}