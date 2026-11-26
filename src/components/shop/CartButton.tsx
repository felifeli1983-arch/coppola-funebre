'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

/** Header cart button: opens the slide-over cart. */
export default function CartButton() {
  const { count, setDrawerOpen, hydrated } = useCart();

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={count > 0 ? `Carrello, ${count} articoli` : 'Carrello'}
      className="relative inline-flex size-11 items-center justify-center text-pietra transition-colors hover:text-bordeaux"
    >
      <ShoppingBag size={22} strokeWidth={1.6} />
      {hydrated && count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-bordeaux px-1 text-[11px] font-semibold tabular-nums text-avorio">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
