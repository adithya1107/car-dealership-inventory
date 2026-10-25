import { useState, type FormEvent } from 'react';
import type { Vehicle } from '../../api/types';
import { getErrorMessage } from '../../lib/error';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Modal } from '../ui/Modal';

interface RestockDialogProps {
  vehicle: Vehicle;
  onSubmit(quantity: number): Promise<void>;
  onCancel(): void;
}

export function RestockDialog({ vehicle, onSubmit, onCancel }: RestockDialogProps) {
  const [quantity, setQuantity] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount < 1) return setError('Enter a whole number of 1 or more.');

    setError(null);
    setSaving(true);
    try {
      await onSubmit(amount);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onCancel}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-slate-600">Currently {vehicle.quantity} in stock.</p>
        {error && <p role="alert" className="rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">{error}</p>}
        <Field id="restock-qty" label="Units to add" type="number" min={1} step={1} autoFocus value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="brand" loading={saving}>Restock</Button>
        </div>
      </form>
    </Modal>
  );
}