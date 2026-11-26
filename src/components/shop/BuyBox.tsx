'use client';

import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import AddToCart from './AddToCart';
import QtyStepper from './QtyStepper';
import { formatPrice } from '@/lib/shop/format';

type Props = {
  slug: string;
  titolo: string;
  prezzo_cent: number;
  valuta: string;
  giacenza: number;
  img?: string;
};

/** Quantity + add to cart, plus a sticky bottom bar on mobile once scrolled past. */
export default function BuyBox({ slug, titolo, prezzo_cent, valuta, giacenza, img }: Props) {
  const [qty, setQty] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const soldOut = giacenza <= 0;
  const item = { slug, titolo, prezzo_cent, img };

  useEffect(() => {
    // Show the sticky bar once the main buy box has scrolled above the viewport.
    const onScroll = () => {
      const el = ref.current;
      if (el) setShowBar(el.getBoundingClientRect().bottom < 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (soldOut) {
    return (
      <div className="border border-pietra/10 bg-white p-4 text-sm text-pietra-chiaro">
        Al momento non disponibile. Contattaci per sapere quando tornerà o per un articolo simile:{' '}
        <a href="tel:+390815713888" className="inline-flex items-center gap-1 text-bordeaux hover:underline">
          <Phone size={13} /> 081 571 3888
        </a>
      </div>
    );
  }

  return (
    <>
      <div ref={ref} className="flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} min={1} max={giacenza} />
        <div className="min-w-[200px] flex-1">
          <AddToCart full item={item} qty={qty} />
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-pietra/10 bg-avorio/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(60,58,55,0.08)] backdrop-blur transition-transform duration-300 md:hidden ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-pietra">{titolo}</div>
            <div className="font-medium tabular-nums text-bordeaux">{formatPrice(prezzo_cent * qty, valuta)}</div>
          </div>
          <div className="flex-none">
            <AddToCart item={item} qty={qty} label="Aggiungi" />
          </div>
        </div>
      </div>
    </>
  );
}
