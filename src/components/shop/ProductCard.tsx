import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import type { Prodotto } from '@/lib/shop/types';
import AddToCart from './AddToCart';

export default function ProductCard({ p }: { p: Prodotto }) {
  const imgPath = p.immagini?.[0]?.storage_path;
  const img = imgPath ? productImageUrl(imgPath) : '';
  const soldOut = p.giacenza <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-pietra/10 bg-white">
      <Link href={`/negozio/${p.slug}`} className="block">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-avorio-scuro">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={p.immagini?.[0]?.alt ?? p.titolo}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Package size={40} strokeWidth={1} className="text-pietra/25" />
          )}
          {soldOut && (
            <span className="absolute left-3 top-3 bg-pietra/80 px-2 py-1 text-[10px] uppercase tracking-wider text-avorio">
              Esaurito
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/negozio/${p.slug}`}>
          <h3 className="font-serif text-lg leading-snug text-pietra group-hover:text-bordeaux">
            {p.titolo}
          </h3>
        </Link>
        <div className="mt-1 font-medium text-bordeaux">
          {formatPrice(p.prezzo_cent, p.valuta)}
        </div>

        <div className="mt-4 pt-0">
          {soldOut ? (
            <span className="inline-flex w-full items-center justify-center bg-pietra/10 px-4 py-2.5 text-sm uppercase tracking-wider text-pietra/50">
              Non disponibile
            </span>
          ) : (
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
      </div>
    </article>
  );
}
