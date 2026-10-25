import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES, MAKES } from '../../lib/catalog';

const labelClass = 'text-xs text-slate-400';
const controlClass = 'mt-1 w-full bg-transparent text-sm font-medium text-navy focus:outline-none';

/** The pill-shaped search bar from the design. Sends visitors to /inventory with filters applied. */
export function QuickSearch() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (make) params.set('make', make);
    if (model.trim()) params.set('model', model.trim());
    navigate(`/inventory?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Quick vehicle search"
      className="mx-6 flex max-w-3xl flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg md:mx-auto md:flex-row md:items-center md:gap-8 md:rounded-full md:px-10"
    >
      <div className="flex-1">
        <label htmlFor="qs-category" className={labelClass}>Category</label>
        <select id="qs-category" value={category} onChange={(e) => setCategory(e.target.value)} className={controlClass}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="qs-make" className={labelClass}>Make</label>
        <select id="qs-make" value={make} onChange={(e) => setMake(e.target.value)} className={controlClass}>
          <option value="">Any make</option>
          {MAKES.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="qs-model" className={labelClass}>Model</label>
        <input id="qs-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="All models" className={controlClass} />
      </div>
      <button
        type="submit"
        aria-label="Search vehicles"
        className="grid size-12 shrink-0 place-items-center self-end rounded-full bg-brand text-white transition hover:bg-brand-dark md:self-auto"
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </form>
  );
}