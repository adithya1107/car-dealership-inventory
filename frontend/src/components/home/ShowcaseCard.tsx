import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Vehicle } from '../../api/types';
import { formatPrice } from '../../lib/format';
import { buttonStyles } from '../ui/styles';
import { VehicleImage } from '../vehicles/VehicleImage';

/** The "image overlapping a white spec card" tile from the Explore section. */
export function ShowcaseCard({ vehicle }: { vehicle: Vehicle }) {
  const specs: [string, string][] = [
    ['Make', vehicle.make],
    ['Model', vehicle.model],
    ['Category', vehicle.category],
    ['In stock', String(vehicle.quantity)],
  ];
  const href = `/inventory?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}`;

  return (
    <article className="flex w-[88vw] max-w-[540px] shrink-0 snap-start items-center sm:w-[540px]">
      <VehicleImage
        category={vehicle.category}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="z-10 h-40 w-44 shrink-0 rounded-xl object-cover shadow-lg sm:h-48 sm:w-56"
      />
      <div className="-ml-6 flex-1 rounded-xl bg-white py-6 pl-10 pr-6 shadow-sm">
        <h3 className="text-lg font-medium">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-xs text-slate-400">{vehicle.quantity > 0 ? 'Available' : 'Sold out'}</p>
        <dl className="mt-3 space-y-1 text-xs">
          {specs.map(([term, value]) => (
            <div key={term} className="flex justify-between gap-4">
              <dt className="text-slate-400">{term}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xl font-medium">{formatPrice(vehicle.price)}</p>
        <Link to={href} className={buttonStyles('navy', 'mt-3 w-full justify-between')}>
          Order Now <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}