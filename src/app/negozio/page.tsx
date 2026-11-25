import type { Metadata } from 'next';
import { getActiveCategorie, searchProdotti, PER_PAGE, type SortKey } from '@/lib/shop/queries';
import ProductCard from '@/components/shop/ProductCard';
import CategorySidebar from '@/components/shop/CategorySidebar';
import ShopToolbar from '@/components/shop/ShopToolbar';
import Pagination from '@/components/shop/Pagination';

export const metadata: Metadata = {
  title: 'Shop · Onoranze Funebri Coppola',
  description:
    'Articoli funebri: urne, cornici, articoli commemorativi e composizioni. Acquisto online con spedizione.',
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
  const activeNome =
    categorie.find((c) => c.slug === searchParams.cat)?.nome ?? 'Tutti i prodotti';

  return (
    <div className="container-custom">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="divider-line" />
          <span className="eyebrow">Shop</span>
        </div>
        <h1 className="section-title">{activeNome}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <CategorySidebar categorie={categorie} activeCat={searchParams.cat} />
          </div>
        </aside>

        {/* Mobile category toggle */}
        <details className="rounded-lg border border-pietra/15 bg-white p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium uppercase tracking-wide text-pietra">
            Categorie
          </summary>
          <div className="mt-3">
            <CategorySidebar categorie={categorie} activeCat={searchParams.cat} />
          </div>
        </details>

        <div className="min-w-0">
          <ShopToolbar total={total} />

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pietra/20 bg-white/60 p-12 text-center">
              <p className="font-serif text-xl text-pietra">Nessun prodotto trovato.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
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
    </div>
  );
}
