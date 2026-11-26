'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart, type CartItem } from './CartProvider';

/**
 * Adds an item to the cart and opens the cart drawer.
 * `variant="card"` is the compact outline button used in product grids.
 */
export default function AddToCart({
  item,
  qty = 1,
  full = false,
  variant = 'primary',
  label = 'Aggiungi al carrello',
  openDrawer = true,
}: {
  item: Omit<CartItem, 'quantita'>;
  qty?: number;
  full?: boolean;
  variant?: 'primary' | 'card';
  label?: string;
  openDrawer?: boolean;
}) {
  const { add, setDrawerOpen } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add(item, Math.max(1, qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    if (openDrawer) setDrawerOpen(true);
  };

  const base =
    'inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors duration-300';
  const styles =
    variant === 'card'
      ? 'min-h-10 border border-pietra/20 px-3 text-pietra hover:border-bordeaux hover:bg-bordeaux hover:text-avorio'
      : 'min-h-12 bg-bordeaux px-6 text-avorio hover:bg-bordeaux-dark md:text-sm';

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${full ? 'w-full' : ''}`}>
      {added ? <Check size={16} /> : <ShoppingBag size={16} strokeWidth={1.8} />}
      {added ? 'Aggiunto' : label}
    </button>
  );
}
