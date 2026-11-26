import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Percorso" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-pietra-chiaro">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="flex-none text-pietra/30" />}
              {c.href && !last ? (
                <Link href={c.href} className="py-1 transition-colors hover:text-bordeaux">
                  {c.label}
                </Link>
              ) : (
                <span className={`truncate py-1 ${last ? 'text-pietra' : ''}`} aria-current={last ? 'page' : undefined}>
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
