import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { purchaseVehicle } from '../api/vehicles';
import type { Vehicle } from '../api/types';
import { Button } from '../components/ui/Button';
import { SearchFilters } from '../components/vehicles/SearchFilters';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../hooks/useVehicles';
import { getErrorMessage } from '../lib/error';
import { paramsFromUrl, PAGE_SIZE } from '../lib/searchParams';

function VehicleCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="h-44 bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-10 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function InventoryPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => paramsFromUrl(searchParams), [searchParams]);
  const { data, pagination, loading, error, refetch, replaceItem } = useVehicles(query);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  // If the current page disappears (e.g. last item on it was deleted), step back.
  useEffect(() => {
    if (!loading && pagination && data.length === 0 && pagination.page > 1) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(Math.max(1, pagination.totalPages)));
          return next;
        },
        { replace: true },
      );
    }
  }, [loading, pagination, data.length, setSearchParams]);

  async function handlePurchase(vehicle: Vehicle) {
    setPurchasingId(vehicle.id);
    try {
      const updated = await purchaseVehicle(vehicle.id);
      replaceItem(updated); // the response carries the new stock level
      toast.success(`You purchased 1 × ${updated.make} ${updated.model}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      refetch(); // stock may have changed under us (someone bought the last one)
    } finally {
      setPurchasingId(null);
    }
  }

  function goToPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const noop = () => undefined; // admin handlers are wired in the next step

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-4">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="mt-1 text-slate-600" aria-live="polite">
            {pagination ? `${pagination.total} vehicle${pagination.total === 1 ? '' : 's'} found` : 'Loading…'}
          </p>
        </div>
      </header>

      <SearchFilters />

      {error && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-brand/10 px-5 py-4 text-sm text-brand">
          <span>{error}</span>
          <Button variant="outline" onClick={refetch}>Retry</Button>
        </div>
      )}

      <div className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading && data.length > 0 ? 'opacity-60' : ''}`}>
        {loading && data.length === 0
          ? Array.from({ length: PAGE_SIZE }, (_, i) => <VehicleCardSkeleton key={i} />)
          : data.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                purchasing={purchasingId === v.id}
                onPurchase={handlePurchase}
                onEdit={noop}
                onRestock={noop}
                onDelete={noop}
              />
            ))}
      </div>

      {!loading && !error && data.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold">No vehicles match your search</p>
          <p className="mt-2 text-slate-500">Try removing a filter or widening the price range.</p>
          <Link to="/inventory" className="mt-4 inline-block text-brand hover:underline">Reset all filters</Link>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>Previous</Button>
          <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}>Next</Button>
        </nav>
      )}
    </div>
  );
}