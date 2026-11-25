'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

export default function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/negozio/carrello"
      aria-label="Carrello"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux text-avorio shadow-lg transition-colors hover:bg-bordeaux-dark"
    >
      <ShoppingBag size={22} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-oro px-1.5 text-xs font-bold text-pietra">
          {count}
        </span>
      )}
    </Link>
  );
}
