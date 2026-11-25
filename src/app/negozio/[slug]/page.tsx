import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import { getProdottoBySlug } from '@/lib/shop/queries';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import AddToCart from '@/components/shop/AddToCart';

export default async function ProdottoPage({ params }: { params: { slug: string } }) {
  const p = await getProdottoBySlug(params.slug);
  if (!p) notFound();

  const imgPath = p.immagini?.[0]?.storage_path;
  const img = imgPath ? productImageUrl(imgPath) : '';
  const soldOut = p.giacenza <= 0;

  return (
    <div className="container-custom">
      <Link
        href="/negozio"
        className="mb-6 inline-flex items-center gap-2 text-sm text-pietra-chiaro hover:text-bordeaux"
      >
        <ArrowLeft size={16} /> Torna allo shop
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-avorio-scuro">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={p.titolo} className="h-full w-full object-cover" />
          ) : (
            <Package size={64} strokeWidth={0.8} className="text-pietra/20" />
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="font-serif text-3xl text-pietra md:text-4xl">{p.titolo}</h1>
          <div className="mt-3 text-2xl font-medium text-bordeaux">
            {formatPrice(p.prezzo_cent, p.valuta)}
          </div>

          {p.descrizione && (
            <p className="mt-6 leading-relaxed text-pietra-chiaro">{p.descrizione}</p>
          )}

          <div className="mt-6 text-sm text-pietra-chiaro">
            {soldOut ? (
              <span className="text-bordeaux">Non disponibile</span>
            ) : (
              <span>Disponibilità: {p.giacenza} pz</span>
            )}
          </div>

          <div className="mt-8 max-w-xs">
            {!soldOut && (
              <AddToCart
                full
                item={{
                  slug: p.slug,
                  titolo: p.titolo,
                  prezzo_cent: p.prezzo_cent,
                  img: imgPath,
                }}
              />
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 border-t border-pietra/10 pt-6 text-sm text-pietra-chiaro">
            <Truck size={18} className="text-oro" />
            Spedizione in tutta Italia · per info 081 571 3888
          </div>
        </div>
      </div>
    </div>
  );
}
