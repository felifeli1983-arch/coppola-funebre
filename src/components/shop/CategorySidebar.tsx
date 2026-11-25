import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { Categoria } from '@/lib/shop/types';

export default function CategorySidebar({
  categorie,
  activeCat,
}: {
  categorie: Categoria[];
  activeCat?: string;
}) {
  const top = categorie.filter((c) => !c.parent_id);
  const activeCategoria = categorie.find((c) => c.slug === activeCat);
  const activeTopId = activeCategoria?.parent_id ?? activeCategoria?.id;

  const linkCls = (active: boolean) =>
    `block rounded px-2 py-1.5 text-sm transition-colors ${
      active ? 'bg-bordeaux/10 font-medium text-bordeaux' : 'text-pietra hover:text-bordeaux'
    }`;

  return (
    <nav className="text-pietra">
      <Link href="/negozio" className={linkCls(!activeCat) + ' mb-1'}>
        Tutti i prodotti
      </Link>

      <ul className="space-y-0.5">
        {top.map((cat) => {
          const children = categorie.filter((c) => c.parent_id === cat.id);
          const isActiveTop = activeTopId === cat.id;

          if (children.length === 0) {
            return (
              <li key={cat.id}>
                <Link href={`/negozio?cat=${cat.slug}`} className={linkCls(activeCat === cat.slug)}>
                  {cat.nome}
                </Link>
              </li>
            );
          }

          return (
            <li key={cat.id}>
              <details open={isActiveTop} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded px-2 py-1.5 text-sm text-pietra hover:text-bordeaux">
                  <span className={activeCat === cat.slug ? 'font-medium text-bordeaux' : ''}>
                    {cat.nome}
                  </span>
                  <ChevronDown
                    size={15}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <ul className="mb-1 ml-2 space-y-0.5 border-l border-pietra/10 pl-2">
                  <li>
                    <Link href={`/negozio?cat=${cat.slug}`} className={linkCls(activeCat === cat.slug)}>
                      Tutto in {cat.nome}
                    </Link>
                  </li>
                  {children.map((sub) => (
                    <li key={sub.id}>
                      <Link href={`/negozio?cat=${sub.slug}`} className={linkCls(activeCat === sub.slug)}>
                        {sub.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
