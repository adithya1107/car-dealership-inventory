import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { searchVehicles } from '../../api/vehicles';
import type { Vehicle } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { DEMO_VEHICLES } from '../../lib/demoData';
import { getErrorMessage } from '../../lib/error';
import { SectionHeading } from './SectionHeading';
import { ShowcaseCard } from './ShowcaseCard';

/** Tab labels from the design, mapped to the vehicle categories they contain. */
const TABS = [
  { label: 'Cars & Minivan', categories: ['sedan', 'hatchback', 'coupe', 'convertible', 'minivan'] },
  { label: 'Trucks', categories: ['truck'] },
  { label: 'Crossovers & SUVs', categories: ['suv', 'crossover'] },
  { label: 'Electrified', categories: ['electric', 'hybrid'] },
];

export function ExploreSection() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState(0);
  const [live, setLive] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Real inventory requires a login (spec), so visitors see demo cars instead.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    searchVehicles({ limit: 100, includeOutOfStock: false })
      .then((page) => !cancelled && setLive(page.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const source = isAuthenticated ? live : DEMO_VEHICLES;
  const vehicles = (source ?? []).filter((v) => TABS[tab].categories.includes(v.category.toLowerCase()));
  const scrollBy = (direction: -1 | 1) =>
    scroller.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });

  return (
    <section className="bg-muted py-16">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="Explore" />

        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Vehicle categories">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              aria-pressed={i === tab}
              className={`rounded-full px-5 py-2 text-sm transition ${
                i === tab ? 'bg-brand text-white' : 'text-slate-600 hover:text-brand'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div ref={scroller} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4">
          {error && <p role="alert" className="text-brand">{error}</p>}
          {isAuthenticated && live === null && !error && <p className="text-slate-500">Loading vehicles…</p>}
          {vehicles.map((v) => (
            <ShowcaseCard key={v.id} vehicle={v} />
          ))}
          {source !== null && vehicles.length === 0 && (
            <p className="text-slate-500">No vehicles in this category yet.</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {!isAuthenticated ? (
            <p className="text-sm text-slate-500">
              Sample vehicles shown. <Link to="/login" className="font-medium text-brand hover:underline">Log in</Link> to see live inventory.
            </p>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="grid size-10 place-items-center rounded-full bg-white shadow-sm hover:bg-brand hover:text-white">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="grid size-10 place-items-center rounded-full bg-white shadow-sm hover:bg-brand hover:text-white">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}