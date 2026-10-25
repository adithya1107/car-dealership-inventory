import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { buttonStyles } from '../ui/styles';

export function FeatureBanner() {
  return (
    <section className="py-10">
      <div className="grid items-center md:grid-cols-5">
        <img
          src="/images/cars/suv.png"
          alt="White SUV parked beside shipping containers"
          className="h-72 w-full object-cover md:col-span-3 md:h-[420px] md:rounded-r-2xl"
        />
        <div className="bg-white p-8 shadow-sm md:col-span-2 md:p-14">
          <h2 className="text-2xl font-bold md:text-3xl">EVs For Everyone</h2>
          <p className="mt-6 max-w-sm text-slate-600">
            From daily commuters to family haulers, explore electric vehicles for every budget.
          </p>
          <Link to="/inventory?category=Electric" className={buttonStyles('navy', 'mt-10')}>
            Read More <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}