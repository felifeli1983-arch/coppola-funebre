'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/shop/CartProvider';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

export default function CarrelloPage() {
  const { items, setQty, remove, totalCent } = useCart();

  return (
    <div className="container-custom max-w-4xl">
      <Link href="/negozio" className="mb-6 inline-flex items-center gap-2 text-sm text-pietra-chiaro hover:text-bordeaux">
        <ArrowLeft size={16} /> Continua lo shopping
      </Link>
      <h1 className="section-title mb-8">Il tuo carrello</h1>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-pietra/20 bg-white/60 p-12 text-center">
          <p className="font-serif text-xl text-pietra">Il carrello è vuoto.</p>
          <Link
            href="/negozio"
            className="mt-4 inline-flex items-center gap-2 text-bordeaux hover:underline"
          >
            Vai allo shop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <ul className="divide-y divide-pietra/10 lg:col-span-2">
            {items.map((i) => (
              <li key={i.slug} className="flex gap-4 py-4">
                <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded bg-avorio-scuro">
                  {i.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImageUrl(i.img)} alt={i.titolo} className="h-full w-full object-cover" />
                  ) : (
                    <Package size={24} className="text-pietra/25" />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <span className="font-serif text-lg text-pietra">{i.titolo}</span>
                    <button onClick={() => remove(i.slug)} className="text-pietra/40 hover:text-bordeaux">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-pietra-chiaro">{formatPrice(i.prezzo_cent)}</span>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-pietra/20">
                      <button
                        onClick={() => setQty(i.slug, i.quantita - 1)}
                        className="px-2 py-1 text-pietra hover:bg-pietra/5"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm">{i.quantita}</span>
                      <button
                        onClick={() => setQty(i.slug, i.quantita + 1)}
                        className="px-2 py-1 text-pietra hover:bg-pietra/5"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-medium text-bordeaux">
                      {formatPrice(i.prezzo_cent * i.quantita)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-lg border border-pietra/10 bg-white p-6">
            <div className="flex justify-between text-sm text-pietra-chiaro">
              <span>Subtotale</span>
              <span>{formatPrice(totalCent)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-pietra-chiaro">
              <span>Spedizione</span>
              <span>Calcolata al checkout</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-pietra/10 pt-4 text-lg font-medium text-pietra">
              <span>Totale</span>
              <span>{formatPrice(totalCent)}</span>
            </div>
            <Link
              href="/negozio/checkout"
              className="btn-primary mt-6 w-full justify-center"
            >
              Procedi all&apos;ordine <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
