'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart, type CartItem } from './CartProvider';

export default function AddToCart({
  item,
  full = false,
}: {
  item: Omit<CartItem, 'quantita'>;
  full?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 bg-bordeaux px-4 py-2.5 text-sm font-medium uppercase tracking-wider text-avorio transition-colors hover:bg-bordeaux-dark ${
        full ? 'w-full' : ''
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingBag size={16} />}
      {added ? 'Aggiunto' : 'Aggiungi'}
    </button>
  );
}
