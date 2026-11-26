import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import type { ProdottoConCategoria } from '@/lib/shop/queries';
import AddToCart from './AddToCart';

export function Availability({ giacenza, className = '' }: { giacenza: number; className?: string }) {
  if (giacenza <= 0) {
    return <span className={`text-xs text-pietra-chiaro ${className}`}>Non disponibile</span>;
  }
  if (giacenza <= 3) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-bordeaux ${className}`}>
        <span className="size-1.5 rounded-full bg-bordeaux" />
        Ultimi {giacenza} {giacenza === 1 ? 'pezzo' : 'pezzi'}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-pietra-chiaro ${className}`}>
      <span className="size-1.5 rounded-full bg-emerald-600" />
      Disponibile
    </span>
  );
}

export default function ProductCard({ p }: { p: ProdottoConCategoria }) {
  const cover = p.immagini?.[0];
  const hover = p.immagini?.[1];
  const soldOut = p.giacenza <= 0;
  const href = `/negozio/${p.slug}`;

  return (
    <article className="group flex min-w-0 flex-col bg-white transition-shadow duration-500 hover:shadow-[0_12px_40px_-12px_rgba(60,58,55,0.25)]">
      <Link href={href} className="relative block overflow-hidden bg-avorio-scuro" tabIndex={-1} aria-hidden>
        <div className="relative aspect-[4/5]">
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImageUrl(cover.storage_path)}
                alt={cover.alt ?? p.titolo}
                loading="lazy"
                className={`absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${
                  hover ? 'group-hover:opacity-0' : ''
                } ${soldOut ? 'grayscale-[40%]' : ''}`}
              />
              {hover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productImageUrl(hover.storage_path)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={44} strokeWidth={0.9} className="text-pietra/20" />
            </div>
          )}
          {soldOut && (
            <span className="absolute left-3 top-3 bg-pietra/85 px-2 py-1 text-[11px] uppercase tracking-wider text-avorio">
              Esaurito
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {p.categoria?.nome && (
          <div className="mb-1 truncate text-[11px] uppercase tracking-widest text-oro">{p.categoria.nome}</div>
        )}
        <h3 className="min-w-0">
          <Link
            href={href}
            className="-my-1 line-clamp-2 break-words py-1 font-serif text-base leading-snug text-pietra transition-colors hover:text-bordeaux sm:text-lg"
          >
            {p.titolo}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-base font-medium tabular-nums text-pietra">{formatPrice(p.prezzo_cent, p.valuta)}</span>
          <Availability giacenza={p.giacenza} className="hidden sm:inline-flex" />
        </div>

        <div className="mt-auto pt-3">
          {soldOut ? (
            <Link
              href={href}
              className="inline-flex min-h-10 w-full items-center justify-center border border-pietra/10 px-3 text-xs uppercase tracking-wider text-pietra-chiaro"
            >
              Dettagli
            </Link>
          ) : (
            <AddToCart
              full
              variant="card"
              label="Aggiungi"
              item={{
                slug: p.slug,
                titolo: p.titolo,
                prezzo_cent: p.prezzo_cent,
                img: cover?.storage_path,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
