'use client';

import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Package, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from './CartProvider';
import { useShipping } from './useShipping';
import QtyStepper from './QtyStepper';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

/** Slide-over cart, opened from the header cart button or after "Aggiungi". */
export default function CartDrawer() {
  const { items, count, totalCent, setQty, remove, drawerOpen, setDrawerOpen } = useCart();
  const ship = useShipping(totalCent);

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-pietra/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-avorio shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-200 data-[state=open]:duration-300"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-pietra/10 px-5 py-4">
            <Dialog.Title className="flex items-center gap-2 font-serif text-2xl text-pietra">
              Carrello
              {count > 0 && (
                <span className="font-sans text-sm font-normal text-pietra-chiaro">
                  ({count} {count === 1 ? 'articolo' : 'articoli'})
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex size-11 items-center justify-center text-pietra transition-colors hover:text-bordeaux"
              aria-label="Chiudi carrello"
            >
              <X size={22} />
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-avorio-scuro text-pietra/40">
                <ShoppingBag size={26} strokeWidth={1.4} />
              </span>
              <p className="mt-5 font-serif text-2xl text-pietra">Il carrello è vuoto</p>
              <p className="mt-2 text-sm text-pietra-chiaro">Scopri gli articoli del nostro negozio.</p>
              <Dialog.Close asChild>
                <Link href="/negozio" className="btn-primary mt-6">
                  Vai al negozio
                </Link>
              </Dialog.Close>
            </div>
          ) : (
            <>
              {ship.threshold > 0 && (
                <div className="border-b border-pietra/10 px-5 py-3">
                  <p className="flex items-center gap-2 text-xs text-pietra-chiaro">
                    <Truck size={14} className="flex-none text-oro" />
                    {ship.missingForFree > 0 ? (
                      <span>
                        Ti mancano <strong className="font-medium text-pietra">{formatPrice(ship.missingForFree)}</strong> per
                        la spedizione gratuita
                      </span>
                    ) : (
                      <span className="font-medium text-pietra">Spedizione gratuita inclusa</span>
                    )}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-pietra/10">
                    <div className="h-full bg-oro transition-all duration-500" style={{ width: `${ship.progress}%` }} />
                  </div>
                </div>
              )}

              <ul className="flex-1 divide-y divide-pietra/10 overflow-y-auto overscroll-contain px-5" data-lenis-prevent>
                {items.map((i) => (
                  <li key={i.slug} className="flex gap-4 py-4">
                    <Link
                      href={`/negozio/${i.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex size-20 flex-none items-center justify-center overflow-hidden bg-avorio-scuro"
                    >
                      {i.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImageUrl(i.img)} alt={i.titolo} className="size-full object-cover" />
                      ) : (
                        <Package size={22} strokeWidth={1.2} className="text-pietra/25" />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/negozio/${i.slug}`}
                          onClick={() => setDrawerOpen(false)}
                          className="line-clamp-2 break-words font-serif text-lg leading-snug text-pietra hover:text-bordeaux"
                        >
                          {i.titolo}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(i.slug)}
                          className="-mr-2 -mt-2 inline-flex size-10 flex-none items-center justify-center text-pietra/40 transition-colors hover:text-bordeaux"
                          aria-label={`Rimuovi ${i.titolo}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <span className="text-xs text-pietra-chiaro">{formatPrice(i.prezzo_cent)} cad.</span>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <QtyStepper size="sm" min={0} value={i.quantita} onChange={(v) => setQty(i.slug, v)} />
                        <span className="font-medium tabular-nums text-pietra">
                          {formatPrice(i.prezzo_cent * i.quantita)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-pietra/10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                <div className="flex justify-between text-sm text-pietra-chiaro">
                  <span>Subtotale</span>
                  <span className="tabular-nums">{formatPrice(totalCent)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-pietra-chiaro">
                  <span>Spedizione</span>
                  <span className="tabular-nums">
                    {!ship.ready ? '—' : ship.costCent === 0 ? 'Gratuita' : formatPrice(ship.costCent)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between border-t border-pietra/10 pt-3 text-lg font-medium text-pietra">
                  <span>Totale</span>
                  <span className="tabular-nums">{formatPrice(totalCent + ship.costCent)}</span>
                </div>
                <Dialog.Close asChild>
                  <Link href="/negozio/checkout" className="btn-primary mt-4 w-full justify-center whitespace-nowrap">
                    Vai al checkout <ArrowRight size={16} />
                  </Link>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Link
                    href="/negozio/carrello"
                    className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-xs uppercase tracking-wider text-pietra-chiaro transition-colors hover:text-bordeaux"
                  >
                    Vedi il carrello
                  </Link>
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
