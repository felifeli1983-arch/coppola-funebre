'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown, Search, X } from 'lucide-react';

const SORTS = [
  { value: 'ordine', label: 'In evidenza' },
  { value: 'prezzo-asc', label: 'Prezzo crescente' },
  { value: 'prezzo-desc', label: 'Prezzo decrescente' },
  { value: 'nome', label: 'Nome A–Z' },
  { value: 'recenti', label: 'Novità' },
];

export default function ShopToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get('q') ?? '';
  const [q, setQ] = useState(current);
  useEffect(() => setQ(current), [current]);

  const push = (next: URLSearchParams) => {
    next.delete('page'); // reset to first page on any filter change
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    push(next);
  };

  const clearSearch = () => {
    setQ('');
    const next = new URLSearchParams(params.toString());
    next.delete('q');
    push(next);
  };

  const onSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== 'ordine') next.set('sort', value);
    else next.delete('sort');
    push(next);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <form onSubmit={onSearch} role="search" className="relative w-full md:max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-pietra/40" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca un prodotto…"
          aria-label="Cerca un prodotto"
          className="h-11 w-full border border-pietra/15 bg-white pl-10 pr-10 text-base text-pietra outline-none transition-colors placeholder:text-pietra/40 focus:border-bordeaux md:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center text-pietra/40 hover:text-bordeaux"
            aria-label="Cancella ricerca"
          >
            <X size={16} />
          </button>
        )}
      </form>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span className="whitespace-nowrap text-sm text-pietra-chiaro" aria-live="polite">
          {total} {total === 1 ? 'prodotto' : 'prodotti'}
        </span>
        <label className="relative inline-flex items-center">
          <span className="sr-only">Ordina per</span>
          <ArrowUpDown size={14} className="pointer-events-none absolute left-3 text-pietra/50" />
          <select
            value={params.get('sort') ?? 'ordine'}
            onChange={(e) => onSort(e.target.value)}
            className="h-11 appearance-none border border-pietra/15 bg-white pl-9 pr-8 text-sm text-pietra outline-none focus:border-bordeaux"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 size-3 text-pietra/50" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="m3 4.5 3 3 3-3" />
          </svg>
        </label>
      </div>
    </div>
  );
}
