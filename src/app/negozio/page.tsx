import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getActiveCategorie, getActiveProdotti } from '@/lib/shop/queries';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

export const metadata: Metadata = {
  title: 'Negozio · Onoranze Funebri Coppola',
  description:
    'Articoli funebri: urne, cornici, articoli commemorativi e composizioni. Acquisto online con spedizione.',
  alternates: { canonical: '/negozio' },
};

export default async function NegozioPage() {
  const [categorie, prodotti] = await Promise.all([
    getActiveCategorie(),
    getActiveProdotti(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-avorio pt-28 pb-24">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">Negozio</span>
            </div>
            <h1 className="section-title">Articoli funebri</h1>
            <p className="mt-4 text-lg text-pietra-chiaro font-light leading-relaxed">
              Urne, cornici, articoli commemorativi e composizioni, con spedizione.
            </p>
          </div>

          {categorie.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {categorie
                .filter((c) => !c.parent_id)
                .map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full border border-pietra/20 px-4 py-1.5 text-sm text-pietra"
                  >
                    {c.nome}
                  </span>
                ))}
            </div>
          )}

          {prodotti.length === 0 ? (
            <div className="rounded-lg border border-dashed border-pietra/20 bg-white/60 p-12 text-center">
              <p className="font-serif text-xl text-pietra">
                Il negozio sarà presto disponibile.
              </p>
              <p className="mt-2 text-pietra-chiaro">
                Stiamo preparando il catalogo. Per informazioni, contattateci al
                081 571 3888.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {prodotti.map((p) => {
                const img = p.immagini?.[0]?.storage_path;
                return (
                  <article
                    key={p.id}
                    className="group overflow-hidden rounded-lg border border-pietra/10 bg-white"
                  >
                    <div className="aspect-square overflow-hidden bg-avorio-scuro">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img && (
                        <img
                          src={productImageUrl(img)}
                          alt={p.immagini?.[0]?.alt ?? p.titolo}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg text-pietra">{p.titolo}</h3>
                      <div className="mt-1 text-bordeaux font-medium">
                        {formatPrice(p.prezzo_cent, p.valuta)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
