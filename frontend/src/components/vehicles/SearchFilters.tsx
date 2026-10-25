import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { CATEGORIES } from '../../lib/catalog';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { inputClass } from '../ui/styles';

const FILTER_KEYS = ['make', 'model', 'category', 'minPrice', 'maxPrice', 'inStock'] as const;
type Draft = Record<(typeof FILTER_KEYS)[number], string>;

const readDraft = (sp: URLSearchParams): Draft =>
  Object.fromEntries(FILTER_KEYS.map((k) => [k, sp.get(k) ?? ''])) as Draft;

const toParams = (draft: Draft): URLSearchParams => {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = draft[key].trim();
    if (value) params.set(key, value);
  }
  return params;
};

const hasPriceConflict = (d: Draft): boolean =>
  d.minPrice !== '' && d.maxPrice !== '' && Number(d.minPrice) > Number(d.maxPrice);

const EMPTY: Draft = { make: '', model: '', category: '', minPrice: '', maxPrice: '', inStock: '' };

/**
 * Filter bar. Inputs are held locally, debounced, then written to the URL so
 * searches are shareable and survive a refresh. The inventory page reads the URL.
 */
export function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<Draft>(() => readDraft(searchParams));
  const debounced = useDebouncedValue(draft, 400);

  useEffect(() => {
    if (hasPriceConflict(debounced)) return;
    setSearchParams(
      // Unchanged filters keep the current URL (and page); changed filters reset to page 1.
      (prev) => (toParams(readDraft(prev)).toString() === toParams(debounced).toString() ? prev : toParams(debounced)),
      { replace: true },
    );
  }, [debounced, setSearchParams]);

  const update = (key: keyof Draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const isFiltered = FILTER_KEYS.some((k) => draft[k] !== '');

  return (
    <form role="search" aria-label="Filter vehicles" onSubmit={(e) => e.preventDefault()} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field id="f-make" label="Make" placeholder="e.g. Toyota" value={draft.make} onChange={(e) => update('make', e.target.value)} />
        <Field id="f-model" label="Model" placeholder="e.g. Corolla" value={draft.model} onChange={(e) => update('model', e.target.value)} />
        <div>
          <label htmlFor="f-category" className="mb-1 block text-sm font-medium">Category</label>
          <select id="f-category" className={inputClass} value={draft.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field id="f-min" label="Min price ($)" type="number" min={0} placeholder="0" value={draft.minPrice} onChange={(e) => update('minPrice', e.target.value)} />
        <Field id="f-max" label="Max price ($)" type="number" min={0} placeholder="Any" value={draft.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-[#a50021]"
            checked={draft.inStock === '1'}
            onChange={(e) => update('inStock', e.target.checked ? '1' : '')}
          />
          In stock only
        </label>

        {hasPriceConflict(draft) && (
          <p role="alert" className="text-sm text-brand">Min price can’t be higher than max price.</p>
        )}

        {isFiltered && (
          <Button variant="outline" onClick={() => setDraft(EMPTY)}>
            <X size={14} aria-hidden="true" /> Clear filters
          </Button>
        )}
      </div>
    </form>
  );
}