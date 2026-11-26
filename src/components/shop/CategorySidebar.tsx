import Link from 'next/link';
import type { Categoria } from '@/lib/shop/types';

function catHref(slug?: string, q?: string) {
  const sp = new URLSearchParams();
  if (slug) sp.set('cat', slug);
  if (q) sp.set('q', q);
  const qs = sp.toString();
  return qs ? `/negozio?${qs}` : '/negozio';
}

/** Desktop category tree. */
export default function CategorySidebar({
  categorie,
  activeCat,
  q,
}: {
  categorie: Categoria[];
  activeCat?: string;
  q?: string;
}) {
  const top = categorie.filter((c) => !c.parent_id);
  const active = categorie.find((c) => c.slug === activeCat);
  const activeTopId = active?.parent_id ?? active?.id;

  const item = (isActive: boolean, sub = false) =>
    `flex min-h-9 items-center rounded-sm px-3 text-sm transition-colors ${sub ? 'pl-6' : ''} ${
      isActive
        ? 'bg-bordeaux/[0.07] font-medium text-bordeaux'
        : 'text-pietra hover:bg-pietra/[0.04] hover:text-bordeaux'
    }`;

  return (
    <nav aria-label="Categorie">
      <div className="mb-3 px-3 text-[11px] font-medium uppercase tracking-widest text-pietra-chiaro">Categorie</div>
      <ul className="grid gap-0.5">
        <li>
          <Link href={catHref(undefined, q)} className={item(!activeCat)}>
            Tutti i prodotti
          </Link>
        </li>
        {top.map((cat) => {
          const children = categorie.filter((c) => c.parent_id === cat.id);
          const open = activeTopId === cat.id;
          return (
            <li key={cat.id}>
              <Link href={catHref(cat.slug, q)} className={item(activeCat === cat.slug)}>
                <span className="truncate">{cat.nome}</span>
                {children.length > 0 && (
                  <span className="ml-auto pl-2 text-xs text-pietra/40">{children.length}</span>
                )}
              </Link>
              {open && children.length > 0 && (
                <ul className="mb-1 mt-0.5 grid gap-0.5 border-l border-pietra/10 ml-3">
                  {children.map((sub) => (
                    <li key={sub.id}>
                      <Link href={catHref(sub.slug, q)} className={item(activeCat === sub.slug, true)}>
                        <span className="truncate">{sub.nome}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Mobile/tablet: horizontally scrollable category chips (+ sub-chips). */
export function CategoryChips({
  categorie,
  activeCat,
  q,
}: {
  categorie: Categoria[];
  activeCat?: string;
  q?: string;
}) {
  const top = categorie.filter((c) => !c.parent_id);
  const active = categorie.find((c) => c.slug === activeCat);
  const activeTopId = active?.parent_id ?? active?.id;
  const subs = activeTopId ? categorie.filter((c) => c.parent_id === activeTopId) : [];

  const chip = (isActive: boolean) =>
    `inline-flex min-h-10 flex-none items-center whitespace-nowrap border px-4 text-sm transition-colors ${
      isActive
        ? 'border-bordeaux bg-bordeaux text-avorio'
        : 'border-pietra/15 bg-white text-pietra hover:border-bordeaux/40'
    }`;

  return (
    <div className="grid gap-2">
      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          <Link href={catHref(undefined, q)} className={chip(!activeCat)}>
            Tutti
          </Link>
          {top.map((c) => (
            <Link key={c.id} href={catHref(c.slug, q)} className={chip(activeTopId === c.id)}>
              {c.nome}
            </Link>
          ))}
        </div>
      </div>
      {subs.length > 0 && (
        <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 pb-1">
            {subs.map((s) => (
              <Link
                key={s.id}
                href={catHref(s.slug, q)}
                className={`inline-flex min-h-9 flex-none items-center whitespace-nowrap px-3 text-sm transition-colors ${
                  activeCat === s.slug
                    ? 'bg-bordeaux/10 font-medium text-bordeaux'
                    : 'text-pietra-chiaro hover:text-bordeaux'
                }`}
              >
                {s.nome}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
