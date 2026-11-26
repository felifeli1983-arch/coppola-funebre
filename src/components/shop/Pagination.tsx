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
  const from = Math.max(1, page - 1);
  const to = Math.min(totalPages, page + 1);
  for (let p = from; p <= to; p++) pages.push(p);

  const cell =
    'inline-flex size-11 items-center justify-center border text-sm tabular-nums transition-colors';
  const idle = 'border-pietra/15 bg-white text-pietra hover:border-bordeaux hover:text-bordeaux';

  return (
    <nav aria-label="Paginazione" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${cell} ${idle}`} aria-label="Pagina precedente">
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className={`${cell} border-pietra/10 text-pietra/25`} aria-hidden>
          <ChevronLeft size={16} />
        </span>
      )}
      {from > 1 && (
        <>
          <Link href={href(1)} className={`${cell} ${idle}`}>1</Link>
          {from > 2 && <span className="px-1 text-pietra/40">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${cell} ${p === page ? 'border-bordeaux bg-bordeaux text-avorio' : idle}`}
        >
          {p}
        </Link>
      ))}
      {to < totalPages && (
        <>
          {to < totalPages - 1 && <span className="px-1 text-pietra/40">…</span>}
          <Link href={href(totalPages)} className={`${cell} ${idle}`}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${cell} ${idle}`} aria-label="Pagina successiva">
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${cell} border-pietra/10 text-pietra/25`} aria-hidden>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
