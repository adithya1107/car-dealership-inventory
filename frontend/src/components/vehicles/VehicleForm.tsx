import { useState, type FormEvent } from 'react';
import type { Vehicle, VehicleInput } from '../../api/types';
import { CATEGORIES } from '../../lib/catalog';
import { getErrorMessage } from '../../lib/error';
import { centsToDollars, dollarsToCents } from '../../lib/format';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';

interface VehicleFormProps {
  /** Present when editing; absent when adding a new vehicle. */
  initial?: Vehicle;
  /** Should throw on failure so the form can show the server's message. */
  onSubmit(input: VehicleInput): Promise<void>;
  onCancel(): void;
}

export function VehicleForm({ initial, onSubmit, onCancel }: VehicleFormProps) {
  const [values, setValues] = useState({
    make: initial?.make ?? '',
    model: initial?.model ?? '',
    category: initial?.category ?? '',
    price: initial ? String(centsToDollars(initial.price)) : '',
    quantity: initial ? String(initial.quantity) : '0',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const bind = (key: keyof typeof values) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const price = Number(values.price);
    const quantity = Number(values.quantity);

    if (!values.make.trim() || !values.model.trim() || !values.category.trim()) {
      return setError('Make, model and category are required.');
    }
    if (!(price > 0)) return setError('Price must be greater than zero.');
    if (!Number.isInteger(quantity) || quantity < 0) return setError('Quantity must be a whole number, zero or more.');

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        make: values.make.trim(),
        model: values.model.trim(),
        category: values.category.trim(),
        price: dollarsToCents(price),
        quantity,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">{error}</p>}

      <Field id="v-make" label="Make" autoFocus {...bind('make')} />
      <Field id="v-model" label="Model" {...bind('model')} />
      <Field id="v-category" label="Category" list="category-options" {...bind('category')} />
      <datalist id="category-options">
        {CATEGORIES.map((c) => <option key={c} value={c} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-4">
        <Field id="v-price" label="Price ($)" type="number" min={0} step="0.01" {...bind('price')} />
        <Field id="v-quantity" label="In stock" type="number" min={0} step={1} {...bind('quantity')} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="brand" loading={saving}>{initial ? 'Save changes' : 'Add vehicle'}</Button>
      </div>
    </form>
  );
}