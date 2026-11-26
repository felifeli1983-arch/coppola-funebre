import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { getActiveCategorie, searchProdotti, PER_PAGE, type SortKey } from '@/lib/shop/queries';
import ProductCard from '@/components/shop/ProductCard';
import CategorySidebar, { CategoryChips } from '@/components/shop/CategorySidebar';
import ShopToolbar from '@/components/shop/ShopToolbar';
import Pagination from '@/components/shop/Pagination';
import Breadcrumb, { type Crumb } from '@/components/shop/Breadcrumb';
import TrustBadges from '@/components/shop/TrustBadges';

export const metadata: Metadata = {
  title: 'Negozio · Onoranze Funebri Coppola',
  description:
    'Articoli funebri e commemorativi: urne, cornici, articoli commemorativi e composizioni floreali. Spedizione in tutta Italia.',
  alternates: { canonical: '/negozio' },
};

type SP = { cat?: string; q?: string; sort?: string; page?: string };

export default async function NegozioPage({ searchParams }: { searchParams: SP }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const sort = (searchParams.sort as SortKey) || undefined;

  const [categorie, { items, total }] = await Promise.all([
    getActiveCategorie(),
    searchProdotti({ cat: searchParams.cat, q: searchParams.q, sort, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const active = categorie.find((c) => c.slug === searchParams.cat);
  const parent = active?.parent_id ? categorie.find((c) => c.id === active.parent_id) : undefined;

  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }, { label: 'Negozio', href: '/negozio' }];
  if (parent) crumbs.push({ label: parent.nome, href: `/negozio?cat=${parent.slug}` });
  if (active) crumbs.push({ label: active.nome });

  const title = active?.nome ?? 'Il nostro negozio';
  const intro =
    active?.descrizione ||
    (active
      ? null
      : 'Urne, cornici, articoli commemorativi e composizioni floreali, scelti con cura per accompagnare il ricordo.');

  return (
    <>
      {/* Title band */}
      <div className="border-b border-pietra/10">
        <div className="container-custom pb-8 pt-4 md:pb-10">
          <Breadcrumb items={crumbs} />
          <div className="mt-4 flex items-center gap-3">
            <span className="divider-line" />
            <span className="eyebrow">Negozio</span>
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-pietra md:text-5xl">{title}</h1>
          {intro && <p className="measure mt-3 text-base font-light leading-relaxed text-pietra-chiaro md:text-lg">{intro}</p>}
          {searchParams.q && (
            <p className="mt-3 text-sm text-pietra-chiaro">
              Risultati per <span className="font-medium text-pietra">“{searchParams.q}”</span>
            </p>
          )}
        </div>
      </div>

      <div className="container-custom pt-6 md:pt-8">
        {/* Mobile/tablet categories */}
        {categorie.length > 0 && (
          <div className="mb-5 lg:hidden">
            <CategoryChips categorie={categorie} activeCat={searchParams.cat} q={searchParams.q} />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <CategorySidebar categorie={categorie} activeCat={searchParams.cat} q={searchParams.q} />
            </div>
          </aside>

          <div className="min-w-0">
            <ShopToolbar total={total} />

            {items.length === 0 ? (
              <div className="mt-6 flex flex-col items-center border border-pietra/10 bg-white px-6 py-16 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-avorio-scuro text-pietra/40">
                  <SearchX size={24} strokeWidth={1.4} />
                </span>
                <p className="mt-4 font-serif text-2xl text-pietra">Nessun prodotto trovato</p>
                <p className="mt-2 max-w-sm text-sm text-pietra-chiaro">
                  Prova a cambiare categoria o termine di ricerca. Per richieste particolari chiamaci al{' '}
                  <a href="tel:+390815713888" className="text-bordeaux underline-offset-2 hover:underline">
                    081 571 3888
                  </a>
                  .
                </p>
                <Link href="/negozio" className="btn-outline mt-6">
                  Vedi tutti i prodotti
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 2xl:grid-cols-4">
                  {items.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  params={{ cat: searchParams.cat, q: searchParams.q, sort: searchParams.sort }}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-16 border-t border-pietra/10 pt-10">
          <TrustBadges />
        </div>
      </div>
    </>
  );
}
