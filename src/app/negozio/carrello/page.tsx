'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Package, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/components/shop/CartProvider';
import { useShipping } from '@/components/shop/useShipping';
import QtyStepper from '@/components/shop/QtyStepper';
import TrustBadges from '@/components/shop/TrustBadges';
import Breadcrumb from '@/components/shop/Breadcrumb';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

export default function CarrelloPage() {
  const { items, count, setQty, remove, totalCent, hydrated } = useCart();
  const ship = useShipping(totalCent);
  const totale = totalCent + ship.costCent;

  return (
    <div className="container-custom">
      <Breadcrumb items={[{ label: 'Negozio', href: '/negozio' }, { label: 'Carrello' }]} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl text-pietra md:text-4xl">
          Il tuo carrello
          {count > 0 && (
            <span className="ml-3 align-middle font-sans text-base font-normal text-pietra-chiaro">
              {count} {count === 1 ? 'articolo' : 'articoli'}
            </span>
          )}
        </h1>
        <Link
          href="/negozio"
          className="inline-flex min-h-10 items-center gap-2 text-sm text-pietra-chiaro transition-colors hover:text-bordeaux"
        >
          <ArrowLeft size={16} /> Continua lo shopping
        </Link>
      </div>

      {!hydrated ? (
        <div className="mt-8 h-64 animate-pulse bg-white/60" />
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center border border-pietra/10 bg-white px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-avorio-scuro text-pietra/40">
            <ShoppingBag size={26} strokeWidth={1.4} />
          </span>
          <p className="mt-5 font-serif text-2xl text-pietra">Il carrello è vuoto</p>
          <p className="mt-2 max-w-sm text-sm text-pietra-chiaro">
            Sfoglia il negozio: urne, cornici, articoli commemorativi e composizioni floreali.
          </p>
          <Link href="/negozio" className="btn-primary mt-6">
            Vai al negozio <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* Items */}
          <div className="min-w-0 border border-pietra/10 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_150px_120px] gap-4 border-b border-pietra/10 px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-pietra-chiaro md:grid">
              <span>Prodotto</span>
              <span className="text-center">Quantità</span>
              <span className="text-right">Totale</span>
            </div>
            <ul className="divide-y divide-pietra/10">
              {items.map((i) => (
                <li
                  key={i.slug}
                  className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 sm:p-5 md:grid-cols-[96px_minmax(0,1fr)_150px_120px] md:items-center md:px-6"
                >
                  <Link
                    href={`/negozio/${i.slug}`}
                    className="row-span-2 flex size-20 items-center justify-center overflow-hidden bg-avorio-scuro md:row-span-1 md:size-24"
                  >
                    {i.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImageUrl(i.img)} alt={i.titolo} className="size-full object-cover" />
                    ) : (
                      <Package size={24} strokeWidth={1.2} className="text-pietra/25" />
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/negozio/${i.slug}`}
                      className="-my-1 line-clamp-2 break-words py-1 font-serif text-lg leading-snug text-pietra transition-colors hover:text-bordeaux md:text-xl"
                    >
                      {i.titolo}
                    </Link>
                    <div className="mt-1 text-sm tabular-nums text-pietra-chiaro">
                      {formatPrice(i.prezzo_cent)} cad.
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i.slug)}
                      className="-ml-1 mt-1 inline-flex min-h-9 items-center gap-1.5 px-1 text-xs text-pietra-chiaro transition-colors hover:text-bordeaux"
                    >
                      <Trash2 size={14} /> Rimuovi
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:contents">
                    <div className="md:flex md:justify-center">
                      <QtyStepper size="sm" min={0} value={i.quantita} onChange={(v) => setQty(i.slug, v)} />
                    </div>
                    <div className="text-right font-medium tabular-nums text-pietra md:text-lg">
                      {formatPrice(i.prezzo_cent * i.quantita)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <aside className="grid gap-4 lg:sticky lg:top-28">
            <div className="border border-pietra/10 bg-white p-5 sm:p-6">
              <h2 className="font-serif text-2xl text-pietra">Riepilogo</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-pietra-chiaro">Subtotale</dt>
                  <dd className="whitespace-nowrap tabular-nums text-pietra">{formatPrice(totalCent)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-pietra-chiaro">Spedizione</dt>
                  <dd className="whitespace-nowrap tabular-nums text-pietra">
                    {!ship.ready ? '—' : ship.costCent === 0 ? 'Gratuita' : formatPrice(ship.costCent)}
                  </dd>
                </div>
              </dl>
              {ship.threshold > 0 && (
                <div className="mt-3 bg-avorio px-3 py-2.5">
                  <p className="flex items-start gap-2 text-xs leading-snug text-pietra-chiaro">
                    <Truck size={14} className="mt-px flex-none text-oro" />
                    {ship.missingForFree > 0 ? (
                      <span>
                        Mancano <strong className="font-medium text-pietra">{formatPrice(ship.missingForFree)}</strong>{' '}
                        per la spedizione gratuita
                      </span>
                    ) : (
                      <span className="font-medium text-pietra">Hai diritto alla spedizione gratuita</span>
                    )}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-pietra/10">
                    <div className="h-full bg-oro transition-all duration-500" style={{ width: `${ship.progress}%` }} />
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-pietra/10 pt-4">
                <span className="text-base font-medium text-pietra">Totale</span>
                <span className="whitespace-nowrap font-serif text-3xl tabular-nums text-pietra">{formatPrice(totale)}</span>
              </div>
              <Link
                href="/negozio/checkout"
                className="mt-5 hidden min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap bg-bordeaux px-6 text-sm font-medium uppercase tracking-wider text-avorio transition-colors hover:bg-bordeaux-dark lg:flex"
              >
                Vai al checkout <ArrowRight size={16} />
              </Link>
            </div>
            <div className="border border-pietra/10 bg-white/60 p-5">
              <TrustBadges layout="stack" />
            </div>
          </aside>
        </div>
      )}

      {/* Mobile/tablet checkout bar */}
      {hydrated && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-pietra/10 bg-avorio/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,58,55,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-widest text-pietra-chiaro">Totale</div>
              <div className="whitespace-nowrap font-serif text-2xl leading-tight tabular-nums text-pietra">
                {formatPrice(totale)}
              </div>
            </div>
            <Link
              href="/negozio/checkout"
              className="ml-auto inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap bg-bordeaux px-5 text-sm font-medium uppercase tracking-wider text-avorio transition-colors hover:bg-bordeaux-dark"
            >
              Vai al checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
