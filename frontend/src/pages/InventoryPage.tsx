import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  createVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
  updateVehicle,
} from '../api/vehicles';
import type { Vehicle, VehicleInput } from '../api/types';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { RestockDialog } from '../components/vehicles/RestockDialog';
import { SearchFilters } from '../components/vehicles/SearchFilters';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useVehicles } from '../hooks/useVehicles';
import { getErrorMessage } from '../lib/error';
import { PAGE_SIZE, paramsFromUrl } from '../lib/searchParams';

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

  // Admin dialog state. `editing` is a vehicle (edit), 'new' (add) or null (closed).
  const [editing, setEditing] = useState<Vehicle | 'new' | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // If the current page disappears (e.g. the last item on it was deleted), step back.
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

  // Throws on failure so VehicleForm can display the server's message inline.
  async function handleSave(input: VehicleInput) {
    if (editing === 'new') {
      await createVehicle(input);
      toast.success('Vehicle added.');
    } else if (editing) {
      await updateVehicle(editing.id, input);
      toast.success('Vehicle updated.');
    }
    setEditing(null);
    refetch();
  }

  // Throws on failure so RestockDialog can display the server's message inline.
  async function handleRestock(quantity: number) {
    if (!restocking) return;
    const updated = await restockVehicle(restocking.id, quantity);
    replaceItem(updated);
    toast.success(`Added ${quantity} unit${quantity === 1 ? '' : 's'} to ${updated.make} ${updated.model}.`);
    setRestocking(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteVehicle(deleting.id);
      toast.success(`${deleting.make} ${deleting.model} was deleted.`);
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
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

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-4">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="mt-1 text-slate-600" aria-live="polite">
            {pagination ? `${pagination.total} vehicle${pagination.total === 1 ? '' : 's'} found` : 'Loading…'}
          </p>
        </div>

        {/* Visibility only: the API rejects non-admins regardless of what the UI shows. */}
        {isAdmin && (
          <Button variant="brand" onClick={() => setEditing('new')}>
            <Plus size={16} aria-hidden="true" /> Add vehicle
          </Button>
        )}
      </header>

      <SearchFilters />

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-brand/10 px-5 py-4 text-sm text-brand"
        >
          <span>{error}</span>
          <Button variant="outline" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      <div
        className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
          loading && data.length > 0 ? 'opacity-60' : ''
        }`}
      >
        {loading && data.length === 0
          ? Array.from({ length: PAGE_SIZE }, (_, i) => <VehicleCardSkeleton key={i} />)
          : data.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                purchasing={purchasingId === v.id}
                onPurchase={handlePurchase}
                onEdit={setEditing}
                onRestock={setRestocking}
                onDelete={setDeleting}
              />
            ))}
      </div>

      {!loading && !error && data.length === 0 && (
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold">No vehicles match your search</p>
          <p className="mt-2 text-slate-500">Try removing a filter or widening the price range.</p>
          <Link to="/inventory" className="mt-4 inline-block text-brand hover:underline">
            Reset all filters
          </Link>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Next
          </Button>
        </nav>
      )}

      {/* ---- Admin dialogs ---- */}
      {editing && (
        <Modal title={editing === 'new' ? 'Add vehicle' : 'Edit vehicle'} onClose={() => setEditing(null)}>
          <VehicleForm
            initial={editing === 'new' ? undefined : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {restocking && (
        <RestockDialog vehicle={restocking} onSubmit={handleRestock} onCancel={() => setRestocking(null)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete vehicle?"
          message={`This permanently removes ${deleting.make} ${deleting.model} from the inventory.`}
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}