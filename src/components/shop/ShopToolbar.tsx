'use client';

import { useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

const SORTS = [
  { value: 'ordine', label: 'Rilevanza' },
  { value: 'prezzo-asc', label: 'Prezzo ↑' },
  { value: 'prezzo-desc', label: 'Prezzo ↓' },
  { value: 'nome', label: 'Nome A-Z' },
  { value: 'recenti', label: 'Più recenti' },
];

export default function ShopToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  const push = (next: URLSearchParams) => {
    next.delete('page'); // reset to first page on any filter change
    router.push(`${pathname}?${next.toString()}`);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    push(next);
  };

  const onSort = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== 'ordine') next.set('sort', value);
    else next.delete('sort');
    push(next);
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={onSearch} className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pietra/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca un prodotto…"
          className="w-full border border-pietra/20 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-bordeaux"
        />
      </form>

      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-sm text-pietra-chiaro">{total} prodotti</span>
        <select
          defaultValue={params.get('sort') ?? 'ordine'}
          onChange={(e) => onSort(e.target.value)}
          className="border border-pietra/20 bg-white py-2 pl-3 pr-8 text-sm outline-none focus:border-bordeaux"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
