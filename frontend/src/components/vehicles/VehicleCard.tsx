import { Package, Pencil, Trash2 } from 'lucide-react';
import type { Vehicle } from '../../api/types';
import { formatPrice } from '../../lib/format';
import { Button } from '../ui/Button';
import { VehicleImage } from './VehicleImage';

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Controls visibility only. The API rejects non-admins regardless. */
  isAdmin: boolean;
  purchasing?: boolean;
  onPurchase(vehicle: Vehicle): void;
  onEdit(vehicle: Vehicle): void;
  onRestock(vehicle: Vehicle): void;
  onDelete(vehicle: Vehicle): void;
}

const iconButton =
  'grid size-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-brand';

export function VehicleCard({ vehicle, isAdmin, purchasing = false, onPurchase, onEdit, onRestock, onDelete }: VehicleCardProps) {
  const soldOut = vehicle.quantity === 0;
  const name = `${vehicle.make} ${vehicle.model}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <VehicleImage category={vehicle.category} alt={name} className={`h-44 w-full object-cover ${soldOut ? 'grayscale' : ''}`} />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium">{vehicle.category}</span>
        {soldOut && <span className="absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">Sold out</span>}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="mt-1 text-sm text-slate-500">{soldOut ? 'Currently unavailable' : `${vehicle.quantity} in stock`}</p>
        <p className="mt-4 text-2xl font-semibold">{formatPrice(vehicle.price)}</p>

        <Button
          variant="navy"
          withArrow={!soldOut}
          className="mt-4 w-full"
          disabled={soldOut}
          loading={purchasing}
          onClick={() => onPurchase(vehicle)}
        >
          {soldOut ? 'Out of Stock' : 'Purchase'}
        </Button>

        {isAdmin && (
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <button className={iconButton} aria-label={`Edit ${name}`} onClick={() => onEdit(vehicle)}>
              <Pencil size={16} aria-hidden="true" />
            </button>
            <button className={iconButton} aria-label={`Restock ${name}`} onClick={() => onRestock(vehicle)}>
              <Package size={16} aria-hidden="true" />
            </button>
            <button className={`${iconButton} ml-auto`} aria-label={`Delete ${name}`} onClick={() => onDelete(vehicle)}>
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}