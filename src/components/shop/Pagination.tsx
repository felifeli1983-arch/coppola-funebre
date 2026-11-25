import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== 'page') sp.set(k, v);
    }
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/negozio?${qs}` : '/negozio';
  };

  // Compact page window around the current page.
  const pages: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let p = from; p <= to; p++) pages.push(p);

  const cell =
    'inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm transition-colors';

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${cell} border-pietra/20 hover:border-bordeaux`}>
          <ChevronLeft size={16} />
        </Link>
      )}
      {from > 1 && (
        <>
          <Link href={href(1)} className={`${cell} border-pietra/20 hover:border-bordeaux`}>1</Link>
          <span className="px-1 text-pietra/40">…</span>
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={`${cell} ${
            p === page
              ? 'border-bordeaux bg-bordeaux text-avorio'
              : 'border-pietra/20 hover:border-bordeaux'
          }`}
        >
          {p}
        </Link>
      ))}
      {to < totalPages && (
        <>
          <span className="px-1 text-pietra/40">…</span>
          <Link href={href(totalPages)} className={`${cell} border-pietra/20 hover:border-bordeaux`}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages && (
        <Link href={href(page + 1)} className={`${cell} border-pietra/20 hover:border-bordeaux`}>
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
